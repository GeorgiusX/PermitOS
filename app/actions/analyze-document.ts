"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  DocumentDiscipline,
  IssueConfidence,
  IssueSeverity,
} from "@/types/db";

// Google Gemini Flash. Default is the newest GA Flash; override via env.
// NOTE: thinkingLevel (below) is a Gemini-3.x control — if you override to a
// 2.x model, swap it for thinkingConfig.thinkingBudget.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const STORAGE_BUCKET = "documents";

const SEVERITIES: IssueSeverity[] = ["critical", "advisory", "pass"];
const CONFIDENCES: IssueConfidence[] = ["strong", "medium", "weak"];
const DISCIPLINES: DocumentDiscipline[] = [
  "architectural",
  "landscape",
  "mep",
  "mep_electrical",
  "mep_plumbing",
  "mep_mechanical",
  "structural",
  "survey",
  "other",
];

type RawIssue = {
  title?: string;
  severity?: string;
  code?: string;
  description?: string;
  fix?: string;
  location?: string;
  confidence?: string;
  discipline?: string;
};

type RawResult = {
  summary?: string;
  risk_score?: number;
  issues?: RawIssue[];
};

export type AnalyzeState = { error: string } | { ok: true } | null;

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

async function callGemini(
  apiKey: string,
  systemText: string,
  base64: string,
  mimeType: string,
): Promise<RawResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            {
              text: "Review this document for compliance against the adopted rules. Return only the JSON object.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8000,
        responseMimeType: "application/json",
        // Gemini Flash thinks by default; for structured extraction keep it
        // minimal so reasoning tokens don't crowd out / truncate the JSON.
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(
      `Gemini error: ${data.error.message ?? JSON.stringify(data.error)}`,
    );
  }
  const text: string =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned no analysis.");
  return JSON.parse(text) as RawResult;
}

export async function analyzeDocument(
  projectId: string,
  documentId: string,
): Promise<AnalyzeState> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // 1. Load the document + its project's municipality.
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select(
      `id, name, file_label, storage_path, mime_type, discipline,
       project:projects(municipality_id, type,
         municipality:municipalities(name))`,
    )
    .eq("id", documentId)
    .maybeSingle();
  if (docErr) return { error: docErr.message };
  if (!doc) return { error: "Document not found." };
  if (!doc.storage_path) {
    return { error: "Document has no uploaded file to analyze." };
  }

  const municipalityId = doc.project?.municipality_id ?? null;
  const municipalityName = doc.project?.municipality?.name ?? "the municipality";

  // 2. Load the adopted rules for the municipality.
  const { data: rules, error: rulesErr } = municipalityId
    ? await supabase
        .from("municipality_rules")
        .select("code, title, description, category")
        .eq("municipality_id", municipalityId)
        .eq("is_active", true)
        .order("code")
    : { data: [], error: null };
  if (rulesErr) return { error: rulesErr.message };
  if (!rules || rules.length === 0) {
    return { error: `No compliance rules are loaded for ${municipalityName}.` };
  }

  // 3. Download the file from Storage and base64-encode it.
  const { data: blob, error: dlErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(doc.storage_path);
  if (dlErr || !blob) {
    return {
      error: `Could not download document: ${dlErr?.message ?? "unknown"}`,
    };
  }
  const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
  const mime = doc.mime_type || "application/pdf";

  await supabase
    .from("documents")
    .update({ status: "analyzing" })
    .eq("id", documentId);

  // 4. Build the system prompt from the DB rules.
  const ruleLines = rules
    .map((r) => `- ${r.code} [${r.category}] ${r.title}: ${r.description}`)
    .join("\n");
  const systemText = `You are a ${municipalityName} permit-compliance reviewer. You review uploaded plan sheets and permit documents against the municipality's adopted compliance rules and identify issues.

ADOPTED RULES — ${municipalityName}:
${ruleLines}

Review the document against these rules only. Return ONLY a valid JSON object — no markdown, no preamble — with this exact shape:
{
  "summary": "2-3 sentence plain-English overview of the document and overall compliance posture",
  "risk_score": 0-100 integer (0 = fully compliant, 100 = severe violations),
  "issues": [
    {
      "title": "short descriptive title",
      "severity": "critical" | "advisory" | "pass",
      "code": "the rule code (e.g. the §-reference) or relevant standard",
      "description": "what the document shows and why it may or may not comply — be specific with numbers/measurements",
      "fix": "specific action to achieve compliance, or 'No action required' when passing",
      "location": "sheet/grid reference if identifiable, else a short locus",
      "confidence": "strong" | "medium" | "weak",
      "discipline": "architectural" | "landscape" | "mep" | "mep_electrical" | "mep_plumbing" | "mep_mechanical" | "structural" | "survey" | "other"
    }
  ]
}
severity: critical = likely permit rejection, advisory = potential issue or missing info, pass = compliant. Only include rules actually checkable from this document.`;

  // 5. Call Gemini.
  let raw: RawResult;
  try {
    raw = await callGemini(apiKey, systemText, base64, mime);
  } catch (e) {
    await supabase
      .from("documents")
      .update({ status: "pending" })
      .eq("id", documentId);
    return { error: e instanceof Error ? e.message : "Analysis failed." };
  }

  // 6. Normalize + persist.
  const issues = (raw.issues ?? []).map((i) => ({
    title: i.title?.trim() || "Untitled finding",
    severity: oneOf<IssueSeverity>(i.severity, SEVERITIES, "advisory"),
    description: i.description?.trim() || "",
    code_ref: i.code?.trim() || null,
    location: i.location?.trim() || null,
    confidence: oneOf<IssueConfidence>(i.confidence, CONFIDENCES, "medium"),
    discipline: oneOf<DocumentDiscipline>(i.discipline, DISCIPLINES, "other"),
  }));

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "advisory").length;
  const passCount = issues.filter((i) => i.severity === "pass").length;
  const riskScore = Math.max(
    0,
    Math.min(100, Math.round(Number(raw.risk_score) || 0)),
  );

  const reportId = crypto.randomUUID();
  const { error: reportErr } = await supabase.from("compliance_reports").insert({
    id: reportId,
    document_id: documentId,
    project_id: projectId,
    risk_score: riskScore,
    summary: raw.summary?.trim() || null,
    critical_count: criticalCount,
    warning_count: warningCount,
    pass_count: passCount,
    ai_provider: "gemini",
  });
  if (reportErr) return { error: reportErr.message };

  if (issues.length > 0) {
    const { error: issuesErr } = await supabase.from("issues").insert(
      issues.map((i) => ({ report_id: reportId, ...i })),
    );
    if (issuesErr) return { error: issuesErr.message };
  }

  const docStatus =
    criticalCount > 0 ? "issues" : warningCount > 0 ? "advisory" : "clean";
  await supabase
    .from("documents")
    .update({ status: docStatus })
    .eq("id", documentId);

  await supabase
    .from("projects")
    .update({
      risk_score: riskScore,
      status: "ai_review_complete",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  revalidatePath("/compliance");
  revalidatePath("/projects");
  return { ok: true };
}

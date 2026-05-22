"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  DocumentDiscipline,
  IssueConfidence,
  IssueSeverity,
} from "@/types/db";

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

// Heavy lifting — runs inside `after()` so the client gets an immediate response.
async function runAnalysis(
  projectId: string,
  documentId: string,
  apiKey: string,
  storagePath: string,
  mimeType: string,
  systemText: string,
) {
  const supabase = await createClient();

  // Download file and base64-encode it.
  const { data: blob, error: dlErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(storagePath);
  if (dlErr || !blob) {
    await supabase
      .from("documents")
      .update({ status: "pending" })
      .eq("id", documentId);
    return;
  }
  const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

  // Call Gemini.
  let raw: RawResult;
  try {
    raw = await callGemini(apiKey, systemText, base64, mimeType);
  } catch {
    await supabase
      .from("documents")
      .update({ status: "pending" })
      .eq("id", documentId);
    return;
  }

  // Normalize + persist.
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
  if (reportErr) {
    await supabase
      .from("documents")
      .update({ status: "pending" })
      .eq("id", documentId);
    return;
  }

  if (issues.length > 0) {
    await supabase
      .from("issues")
      .insert(issues.map((i) => ({ report_id: reportId, ...i })));
  }

  // Invalidate before the document status update so the Next.js cache is
  // already stale when Realtime fires and the browser calls router.refresh().
  revalidatePath("/compliance");
  revalidatePath("/projects");

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

  // 1. Load document + project municipality.
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select(
      `id, name, storage_path, mime_type,
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
  const municipalityName =
    doc.project?.municipality?.name ?? "the municipality";

  // 2. Load the adopted rules — validate up front before queueing.
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
    return {
      error: `No compliance rules are loaded for ${municipalityName}.`,
    };
  }

  // 3. Mark as analyzing immediately so the UI can start showing progress.
  await supabase
    .from("documents")
    .update({ status: "analyzing" })
    .eq("id", documentId);

  // 4. Build the system prompt (done here so `after` doesn't need DB access for rules).
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

  // 5. Schedule the heavy work (download + Gemini + DB write) to run after
  //    this server action returns — client gets an immediate { ok: true }.
  after(() =>
    runAnalysis(
      projectId,
      documentId,
      apiKey,
      doc.storage_path!,
      doc.mime_type || "application/pdf",
      systemText,
    ),
  );

  return { ok: true };
}

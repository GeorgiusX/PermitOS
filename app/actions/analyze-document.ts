"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  DocumentDiscipline,
  IssueConfidence,
  IssueSeverity,
} from "@/types/db";

const MODEL = "claude-sonnet-4-6";
const STORAGE_BUCKET = "documents";

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

type AnalyzedIssue = {
  title: string;
  severity: IssueSeverity;
  code: string;
  description: string;
  fix: string;
  location: string;
  confidence: IssueConfidence;
  discipline: DocumentDiscipline;
};

type AnalysisResult = {
  summary: string;
  risk_score: number;
  issues: AnalyzedIssue[];
};

// Strict JSON schema for structured output. No numeric/length constraints
// (unsupported by structured outputs) — bounds are enforced after parsing.
const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    risk_score: { type: "integer" },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          severity: { type: "string", enum: ["critical", "advisory", "pass"] },
          code: { type: "string" },
          description: { type: "string" },
          fix: { type: "string" },
          location: { type: "string" },
          confidence: { type: "string", enum: ["strong", "medium", "weak"] },
          discipline: { type: "string", enum: DISCIPLINES },
        },
        required: [
          "title",
          "severity",
          "code",
          "description",
          "fix",
          "location",
          "confidence",
          "discipline",
        ],
      },
    },
  },
  required: ["summary", "risk_score", "issues"],
} as const;

export type AnalyzeState = { error: string } | { ok: true } | null;

export async function analyzeDocument(
  projectId: string,
  documentId: string,
): Promise<AnalyzeState> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "ANTHROPIC_API_KEY is not configured." };
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

  // 2. Load the adopted rules for the municipality (cached prefix per municipality).
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

  // 3. Download the file from Storage and base64-encode it.
  const { data: blob, error: dlErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(doc.storage_path);
  if (dlErr || !blob) {
    return { error: `Could not download document: ${dlErr?.message ?? "unknown"}` };
  }
  const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
  const mime = doc.mime_type || "application/pdf";

  // Mark the document as analyzing.
  await supabase
    .from("documents")
    .update({ status: "analyzing" })
    .eq("id", documentId);

  // 4. Build the (cacheable) system prompt from the DB rules.
  const ruleLines = rules
    .map((r) => `- ${r.code} [${r.category}] ${r.title}: ${r.description}`)
    .join("\n");
  const systemText = `You are a ${municipalityName} permit-compliance reviewer. You review uploaded plan sheets and permit documents against the municipality's adopted compliance rules and identify issues.

ADOPTED RULES — ${municipalityName}:
${ruleLines}

Review the document against these rules only. For each rule you can actually check from the document, decide compliance and emit a finding:
- severity: "critical" = likely permit rejection; "advisory" = potential issue or missing information; "pass" = compliant.
- confidence: "strong" / "medium" / "weak" based on how clearly the document supports the finding.
- code: the rule code (e.g. the §-reference) or the relevant standard.
- location: a sheet/grid reference if identifiable, otherwise a short locus.
- discipline: the discipline the finding belongs to.
- fix: a specific action to achieve compliance, or "No action required" when passing.
Also provide a 2–3 sentence plain-English "summary" and an integer "risk_score" from 0 (fully compliant) to 100 (severe violations). Only include rules actually checkable from this document.`;

  // 5. Call Claude with the document + structured JSON output.
  const client = new Anthropic({ apiKey });
  let result: AnalysisResult;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            mime.startsWith("image/")
              ? {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mime as
                      | "image/png"
                      | "image/jpeg"
                      | "image/gif"
                      | "image/webp",
                    data: base64,
                  },
                }
              : {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
            {
              type: "text",
              text: "Review this document for compliance against the adopted rules. Return only the structured JSON object.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Model returned no analysis." };
    }
    result = JSON.parse(textBlock.text) as AnalysisResult;
  } catch (e) {
    await supabase
      .from("documents")
      .update({ status: "pending" })
      .eq("id", documentId);
    const msg = e instanceof Error ? e.message : "Analysis failed.";
    return { error: msg };
  }

  // 6. Persist report + issues; update project + document status.
  const issues = result.issues ?? [];
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "advisory").length;
  const passCount = issues.filter((i) => i.severity === "pass").length;
  const riskScore = Math.max(0, Math.min(100, Math.round(result.risk_score)));

  const reportId = crypto.randomUUID();
  const { error: reportErr } = await supabase.from("compliance_reports").insert({
    id: reportId,
    document_id: documentId,
    project_id: projectId,
    risk_score: riskScore,
    summary: result.summary,
    critical_count: criticalCount,
    warning_count: warningCount,
    pass_count: passCount,
    ai_provider: "claude",
  });
  if (reportErr) return { error: reportErr.message };

  if (issues.length > 0) {
    const { error: issuesErr } = await supabase.from("issues").insert(
      issues.map((i) => ({
        report_id: reportId,
        severity: i.severity,
        title: i.title,
        description: i.description,
        code_ref: i.code,
        location: i.location,
        confidence: i.confidence,
        discipline: i.discipline,
      })),
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

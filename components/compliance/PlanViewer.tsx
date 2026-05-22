import { IconMinus, IconPlus, IconArrowsMaximize } from "@tabler/icons-react";
import type { ReportIssue } from "@/lib/data/compliance";

const VB_W = 520;
const VB_H = 400;

const FALLBACK_POS: [number, number][] = [
  [280, 118],
  [130, 200],
  [340, 190],
  [200, 150],
  [410, 230],
];

function calloutPoint(issue: ReportIssue, i: number): [number, number] {
  if (issue.calloutX !== null && issue.calloutY !== null) {
    return [issue.calloutX * VB_W, issue.calloutY * VB_H];
  }
  return FALLBACK_POS[i % FALLBACK_POS.length];
}

export function PlanViewer({
  issues,
  sheetLabel,
  projectTitle,
  permitNo,
  documentUrl,
  documentMimeType,
}: {
  issues: ReportIssue[];
  sheetLabel: string;
  projectTitle: string;
  permitNo: string | null;
  documentUrl?: string | null;
  documentMimeType?: string | null;
}) {
  const placed = issues.filter((i) => i.severity !== "pass");
  const isPdf = documentMimeType === "application/pdf";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-3">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-3.5 py-2">
        <span className="text-[12px] text-ink-2">{sheetLabel}</span>
        <div className="ml-auto flex gap-1">
          {[IconMinus, IconPlus, IconArrowsMaximize].map((Icon, i) => (
            <div
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle bg-surface text-ink-2"
            >
              <Icon size={14} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-5">
        {documentUrl ? (
          isPdf ? (
            <iframe
              src={documentUrl}
              className="h-full w-full rounded-lg border border-border-strong"
              title={sheetLabel}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={documentUrl}
              alt={sheetLabel}
              className="max-h-full max-w-full rounded-lg border border-border-strong object-contain shadow-sm"
            />
          )
        ) : (
          /* Fallback: schematic SVG placeholder with callout overlays */
          <div className="shrink-0 rounded-lg border border-border-strong bg-surface">
            <svg
              width={VB_W}
              height={VB_H}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              xmlns="http://www.w3.org/2000/svg"
              className="block"
            >
              <rect width={VB_W} height={VB_H} fill="#fafaf9" />
              <rect x="40" y="36" width="270" height="228" fill="white" stroke="#555" strokeWidth="2" />
              <rect x="310" y="36" width="170" height="228" fill="#f4f9ef" stroke="#b0ce90" strokeWidth="1" />
              <text x="395" y="58" textAnchor="middle" fontSize="9" fill="#6a9a4a" letterSpacing="1">LANDSCAPE AREA</text>
              <line x1="40" y1="148" x2="310" y2="148" stroke="#555" strokeWidth="1.5" />
              <line x1="40" y1="204" x2="310" y2="204" stroke="#555" strokeWidth="1.5" />
              <line x1="145" y1="148" x2="145" y2="264" stroke="#555" strokeWidth="1.5" />
              <line x1="220" y1="148" x2="220" y2="264" stroke="#555" strokeWidth="1.5" />
              <text x="175" y="97" textAnchor="middle" fontSize="9" fill="#777">LIVING / DINING</text>
              <text x="91" y="178" textAnchor="middle" fontSize="8" fill="#777">KITCHEN</text>
              <text x="182" y="173" textAnchor="middle" fontSize="8" fill="#777">BED 1</text>
              <text x="264" y="173" textAnchor="middle" fontSize="8" fill="#777">BED 2</text>
              <text x="91" y="232" textAnchor="middle" fontSize="8" fill="#777">BATH</text>
              <text x="182" y="232" textAnchor="middle" fontSize="8" fill="#777">BED 3</text>
              <text x="264" y="232" textAnchor="middle" fontSize="8" fill="#777">UTILITY</text>
              <circle cx="354" cy="100" r="18" fill="#c8dfa0" stroke="#7aaa52" strokeWidth="1" />
              <circle cx="400" cy="80" r="14" fill="#c8dfa0" stroke="#7aaa52" strokeWidth="1" />
              <circle cx="440" cy="130" r="16" fill="#c8dfa0" stroke="#7aaa52" strokeWidth="1" />
              <circle cx="360" cy="190" r="12" fill="#c8dfa0" stroke="#7aaa52" strokeWidth="1" />
              {placed.map((issue, i) => {
                const [cx, cy] = calloutPoint(issue, i);
                const stroke = issue.severity === "critical" ? "#a32d2d" : "#d97b2f";
                const bg = issue.severity === "critical" ? "#fcebeb" : "#faeeda";
                return (
                  <g key={issue.id}>
                    <circle cx={cx} cy={cy} r="28" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4,2" opacity="0.7" />
                    <circle cx={cx + 16} cy={cy - 16} r="11" fill={bg} stroke={stroke} strokeWidth="1.5" />
                    <text x={cx + 16} y={cy - 12} textAnchor="middle" fontSize="10" fontWeight="700" fill={stroke}>{i + 1}</text>
                  </g>
                );
              })}
              <rect x="40" y="308" width="440" height="60" fill="#f5f4f1" stroke="#ddd" strokeWidth="0.5" rx="2" />
              <text x="52" y="326" fontSize="8" fill="#888">PROJECT</text>
              <text x="95" y="326" fontSize="8" fill="#444" fontWeight="500">{projectTitle.slice(0, 48)}</text>
              <text x="52" y="340" fontSize="8" fill="#888">PERMIT</text>
              <text x="95" y="340" fontSize="8" fill="#444">{permitNo ?? "—"}</text>
              <text x="52" y="354" fontSize="8" fill="#888">SHEET</text>
              <text x="95" y="354" fontSize="8" fill="#444">{sheetLabel}</text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

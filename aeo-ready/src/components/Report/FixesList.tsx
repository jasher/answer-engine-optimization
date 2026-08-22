import React, { useState } from "react";

interface FixItem {
  id: string;
  severity: string;
  pts: string;
  title: string;
  why: string;
  whereTo?: string;
  whereToWarn?: string;
  language: string;
  filename: string;
  code: string;
  pending?: string;
}

interface FixesListProps {
  fixes: FixItem[];
}

export const FixesList: React.FC<FixesListProps> = ({ fixes }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const getSeverityClass = (sev: string) => {
    const s = sev.toLowerCase();
    if (s.includes("high") || s.includes("critical")) return "sev-high";
    if (s.includes("ahead")) return "sev-ahead";
    return "sev-medium";
  };

  return (
    <>
      <h2 className="results-title mt-10">
        {fixes.length} step-by-step recommendations, highest impact first
      </h2>
      <div className="fixes">
        {fixes.map((fix) => {
          const sevClass = getSeverityClass(fix.severity);
          return (
            <article className={`fix card ${sevClass}`} key={fix.id}>
              <div className="fix-head">
                <span>
                  <span className="fix-badge">{fix.severity}</span>
                  <span className="fix-pts">{fix.pts}</span>
                </span>
                {fix.filename && <span className="fix-where">{fix.filename.split(" — ")[0]}</span>}
              </div>

              <h3 className="fix-title">{fix.title}</h3>
              <p className="fix-why">{fix.why}</p>

              {fix.pending && (
                <p className="fix-pending">
                  <b>⧗ Pending.</b> {fix.pending}
                </p>
              )}

              {fix.code && (
                <div className="artifact">
                  <div className="artifact-bar">
                    <span className="artifact-name">{fix.filename}</span>
                    <button
                      type="button"
                      className={`copy-btn ${copiedId === fix.id ? "copied" : ""}`}
                      onClick={() => handleCopy(fix.id, fix.code)}
                    >
                      {copiedId === fix.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre>
                    <code>{fix.code}</code>
                  </pre>
                </div>
              )}

              {fix.whereTo && (
                <p className="fix-where-to">
                  <b>Put it at</b> {fix.whereTo.replace(/^Put it at\s*/i, "")}
                </p>
              )}
              {fix.whereToWarn && <p className="fix-where-to warn">{fix.whereToWarn}</p>}
            </article>
          );
        })}
      </div>
    </>
  );
};

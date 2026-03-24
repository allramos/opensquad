import { useEffect, useState } from "react";
import { api, type RunInfo } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "running": return "badge-running";
    case "completed": return "badge-completed";
    case "checkpoint": return "badge-checkpoint";
    case "failed": return "badge-failed";
    default: return "badge-idle";
  }
}

export function RunsPage() {
  const [runs, setRuns] = useState<RunInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useI18nStore((s) => s.t);

  useEffect(() => {
    api.getRuns().then(setRuns).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const cellStyle: React.CSSProperties = {
    padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border-subtle)",
  };
  const headerCellStyle: React.CSSProperties = {
    ...cellStyle, fontSize: 11, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.5px", color: "var(--text-muted)", background: "var(--bg-raised)",
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("runs.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("runs.subtitle")}</p>
      </div>

      {loading && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("runs.loading")}</div>}
      {error && <div style={{ color: "var(--accent-red)", padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={headerCellStyle}>{t("runs.colSquad")}</th>
                <th style={headerCellStyle}>{t("runs.colRunId")}</th>
                <th style={headerCellStyle}>{t("runs.colStatus")}</th>
                <th style={headerCellStyle}>{t("runs.colSteps")}</th>
                <th style={headerCellStyle}>{t("runs.colDuration")}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.runId}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ ...cellStyle, fontWeight: 600 }}>{run.squad}</td>
                  <td style={{ ...cellStyle, color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{run.runId}</td>
                  <td style={cellStyle}><span className={`badge ${statusBadgeClass(run.status)}`}>{run.status}</span></td>
                  <td style={{ ...cellStyle, color: "var(--text-secondary)" }}>{run.steps ?? "-"}</td>
                  <td style={{ ...cellStyle, color: "var(--text-secondary)" }}>{run.duration ?? "-"}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr><td colSpan={5} style={{ ...cellStyle, textAlign: "center", color: "var(--text-muted)", padding: 32 }}>{t("runs.empty")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

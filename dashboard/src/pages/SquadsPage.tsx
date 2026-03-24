import { useEffect, useState } from "react";
import { Users, Puzzle, Globe } from "lucide-react";
import { api, type SquadDetail } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";

export function SquadsPage() {
  const [squads, setSquads] = useState<SquadDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useI18nStore((s) => s.t);

  useEffect(() => {
    api
      .getSquads()
      .then(setSquads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("squads.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("squads.subtitle")}</p>
      </div>

      {loading && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("squads.loading")}</div>}
      {error && <div style={{ color: "var(--accent-red)", padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {squads.map((squad) => (
            <div key={squad.code} className="card" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {squad.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{squad.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>v{squad.version}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                {squad.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Globe size={14} />{squad.platform}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={14} />{squad.agents.length} {t("squads.agents")}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Puzzle size={14} />{squad.skills.length} {t("squads.skills")}</span>
              </div>
            </div>
          ))}
          {squads.length === 0 && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("squads.empty")}</div>}
        </div>
      )}
    </div>
  );
}

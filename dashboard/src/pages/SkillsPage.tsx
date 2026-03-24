import { useEffect, useState } from "react";
import { Key } from "lucide-react";
import { api, type SkillInfo } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";

function typeBadgeClass(type: string): string {
  switch (type) {
    case "mcp": return "badge-running";
    case "script": return "badge-completed";
    case "hybrid": return "badge-checkpoint";
    case "prompt": return "badge-idle";
    default: return "badge-idle";
  }
}

export function SkillsPage() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useI18nStore((s) => s.t);

  useEffect(() => {
    api.getSkills().then(setSkills).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("skills.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("skills.subtitle")}</p>
      </div>

      {loading && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("skills.loading")}</div>}
      {error && <div style={{ color: "var(--accent-red)", padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {skills.map((skill) => (
            <div key={skill.slug} className="card" style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{skill.name}</div>
                {skill.type && <span className={`badge ${typeBadgeClass(skill.type)}`}>{skill.type}</span>}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                {skill.description}
              </p>
              {skill.env.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                  <Key size={12} />
                  {t(skill.env.length === 1 ? "skills.envVar" : "skills.envVars", { count: skill.env.length })}
                </div>
              )}
            </div>
          ))}
          {skills.length === 0 && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("skills.empty")}</div>}
        </div>
      )}
    </div>
  );
}

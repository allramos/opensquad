import { useEffect, useState } from "react";
import {
  Key,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, type SkillInfo } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";
import { LinkedText } from "@/components/LinkedText";
import { getGuidesForSkill, type EnvVarGuide } from "@/lib/envVarGuides";

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
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envDraft, setEnvDraft] = useState<Record<string, string>>({});
  const [envSaving, setEnvSaving] = useState(false);
  const [envSaved, setEnvSaved] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const t = useI18nStore((s) => s.t);
  const locale = useI18nStore((s) => s.locale);

  useEffect(() => {
    Promise.all([api.getSkills(), api.getEnvVars()])
      .then(([s, env]) => {
        setSkills(s);
        setEnvVars(env);
        setEnvDraft(env);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const saveEnv = async () => {
    setEnvSaving(true);
    try {
      await api.saveEnvVars(envDraft);
      setEnvVars({ ...envDraft });
      setEnvSaved(true);
      setTimeout(() => setEnvSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setEnvSaving(false);
    }
  };

  const toggleVisible = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const isConfigured = (key: string) => {
    const val = envVars[key];
    return !!val && val.length > 5 && !val.startsWith("your_");
  };

  const hasPendingChanges = Object.keys(envDraft).some(
    (k) => envDraft[k] !== (envVars[k] ?? "")
  ) || Object.keys(envDraft).length !== Object.keys(envVars).length;

  const getSteps = (guide: EnvVarGuide): string[] => {
    const loc = locale as keyof typeof guide.steps;
    return guide.steps[loc] ?? guide.steps.en;
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("skills.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("skills.subtitle")}</p>
      </div>

      {loading && <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("skills.loading")}</div>}
      {error && <div style={{ color: "var(--accent-red)", padding: 20 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {skills.map((skill) => {
            const guides = getGuidesForSkill(skill.slug);
            const isExpanded = expandedSkill === skill.slug;
            const allConfigured = guides.length > 0 && guides.every((g) => isConfigured(g.key));
            return (
              <div
                key={skill.slug}
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  transition: "var(--transition-normal)",
                }}
              >
                {/* Skill header */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: guides.length > 0 ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (guides.length > 0) setExpandedSkill(isExpanded ? null : skill.slug);
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{skill.name}</span>
                      {skill.type && (
                        <span className={`badge ${typeBadgeClass(skill.type)}`}>{skill.type}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      {skill.description}
                    </p>
                  </div>

                  {/* Status indicator */}
                  {guides.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {allConfigured ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent-green)" }}>
                          <CheckCircle2 size={14} />
                          {t("skills.configured")}
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent-amber)" }}>
                          <AlertCircle size={14} />
                          {t("skills.setupRequired")}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  )}

                  {guides.length === 0 && skill.env.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {t("skills.noConfigNeeded")}
                    </span>
                  )}
                </div>

                {/* Expanded config panel */}
                {isExpanded && guides.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      padding: "20px",
                      background: "var(--bg-raised)",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    {guides.map((guide) => {
                      const configured = isConfigured(guide.key);
                      const visible = visibleKeys.has(guide.key);

                      return (
                        <div key={guide.key} style={{ marginBottom: guides.indexOf(guide) < guides.length - 1 ? 24 : 0 }}>
                          {/* Var label + status */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Key size={14} color="var(--text-muted)" />
                            <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "monospace" }}>{guide.key}</span>
                            {configured && <CheckCircle2 size={14} color="var(--accent-green)" />}
                          </div>

                          {/* Input row */}
                          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                            <div style={{ flex: 1, position: "relative" }}>
                              <input
                                type={visible ? "text" : "password"}
                                value={envDraft[guide.key] ?? ""}
                                onChange={(e) => setEnvDraft({ ...envDraft, [guide.key]: e.target.value })}
                                placeholder={guide.placeholder}
                                style={{
                                  width: "100%",
                                  padding: "8px 40px 8px 12px",
                                  background: "var(--bg-surface)",
                                  border: `1px solid ${configured ? "var(--accent-green)" : "var(--border-default)"}`,
                                  borderRadius: "var(--radius-sm)",
                                  color: "var(--text-primary)",
                                  fontSize: 13,
                                  fontFamily: "monospace",
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={() => toggleVisible(guide.key)}
                                style={{
                                  position: "absolute",
                                  right: 8,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                  padding: 2,
                                }}
                              >
                                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* Setup guide */}
                          <div
                            style={{
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-md)",
                              padding: "12px 16px",
                            }}
                          >
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                {t("skills.howToSetup")}
                              </span>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                              {getSteps(guide).map((step, i) => (
                                <li key={i}><LinkedText text={step} /></li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      );
                    })}

                    {/* Save button */}
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        onClick={saveEnv}
                        disabled={envSaving || !hasPendingChanges}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          background: hasPendingChanges ? "var(--accent-primary)" : "var(--bg-overlay)",
                          color: hasPendingChanges ? "#fff" : "var(--text-muted)",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: hasPendingChanges ? "pointer" : "default",
                          transition: "var(--transition-fast)",
                          opacity: envSaving ? 0.6 : 1,
                        }}
                      >
                        {envSaved ? <Check size={14} /> : <Save size={14} />}
                        {envSaved ? t("settings.saved") : t("skills.saveKeys")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {skills.length === 0 && (
            <div style={{ color: "var(--text-muted)", padding: 20 }}>{t("skills.empty")}</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Save, Check, Sparkles, Cpu, Monitor, RefreshCw } from "lucide-react";
import { api, type Preferences } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";
import { CompanyWizard } from "@/components/CompanyWizard";

const IDE_OPTIONS = [
  { value: "claude-code", label: "Claude Code", ai: "Claude (Anthropic)" },
  { value: "antigravity", label: "Antigravity", ai: "Gemini (Google)" },
  { value: "codex", label: "Codex (OpenAI)", ai: "GPT / o-series (OpenAI)" },
  { value: "cursor", label: "Cursor", ai: "Claude / GPT (configurable)" },
  { value: "opencode", label: "OpenCode", ai: "Claude / GPT (configurable)" },
  { value: "vscode-copilot", label: "VS Code + Copilot", ai: "GPT (GitHub Copilot)" },
];

const TIER_OPTIONS = [
  { value: "powerful", labelKey: "settings.tierPowerful" },
  { value: "fast", labelKey: "settings.tierFast" },
];

const MODEL_ROLES = [
  { key: "orchestrator", labelKey: "settings.roleOrchestrator", descKey: "settings.roleOrchestratorDesc" },
  { key: "writer", labelKey: "settings.roleWriter", descKey: "settings.roleWriterDesc" },
  { key: "researcher", labelKey: "settings.roleResearcher", descKey: "settings.roleResearcherDesc" },
  { key: "investigator", labelKey: "settings.roleInvestigator", descKey: "settings.roleInvestigatorDesc" },
];

export function SettingsPage() {
  const t = useI18nStore((s) => s.t);
  const setLocale = useI18nStore((s) => s.setLocale);

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [models, setModels] = useState<Record<string, string>>({});
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsSaved, setModelsSaved] = useState(false);

  const [context, setContext] = useState("");
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextSaved, setContextSaved] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    api.getPreferences().then(setPrefs).catch((e) => setPrefsError(e.message)).finally(() => setPrefsLoading(false));
    api.getModelConfig().then((cfg) => setModels(cfg.models)).catch(() => {}).finally(() => setModelsLoading(false));
    api.getCompanyContext().then((res) => setContext(res.content)).catch((e) => setContextError(e.message)).finally(() => setContextLoading(false));
  }, []);

  const savePrefs = async () => {
    if (!prefs) return;
    try {
      await api.savePreferences(prefs);
      setLocale(prefs.language);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (e: unknown) {
      setPrefsError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const saveModels = async () => {
    try {
      await api.saveModelConfig(models);
      setModelsSaved(true);
      setTimeout(() => setModelsSaved(false), 2000);
    } catch {
      // silent
    }
  };

  const runUpdate = async () => {
    setUpdating(true);
    setUpdateResult(null);
    setUpdateError(null);
    try {
      const res = await api.updateCore();
      setUpdateResult(t("settings.updateSuccess", { from: res.from, to: res.to, count: String(res.filesUpdated) }));
    } catch (e: unknown) {
      setUpdateError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const saveCtx = async () => {
    try {
      await api.saveCompanyContext(context);
      setContextSaved(true);
      setTimeout(() => setContextSaved(false), 2000);
    } catch (e: unknown) {
      setContextError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", background: "var(--bg-raised)",
    border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit",
    outline: "none", transition: "var(--transition-fast)",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "var(--text-secondary)", marginBottom: 6,
  };
  const buttonStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", background: "var(--accent-primary)", color: "#fff",
    border: "none", borderRadius: "var(--radius-sm)", fontSize: 13,
    fontWeight: 600, cursor: "pointer", transition: "var(--transition-fast)",
  };
  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)", padding: 24,
  };

  const selectedIde = IDE_OPTIONS.find((o) => prefs?.ides?.includes(o.value));

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("settings.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("settings.subtitle")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>

        {/* Preferences */}
        <section className="card" style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{t("settings.preferences")}</h2>

          {prefsLoading && <div style={{ color: "var(--text-muted)" }}>{t("common.loading")}</div>}
          {prefsError && <div style={{ color: "var(--accent-red)", marginBottom: 12 }}>{prefsError}</div>}

          {prefs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>{t("settings.name")}</label>
                <input type="text" value={prefs.userName} onChange={(e) => setPrefs({ ...prefs, userName: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t("settings.language")}</label>
                <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="English">English</option>
                  <option value="Português (Brasil)">Português (Brasil)</option>
                  <option value="Español">Español</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t("settings.dateFormat")}</label>
                <select value={prefs.dateFormat} onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <button onClick={savePrefs} style={buttonStyle}>
                  {prefsSaved ? <Check size={14} /> : <Save size={14} />}
                  {prefsSaved ? t("settings.saved") : t("settings.savePreferences")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* AI Environment */}
        <section className="card" style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Cpu size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{t("settings.aiEnvironment")}</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
            {t("settings.aiEnvironmentDesc")}
          </p>

          {prefs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* IDE selection */}
              <div>
                <label style={labelStyle}>
                  <Monitor size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  {t("settings.ideLabel")}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {IDE_OPTIONS.map((ide) => {
                    const isActive = prefs.ides?.includes(ide.value);
                    return (
                      <button
                        key={ide.value}
                        onClick={() => setPrefs({ ...prefs, ides: [ide.value] })}
                        style={{
                          padding: "10px 12px",
                          background: isActive ? "var(--accent-primary-dim)" : "var(--bg-raised)",
                          border: `1px solid ${isActive ? "var(--accent-primary)" : "var(--border-default)"}`,
                          borderRadius: "var(--radius-md)",
                          color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "var(--transition-fast)",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{ide.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{ide.ai}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedIde && (
                <div style={{
                  padding: "10px 14px", borderRadius: "var(--radius-sm)",
                  background: "var(--accent-cyan-dim)", fontSize: 12,
                  color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Cpu size={14} />
                  {t("settings.aiActive", { ide: selectedIde.label, ai: selectedIde.ai })}
                </div>
              )}
            </div>
          )}

          {/* Model tiers */}
          {!modelsLoading && (
            <div style={{ marginTop: 20 }}>
              <label style={{ ...labelStyle, marginBottom: 12 }}>{t("settings.modelTiers")}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MODEL_ROLES.map(({ key, labelKey, descKey }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", background: "var(--bg-raised)",
                      border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t(labelKey)}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t(descKey)}</div>
                    </div>
                    <select
                      value={models[key] ?? "powerful"}
                      onChange={(e) => setModels({ ...models, [key]: e.target.value })}
                      style={{
                        padding: "4px 8px", background: "var(--bg-surface)",
                        border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)",
                        color: "var(--text-primary)", fontSize: 12, cursor: "pointer",
                        fontWeight: 600, minWidth: 110,
                      }}
                    >
                      {TIER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <button onClick={saveModels} style={buttonStyle}>
                  {modelsSaved ? <Check size={14} /> : <Save size={14} />}
                  {modelsSaved ? t("settings.saved") : t("settings.saveModelConfig")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Company Context */}
        <section className="card" style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{t("settings.companyContext")}</h2>
            <button
              onClick={() => setShowWizard(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", background: "var(--accent-primary-dim)",
                color: "var(--accent-primary)", border: "1px solid var(--accent-primary)",
                borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "var(--transition-fast)",
              }}
            >
              <Sparkles size={14} />
              {t("wizard.buttonLabel")}
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>{t("settings.companyContextDesc")}</p>

          {contextLoading && <div style={{ color: "var(--text-muted)" }}>{t("common.loading")}</div>}
          {contextError && <div style={{ color: "var(--accent-red)", marginBottom: 12 }}>{contextError}</div>}

          {!contextLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={16} placeholder={t("settings.companyContextPlaceholder")} style={{ ...inputStyle, resize: "vertical", minHeight: 280, lineHeight: 1.6 }} />
              <div>
                <button onClick={saveCtx} style={buttonStyle}>
                  {contextSaved ? <Check size={14} /> : <Save size={14} />}
                  {contextSaved ? t("settings.saved") : t("settings.saveContext")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* System Update */}
        <section className="card" style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <RefreshCw size={18} color="var(--accent-green)" />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{t("settings.systemUpdate")}</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            {t("settings.systemUpdateDesc")}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={runUpdate}
              disabled={updating}
              style={{
                ...buttonStyle,
                background: updating ? "var(--bg-overlay)" : "var(--accent-green)",
                color: updating ? "var(--text-muted)" : "#000",
                opacity: updating ? 0.7 : 1,
              }}
            >
              <RefreshCw size={14} style={updating ? { animation: "spin 1s linear infinite" } : undefined} />
              {updating ? t("settings.updating") : t("settings.updateButton")}
            </button>
          </div>
          {updateResult && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-green-dim)", color: "var(--accent-green)", fontSize: 13 }}>
              {updateResult}
            </div>
          )}
          {updateError && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--accent-red-dim)", color: "var(--accent-red)", fontSize: 13 }}>
              {updateError}
            </div>
          )}
        </section>
      </div>

      {showWizard && (
        <CompanyWizard
          onComplete={(md) => { setContext(md); setShowWizard(false); }}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

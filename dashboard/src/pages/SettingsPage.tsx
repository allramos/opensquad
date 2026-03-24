import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { api, type Preferences } from "@/lib/api";
import { useI18nStore } from "@/store/useI18nStore";

export function SettingsPage() {
  const t = useI18nStore((s) => s.t);
  const setLocale = useI18nStore((s) => s.setLocale);

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [context, setContext] = useState("");
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextSaved, setContextSaved] = useState(false);

  useEffect(() => {
    api.getPreferences().then(setPrefs).catch((e) => setPrefsError(e.message)).finally(() => setPrefsLoading(false));
    api.getCompanyContext().then((res) => setContext(res.content)).catch((e) => setContextError(e.message)).finally(() => setContextLoading(false));
  }, []);

  const savePrefs = async () => {
    if (!prefs) return;
    try {
      await api.savePreferences(prefs);
      // Apply language change immediately
      setLocale(prefs.language);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (e: unknown) {
      setPrefsError(e instanceof Error ? e.message : "Save failed");
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

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("settings.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("settings.subtitle")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
        <section className="card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: 24 }}>
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

        <section className="card" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t("settings.companyContext")}</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>{t("settings.companyContextDesc")}</p>

          {contextLoading && <div style={{ color: "var(--text-muted)" }}>{t("common.loading")}</div>}
          {contextError && <div style={{ color: "var(--accent-red)", marginBottom: 12 }}>{contextError}</div>}

          {!contextLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={12} style={{ ...inputStyle, resize: "vertical", minHeight: 200, lineHeight: 1.6 }} />
              <div>
                <button onClick={saveCtx} style={buttonStyle}>
                  {contextSaved ? <Check size={14} /> : <Save size={14} />}
                  {contextSaved ? t("settings.saved") : t("settings.saveContext")}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

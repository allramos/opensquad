import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";
import { api, type Preferences } from "@/lib/api";

export function SettingsPage() {
  // Preferences state
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Company context state
  const [context, setContext] = useState("");
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextSaved, setContextSaved] = useState(false);

  useEffect(() => {
    api
      .getPreferences()
      .then(setPrefs)
      .catch((e) => setPrefsError(e.message))
      .finally(() => setPrefsLoading(false));

    api
      .getCompanyContext()
      .then((res) => setContext(res.content))
      .catch((e) => setContextError(e.message))
      .finally(() => setContextLoading(false));
  }, []);

  const savePrefs = async () => {
    if (!prefs) return;
    try {
      await api.savePreferences(prefs);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (e: unknown) {
      setPrefsError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const saveContext = async () => {
    try {
      await api.saveCompanyContext(context);
      setContextSaved(true);
      setTimeout(() => setContextSaved(false), 2000);
    } catch (e: unknown) {
      setContextError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    background: "var(--bg-raised)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "var(--transition-fast)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6,
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "var(--accent-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "var(--transition-fast)",
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: 32,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Configure your opensquad workspace
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
        {/* Preferences section */}
        <section
          className="card"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Preferences</h2>

          {prefsLoading && (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          )}

          {prefsError && (
            <div style={{ color: "var(--accent-red)", marginBottom: 12 }}>{prefsError}</div>
          )}

          {prefs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={prefs.userName}
                  onChange={(e) => setPrefs({ ...prefs, userName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Language</label>
                <select
                  value={prefs.language}
                  onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="pt">Portuguese</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Date Format</label>
                <select
                  value={prefs.dateFormat}
                  onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <button onClick={savePrefs} style={buttonStyle}>
                  {prefsSaved ? <Check size={14} /> : <Save size={14} />}
                  {prefsSaved ? "Saved" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Company context section */}
        <section
          className="card"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Company Context</h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 16,
            }}
          >
            This context is loaded for every squad run. Use it to define your brand, tone, and guidelines.
          </p>

          {contextLoading && (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          )}

          {contextError && (
            <div style={{ color: "var(--accent-red)", marginBottom: 12 }}>{contextError}</div>
          )}

          {!contextLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={12}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 200,
                  lineHeight: 1.6,
                }}
              />
              <div>
                <button onClick={saveContext} style={buttonStyle}>
                  {contextSaved ? <Check size={14} /> : <Save size={14} />}
                  {contextSaved ? "Saved" : "Save Context"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

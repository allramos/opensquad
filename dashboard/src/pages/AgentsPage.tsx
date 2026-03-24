import { useEffect, useState, useCallback } from "react";
import { useI18nStore } from "@/store/useI18nStore";
import { api, type AgentInfo } from "@/lib/api";

type Agent = AgentInfo & { installed?: boolean };

export function AgentsPage() {
  const t = useI18nStore((s) => s.t);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [available, setAvailable] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstall, setShowInstall] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [operatingOn, setOperatingOn] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<"install" | "remove" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailable = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const data = await api.getAvailableAgents();
      setAvailable(data.filter((a) => !a.installed));
    } catch {
      /* empty */
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleInstall = async (slug: string) => {
    setOperatingOn(slug);
    setOperationType("install");
    try {
      await api.installAgent(slug);
      await fetchAgents();
      await fetchAvailable();
    } catch {
      /* empty */
    } finally {
      setOperatingOn(null);
      setOperationType(null);
    }
  };

  const handleRemove = async (slug: string) => {
    setConfirmRemove(null);
    setOperatingOn(slug);
    setOperationType("remove");
    try {
      await api.uninstallAgent(slug);
      await fetchAgents();
      if (showInstall) await fetchAvailable();
    } catch {
      /* empty */
    } finally {
      setOperatingOn(null);
      setOperationType(null);
    }
  };

  const handleOpenInstall = () => {
    setShowInstall(true);
    fetchAvailable();
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "var(--text-secondary)" }}>{t("agents.loading")}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={titleStyle}>{t("agents.title")}</h1>
          <p style={subtitleStyle}>{t("agents.subtitle")}</p>
        </div>
        <button onClick={handleOpenInstall} style={installButtonStyle}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          {t("agents.installAgents")}
        </button>
      </div>

      {/* Install Section */}
      {showInstall && (
        <div style={{ marginBottom: 24, animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{t("agents.availableAgents")}</h2>
            <button
              onClick={() => setShowInstall(false)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 18, fontFamily: "inherit" }}
            >
              x
            </button>
          </div>
          {loadingAvailable ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t("agents.loading")}</p>
          ) : available.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{t("agents.noAvailable")}</p>
          ) : (
            <div style={gridStyle}>
              {available.map((agent) => (
                <div key={agent.slug} className="card" style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
                      {agent.description && (
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{agent.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleInstall(agent.slug)}
                      disabled={operatingOn === agent.slug}
                      style={smallActionButtonStyle("var(--accent-green)")}
                    >
                      {operatingOn === agent.slug && operationType === "install" ? (
                        <span style={spinnerStyle}>{"\u21BB"}</span>
                      ) : null}
                      {operatingOn === agent.slug && operationType === "install"
                        ? t("agents.installing")
                        : t("agents.install")}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {agent.category && <span className="badge badge-info" style={badgeStyle("var(--accent-cyan)")}>{agent.category}</span>}
                    {agent.version && <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>v{agent.version}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderBottom: "1px solid var(--border)", marginTop: 16, marginBottom: 8 }} />
        </div>
      )}

      {/* Installed Agents */}
      {agents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>{t("agents.empty")}</p>
          <button onClick={handleOpenInstall} style={installButtonStyle}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            {t("agents.installAgents")}
          </button>
        </div>
      ) : (
        <div style={gridStyle}>
          {agents.map((agent) => (
            <div key={agent.slug} className="card" style={cardStyle}>
              {/* Card Header */}
              <div style={cardHeaderStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
                  {agent.description && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{agent.description}</div>
                  )}
                </div>
                {confirmRemove === agent.slug ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--accent-amber)" }}>{t("agents.removeConfirm")}</span>
                    <button
                      onClick={() => handleRemove(agent.slug)}
                      style={smallActionButtonStyle("var(--accent-red)")}
                    >
                      {t("agents.remove")}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(null)}
                      style={{ ...smallActionButtonStyle("var(--text-secondary)"), background: "transparent", border: "1px solid var(--border)" }}
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(agent.slug)}
                    disabled={operatingOn === agent.slug}
                    style={removeButtonStyle}
                    title={t("agents.remove")}
                  >
                    {operatingOn === agent.slug && operationType === "remove" ? (
                      <span style={spinnerStyle}>{"\u21BB"}</span>
                    ) : (
                      <span>{"\uD83D\uDDD1"}</span>
                    )}
                  </button>
                )}
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {agent.category && <span className="badge badge-info" style={badgeStyle("var(--accent-cyan)")}>{agent.category}</span>}
                {agent.version && <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>v{agent.version}</span>}
                <span className="badge badge-success" style={badgeStyle("var(--accent-green)")}>{t("agents.installed")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────── */

const pageStyle: React.CSSProperties = {
  padding: 24,
  overflowY: "auto",
  flex: 1,
  animation: "fadeIn 0.3s ease",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginBottom: 4,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 16,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

const installButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  background: "var(--accent-cyan)",
  color: "#000",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
};

function smallActionButtonStyle(color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: color,
    color: "#000",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

const removeButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontSize: 14,
  flexShrink: 0,
};

function badgeStyle(color: string): React.CSSProperties {
  return {
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 4,
    background: `${color}22`,
    color: color,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };
}

const spinnerStyle: React.CSSProperties = {
  display: "inline-block",
  animation: "spin 1s linear infinite",
};

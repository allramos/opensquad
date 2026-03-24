import { Activity, Users, Puzzle, History, ArrowRight } from "lucide-react";
import { useSquadStore } from "@/store/useSquadStore";
import { useNavStore, type Page } from "@/store/useNavStore";
import { useI18nStore } from "@/store/useI18nStore";

export function DashboardPage() {
  const squads = useSquadStore((s) => s.squads);
  const activeStates = useSquadStore((s) => s.activeStates);
  const navigate = useNavStore((s) => s.navigate);
  const t = useI18nStore((s) => s.t);

  const quickLinks: { icon: typeof Activity; labelKey: string; page: Page; descKey: string }[] = [
    { icon: Activity, labelKey: "nav.monitor", page: "monitor", descKey: "dashboard.monitorDesc" },
    { icon: Users, labelKey: "nav.squads", page: "squads", descKey: "dashboard.squadsDesc" },
    { icon: Puzzle, labelKey: "nav.skills", page: "skills", descKey: "dashboard.skillsDesc" },
    { icon: History, labelKey: "nav.runs", page: "runs", descKey: "dashboard.runsDesc" },
  ];

  const activeSquadEntries = Array.from(activeStates.entries());

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
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t("dashboard.title")}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "var(--accent-cyan-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Activity size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeStates.size}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("dashboard.activeSquads")}</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: "var(--radius-md)",
              background: "var(--accent-primary-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Users size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{squads.size}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("dashboard.totalSquads")}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
          {t("dashboard.quickLinks")}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {quickLinks.map(({ icon: Icon, labelKey, page, descKey }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className="card"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                border: "1px solid var(--border-subtle)",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "var(--transition-fast)",
              }}
            >
              <Icon size={18} color="var(--text-secondary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t(labelKey)}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t(descKey)}</div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      </div>

      {activeSquadEntries.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
            {t("dashboard.activeSquadsTitle")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeSquadEntries.map(([code, state]) => {
              const squad = squads.get(code);
              const statusClass =
                state.status === "running" ? "badge-running"
                  : state.status === "checkpoint" ? "badge-checkpoint"
                    : state.status === "completed" ? "badge-completed"
                      : "badge-idle";

              return (
                <div
                  key={code}
                  className="card"
                  style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                  onClick={() => navigate("monitor")}
                >
                  <div style={{ fontSize: 20 }}>{squad?.icon ?? ""}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{squad?.name ?? code}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {t("dashboard.step")} {state.step.current}/{state.step.total}
                      {state.step.label ? ` - ${state.step.label}` : ""}
                    </div>
                  </div>
                  <span className={`badge ${statusClass}`}>{state.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

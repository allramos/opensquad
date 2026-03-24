import { Activity, Users, Puzzle, History, ArrowRight } from "lucide-react";
import { useSquadStore } from "@/store/useSquadStore";
import { useNavStore, type Page } from "@/store/useNavStore";

const quickLinks: { icon: typeof Activity; label: string; page: Page; description: string }[] = [
  { icon: Activity, label: "Monitor", page: "monitor", description: "Live squad visualization" },
  { icon: Users, label: "Squads", page: "squads", description: "Manage your squads" },
  { icon: Puzzle, label: "Skills", page: "skills", description: "Installed integrations" },
  { icon: History, label: "Runs", page: "runs", description: "Execution history" },
];

export function DashboardPage() {
  const squads = useSquadStore((s) => s.squads);
  const activeStates = useSquadStore((s) => s.activeStates);
  const navigate = useNavStore((s) => s.navigate);

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
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Overview of your opensquad workspace
        </p>
      </div>

      {/* Stats cards */}
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
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-cyan-dim)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{activeStates.size}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Active Squads</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-primary-dim)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{squads.size}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Total Squads</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
          Quick Links
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {quickLinks.map(({ icon: Icon, label, page, description }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "var(--transition-fast)",
              }}
            >
              <Icon size={18} color="var(--text-secondary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{description}</div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      </div>

      {/* Recently active squads */}
      {activeSquadEntries.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
            Recently Active
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeSquadEntries.map(([code, state]) => {
              const squad = squads.get(code);
              const statusClass =
                state.status === "running"
                  ? "badge-running"
                  : state.status === "checkpoint"
                    ? "badge-checkpoint"
                    : state.status === "completed"
                      ? "badge-completed"
                      : "badge-idle";

              return (
                <div
                  key={code}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("monitor")}
                >
                  <div style={{ fontSize: 20 }}>{squad?.icon ?? ""}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {squad?.name ?? code}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Step {state.step.current}/{state.step.total}
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

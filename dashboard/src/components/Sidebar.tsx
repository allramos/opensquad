import { useState } from "react";
import {
  LayoutDashboard,
  Monitor,
  Users,
  Puzzle,
  History,
  Settings,
  Zap,
} from "lucide-react";
import { useNavStore, type Page } from "@/store/useNavStore";
import { useSquadStore } from "@/store/useSquadStore";

const navItems: { icon: typeof LayoutDashboard; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
  { icon: Monitor, label: "Monitor", page: "monitor" },
  { icon: Users, label: "Squads", page: "squads" },
  { icon: Puzzle, label: "Skills", page: "skills" },
  { icon: History, label: "Runs", page: "runs" },
  { icon: Settings, label: "Settings", page: "settings" },
];

export function Sidebar() {
  const currentPage = useNavStore((s) => s.currentPage);
  const navigate = useNavStore((s) => s.navigate);
  const isConnected = useSquadStore((s) => s.isConnected);
  const [hoveredPage, setHoveredPage] = useState<Page | null>(null);

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minWidth: "var(--sidebar-width)",
        height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--accent-primary-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={18} color="var(--accent-primary)" />
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            opensquad
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Dashboard
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ icon: Icon, label, page }) => {
          const isActive = currentPage === page;
          const isHovered = hoveredPage === page;

          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              onMouseEnter={() => setHoveredPage(page)}
              onMouseLeave={() => setHoveredPage(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: isActive
                  ? "var(--bg-active)"
                  : isHovered
                    ? "var(--bg-hover)"
                    : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "var(--transition-fast)",
                position: "relative",
                textAlign: "left",
                width: "100%",
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    borderRadius: 2,
                    background: "var(--accent-primary)",
                  }}
                />
              )}
              <Icon size={18} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Connection status */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: isConnected ? "var(--accent-green)" : "var(--accent-red)",
            flexShrink: 0,
          }}
        />
        {isConnected ? "Connected" : "Disconnected"}
      </div>
    </aside>
  );
}

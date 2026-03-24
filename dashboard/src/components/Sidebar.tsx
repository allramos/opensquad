import { useState } from "react";
import {
  LayoutDashboard,
  Monitor,
  Users,
  Puzzle,
  UserCheck,
  History,
  Settings,
  Zap,
} from "lucide-react";
import { useNavStore, type Page } from "@/store/useNavStore";
import { useSquadStore } from "@/store/useSquadStore";
import { useI18nStore } from "@/store/useI18nStore";

const navItems: { icon: typeof LayoutDashboard; labelKey: string; page: Page }[] = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", page: "dashboard" },
  { icon: Monitor, labelKey: "nav.monitor", page: "monitor" },
  { icon: Users, labelKey: "nav.squads", page: "squads" },
  { icon: Puzzle, labelKey: "nav.skills", page: "skills" },
  { icon: UserCheck, labelKey: "nav.agents", page: "agents" },
  { icon: History, labelKey: "nav.runs", page: "runs" },
  { icon: Settings, labelKey: "nav.settings", page: "settings" },
];

export function Sidebar() {
  const currentPage = useNavStore((s) => s.currentPage);
  const navigate = useNavStore((s) => s.navigate);
  const isConnected = useSquadStore((s) => s.isConnected);
  const t = useI18nStore((s) => s.t);
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
            {t("app.name")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {t("app.subtitle")}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ icon: Icon, labelKey, page }) => {
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
                {t(labelKey)}
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
        {isConnected ? t("nav.connected") : t("nav.disconnected")}
      </div>
    </aside>
  );
}

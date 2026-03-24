import { useEffect } from "react";
import { useSquadSocket } from "@/hooks/useSquadSocket";
import { useNavStore } from "@/store/useNavStore";
import { useI18nStore } from "@/store/useI18nStore";
import { Sidebar } from "@/components/Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { MonitorPage } from "@/pages/MonitorPage";
import { SquadsPage } from "@/pages/SquadsPage";
import { SkillsPage } from "@/pages/SkillsPage";
import { AgentsPage } from "@/pages/AgentsPage";
import { RunsPage } from "@/pages/RunsPage";
import { SettingsPage } from "@/pages/SettingsPage";

export function App() {
  useSquadSocket();
  const page = useNavStore((s) => s.currentPage);
  const loadI18n = useI18nStore((s) => s.loadFromPreferences);

  useEffect(() => { loadI18n(); }, [loadI18n]);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "monitor" && <MonitorPage />}
        {page === "squads" && <SquadsPage />}
        {page === "skills" && <SkillsPage />}
        {page === "agents" && <AgentsPage />}
        {page === "runs" && <RunsPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

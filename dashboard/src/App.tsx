import { useSquadSocket } from "@/hooks/useSquadSocket";
import { useNavStore } from "@/store/useNavStore";
import { Sidebar } from "@/components/Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { MonitorPage } from "@/pages/MonitorPage";
import { SquadsPage } from "@/pages/SquadsPage";
import { SkillsPage } from "@/pages/SkillsPage";
import { RunsPage } from "@/pages/RunsPage";
import { SettingsPage } from "@/pages/SettingsPage";

export function App() {
  useSquadSocket();
  const page = useNavStore((s) => s.currentPage);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {page === "dashboard" && <DashboardPage />}
        {page === "monitor" && <MonitorPage />}
        {page === "squads" && <SquadsPage />}
        {page === "skills" && <SkillsPage />}
        {page === "runs" && <RunsPage />}
        {page === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

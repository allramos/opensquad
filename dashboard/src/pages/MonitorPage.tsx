import { SquadSelector } from "@/components/SquadSelector";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";

export function MonitorPage() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SquadSelector />
        <OfficeScene />
      </div>
      <StatusBar />
    </div>
  );
}

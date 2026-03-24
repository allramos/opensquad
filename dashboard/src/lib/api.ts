// ---------------------------------------------------------------------------
// API client for the dashboard Vite plugin endpoints
// ---------------------------------------------------------------------------

export interface SkillInfo {
  slug: string;
  name: string;
  description: string;
  type: string;
  version: string;
  env: string[];
}

export interface AgentInfo {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  version: string;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  installSkill: (id: string) =>
    fetchJson<{ ok: boolean; id: string }>("/api/skills/install", { method: "POST", body: JSON.stringify({ id }) }),
  uninstallSkill: (id: string) =>
    fetchJson<{ ok: boolean; id: string }>("/api/skills/uninstall", { method: "POST", body: JSON.stringify({ id }) }),
  getAvailableSkills: () => fetchJson<(SkillInfo & { installed: boolean })[]>("/api/skills/available"),
  installAgent: (id: string) =>
    fetchJson<{ ok: boolean; id: string }>("/api/agents/install", { method: "POST", body: JSON.stringify({ id }) }),
  uninstallAgent: (id: string) =>
    fetchJson<{ ok: boolean; id: string }>("/api/agents/uninstall", { method: "POST", body: JSON.stringify({ id }) }),
  getAvailableAgents: () => fetchJson<(AgentInfo & { installed: boolean })[]>("/api/agents/available"),
  updateCore: () =>
    fetchJson<{ ok: boolean; from: string; to: string; filesUpdated: number }>("/api/update", { method: "POST" }),
};

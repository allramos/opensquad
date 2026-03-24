const BASE = "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface SkillInfo {
  slug: string;
  name: string;
  description: string;
  type: string;
  version: string | null;
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

export interface RunInfo {
  squad: string;
  runId: string;
  status: string;
  steps: string | null;
  duration: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface SquadDetail {
  code: string;
  name: string;
  icon: string;
  description: string;
  version: string;
  platform: string;
  format: string;
  skills: string[];
  agents: string[];
}

export interface Preferences {
  userName: string;
  language: string;
  ides: string[];
  dateFormat: string;
}

export const api = {
  getSkills: () => fetchJson<SkillInfo[]>("/api/skills"),
  getAgents: () => fetchJson<AgentInfo[]>("/api/agents"),
  getRuns: () => fetchJson<RunInfo[]>("/api/runs"),
  getSquads: () => fetchJson<SquadDetail[]>("/api/squads"),
  getPreferences: () => fetchJson<Preferences>("/api/preferences"),
  savePreferences: (prefs: Preferences) =>
    fetchJson<{ ok: boolean }>("/api/preferences", { method: "PUT", body: JSON.stringify(prefs) }),
  getCompanyContext: () => fetchJson<{ content: string }>("/api/company-context"),
  saveCompanyContext: (content: string) =>
    fetchJson<{ ok: boolean }>("/api/company-context", { method: "PUT", body: JSON.stringify({ content }) }),
  getEnvVars: () => fetchJson<Record<string, string>>("/api/env"),
  saveEnvVars: (vars: Record<string, string>) =>
    fetchJson<{ ok: boolean }>("/api/env", { method: "PUT", body: JSON.stringify(vars) }),
};

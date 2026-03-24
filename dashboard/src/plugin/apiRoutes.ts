import type { ViteDevServer } from "vite";
import fsp from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { IncomingMessage, ServerResponse } from "node:http";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(
  res: ServerResponse,
  status: number,
  body: unknown,
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function dirEntries(dir: string) {
  try {
    return await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function listSkills(projectRoot: string) {
  const skillsDir = path.join(projectRoot, "skills");
  const entries = await dirEntries(skillsDir);
  const matter = (await import("gray-matter")).default;

  const skills: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const skillMdPath = path.join(skillsDir, entry.name, "SKILL.md");
    try {
      const raw = await fsp.readFile(skillMdPath, "utf-8");
      const { data } = matter(raw);
      skills.push({
        slug: entry.name,
        name: data.name ?? entry.name,
        description: data.description ?? "",
        type: data.type ?? null,
        version: data.version ?? null,
        env: Array.isArray(data.env) ? data.env : [],
      });
    } catch {
      // No SKILL.md or unreadable — include with defaults
      skills.push({
        slug: entry.name,
        name: entry.name,
        description: "",
        type: null,
        version: null,
        env: [],
      });
    }
  }

  return skills;
}

async function listAgents(projectRoot: string) {
  const agentsDir = path.join(projectRoot, "agents");
  const entries = await dirEntries(agentsDir);
  const matter = (await import("gray-matter")).default;

  const agents: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".agent.md")) continue;

    const filePath = path.join(agentsDir, entry.name);
    try {
      const raw = await fsp.readFile(filePath, "utf-8");
      const { data } = matter(raw);
      agents.push({
        slug: entry.name.replace(/\.agent\.md$/, ""),
        name: data.name ?? entry.name,
        description: data.description ?? "",
        category: data.category ?? null,
        icon: data.icon ?? null,
        version: data.version ?? null,
      });
    } catch {
      // Unreadable — skip
    }
  }

  return agents;
}

async function listRuns(projectRoot: string) {
  const squadsDir = path.join(projectRoot, "squads");
  const squadEntries = await dirEntries(squadsDir);

  const runs: Record<string, unknown>[] = [];

  for (const squad of squadEntries) {
    if (!squad.isDirectory()) continue;
    if (squad.name.startsWith(".") || squad.name.startsWith("_")) continue;

    const outputDir = path.join(squadsDir, squad.name, "output");
    const runEntries = await dirEntries(outputDir);

    for (const run of runEntries) {
      if (!run.isDirectory()) continue;

      const statePath = path.join(outputDir, run.name, "state.json");
      try {
        const raw = await fsp.readFile(statePath, "utf-8");
        const parsed = JSON.parse(raw);
        runs.push({
          runId: run.name,
          squad: squad.name,
          ...parsed,
        });
      } catch {
        // Missing or invalid state.json — skip
      }
    }
  }

  // Sort by runId descending, limit 50
  runs.sort((a, b) => String(b.runId).localeCompare(String(a.runId)));
  return runs.slice(0, 50);
}

async function readPreferences(projectRoot: string) {
  const memoryDir = path.join(projectRoot, "_opensquad", "_memory");

  // Try JSON first
  const jsonPath = path.join(memoryDir, "preferences.json");
  try {
    const raw = await fsp.readFile(jsonPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    // Fall through to markdown
  }

  // Try markdown with **Key:** Value pattern
  const mdPath = path.join(memoryDir, "preferences.md");
  try {
    const raw = await fsp.readFile(mdPath, "utf-8");
    const prefs: Record<string, string> = {};
    const regex = /\*\*(.+?):\*\*\s*(.+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      prefs[match[1].trim()] = match[2].trim();
    }
    return prefs;
  } catch {
    return {};
  }
}

async function writePreferences(projectRoot: string, body: unknown) {
  const memoryDir = path.join(projectRoot, "_opensquad", "_memory");
  await fsp.mkdir(memoryDir, { recursive: true });
  const jsonPath = path.join(memoryDir, "preferences.json");
  await fsp.writeFile(jsonPath, JSON.stringify(body, null, 2), "utf-8");
}

async function readCompanyContext(projectRoot: string) {
  const filePath = path.join(projectRoot, "_opensquad", "_memory", "company.md");
  try {
    const content = await fsp.readFile(filePath, "utf-8");
    return { content };
  } catch {
    return { content: "" };
  }
}

async function writeCompanyContext(projectRoot: string, content: string) {
  const memoryDir = path.join(projectRoot, "_opensquad", "_memory");
  await fsp.mkdir(memoryDir, { recursive: true });
  const filePath = path.join(memoryDir, "company.md");
  await fsp.writeFile(filePath, content, "utf-8");
}

async function listSquads(projectRoot: string) {
  const squadsDir = path.join(projectRoot, "squads");
  const entries = await dirEntries(squadsDir);

  const squads: Record<string, unknown>[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(squadsDir, entry.name, "squad.yaml");
    try {
      const raw = await fsp.readFile(yamlPath, "utf-8");
      const parsed = parseYaml(raw);
      const s = parsed?.squad ?? parsed;
      squads.push({
        code: s?.code ?? entry.name,
        name: s?.name ?? entry.name,
        icon: s?.icon ?? null,
        version: s?.version ?? null,
        description: s?.description ?? "",
        target_audience: s?.target_audience ?? null,
        platform: s?.platform ?? null,
        format: s?.format ?? null,
        skills: Array.isArray(s?.skills) ? s.skills : [],
        agents: Array.isArray(s?.agents) ? s.agents : [],
      });
    } catch {
      squads.push({
        code: entry.name,
        name: entry.name,
        icon: null,
        version: null,
        description: "",
        target_audience: null,
        platform: null,
        format: null,
        skills: [],
        agents: [],
      });
    }
  }

  return squads;
}

async function getSquad(projectRoot: string, code: string) {
  const yamlPath = path.join(projectRoot, "squads", code, "squad.yaml");
  try {
    const raw = await fsp.readFile(yamlPath, "utf-8");
    const parsed = parseYaml(raw);
    const s = parsed?.squad ?? parsed;
    return {
      code: s?.code ?? code,
      name: s?.name ?? code,
      icon: s?.icon ?? null,
      version: s?.version ?? null,
      description: s?.description ?? "",
      target_audience: s?.target_audience ?? null,
      platform: s?.platform ?? null,
      format: s?.format ?? null,
      skills: Array.isArray(s?.skills) ? s.skills : [],
      agents: Array.isArray(s?.agents) ? s.agents : [],
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerApiRoutes(
  server: ViteDevServer,
  projectRoot: string,
): void {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";

    try {
      // GET /api/skills
      if (method === "GET" && url === "/api/skills") {
        const skills = await listSkills(projectRoot);
        return jsonResponse(res, 200, skills);
      }

      // GET /api/agents
      if (method === "GET" && url === "/api/agents") {
        const agents = await listAgents(projectRoot);
        return jsonResponse(res, 200, agents);
      }

      // GET /api/runs
      if (method === "GET" && url === "/api/runs") {
        const runs = await listRuns(projectRoot);
        return jsonResponse(res, 200, runs);
      }

      // GET /api/preferences
      if (method === "GET" && url === "/api/preferences") {
        const prefs = await readPreferences(projectRoot);
        return jsonResponse(res, 200, prefs);
      }

      // PUT /api/preferences
      if (method === "PUT" && url === "/api/preferences") {
        const body = JSON.parse(await readBody(req));
        await writePreferences(projectRoot, body);
        return jsonResponse(res, 200, { ok: true });
      }

      // GET /api/company-context
      if (method === "GET" && url === "/api/company-context") {
        const ctx = await readCompanyContext(projectRoot);
        return jsonResponse(res, 200, ctx);
      }

      // PUT /api/company-context
      if (method === "PUT" && url === "/api/company-context") {
        const body = JSON.parse(await readBody(req));
        if (typeof body?.content !== "string") {
          return jsonResponse(res, 400, { error: "body.content must be a string" });
        }
        await writeCompanyContext(projectRoot, body.content);
        return jsonResponse(res, 200, { ok: true });
      }

      // GET /api/squads
      if (method === "GET" && url === "/api/squads") {
        const squads = await listSquads(projectRoot);
        return jsonResponse(res, 200, squads);
      }

      // GET /api/squads/:code
      const squadMatch = method === "GET" && url.match(/^\/api\/squads\/([^/]+)$/);
      if (squadMatch) {
        const code = decodeURIComponent(squadMatch[1]);
        const squad = await getSquad(projectRoot, code);
        if (!squad) {
          return jsonResponse(res, 404, { error: "Squad not found" });
        }
        return jsonResponse(res, 200, squad);
      }

      // Not one of our routes — pass through
      next();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Internal Server Error";
      jsonResponse(res, 500, { error: message });
    }
  });
}

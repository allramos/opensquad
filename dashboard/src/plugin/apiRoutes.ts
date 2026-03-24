import type { ViteDevServer } from "vite";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function jsonResponse(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function resolveProjectRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), ".."), // started from dashboard/
    path.resolve(process.cwd()),       // started from project root
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "_opensquad"))) return c;
  }
  return path.resolve(process.cwd(), "..");
}

// ---------------------------------------------------------------------------
// Skills helpers
// ---------------------------------------------------------------------------

function getBundledSkillsDir(projectRoot: string): string {
  return path.join(projectRoot, "skills");
}

function getInstalledSkillsDir(projectRoot: string): string {
  return path.join(projectRoot, "skills");
}

async function parseSkillMeta(skillDir: string, slug: string) {
  const skillMdPath = path.join(skillDir, slug, "SKILL.md");
  try {
    const raw = await fsp.readFile(skillMdPath, "utf-8");
    const matter = (await import("gray-matter")).default;
    const { data } = matter(raw);
    return {
      slug,
      name: data.name ? String(data.name).trim() : slug,
      description: data.description ? String(data.description).trim() : "",
      type: data.type ? String(data.type).trim() : "",
      version: data.version ? String(data.version).trim() : "",
      env: Array.isArray(data.env) ? data.env.map((v: unknown) => String(v).trim()) : [],
    };
  } catch {
    return { slug, name: slug, description: "", type: "", version: "", env: [] as string[] };
  }
}

// ---------------------------------------------------------------------------
// Agents helpers
// ---------------------------------------------------------------------------

function getBundledAgentsDir(projectRoot: string): string {
  return path.join(projectRoot, "agents");
}

function getInstalledAgentsDir(projectRoot: string): string {
  return path.join(projectRoot, "agents");
}

async function parseAgentMeta(agentsDir: string, slug: string) {
  const agentMdPath = path.join(agentsDir, slug, "AGENT.md");
  try {
    const raw = await fsp.readFile(agentMdPath, "utf-8");
    const matter = (await import("gray-matter")).default;
    const { data } = matter(raw);
    return {
      slug,
      name: data.name ? String(data.name).trim() : slug,
      description: data.description ? String(data.description).trim() : "",
      category: data.category ? String(data.category).trim() : "",
      icon: data.icon ? String(data.icon).trim() : "",
      version: data.version ? String(data.version).trim() : "",
    };
  } catch {
    return { slug, name: slug, description: "", category: "", icon: "", version: "" };
  }
}

// ---------------------------------------------------------------------------
// Update helpers
// ---------------------------------------------------------------------------

const PROTECTED_PATHS = [
  "_opensquad/_memory",
  "_opensquad/_investigations",
  "agents",
  "squads",
];

function isProtected(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return PROTECTED_PATHS.some(
    (p) => normalized === p || normalized.startsWith(p + "/"),
  );
}

async function getTemplateEntries(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await getTemplateEntries(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Register API routes
// ---------------------------------------------------------------------------

export function registerApiRoutes(server: ViteDevServer) {
  const projectRoot = resolveProjectRoot();

  // POST /api/skills/install
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/skills/install" || req.method !== "POST") return next();
    try {
      const body = JSON.parse(await readBody(req));
      const id = body?.id;
      if (!id || typeof id !== "string" || !ID_RE.test(id)) {
        return jsonResponse(res, 400, { error: "Invalid skill id" });
      }

      const bundledDir = getBundledSkillsDir(projectRoot);
      const srcDir = path.join(bundledDir, id);
      const destDir = path.join(getInstalledSkillsDir(projectRoot), id);

      // Check bundled skill exists
      try {
        await fsp.stat(srcDir);
      } catch {
        return jsonResponse(res, 404, { error: `Skill '${id}' not found` });
      }

      // Self-install detection (dev scenario where src === dest)
      const resolvedSrc = path.resolve(srcDir);
      const resolvedDest = path.resolve(destDir);
      if (resolvedSrc === resolvedDest) {
        return jsonResponse(res, 200, { ok: true, id });
      }

      // Check if already installed
      try {
        await fsp.stat(destDir);
        return jsonResponse(res, 409, { error: `Skill '${id}' is already installed` });
      } catch {
        // Not installed — proceed
      }

      await fsp.cp(srcDir, destDir, { recursive: true });
      jsonResponse(res, 200, { ok: true, id });
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // POST /api/skills/uninstall
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/skills/uninstall" || req.method !== "POST") return next();
    try {
      const body = JSON.parse(await readBody(req));
      const id = body?.id;
      if (!id || typeof id !== "string" || !ID_RE.test(id)) {
        return jsonResponse(res, 400, { error: "Invalid skill id" });
      }

      const skillDir = path.join(getInstalledSkillsDir(projectRoot), id);
      await fsp.rm(skillDir, { recursive: true, force: true });
      jsonResponse(res, 200, { ok: true, id });
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // GET /api/skills/available
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/skills/available" || req.method !== "GET") return next();
    try {
      const bundledDir = getBundledSkillsDir(projectRoot);
      const installedDir = getInstalledSkillsDir(projectRoot);

      let entries;
      try {
        entries = await fsp.readdir(bundledDir, { withFileTypes: true });
      } catch {
        return jsonResponse(res, 200, []);
      }

      const skills = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const slug = entry.name;
        const meta = await parseSkillMeta(bundledDir, slug);

        let installed = false;
        // In dev, bundled === installed dir, so check if it exists
        const resolvedBundled = path.resolve(bundledDir);
        const resolvedInstalled = path.resolve(installedDir);
        if (resolvedBundled === resolvedInstalled) {
          installed = true; // all bundled skills are "installed" in dev
        } else {
          try {
            await fsp.stat(path.join(installedDir, slug));
            installed = true;
          } catch {
            installed = false;
          }
        }

        skills.push({ ...meta, installed });
      }

      jsonResponse(res, 200, skills);
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // POST /api/agents/install
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/agents/install" || req.method !== "POST") return next();
    try {
      const body = JSON.parse(await readBody(req));
      const id = body?.id;
      if (!id || typeof id !== "string" || !ID_RE.test(id)) {
        return jsonResponse(res, 400, { error: "Invalid agent id" });
      }

      const bundledDir = getBundledAgentsDir(projectRoot);
      const srcFile = path.join(bundledDir, id, "AGENT.md");
      const destDir = path.join(getInstalledAgentsDir(projectRoot));
      const destFile = path.join(destDir, `${id}.agent.md`);

      // Check bundled agent exists
      try {
        await fsp.stat(srcFile);
      } catch {
        return jsonResponse(res, 404, { error: `Agent '${id}' not found` });
      }

      // Check if already installed
      try {
        await fsp.stat(destFile);
        return jsonResponse(res, 409, { error: `Agent '${id}' is already installed` });
      } catch {
        // Not installed — proceed
      }

      await fsp.mkdir(destDir, { recursive: true });
      await fsp.copyFile(srcFile, destFile);
      jsonResponse(res, 200, { ok: true, id });
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // POST /api/agents/uninstall
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/agents/uninstall" || req.method !== "POST") return next();
    try {
      const body = JSON.parse(await readBody(req));
      const id = body?.id;
      if (!id || typeof id !== "string" || !ID_RE.test(id)) {
        return jsonResponse(res, 400, { error: "Invalid agent id" });
      }

      const agentFile = path.join(getInstalledAgentsDir(projectRoot), `${id}.agent.md`);
      await fsp.rm(agentFile, { force: true });
      jsonResponse(res, 200, { ok: true, id });
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // GET /api/agents/available
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/agents/available" || req.method !== "GET") return next();
    try {
      const bundledDir = getBundledAgentsDir(projectRoot);
      const installedDir = getInstalledAgentsDir(projectRoot);

      let entries;
      try {
        entries = await fsp.readdir(bundledDir, { withFileTypes: true });
      } catch {
        return jsonResponse(res, 200, []);
      }

      const agents = [];
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const slug = entry.name;
        const meta = await parseAgentMeta(bundledDir, slug);

        let installed = false;
        try {
          await fsp.stat(path.join(installedDir, `${slug}.agent.md`));
          installed = true;
        } catch {
          installed = false;
        }

        agents.push({ ...meta, installed });
      }

      jsonResponse(res, 200, agents);
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });

  // POST /api/update
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
    if (req.url !== "/api/update" || req.method !== "POST") return next();
    try {
      const templatesDir = path.join(projectRoot, "templates");

      // Read current version
      let oldVersion = "unknown";
      try {
        oldVersion = (
          await fsp.readFile(
            path.join(projectRoot, "_opensquad", ".opensquad-version"),
            "utf-8",
          )
        ).trim();
      } catch {
        // Legacy install — no version file
      }

      // Read new version
      const newVersion = (
        await fsp.readFile(
          path.join(templatesDir, "_opensquad", ".opensquad-version"),
          "utf-8",
        )
      ).trim();

      // Copy template files, skipping protected paths and ide-templates
      const entries = await getTemplateEntries(templatesDir);
      let count = 0;

      for (const entry of entries) {
        const relativePath = path.relative(templatesDir, entry);
        if (isProtected(relativePath)) continue;
        if (relativePath.replace(/\\/g, "/").startsWith("ide-templates/")) continue;

        const destPath = path.join(projectRoot, relativePath);
        await fsp.mkdir(path.dirname(destPath), { recursive: true });
        await fsp.cp(entry, destPath);
        count++;
      }

      jsonResponse(res, 200, { ok: true, from: oldVersion, to: newVersion, filesUpdated: count });
    } catch (err) {
      jsonResponse(res, 500, { error: String(err) });
    }
  });
}

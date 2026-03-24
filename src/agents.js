import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseFrontmatter,
  parseLocalizedDescriptions,
  getLocalizedDescription,
  validateId,
  createMetaCache,
  getVersionFromFile,
} from './registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_AGENTS_DIR = join(__dirname, '..', 'agents');

const metaCache = createMetaCache();

export async function listInstalled(targetDir) {
  try {
    const agentsDir = join(targetDir, 'agents');
    const entries = await readdir(agentsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.agent.md'))
      .map((e) => e.name.replace(/\.agent\.md$/, ''));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function listAvailable() {
  try {
    const entries = await readdir(BUNDLED_AGENTS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getAgentMeta(id) {
  if (metaCache.has(id)) return metaCache.get(id);
  try {
    const filePath = join(BUNDLED_AGENTS_DIR, id, 'AGENT.md');
    const { data } = await parseFrontmatter(filePath);

    const name = data.name ? String(data.name).trim() : id;
    const description = data.description ? String(data.description).trim() : '';
    const category = data.category ? String(data.category).trim() : '';
    const icon = data.icon ? String(data.icon).trim() : '';
    const version = data.version ? String(data.version).trim() : '';
    const descriptions = parseLocalizedDescriptions(data);

    const result = { name, description, descriptions, category, icon, version };
    metaCache.set(id, result);
    return result;
  } catch (err) {
    if (err.code === 'ENOENT') {
      metaCache.set(id, null);
      return null;
    }
    throw err;
  }
}

export async function installAgent(id, targetDir) {
  validateId(id, 'agent');
  const srcFile = join(BUNDLED_AGENTS_DIR, id, 'AGENT.md');
  try {
    await stat(srcFile);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Agent '${id}' not found in registry`, { cause: err });
    throw err;
  }
  const destDir = join(targetDir, 'agents');
  const destFile = join(destDir, `${id}.agent.md`);
  const resolvedDest = resolve(destFile).toLowerCase();
  const resolvedTarget = resolve(targetDir).toLowerCase();
  if (!resolvedDest.startsWith(resolvedTarget + sep)) {
    throw new Error(`Agent destination escapes target directory: '${id}'`);
  }
  await mkdir(destDir, { recursive: true });
  await copyFile(srcFile, destFile);
  metaCache.delete(id);
}

export async function removeAgent(id, targetDir) {
  validateId(id, 'agent');
  const agentFile = join(targetDir, 'agents', `${id}.agent.md`);
  const resolvedFile = resolve(agentFile).toLowerCase();
  const resolvedTarget = resolve(targetDir).toLowerCase();
  if (!resolvedFile.startsWith(resolvedTarget + sep)) {
    throw new Error(`Agent path escapes target directory: '${id}'`);
  }
  await rm(agentFile, { force: true });
  metaCache.delete(id);
}

export function clearMetaCache() {
  metaCache.clear();
}

export async function getAgentVersion(id, targetDir) {
  const agentPath = join(targetDir, 'agents', `${id}.agent.md`);
  return getVersionFromFile(agentPath);
}

export { getLocalizedDescription };

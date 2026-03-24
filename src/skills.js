import { cp, readdir, rm, stat } from 'node:fs/promises';
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
const BUNDLED_SKILLS_DIR = join(__dirname, '..', 'skills');

const metaCache = createMetaCache();

export async function listInstalled(targetDir) {
  try {
    const skillsDir = join(targetDir, 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'opensquad-skill-creator')
      .map((e) => e.name);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function listAvailable() {
  try {
    const entries = await readdir(BUNDLED_SKILLS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getSkillMeta(id) {
  if (metaCache.has(id)) return metaCache.get(id);
  try {
    const filePath = join(BUNDLED_SKILLS_DIR, id, 'SKILL.md');
    const { data } = await parseFrontmatter(filePath);

    const name = data.name ? String(data.name).trim() : id;
    const description = data.description ? String(data.description).trim() : '';
    const type = data.type ? String(data.type).trim() : '';
    const env = Array.isArray(data.env) ? data.env.map((v) => String(v).trim()) : [];
    const descriptions = parseLocalizedDescriptions(data);

    const result = { name, description, descriptions, type, env };
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

export async function installSkill(id, targetDir) {
  validateId(id, 'skill');
  const srcDir = join(BUNDLED_SKILLS_DIR, id);
  try {
    await stat(srcDir);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Skill '${id}' not found in registry`, { cause: err });
    throw err;
  }
  const destDir = join(targetDir, 'skills', id);
  const resolvedSrc = resolve(srcDir).toLowerCase();
  const resolvedDest = resolve(destDir).toLowerCase();
  const resolvedTarget = resolve(targetDir).toLowerCase();
  if (resolvedSrc === resolvedDest || resolvedDest.startsWith(resolvedSrc + sep)) {
    return;
  }
  // Ensure destination is within targetDir
  if (!resolvedDest.startsWith(resolvedTarget + sep)) {
    throw new Error(`Skill destination escapes target directory: '${id}'`);
  }
  await cp(srcDir, destDir, { recursive: true });
  metaCache.delete(id);
}

export async function removeSkill(id, targetDir) {
  validateId(id, 'skill');
  const skillDir = join(targetDir, 'skills', id);
  const resolvedDir = resolve(skillDir).toLowerCase();
  const resolvedTarget = resolve(targetDir).toLowerCase();
  if (!resolvedDir.startsWith(resolvedTarget + sep)) {
    throw new Error(`Skill path escapes target directory: '${id}'`);
  }
  await rm(skillDir, { recursive: true, force: true });
  metaCache.delete(id);
}

export function clearMetaCache() {
  metaCache.clear();
}

export async function getSkillVersion(id, targetDir) {
  const skillPath = join(targetDir, 'skills', id, 'SKILL.md');
  return getVersionFromFile(skillPath);
}

export { getLocalizedDescription };

import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

const LOCALE_CODES = ['pt-BR', 'es'];

/**
 * Parse frontmatter from a markdown file using gray-matter.
 * Returns { data, content } where data is the parsed YAML object.
 */
export async function parseFrontmatter(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  return matter(raw);
}

/**
 * Extract localized descriptions from parsed frontmatter data.
 * Looks for keys like description_pt-BR, description_es, etc.
 */
export function parseLocalizedDescriptions(data) {
  const descriptions = {};
  for (const code of LOCALE_CODES) {
    const key = `description_${code}`;
    if (data[key]) {
      descriptions[code] = String(data[key]).trim();
    }
  }
  return descriptions;
}

/**
 * Return the best description for a given locale, falling back to English.
 */
export function getLocalizedDescription(meta, localeCode) {
  if (localeCode && localeCode !== 'en' && meta.descriptions?.[localeCode]) {
    return meta.descriptions[localeCode];
  }
  return meta.description;
}

/**
 * Validate an ID (skill or agent) — lowercase alphanumeric + hyphens only.
 */
export function validateId(id, type = 'item') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid ${type} id: '${id}'`);
  }
}

/**
 * Create a simple Map-based metadata cache with get/set/delete/clear.
 */
export function createMetaCache() {
  const cache = new Map();
  return {
    has: (key) => cache.has(key),
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
    delete: (key) => cache.delete(key),
    clear: () => cache.clear(),
  };
}

/**
 * Extract a version string from frontmatter of an installed item.
 */
export async function getVersionFromFile(filePath) {
  try {
    const { data } = await parseFrontmatter(filePath);
    return data.version ? String(data.version).trim() : null;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export { LOCALE_CODES };

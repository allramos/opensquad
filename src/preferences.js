import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PREFS_DIR = '_opensquad/_memory';
const PREFS_JSON = 'preferences.json';
const PREFS_MD = 'preferences.md';

function prefsJsonPath(targetDir) {
  return join(targetDir, PREFS_DIR, PREFS_JSON);
}

function prefsMdPath(targetDir) {
  return join(targetDir, PREFS_DIR, PREFS_MD);
}

/**
 * Read preferences. Tries JSON first, falls back to legacy markdown format.
 */
export async function readPreferences(targetDir) {
  // Try JSON first
  try {
    const raw = await readFile(prefsJsonPath(targetDir), 'utf-8');
    return JSON.parse(raw);
  } catch {
    // JSON not found — try legacy markdown
  }

  try {
    const content = await readFile(prefsMdPath(targetDir), 'utf-8');
    return parseLegacyMarkdown(content);
  } catch {
    // No preferences at all
  }

  return defaultPreferences();
}

/**
 * Write preferences as JSON.
 */
export async function writePreferences(targetDir, prefs) {
  const filePath = prefsJsonPath(targetDir);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(prefs, null, 2) + '\n', 'utf-8');
}

function defaultPreferences() {
  return {
    userName: '',
    language: 'English',
    ides: ['claude-code'],
    dateFormat: 'YYYY-MM-DD',
  };
}

function parseLegacyMarkdown(content) {
  const prefs = defaultPreferences();

  const nameMatch = content.match(/\*\*User Name:\*\*\s*(.+)/);
  if (nameMatch) prefs.userName = nameMatch[1].trim();

  const langMatch = content.match(/\*\*Output Language:\*\*\s*(.+)/);
  if (langMatch) prefs.language = langMatch[1].trim();

  const idesMatch = content.match(/\*\*IDEs:\*\*\s*(.+)/);
  if (idesMatch) prefs.ides = idesMatch[1].trim().split(/,\s*/);

  const dateMatch = content.match(/\*\*Date Format:\*\*\s*(.+)/);
  if (dateMatch) prefs.dateFormat = dateMatch[1].trim();

  return prefs;
}

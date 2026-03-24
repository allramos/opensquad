import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listRuns, formatDuration, printRuns } from '../src/runs.js';
import { loadLocale } from '../src/i18n.js';

test('listRuns returns empty array when no squads exist', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns finds state.json in output directories', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), JSON.stringify({
      squad: 'my-squad',
      status: 'completed',
      step: { current: 3, total: 3 },
      startedAt: '2026-03-17T12:00:00Z',
      completedAt: '2026-03-17T12:05:00Z',
    }), 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'my-squad');
    assert.equal(runs[0].status, 'completed');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns filters by squad name', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (const name of ['squad-a', 'squad-b']) {
      const runDir = join(dir, 'squads', name, 'output', '2026-03-17-120000');
      await mkdir(runDir, { recursive: true });
      await writeFile(join(runDir, 'state.json'), JSON.stringify({
        squad: name, status: 'completed', step: { current: 1, total: 1 },
        startedAt: '2026-03-17T12:00:00Z', completedAt: '2026-03-17T12:01:00Z',
      }), 'utf-8');
    }

    const runs = await listRuns('squad-a', dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].squad, 'squad-a');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns returns unknown for runs without state.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns handles malformed state.json', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), 'not json', 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'unknown');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns sorts by runId descending', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (const ts of ['2026-03-17-100000', '2026-03-17-120000', '2026-03-17-080000']) {
      const runDir = join(dir, 'squads', 'my-squad', 'output', ts);
      await mkdir(runDir, { recursive: true });
      await writeFile(join(runDir, 'state.json'), JSON.stringify({
        squad: 'my-squad', status: 'completed', step: { current: 1, total: 1 },
        startedAt: `2026-03-17T${ts.slice(11, 13)}:00:00Z`,
        completedAt: `2026-03-17T${ts.slice(11, 13)}:01:00Z`,
      }), 'utf-8');
    }

    const runs = await listRuns(null, dir);
    assert.equal(runs[0].runId, '2026-03-17-120000');
    assert.equal(runs[1].runId, '2026-03-17-100000');
    assert.equal(runs[2].runId, '2026-03-17-080000');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns limits to 20 results', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    for (let i = 0; i < 25; i++) {
      const ts = `2026-03-${String(i + 1).padStart(2, '0')}-120000`;
      const runDir = join(dir, 'squads', 'my-squad', 'output', ts);
      await mkdir(runDir, { recursive: true });
    }

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 20);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('formatDuration formats milliseconds', () => {
  assert.equal(formatDuration(150000), '2m 30s');
  assert.equal(formatDuration(3600000), '1h 0m');
  assert.equal(formatDuration(3661000), '1h 1m');
  assert.equal(formatDuration(45000), '45s');
  assert.equal(formatDuration(0), '0s');
});

test('listRuns calculates duration from timestamps', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const runDir = join(dir, 'squads', 'my-squad', 'output', '2026-03-17-120000');
    await mkdir(runDir, { recursive: true });
    await writeFile(join(runDir, 'state.json'), JSON.stringify({
      squad: 'my-squad', status: 'completed',
      step: { current: 3, total: 3 },
      startedAt: '2026-03-17T12:00:00Z',
      completedAt: '2026-03-17T12:05:30Z',
    }), 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs[0].duration, '5m 30s');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listRuns ignores non-directory entries in output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-runs-'));
  try {
    const outputDir = join(dir, 'squads', 'my-squad', 'output');
    await mkdir(outputDir, { recursive: true });
    await writeFile(join(outputDir, 'random-file.txt'), 'not a run', 'utf-8');

    const runs = await listRuns(null, dir);
    assert.equal(runs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- printRuns ---

test('printRuns outputs "No runs found" for empty array', async () => {
  await loadLocale('English');
  const lines = [];
  const origLog = console.log;
  console.log = (msg) => lines.push(msg);
  try {
    printRuns([]);
  } finally {
    console.log = origLog;
  }
  assert.ok(lines.some((l) => l.includes('No runs found')));
});

test('printRuns outputs squad name and run details', () => {
  const lines = [];
  const origLog = console.log;
  console.log = (msg) => lines.push(msg);
  try {
    printRuns([
      { squad: 'my-squad', runId: '2026-03-17-120000', status: 'completed', steps: '3/3', duration: '5m 30s' },
    ]);
  } finally {
    console.log = origLog;
  }
  const all = lines.join('\n');
  assert.ok(all.includes('my-squad'));
  assert.ok(all.includes('2026-03-17-120000'));
  assert.ok(all.includes('completed'));
  assert.ok(all.includes('5m 30s'));
});

test('printRuns groups runs by squad', () => {
  const lines = [];
  const origLog = console.log;
  console.log = (msg) => lines.push(msg);
  try {
    printRuns([
      { squad: 'alpha', runId: 'run-2', status: 'running', steps: null, duration: null },
      { squad: 'alpha', runId: 'run-1', status: 'completed', steps: '2/2', duration: '1m 0s' },
      { squad: 'beta', runId: 'run-3', status: 'failed', steps: '1/3', duration: '30s' },
    ]);
  } finally {
    console.log = origLog;
  }
  const all = lines.join('\n');
  assert.ok(all.includes('alpha'));
  assert.ok(all.includes('beta'));
});

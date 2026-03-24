import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'bin', 'opensquad.js');

function run(...args) {
  return execFileSync(process.execPath, [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 10000,
  });
}

function runWithStatus(...args) {
  try {
    const stdout = run(...args);
    return { stdout, exitCode: 0 };
  } catch (err) {
    return { stdout: err.stdout || '', exitCode: err.status };
  }
}

// --- --version ---

test('--version prints the package version', () => {
  const output = run('--version');
  assert.match(output.trim(), /^\d+\.\d+\.\d+$/);
});

test('-v prints the package version', () => {
  const output = run('-v');
  assert.match(output.trim(), /^\d+\.\d+\.\d+$/);
});

// --- --help ---

test('--help prints usage information', () => {
  const output = run('--help');
  assert.ok(output.includes('opensquad'));
  assert.ok(output.includes('Usage:'));
  assert.ok(output.includes('init'));
  assert.ok(output.includes('install'));
});

test('-h prints usage information', () => {
  const output = run('-h');
  assert.ok(output.includes('Usage:'));
});

// --- unknown command ---

test('unknown command prints help and exits with code 1', () => {
  const { stdout, exitCode } = runWithStatus('nonexistent-command');
  assert.ok(stdout.includes('Usage:'));
  assert.equal(exitCode, 1);
});

// --- no command ---

test('no command prints help and exits with code 0', () => {
  const { stdout, exitCode } = runWithStatus();
  assert.ok(stdout.includes('Usage:'));
  assert.equal(exitCode, 0);
});

#!/usr/bin/env node

import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';
import { listRuns, printRuns } from '../src/runs.js';
import { loadSavedLocale } from '../src/init.js';

const HELP_TEXT = `
  opensquad — Multi-agent orchestration for Claude Code

  Usage:
    npx opensquad init                    Initialize Opensquad
    npx opensquad update                  Update Opensquad core
    npx opensquad install <name>          Install a skill
    npx opensquad uninstall <name>        Remove a skill
    npx opensquad update <name>           Update a specific skill
    npx opensquad skills                  List installed skills
    npx opensquad agents                  List installed agents
    npx opensquad agents install <name>   Install a predefined agent
    npx opensquad agents remove <name>    Remove an agent
    npx opensquad agents update           Update all agents
    npx opensquad runs [squad-name]       View execution history

  Options:
    --help, -h       Show this help message
    --version, -v    Show version number

  Learn more: https://github.com/renatoasse/opensquad
`;

function getVersion() {
  const require = createRequire(import.meta.url);
  return require('../package.json').version;
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    help: { type: 'boolean', short: 'h', default: false },
    version: { type: 'boolean', short: 'v', default: false },
  },
});

try {
  if (values.version) {
    console.log(getVersion());
  } else if (values.help) {
    console.log(HELP_TEXT);
  } else {
    const command = positionals[0];

    if (command === 'init') {
      await init(process.cwd());
    } else if (command === 'install') {
      const result = await skillsCli('install', positionals.slice(1), process.cwd());
      if (!result.success) process.exitCode = 1;
    } else if (command === 'uninstall') {
      const result = await skillsCli('remove', positionals.slice(1), process.cwd());
      if (!result.success) process.exitCode = 1;
    } else if (command === 'update') {
      const target = positionals[1];
      if (target) {
        const result = await skillsCli('update-one', [target], process.cwd());
        if (!result.success) process.exitCode = 1;
      } else {
        const result = await update(process.cwd());
        if (!result.success) process.exitCode = 1;
      }
    } else if (command === 'skills') {
      const subcommand = positionals[1];
      const args = positionals.slice(2);
      const result = await skillsCli(subcommand, args, process.cwd());
      if (!result.success) process.exitCode = 1;
    } else if (command === 'agents') {
      const subcommand = positionals[1];
      const args = positionals.slice(2);
      const result = await agentsCli(subcommand, args, process.cwd());
      if (!result.success) process.exitCode = 1;
    } else if (command === 'runs') {
      await loadSavedLocale(process.cwd());
      const squadName = positionals[1] || null;
      const runs = await listRuns(squadName, process.cwd());
      printRuns(runs);
    } else {
      console.log(HELP_TEXT);
      if (command) process.exitCode = 1;
    }
  }
} catch (err) {
  console.error(`\n  Error: ${err.message}\n`);
  process.exitCode = 1;
}

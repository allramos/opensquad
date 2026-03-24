import { createInterface } from 'node:readline';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { listInstalled, installAgent, removeAgent, getAgentMeta, getLocalizedDescription } from './agents.js';
import { loadLocale, t, getLocaleCode } from './i18n.js';
import { loadSavedLocale } from './init.js';
import { logEvent } from './logger.js';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function agentsCli(subcommand, args, targetDir) {
  // Require initialized project
  try {
    await stat(join(targetDir, '_opensquad'));
  } catch {
    await loadLocale('English');
    console.log(`\n  ${t('agentsNotInitialized')}\n`);
    return { success: false };
  }

  await loadSavedLocale(targetDir);

  try {
    if (subcommand === 'list' || !subcommand) {
      await runList(targetDir);
    } else if (subcommand === 'install') {
      if (!(await runInstall(args[0], targetDir))) return { success: false };
    } else if (subcommand === 'remove') {
      if (!(await runRemove(args[0], targetDir))) return { success: false };
    } else if (subcommand === 'update') {
      await runUpdate(targetDir);
    } else if (subcommand === 'update-one') {
      await runUpdateOne(args[0], targetDir);
    } else {
      console.log(`\n  ${t('agentsUnknownCommand', { cmd: subcommand })}\n`);
      return { success: false };
    }
  } catch (err) {
    console.log(`\n  ${t('agentsError', { message: err.message })}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList(targetDir) {
  console.log(`\n  ${t('agentsTitle')}\n`);

  const installed = await listInstalled(targetDir);

  if (installed.length > 0) {
    console.log(`  ${t('agentsInstalledHeader')}`);
    for (const id of installed) {
      const meta = await getAgentMeta(id);
      if (meta) {
        const desc = getLocalizedDescription(meta, getLocaleCode());
        const parts = [meta.name];
        if (meta.icon) parts.unshift(meta.icon);
        if (meta.category) parts.push(`(${meta.category})`);
        parts.push(`- ${desc.split('.')[0]}`);
        console.log(`    ${parts.join(' ')}`);
      } else {
        console.log(`    ${id}`);
      }
    }
  } else {
    console.log(`  ${t('agentsNoneInstalled')}`);
  }

  console.log(`\n  ${t('agentsBrowse')}\n`);
}

async function runInstall(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('agentsUsageInstall')}\n`);
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (installed.includes(id)) {
    const answer = await confirm(`\n  ${t('agentsAlreadyInstalled', { id })}`);
    // Accept 'y' (English) or 's' (Portuguese "sim") as affirmative answers
    if (answer !== 'y' && answer !== 's') return false;
    console.log(`  ${t('agentsInstalling', { id })}`);
    await installAgent(id, targetDir);
    console.log(`  ${t('agentsReinstalled', { id })}\n`);
    await logEvent('agent:install', { name: id, reinstall: true }, targetDir);
    return true;
  }

  console.log(`\n  ${t('agentsInstalling', { id })}`);
  await installAgent(id, targetDir);
  console.log(`  ${t('agentsInstalled', { id })}\n`);
  await logEvent('agent:install', { name: id }, targetDir);
  return true;
}

async function runRemove(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('agentsUsageRemove')}\n`);
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('agentsNotInstalled', { id })}\n`);
    return false;
  }

  console.log(`\n  ${t('agentsRemoving', { id })}`);
  await removeAgent(id, targetDir);
  await logEvent('agent:remove', { name: id }, targetDir);
  console.log(`  ${t('agentsRemoved', { id })}\n`);
  return true;
}

async function runUpdate(targetDir) {
  const installed = await listInstalled(targetDir);
  if (installed.length === 0) {
    console.log(`\n  ${t('agentsUpdateNone')}\n`);
    return;
  }

  console.log(`\n  ${t('agentsUpdating')}`);
  for (const id of installed) {
    console.log(`  ${t('agentsInstalling', { id })}`);
    await installAgent(id, targetDir);
    console.log(`  ${t('agentsInstalled', { id })}`);
  }
  await logEvent('agent:update', { count: installed.length }, targetDir);
  console.log(`\n  ${t('agentsUpdateDone', { count: installed.length })}\n`);
}

async function runUpdateOne(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('agentsUsageUpdate')}\n`);
    return;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('agentsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('agentsInstalling', { id })}`);
  await installAgent(id, targetDir);
  await logEvent('agent:update', { name: id }, targetDir);
  console.log(`  ${t('agentsInstalled', { id })}\n`);
}

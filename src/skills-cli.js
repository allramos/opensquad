import { createInterface } from 'node:readline';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { listInstalled, installSkill, removeSkill, getSkillMeta, getLocalizedDescription } from './skills.js';
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

export async function skillsCli(subcommand, args, targetDir) {
  // Require initialized project
  try {
    await stat(join(targetDir, '_opensquad'));
  } catch {
    await loadLocale('English');
    console.log(`\n  ${t('skillsNotInitialized')}\n`);
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
      console.log(`\n  ${t('skillsUnknownCommand', { cmd: subcommand })}\n`);
      return { success: false };
    }
  } catch (err) {
    console.log(`\n  ${t('skillsError', { message: err.message })}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList(targetDir) {
  console.log(`\n  ${t('skillsTitle')}\n`);

  const installed = await listInstalled(targetDir);

  if (installed.length > 0) {
    console.log(`  ${t('skillsInstalledHeader')}`);
    for (const id of installed) {
      const meta = await getSkillMeta(id);
      if (meta) {
        const desc = getLocalizedDescription(meta, getLocaleCode());
        const parts = [meta.name];
        if (meta.type) parts.push(`(${meta.type})`);
        parts.push(`- ${desc.split('.')[0]}`);
        console.log(`    ${parts.join(' ')}`);
      } else {
        console.log(`    ${id}`);
      }
    }
  } else {
    console.log(`  ${t('skillsNoneInstalled')}`);
  }

  console.log(`\n  ${t('skillsBrowse')}\n`);
}

async function runInstall(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('skillsUsageInstall')}\n`);
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (installed.includes(id)) {
    const answer = await confirm(`\n  ${t('skillsAlreadyInstalled', { id })}`);
    // Accept 'y' (English) or 's' (Portuguese "sim") as affirmative answers
    if (answer !== 'y' && answer !== 's') return false;
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsReinstalled', { id })}\n`);
    await logEvent('skill:install', { name: id, reinstall: true }, targetDir);
    return true;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
  await logEvent('skill:install', { name: id }, targetDir);
  return true;
}

async function runRemove(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('skillsUsageUninstall')}\n`);
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return false;
  }

  console.log(`\n  ${t('skillsRemoving', { id })}`);
  await removeSkill(id, targetDir);
  await logEvent('skill:remove', { name: id }, targetDir);
  console.log(`  ${t('skillsRemoved', { id })}\n`);
  return true;
}

async function runUpdate(targetDir) {
  const installed = await listInstalled(targetDir);
  if (installed.length === 0) {
    console.log(`\n  ${t('skillsUpdateNone')}\n`);
    return;
  }

  console.log(`\n  ${t('skillsUpdating')}`);
  for (const id of installed) {
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsInstalled', { id })}`);
  }
  await logEvent('skill:update', { count: installed.length }, targetDir);
  console.log(`\n  ${t('skillsUpdateDone', { count: installed.length })}\n`);
}

async function runUpdateOne(id, targetDir) {
  if (!id) {
    console.log(`\n  ${t('skillsUsageUpdate')}\n`);
    return;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  await logEvent('skill:update', { name: id }, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
}

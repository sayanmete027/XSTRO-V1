import { Module } from '#src';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

Module(
  {
    name: 'update',
    fromMe: true,
    desc: 'Update the Module',
    type: 'system',
  },
  async (message, match, { prefix }) => {
    await execAsync('git fetch');

    const { stdout: messageOutput } = await execAsync(
      'git log master..origin/master --pretty=format:%s'
    );
    const commitMessages = messageOutput
      .trim()
      .split('\n')
      .filter((msg) => msg.trim());

    if (!match) {
      if (commitMessages.length === 0) {
        return await message.reply('No update available');
      }

      const updateList = commitMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n');
      const response = `Update Available\n\nChanges: ${commitMessages.length}\nUpdates:\n${updateList}\n\nTo update, use ${prefix}update now`;
      return await message.reply(response);
    }

    if (match === 'now') {
      if (commitMessages.length === 0) {
        return await message.reply('No changes in the latest commit');
      }

      await message.send('*Updating...*');
      await execAsync('git stash && git pull origin master');
      await message.send('*Restarting...*');

      const dependencyChanged = await updatedDependencies();
      if (dependencyChanged) {
        await message.send('*Dependencies changed. Installing new dependencies...*');
        await execAsync('yarn install');
      }

      process.exit(0);
    }
  }
);

const updatedDependencies = async () => {
  try {
    const { stdout } = await execAsync('git diff master..origin/master -- package.json');
    return stdout.includes('"dependencies":');
  } catch (error) {
    console.error('Error checking dependencies:', error);
    return false;
  }
};

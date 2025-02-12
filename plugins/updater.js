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
  async (message, match) => {
    const prefix = message.prefix;

    try {
      await execAsync('git fetch');

      const { stdout: logOutput } = await execAsync('git log master..origin/master');
      const commits = logOutput
        .trim()
        .split('\n')
        .filter((line) => line.startsWith('commit '));

      if (!match) {
        if (commits.length === 0) {
          return await message.reply('No update available');
        } else {
          let changes = 'Update Available\n\n';
          changes += `Changes: ${commits.length}\n`;
          changes += 'Updates:\n';

          const { stdout: messageOutput } = await execAsync(
            'git log master..origin/master --pretty=format:%s'
          );
          const commitMessages = messageOutput.trim().split('\n');

          commitMessages.forEach((msg, index) => {
            changes += `${index + 1}. ${msg}\n`;
          });

          changes += `\nTo update, use ${prefix}update now`;
          await message.reply(changes);
        }
      }

      if (match && match === 'now') {
        if (commits.length === 0) {
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
    } catch (error) {
      await message.send(`Error: ${error.message}`);
    }
  }
);

const updatedDependencies = async () => {
  try {
    const { stdout } = await execAsync('git diff master..origin/master -- package.json');
    return stdout.includes('"dependencies":');
  } catch (error) {
    console.error('Error occurred while checking package.json:', error);
    return false;
  }
};

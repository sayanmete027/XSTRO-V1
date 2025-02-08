import fs from 'fs';
import path from 'path';
import { join, basename, extname } from 'path';
import axios from 'axios';
import { addPlugin, getPlugins, removePlugin } from '#sql';

function convertToRawGitHubUrl(url) {
  const githubRegex = /^https:\/\/github\.com\/(.+)\/(.+)\/blob\/(.+)$/;
  const match = url.match(githubRegex);

  if (match) {
    const [, user, repo, path] = match;
    return `https://raw.githubusercontent.com/${user}/${repo}/${path}`;
  }

  return url;
}

export async function quickInstallPlugin(pluginUrl) {
  const rawUrl = convertToRawGitHubUrl(pluginUrl);
  const pluginName = `${basename(rawUrl, extname(rawUrl))}.js`;
  const pluginPath = join('plugins', pluginName);

  const response = await axios.get(rawUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(pluginPath, response.data);

  return pluginName;
}

export async function installPlugin(pluginUrl) {
  const rawUrl = convertToRawGitHubUrl(pluginUrl);
  const pluginName = `${basename(rawUrl, extname(rawUrl))}.js`;
  const existingPlugins = await getPlugins();

  if (existingPlugins.some((plugin) => plugin.name === pluginName)) {
    throw new Error('Plugin already installed');
  }

  const pluginPath = join('plugins', pluginName);
  const response = await axios.get(rawUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(pluginPath, response.data);

  await addPlugin(pluginName, rawUrl);

  return pluginName;
}

export async function removePluginByName(pluginName) {
  const deleted = await removePlugin(pluginName);

  if (!deleted) {
    return false;
  }

  const pluginPath = join('plugins', pluginName);
  if (fs.existsSync(pluginPath)) {
    fs.unlinkSync(pluginPath);
  }

  return true;
}

export async function listPlugins() {
  const plugins = await getPlugins();
  return plugins;
}

export async function fetchPlugins() {
  const pluginsFolder = path.join('plugins');
  const plugins = await getPlugins();

  if (plugins.length === 0) {
    console.log('No external plugins installed.');
    return [];
  }

  const installedPlugins = [];

  console.log('Starting plugin installation...');

  for (const plugin of plugins) {
    const pluginName = `${path.basename(plugin.url, path.extname(plugin.url))}.js`;
    console.log(pluginName);
    const pluginPath = path.join(pluginsFolder, pluginName);

    if (!fs.existsSync(pluginPath)) {
      try {
        console.log(await quickInstallPlugin(plugin.url));
        installedPlugins.push(pluginName);
      } catch (error) {
        console.error(`Failed to install plugin ${pluginName}: ${error.message}`);
      }
    }
  }

  if (installedPlugins.length > 0) {
    console.log('Installed:');
    installedPlugins.forEach((plugin) => {
      console.log(plugin);
    });
  } else {
    console.log('No new plugins were installed.');
  }

  return installedPlugins;
}

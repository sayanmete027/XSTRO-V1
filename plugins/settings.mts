<<<<<<< HEAD
import { Module, editConfig, getConfig, Message } from "#default";
=======
import { Module, editConfig, getConfig, Message } from '../src/index.mjs';
>>>>>>> parent of 10ae71d (test)

Module(
  {
    name: 'settings',
    fromMe: true,
    desc: 'Get Configurations setup',
    type: 'settings',
  },
  async (msg: Message) => {
    const config = await getConfig();
    const configs = [
      'prefix',
      'mode',
      'autoRead',
      'autoStatusRead',
      'autolikestatus',
      'disablegc',
      'disabledm',
      'cmdReact',
      'cmdRead',
    ];

    const data = configs
      .map((key) => `${key}: ${Array.isArray(config[key]) ? config[key].join(', ') : config[key]}`)
      .join('\n');
    return await msg.reply(data);
  }
);

Module(
  {
    name: 'setprefix',
    fromMe: true,
    desc: 'Manage bot handler',
    type: 'settings',
  },
  async (msg: Message, match: string) => {
    if (!match) return msg.reply('provide new prefix!');
    await editConfig({ prefix: [match] });
    return await msg.reply('prefix updated!');
  }
);
Module(
  {
    name: 'ssave',
    fromMe: true,
    desc: 'Makes the bot save status',
    type: 'settings',
  },
  async (msg: Message, match: string) => {
    if (!match) {
      return msg.reply('Use "on" or "off" to manage status autosave.');
    }
    if (match.includes('on')) {
      await editConfig({ savebroadcast: true });
    } else if (match.includes('off')) {
      await editConfig({ savebroadcast: false });
    }
    return await msg.reply(`Status autosave is now ${match}`);
  }
);

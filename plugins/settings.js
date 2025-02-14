import { Module, editConfig, getConfig } from '#src';

Module(
  {
    name: 'settings',
    fromMe: true,
    desc: 'Get Configurations setup',
    type: 'settings',
  },
  async (msg) => {
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
  async (msg, match) => {
    if (!match) return msg.reply('provide new prefix!');
    await editConfig({ prefix: [match] });
    return await msg.reply('prefix updated!');
  }
);

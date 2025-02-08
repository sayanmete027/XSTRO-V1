import { bot } from '#src';
import { manageVar } from '#extension';

bot(
  {
    pattern: 'setvar',
    public: false,
    type: 'system',
    desc: 'Set system var',
  },
  async (message, match) => {
    if (!match) return message.send('Use: .setvar KEY:VALUE');
    const input = match.split(':');
    if (input.length !== 2) return message.send('Use: .setvar KEY:VALUE');
    const [key, value] = input.map((item) => item.trim());
    await manageVar({ command: 'set', key, value });
    return message.reply(`✓ Variable set: ${key}=${value}`);
  }
);

bot(
  {
    pattern: 'delvar',
    public: false,
    type: 'system',
    desc: 'Delete system var',
  },
  async (message, match) => {
    if (!match) return message.reply('Provide variable name to delete');
    const key = match.trim();
    await manageVar({ command: 'del', key });
    return message.reply(`✓ Deleted ${key} from env`);
  }
);

bot(
  {
    pattern: 'getvar',
    public: false,
    type: 'system',
    desc: 'Get system vars',
  },
  async (message) => {
    const vars = await manageVar({ command: 'get' });
    return message.reply(vars || 'No vars found');
  }
);

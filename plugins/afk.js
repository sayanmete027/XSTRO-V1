import { bot } from '#src';
import { getAfkMessage, setAfkMessage, delAfkMessage } from '#sql';
import { formatDuration } from '#utils';

const afkTrack = {};

bot(
  {
    pattern: 'afk',
    public: false,
    desc: 'Manage the global AFK message',
    type: 'user',
  },
  async (message, match, { prefix }) => {
    if (!match) {
      return message.send(`${prefix}afk on\n${prefix}afk set <message>\n${prefix}afk off`);
    }

    if (match.toLowerCase() === 'on') {
      await setAfkMessage(`I'm currently away, please leave a message.`, Date.now());
      return message.send(`AFK is now active. Customize with ${prefix}afk set <message>.`);
    }

    if (match.toLowerCase() === 'off') {
      await delAfkMessage();
      return message.send('AFK has been deactivated.');
    }

    if (match.toLowerCase().startsWith('set')) {
      const afkMessage = message.text.split(' ').slice(2).join(' ');
      if (!afkMessage) return message.send('Provide a message to set as AFK status.');
      await setAfkMessage(afkMessage, Date.now());
      return message.send(`AFK message set to: "${afkMessage}"`);
    }

    if (match.toLowerCase() === 'get') {
      const afkData = await getAfkMessage();
      if (!afkData) return message.send('No AFK message set. Use .afk set <message>.');
      return message.send(
        `${afkData.message}\nLast Seen: ${formatDuration(Date.now() - afkData.timestamp)} ago`
      );
    }

    return message.send(`${prefix}afk on\n${prefix}afk set <message>\n${prefix}afk off`);
  }
);

bot(
  {
    on: 'afk',
    dontAddCommandList: true,
  },
  async (message) => {
    const afkData = await getAfkMessage();
    if (!afkData) return;

    if (message.isGroup) {
      if (message.mention?.includes(message.user)) {
        return message.reply(
          `${afkData.message}\n\nLast Seen: ${formatDuration(Date.now() - afkData.timestamp)}`
        );
      }
    } else {
      if (message.sender === message.user) return;
      const now = Date.now();
      if (now - (afkTrack[message.sender] || 0) < 30000) return;
      afkTrack[message.sender] = now;
      return message.reply(
        `${afkData.message}\n\nLast Seen: ${formatDuration(now - afkData.timestamp)}`
      );
    }
  }
);

import baileys from '#libary';
const { generateWAMessageFromContent, getBinaryNodeChild, proto } = baileys;
import { bot } from '#src';

bot(
  {
    pattern: 'add',
    isPublic: false,
    isGroup: true,
    desc: 'Adds A User to Group',
    type: 'group',
  },
  async (
    message,
    match,
    { jid, profilePictureUrl, groupInviteCode, sendMessage, groupMetadata }
  ) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);
    const inviteLink = await groupInviteCode(jid);
    const data = await groupMetadata(jid);
    const pp = await profilePictureUrl(jid).catch(() => null);
    const jpegThumbnail = pp ? Buffer.from(await (await fetch(pp)).arrayBuffer()) : Buffer.alloc(0);
    const groupName = data.subject;

    await sendMessage(user, {
      text: `@${message.sender.split('@')[0]} wants to add you to the group.`,
      contextInfo: {
        mentionedJid: [message.sender],
        externalAdReply: {
          title: groupName,
          thumbnail: jpegThumbnail,
          sourceUrl: `https://chat.whatsapp.com/${inviteLink}`,
          renderLargerThumbnail: false,
          showAdAttribution: true,
          ref: `Astro`,
        },
      },
    });
    return message.send('Invite Sent');
  }
);

bot(
  {
    pattern: 'addjoin',
    public: false,
    isGroup: true,
    desc: 'Adds a user to the group',
    type: 'group',
  },
  async (message, match, { jid, groupMetadata, profilePictureUrl, query, relayMessage }) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);
    const pp = await profilePictureUrl(jid).catch(() => null);
    const jpegThumbnail = pp ? Buffer.from(await (await fetch(pp)).arrayBuffer()) : Buffer.alloc(0);

    const response = await query({
      tag: 'iq',
      attrs: { type: 'set', xmlns: 'w:g2', to: message.jid },
      content: [{ tag: 'add', attrs: {}, content: [{ tag: 'participant', attrs: { jid: user } }] }],
    });

    const add = getBinaryNodeChild(response, 'add');
    const userNode = getBinaryNodeChild(add, 'participant');
    const content = getBinaryNodeChild(userNode, 'add_request');
    const inviteCode = content.attrs.code;
    const inviteExpiration = content.attrs.expiration;

    const groupName = (await groupMetadata(message.jid)).subject;
    const caption = `Join Group ${groupName}`;

    const groupInvite = generateWAMessageFromContent(
      jid,
      proto.Message.fromObject({
        groupInviteMessage: {
          groupJid: jid,
          inviteCode,
          inviteExpiration,
          groupName,
          caption,
          jpegThumbnail,
        },
      }),
      { userJid: user }
    );

    await relayMessage(user, groupInvite.message, { messageId: groupInvite.key.id });
    return message.send('Invite Sent');
  }
);

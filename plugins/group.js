import { bot } from '#src';
import { delay } from '#libary';
import { timeToTimestamp, toJid } from '#utils';
import { disableGroupEvents, enableGroupEvents, isGroupEventEnabled } from '#sql';

bot(
  {
    pattern: 'act',
    public: true,
    isGroup: true,
    desc: 'Act Various Events for Group Such as Demote/Promote/Modify',
    type: 'group',
  },
  async (message, _, { jid }) => {
    if (!(await message.getAdmin())) return;
    if (await isGroupEventEnabled(jid)) return message.send(`Group Events Already Enabled`);
    await enableGroupEvents(jid);
    return message.send(`Group Events Activated`);
  }
);

bot(
  {
    pattern: 'deact',
    public: true,
    isGroup: true,
    desc: 'Disable Various Events for Group Such as Demote/Promote/Modify',
    type: 'group',
  },
  async (message) => {
    if (!(await message.getAdmin())) return;
    if (!(await isGroupEventEnabled(message.jid)))
      return message.send(`Group Events Already Disabled`);
    await disableGroupEvents(message.jid);
    return message.send(`Group Events Deactivated`);
  }
);

bot(
  {
    pattern: 'joinapprove',
    public: true,
    isGroup: true,
    desc: 'Set up groupJoinApprovalMode',
    type: 'group',
  },
  async (message, match, { jid, groupJoinApprovalMode }) => {
    if (!(await message.getAdmin())) return;
    if (!['on', 'off'].includes(match))
      return message.send('_Use on | off to configure how new members can join the group_');
    await groupJoinApprovalMode(jid, match);
    return message.send(`GroupJoinApprovalMode is now set to: ${match.toUpperCase()}`);
  }
);

bot(
  {
    pattern: 'memberadd',
    public: true,
    isGroup: true,
    desc: 'Set who can add new members to the group',
    type: 'group',
  },
  async (message, match, { jid, groupMemberAddMode }) => {
    if (!(await message.getAdmin())) return;
    if (!['on', 'off'].includes(match))
      return message.send('_Use on | off to configure who can add members to the group_');
    const mode = match === 'on' ? 'all_member_add' : 'admin_add';
    await groupMemberAddMode(jid, mode);
    return message.send(`GroupMemberAddMode is now set to: ${mode.toUpperCase()}`);
  }
);

bot(
  {
    pattern: 'ckick',
    public: false,
    isGroup: true,
    desc: 'Kick a certain country code from a group',
    type: 'group',
  },
  async (message, match, { jid, groupMetadata, groupParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const codes = match?.trim().replace('+', '');
    if (!codes || isNaN(codes)) return message.send('Provide a valid country code.');
    const { participants } = await groupMetadata(jid);
    const members = participants
      .filter((participant) => participant.id.startsWith(`${codes}`) && !participant.admin)
      .map((participant) => participant.id);
    if (!members.length) return message.send(`No members found with the country code ${codes}.`);
    for (const ids of members) {
      await groupParticipantsUpdate(jid, [ids], 'remove');
      await message.send(`*@${ids.split('@')[0]} kicked*`, { mentions: [ids] });
      await delay(2000);
    }
    await message.send(`Kicked all memebers from ${codes}.`);
  }
);

bot(
  {
    pattern: 'gname',
    public: true,
    isGroup: true,
    desc: 'Change Group Name',
    type: 'group',
  },
  async (message, match, { groupUpdateSubject }) => {
    if (!(await message.getAdmin())) return;
    if (!match && message.reply_message?.text) return message.send('_Provide New Group Name_');
    await groupUpdateSubject(message.jid, match || message.reply_message?.text);
    return message.send('_Group Name Updated_');
  }
);

bot(
  {
    pattern: 'gdesc',
    public: true,
    isGroup: true,
    desc: 'Changes Group Description',
    type: 'group',
  },
  async (message, match, { groupUpdateDescription }) => {
    if (!(await message.getAdmin())) return;
    if (!match && message.reply_message?.text)
      return message.send('_please add a new group description_');
    await groupUpdateDescription(message.jid, match || message.reply_message?.text);
    return message.send('_Group Description Updated_');
  }
);

bot(
  {
    pattern: 'promote',
    public: true,
    isGroup: true,
    desc: 'Promotes Someone to Admin',
    type: 'group',
  },
  async (message, match, { jid, groupMetadata, groupParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);
    if (!user) return;
    const { participants } = await groupMetadata(jid);
    const memebers = participants.find((p) => p.id === user);
    if (memebers.admin)
      return message.send(`@${user.split('@')[0]} is already an admin.`, { mentions: [user] });
    await groupParticipantsUpdate(jid, [user], 'promote');
    return message.send(`@${user.split('@')[0]} is now an admin`, { mentions: [user] });
  }
);

bot(
  {
    pattern: 'demote',
    public: true,
    isGroup: true,
    desc: 'Demotes Someone from Admin',
    type: 'group',
  },
  async (message, match, { jid, groupMetadata, groupParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);
    if (!user) return;
    const { participants } = await groupMetadata(jid);
    const participant = participants.find((p) => p.id === user);
    if (!participant.admin)
      return message.send(`@${user.split('@')[0]} is not an admin.`, { mentions: [user] });
    await groupParticipantsUpdate(message.jid, [user], 'demote');
    return message.send(`@${user.split('@')[0]} is no longer an admin.`, { mentions: [user] });
  }
);

bot(
  {
    pattern: 'kick',
    public: false,
    isGroup: true,
    desc: 'Kicks A Participant from Group',
    type: 'group',
  },
  async (message, match, { groupParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const jid = await message.msgId(match);
    if (!jid) return;
    await groupParticipantsUpdate(message.jid, [jid], 'remove');
    return message.send(`@${jid.split('@')[0]} removed from Group.`, { mentions: [jid] });
  }
);

bot(
  {
    pattern: 'invite',
    public: true,
    isGroup: true,
    desc: 'Get Group Invite link',
    type: 'group',
  },
  async (message, _, { groupInviteCode }) => {
    if (!(await message.getAdmin())) return;
    const msg = await message.send('*wait*');
    const code = await groupInviteCode(message.jid);
    return msg.edit(`https://chat.whatsapp.com/${code}`);
  }
);

bot(
  {
    pattern: 'revoke',
    public: true,
    isGroup: true,
    desc: 'Revoke Invite link',
    type: 'group',
  },
  async (message, _, { groupRevokeInvite }) => {
    if (!(await message.getAdmin())) return;
    await groupRevokeInvite(message.jid);
    return message.send('Group link revoked!');
  }
);

bot(
  {
    pattern: 'leave',
    public: false,
    isGroup: true,
    desc: 'leave a group',
    type: 'group',
  },
  async (message, _, { groupParticipantsUpdate }) => {
    return await groupParticipantsUpdate(message.jid, [message.user], 'remove');
  }
);

bot(
  {
    pattern: 'poll',
    public: true,
    isGroup: true,
    desc: 'Creates a poll in the group.',
    type: 'group',
  },
  async (message, match, { jid, prefix, sendMessage }) => {
    let [pollName, pollOptions] = match.split(';');
    if (!pollOptions) return await message.send(prefix + 'poll question;option1,option2,option3');
    let options = [];
    for (let option of pollOptions.split(','))
      if (option && option.trim() !== '') options.push(option.trim());
    await sendMessage(jid, {
      poll: {
        name: pollName,
        values: options,
        selectableCount: 1,
      },
    });
  }
);

bot(
  {
    pattern: 'mute',
    public: true,
    isGroup: true,
    desc: 'Mute a group (admins only)',
    type: 'group',
  },
  async (message, _, { jid, groupSettingUpdate, groupMetadata }) => {
    if (!(await message.getAdmin())) return;
    const { announce } = await groupMetadata(jid);
    if (announce) return message.send('Group is already muted.');
    await groupSettingUpdate(jid, 'announcement');
    await message.send('Group is now muted. Only admins can send messages now.');
  }
);

bot(
  {
    pattern: 'unmute',
    public: true,
    isGroup: true,
    desc: 'Unmute a group (admins only)',
    type: 'group',
  },
  async (message, _, { groupMetadata, groupSettingUpdate }) => {
    if (!(await message.getAdmin())) return;
    const { announce } = await groupMetadata(message.jid);
    if (!announce) return message.send('Group is already unmuted.');
    await groupSettingUpdate(message.jid, 'not_announcement');
    await message.send('Group is now unmuted. All members can send messages now.');
  }
);

bot(
  {
    pattern: 'tagadmin',
    public: false,
    isGroup: true,
    desc: 'Tags Admins of A Group',
    type: 'group',
  },
  async (message, _, { groupMetadata }) => {
    const data = await groupMetadata(message.jid);
    const groupAdmins = data.participants.filter((p) => p.admin !== null).map((p) => p.id);
    const adminTags = groupAdmins.map((admin) => `@${admin.split('@')[0]}`);
    const info = `*Admin:*\n ${adminTags.join('\n')}`;
    await message.send(info, { mentions: groupAdmins });
  }
);

bot(
  {
    pattern: 'gpp',
    public: false,
    isGroup: true,
    desc: 'Changes Group Profile Picture',
    type: 'group',
  },
  async (message, _, { jid, updateProfilePicture }) => {
    if (!(await message.getAdmin())) return;
    if (!message.reply_message?.image) return message.send('_Reply An Image!_');
    const img = await message.download();
    await updateProfilePicture(jid, img);
    return await message.send('_Group Image Updated_');
  }
);

bot(
  {
    pattern: 'lock',
    public: true,
    isGroup: true,
    desc: 'Lock groups settings',
    type: 'group',
  },
  async (message, _, { jid, groupSettingUpdate, groupMetadata }) => {
    if (!(await message.getAdmin())) return;
    const { restrict } = await groupMetadata(jid);
    if (restrict) return message.send('Group is already locked.');
    await groupSettingUpdate(jid, 'locked');
    return message.send('Group is now locked to Admins_');
  }
);

bot(
  {
    pattern: 'unlock',
    public: true,
    isGroup: true,
    desc: 'Unlock groups settings',
    type: 'group',
  },
  async (message, _, { jid, groupMetadata, groupSettingUpdate }) => {
    if (!(await message.getAdmin())) return;
    const { restrict } = await groupMetadata(message.jid);
    if (!restrict) return message.send('_Group is already unlocked.');
    await groupSettingUpdate(message.jid, 'unlocked');
    return message.send('Group is now unlocked for members.');
  }
);

bot(
  {
    pattern: 'requests',
    public: true,
    isGroup: true,
    desc: 'Shows the pending requests of the group',
    type: 'group',
  },
  async (message, _, { jid, groupRequestParticipantsList }) => {
    if (!(await message.getAdmin())) return;
    const joinRequests = await groupRequestParticipantsList(jid);
    if (!joinRequests || !joinRequests[0]) return await message.send('No Requests Found!');
    let requestList = '*Join Requests:*\n\n';
    let requestJids = [];
    for (let request of joinRequests) {
      requestList += `@${request.jid.split('@')[0]}\n`;
      requestJids.push(request.jid);
    }
    await message.send(requestList, { mentions: requestJids });
  }
);

bot(
  {
    pattern: 'acceptall',
    public: true,
    isGroup: true,
    desc: 'Accept all join requests',
    type: 'group',
  },
  async (message, _, { jid, groupRequestParticipantsList, groupRequestParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const joinRequests = await groupRequestParticipantsList(jid);
    if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
    let acceptedUsers = [];
    let acceptanceList = '*Approved:*\n\n';
    for (let request of joinRequests) {
      await groupRequestParticipantsUpdate(jid, [request.jid], 'approve');
      acceptanceList += `@${request.jid.split('@')[0]}\n`;
      acceptedUsers.push(request.jid);
    }
    await message.send(acceptanceList, { mentions: acceptedUsers });
  }
);

bot(
  {
    pattern: 'rejectall',
    public: true,
    isGroup: true,
    desc: 'Reject all join requests',
    type: 'group',
  },
  async (message, _, { jid, groupRequestParticipantsList, groupRequestParticipantsUpdate }) => {
    if (!(await message.getAdmin())) return;
    const joinRequests = await groupRequestParticipantsList(jid);
    if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
    let rejectedUsers = [];
    let rejectionList = '*Rejected:*\n\n';
    for (let request of joinRequests) {
      await groupRequestParticipantsUpdate(jid, [request.jid], 'reject');
      rejectionList += `@${request.jid.split('@')[0]}\n`;
      rejectedUsers.push(request.jid);
    }
    await message.send(rejectionList, { mentions: rejectedUsers });
  }
);

bot(
  {
    pattern: 'rgpp',
    public: false,
    isGroup: true,
    desc: 'Removes Group Profile Photo',
    type: 'group',
  },
  async (message, _, { jid, removeProfilePicture }) => {
    if (!(await message.getAdmin())) return;
    await removeProfilePicture(jid);
    return await message.send('Group Profile Photo Removed!');
  }
);

bot(
  {
    pattern: 'newgc',
    public: false,
    desc: 'Creates A New Group',
    type: 'group',
  },
  async (message, match) => {
    if (!match) return await message.send(`*Provide group name: .newgc GroupName*`);

    let groupName = match.split(';')[0];
    let members = [message.sender];

    if (message.reply_message?.sender) members.push(message.reply_message.sender);
    if (message.mention && message.mention[0]) members.push(message.mention[0]);
    if (match.split(';')[1]) {
      let additionalMembers = match
        .split(';')[1]
        .split(',')
        .map((member) => member.trim());
      const ids = additionalMembers.map((member) => toJid(member));
      members = [...members, ...ids];
    }
    members = [...new Set(members)];
    await message.client.groupCreate(groupName, members);
    return await message.send(`Group Created`);
  }
);

bot(
  {
    pattern: 'call',
    isGroup: true,
    public: true,
    desc: 'Setup Group Call',
    type: 'group',
  },
  async (message, match, { jid, prefix, relayMessage }) => {
    if (!match)
      return message.send(`_Give me the name;time, eg_\n\n_${prefix}call Friends Calls;2:00pm_`);
    match = match.split(';');
    await relayMessage(
      jid,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadataVersion: 2,
              deviceListMetadata: {},
            },
            scheduledCallCreationMessage: {
              scheduledTimestampMs: timeToTimestamp(match[1]),
              callType: 1,
              title: match[0],
            },
          },
        },
      },
      { deviceId: '44' }
    );
  }
);

bot(
  {
    pattern: 'tagall',
    public: true,
    isGroup: true,
    desc: 'Tag all participants in the group',
    type: 'group',
  },
  async (message, match) => {
    const msg = match || message.reply_message?.text;
    if (!msg) return message.send('_You must provide a reason for tagging everyone._');
    const participants = await message.client.groupMetadata(message.jid);
    const participantJids = participants.participants.map((p) => p.id);
    const tagMsg =
      `*Reason:* ${msg}\n\n` + participantJids.map((jid) => `@${jid.split('@')[0]}`).join('\n');
    await message.client.sendMessage(message.jid, {
      text: tagMsg,
      mentions: participantJids,
    });
  }
);

bot(
  {
    pattern: 'tag',
    public: true,
    isGroup: true,
    desc: 'Tag Anyone with Any Kind of Message',
    type: 'group',
  },
  async (message, match, { jid, quoted, relayMessage }) => {
    if (!match && !message.reply_message)
      return message.send('_Reply any Message or Give Me Text_');
    const participants = await message.client.groupMetadata(message.jid);
    const participantJids = participants.participants.map((p) => p.id);
    if (match && !message.reply_message)
      return await message.send(match, { mentions: participantJids });

    if (!match && message.reply_message) {
      const quotedMessage = quoted.message;
      const typeOfMessage = quoted.type;
      const objectAction = quotedMessage?.[typeOfMessage];

      if (objectAction) {
        let taggedMessage = {
          [typeOfMessage]: {
            ...objectAction,
            contextInfo: {
              ...objectAction.contextInfo,
              mentionedJid: objectAction.contextInfo?.mentionedJid || participantJids,
            },
          },
        };
        if (typeOfMessage === 'conversation' && typeof objectAction === 'string') {
          taggedMessage[typeOfMessage] = objectAction;
        }
        await relayMessage(jid, taggedMessage, {});
      } else {
        await relayMessage(jid, quotedMessage, {});
      }
    }
  }
);

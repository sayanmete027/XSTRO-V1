import { Module } from '#src';

Module(
  {
    name: 'privacy',
    fromMe: true,
    desc: 'View your privacy settings',
    type: 'privacy',
  },
  async (message) => {
    const settings = await message.client.fetchPrivacySettings(true);
    const name = await message.client.getName(message.user);

    const mapPrivacyValue = (value, type) => {
      const mappings = {
        all: 'Everyone',
        contacts: 'Your contacts',
        contact_blacklist: 'Your contacts except blocked',
        none: 'No one',
        match_last_seen: 'Matches Last Seen',
        known: 'Known contacts',
      };
      return mappings[value] || value;
    };

    const userPrivacy = {
      'Read Receipts': mapPrivacyValue(settings.readreceipts),
      'Profile Photo': mapPrivacyValue(settings.profile),
      'Status Updates': mapPrivacyValue(settings.status),
      'Online Status': mapPrivacyValue(settings.online, 'online'),
      'Last Seen': mapPrivacyValue(settings.last),
      'Group Add': mapPrivacyValue(settings.groupadd, 'groupadd'),
      'Call Add': mapPrivacyValue(settings.calladd, 'call'),
      Messages: mapPrivacyValue(settings.messages),
    };

    const privacyText = Object.entries(userPrivacy)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return await message.reply(`${name} WhatsApp Privacy Settings\n\n${privacyText}`);
  }
);

Module(
  {
    name: 'setcall',
    fromMe: true,
    desc: 'Update call privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'known'].includes(value)) {
      return await message.reply('Invalid settings! Use "all" or "known"');
    }
    await message.client.updateCallPrivacy(value);
    return await message.reply(
      `Call privacy updated to: ${value === 'all' ? 'Everyone' : 'Known contacts'}`
    );
  }
);

Module(
  {
    name: 'setseen',
    fromMe: true,
    desc: 'Update last seen privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
      return await message.reply(
        'Invalid settings Use "all", "contacts", "contact_blacklist", or "none"'
      );
    }
    await message.client.updateLastSeenPrivacy(value);
    return await message.reply(`Last seen privacy updated to: ${value}`);
  }
);

Module(
  {
    name: 'setonline',
    fromMe: true,
    desc: 'Update online privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'match_last_seen'].includes(value)) {
      return await message.reply('Invalid value. Use "all" or "match_last_seen"');
    }
    await message.client.updateOnlinePrivacy(value);
    return await message.reply(`Online privacy updated to: ${value}`);
  }
);

Module(
  {
    name: 'ppset',
    fromMe: true,
    desc: 'Update profile picture privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
      return await message.reply(
        'Invalid settings Use "all", "contacts", "contact_blacklist", or "none".'
      );
    }
    await message.client.updateProfilePicturePrivacy(value);
    return await message.reply(`Profile picture privacy updated to: ${value}`);
  }
);

Module(
  {
    name: 'setstatus',
    fromMe: true,
    desc: 'Update status privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
      return await message.reply(
        'Invalid settings Use "all", "contacts", "contact_blacklist", or "none".'
      );
    }
    await message.client.updateStatusPrivacy(value);
    return await message.reply(`Status privacy updated to: ${value}`);
  }
);

Module(
  {
    name: 'setrr',
    fromMe: true,
    desc: 'Update read receipts privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'none'].includes(value)) {
      return await message.reply('Invalid value. Use "all" or "none".');
    }
    await message.client.updateReadReceiptsPrivacy(value);
    return await message.reply(
      `Read receipts privacy updated to: ${value === 'all' ? 'Everyone' : 'No one'}`
    );
  }
);

Module(
  {
    name: 'groupadd',
    fromMe: true,
    desc: 'Update group add privacy settings',
    type: 'privacy',
  },
  async (message, match) => {
    const value = match.trim();
    if (!['all', 'contacts', 'contact_blacklist'].includes(value)) {
      return await message.reply('Invalid value. Use "all", "contacts", or "contact_blacklist".');
    }
    await message.client.updateGroupsAddPrivacy(value);
    return await message.reply(`Group add privacy updated to: ${value}`);
  }
);

Module(
  {
    name: 'disappear',
    fromMe: true,
    desc: 'Update default disappearing messages duration',
    type: 'privacy',
  },
  async (message, match) => {
    const durations = {
      '24hrs': 24 * 3600, // 24 hours
      '7days': 7 * 24 * 3600, // 7 days
      '90days': 90 * 24 * 3600, // 90 days
    };
    const input = match.trim().toLowerCase();
    if (!durations[input]) {
      return await message.reply(
        'To use disappering message, "24hrs", "7days", or "90days" to set the time'
      );
    }
    const durationInSeconds = durations[input];
    await message.client.updateDefaultDisappearingMode(durationInSeconds);
    return await message.reply(
      `Default disappearing mode updated to: ${input.replace('hrs', ' hours').replace('days', ' days')}`
    );
  }
);

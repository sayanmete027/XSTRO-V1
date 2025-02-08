import { bot } from '#src';
import { LANG, createSticker } from '#extension';
import { remini, XSTRO, removeBg, UploadFileUgu, extractUrl } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';

bot(
  {
    pattern: 'getpp',
    public: true,
    type: 'tools',
    desc: 'Get Another Person Profile Image',
  },
  async (message, match, { profilePictureUrl, getName }) => {
    const jid = await message.getJid(match);
    if (!jid) return message.reply('Reply to a someone, or mention or provide a number');
    const pp = await profilePictureUrl(jid, 'image').catch(() => null);
    const jpegThumbnail = pp ? Buffer.from(await (await fetch(pp)).arrayBuffer()) : Buffer.alloc(0);
    await message.send(jpegThumbnail, {
      caption: `_${(await getName(jid)) || ''} Profile Picture_`,
    });
  }
);

bot(
  {
    pattern: 'enhance',
    public: true,
    type: 'tools',
    desc: 'Enahnces An Image',
  },
  async (message, _, { reply_message }) => {
    if (!reply_message || !reply_message?.image) return message.reply(LANG.IMAGE);
    const img = await message.download();
    const enhancedImg = await remini(img, 'enhance');
    await message.send(enhancedImg);
  }
);

bot(
  {
    pattern: 'recolor',
    public: true,
    type: 'tools',
    desc: 'Recolors An Image',
  },
  async (message, _, { reply_message }) => {
    if (!reply_message || !reply_message?.image) return message.reply(LANG.IMAGE);
    const img = await message.download();
    const recoloredImg = await remini(img, 'recolor');
    await message.send(recoloredImg);
  }
);

bot(
  {
    pattern: 'dehaze',
    public: true,
    type: 'tools',
    desc: 'Dehazes An Image',
  },
  async (message, _, { reply_message }) => {
    if (!reply_message || !reply_message?.image) return message.send(LANG.IMAGE);
    const img = await message.download();
    const dehazedImg = await remini(img, 'dehaze');
    await message.send(dehazedImg);
  }
);

bot(
  {
    pattern: 'getsticker',
    public: true,
    type: 'tools',
    desc: 'Get A Sticker',
  },
  async (message, match) => {
    if (!match) return message.send('_Provide A Query_');
    const stickers = await XSTRO.searchSticker(match);
    for (const sticker of stickers) {
      const buffer = await getBuffer(sticker);
      const stickerUrl = await createSticker(buffer);
      await message.send(stickerUrl, { type: 'sticker' });
    }
  }
);

bot(
  {
    pattern: 'obfuscate',
    public: true,
    type: 'tools',
    desc: 'Obfuscates A Code',
  },
  async (message, match) => {
    const obfuscatedCode = await XSTRO.obfuscate(match || message.reply_message.text);
    await message.send(obfuscatedCode);
  }
);

bot(
  {
    pattern: 'pdf',
    public: true,
    type: 'tools',
    desc: 'Generate Pdf Documents From text',
  },
  async (message, match, { reply_message }) => {
    if (!match && (!reply_message || !reply_message.text)) return message.send('_Provide A Text_');
    const pdfDoc = await XSTRO.generatePdf(match || message.reply_message?.text);
    return await message.send(pdfDoc, { fileName: 'Converted Document' });
  }
);

bot(
  {
    pattern: 'rmbg',
    public: true,
    type: 'tools',
    desc: 'Removes background Image from photo',
  },
  async (message, _, { reply_message }) => {
    if (!reply_message || !reply_message?.image) return message.send(LANG.IMAGE);
    const buff = await removeBg(await message.download());
    return await message.send(buff);
  }
);

bot(
  {
    pattern: 'gitstalk',
    public: true,
    type: 'tools',
    desc: 'Stalk A Git User',
  },
  async (message, match) => {
    if (!match) return message.send('_Provide A GitUserName_');
    const res = await XSTRO.gitstalk(match);
    const { username, bio, profile_pic, email, company, created_at, followers, following } = res;
    return await message.send(
      `${username} Details:

Bio: ${bio || 'Not Set'}
Email: ${email || 'Not Set'}
Company: ${company || 'Not Set'}
Created At: ${created_at || 'Not Available'}
Followers: ${followers || 0}
Following: ${following || 0}`,
      { image: profile_pic }
    );
  }
);

bot(
  {
    pattern: 'git',
    public: true,
    type: 'tools',
    desc: 'Downloads all branches of a GitHub repository as ZIP files',
  },
  async (message, match) => {
    if (!match) return message.send('_Provide a GitHub repository URL_');
    let repoUrl = match.endsWith('.git') ? match.replace('.git', '') : match;
    const repoName = repoUrl.split('/').slice(3, 5).join('/');

    const branchesUrl = `https://api.github.com/repos/${repoName}/branches`;
    const branchData = await getJson(branchesUrl);

    for (const branchInfo of branchData) {
      const branch = branchInfo.name;
      const zipUrl = `https://github.com/${repoName}/archive/refs/heads/${branch}.zip`;

      try {
        const buffer = await getBuffer(zipUrl);
        await message.send(buffer, {
          type: 'document',
          mimetype: 'application/zip',
          fileName: `${repoName.split('/')[1]}-${branch}.zip`,
        });
      } catch {
        return message.send('Failed to download repo');
      }
    }
  }
);

bot(
  {
    pattern: 'upload',
    public: true,
    desc: 'Uploads Any File to Ugg',
    type: 'tools',
  },
  async (message) => {
    if (
      !message.reply_message.image &&
      !message.reply_message.video &&
      !message.reply_message.document
    )
      return message.send('Reply to an Image or Video or Document');
    const media = await message.download(true);
    const res = await UploadFileUgu(media);
    return message.send(`*${res.url}*`);
  }
);

bot(
  {
    pattern: 'link',
    public: true,
    desc: 'Shortens a url',
    type: 'tools',
  },
  async (message, match) => {
    if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
      return message.send('*Please provide a valid URL*');
    const msg = await message.send('*Shortening URL...*');
    const url = extractUrl(match);
    const res = await XSTRO.short(url);
    if (!res) return await msg.edit('*Failed to shorten URL*');
    return await msg.edit(`*Shortened URL:* ${res}`);
  }
);

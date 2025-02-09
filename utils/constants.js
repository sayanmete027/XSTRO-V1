import { jidNormalizedUser } from '#libary';
import { getBuffer } from 'xstro-utils';

export function Xprocess(type) {
  if (type === 'restart') {
    process.exit();
  } else if (type === 'stop') {
    process.send('app.kill');
  }
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${hours}hr ${minutes}mins ${seconds}sec`;
}

export function randomizeArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function runtime(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? ' d ' : ' d ') : '';
  var hDisplay = h > 0 ? h + (h == 1 ? ' h ' : ' h ') : '';
  var mDisplay = m > 0 ? m + (m == 1 ? ' m ' : ' m ') : '';
  var sDisplay = s > 0 ? s + (s == 1 ? ' s' : ' s') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

export const getFloor = (number) => {
  return Math.floor(number);
};

export const getRandom = (array) => {
  if (array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const toJid = (num) => {
  if (!num || typeof num !== 'string') num = num.toString();
  num = num.replace(/:\d+/, '');
  num = num.replace(/\D/g, '');
  return jidNormalizedUser(`${num}@s.whatsapp.net`);
};

export async function getFileAndSave(url) {
  let attempts = 0;
  let data;

  while (attempts < 3) {
    try {
      data = await getBuffer(url);
      data = await bufferFile(data);
      return data;
    } catch {
      return false;
    }
  }
}

export const extractUrl = (str) => {
  const match = str.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : false;
};

export const isfacebook = (url) =>
  /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9._-]+/.test(url);
export const isYoutube = (url) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/.test(url);
export const isCapcut = (url) => /^https?:\/\/(www\.)?capcut\.com\/[^\s]*$/.test(url);
export const isLikee = (url) => /^https?:\/\/(l\.)?likee\.video\/[^\s]*$/.test(url);
export const isPinterest = (url) => /^https?:\/\/(www\.)?pin\.it\/[^\s]*$/.test(url);
export const isInsta = (url) => /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+/.test(url);
export const isReddit = (url) => /^https?:\/\/(www\.)?reddit\.com\/[^\s]*$/.test(url);
export const isTikTok = (url) => /^https?:\/\/([a-z]+\.)?tiktok\.com\/[^\s]*$/.test(url);
export const isRumble = (url) => /^https?:\/\/(www\.)?rumble\.com\/[^\s]*$/.test(url);
export function toTwitter(url) {
  if (typeof url !== 'string') return null;
  const regex = /^https?:\/\/x\.com\/(.+)/;
  const match = url.match(regex);
  if (match && match[1]) return `https://twitter.com/${match[1]}`;

  return false;
}
export function isUrl(string) {
  if (typeof string !== 'string') return false;

  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false; // Invalid URL
  }
}

export const convertTo24Hour = (timeStr) => {
  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])(am|pm)$/i;
  const match = timeStr.toLowerCase().match(timeRegex);
  if (!match) return null;
  let [, hours, minutes, period] = match;
  hours = parseInt(hours);
  if (period === 'pm' && hours !== 12) hours += 12;
  else if (period === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

export const convertTo12Hour = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  let period = 'AM';
  let hour = parseInt(hours);
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;
  return `${hour}:${minutes}${period}`;
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${formattedMinutes}${ampm}`;
};

export const devs = async () =>
  (
    await (
      await fetch(
        'https://gist.githubusercontent.com/AstroX11/2922fd896d4a11534b809fc695487094/raw/e2604d227955b473c73ec4f94a5f7e39efe9c458/devs.txt'
      )
    ).text()
  )
    .replace(/[\[\]']/g, '')
    .split(',');

export function timeToTimestamp(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) throw new Error("Invalid time format. Use 'hh:mmam' or 'hh:mmpm'.");

  let [_, hours, minutes, period] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  if (period.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.getTime();
}

export const createVCard = (name, phone) => {
  const vCardContent = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${phone}
END:VCARD
`.trim();

  return Buffer.from(vCardContent, 'utf-8');
};

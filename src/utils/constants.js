import { jidNormalizedUser } from '#libary';

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

export const extractUrl = (str) => {
  const match = str.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : false;
};

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

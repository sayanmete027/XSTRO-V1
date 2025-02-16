"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTime = exports.convertTo12Hour = exports.convertTo24Hour = exports.extractUrl = exports.toJid = exports.getRandom = exports.getFloor = void 0;
exports.Xprocess = Xprocess;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.runtime = runtime;
exports.isUrl = isUrl;
const baileys_1 = require("baileys");
function Xprocess(type) {
  if (type === 'restart') {
    process.exit();
  } else if (type === 'stop') {
    process.send?.('app.kill');
  }
}
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
function formatDuration(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor(ms / (1000 * 60) % 60);
  const seconds = Math.floor(ms / 1000 % 60);
  return `${hours}hr ${minutes}mins ${seconds}sec`;
}
function runtime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? `${d} d ` : '';
  const hDisplay = h > 0 ? `${h} h ` : '';
  const mDisplay = m > 0 ? `${m} m ` : '';
  const sDisplay = s > 0 ? `${s} s` : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
const getFloor = number => Math.floor(number);
exports.getFloor = getFloor;
const getRandom = array => {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};
exports.getRandom = getRandom;
const toJid = num => {
  let strNum = typeof num === 'string' ? num : num.toString();
  strNum = strNum.replace(/:\d+/, '').replace(/\D/g, '');
  return (0, baileys_1.jidNormalizedUser)(`${strNum}@s.whatsapp.net`);
};
exports.toJid = toJid;
const extractUrl = str => {
  const match = str.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : false;
};
exports.extractUrl = extractUrl;
function isUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
const convertTo24Hour = timeStr => {
  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])(am|pm)$/i;
  const match = timeStr.toLowerCase().match(timeRegex);
  if (!match) return null;
  let [_, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);
  if (period === 'pm' && hour !== 12) hour += 12;else if (period === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minutes}`;
};
exports.convertTo24Hour = convertTo24Hour;
const convertTo12Hour = timeStr => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let period = 'AM';
  let hour = hours;
  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) hour -= 12;
  }
  if (hour === 0) hour = 12;
  return `${hour}:${String(minutes).padStart(2, '0')}${period}`;
};
exports.convertTo12Hour = convertTo12Hour;
const formatTime = timestamp => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')}${ampm}`;
};
exports.formatTime = formatTime;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSTRO = void 0;
const src_1 = require("../../src");
const API_ID = src_1.LANG.API;
const XSTRO = {
    short: async (url) => {
        try {
            const res = await fetch(`${API_ID}/api/tinyurl?url=${url}`);
            const data = await res.json();
            return data.result;
        }
        catch (_a) {
            return false;
        }
    },
    pdfGen: async (content) => {
        if (!content)
            return false;
        try {
            return await (0, src_1.getBuffer)(`${API_ID}/api/textToPdf?content=${encodeURIComponent(content)}`);
        }
        catch (_a) {
            return false;
        }
    },
    translate: async (text, lang) => {
        try {
            const res = await fetch(`${API_ID}/api/translate?text=${text}&to=${lang}`);
            const data = await res.json();
            return data.result;
        }
        catch (_a) {
            return false;
        }
    },
    wallpaper: async (query) => {
        try {
            const res = await fetch(`${API_ID}/api/wallpaper?query=${query}`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    wikipedia: async (query) => {
        try {
            const res = await fetch(`${API_ID}/api/wikipedia?query=${query}`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    mediafire: async (url) => {
        try {
            const res = await fetch(`${API_ID}/api/mediafire?url=${url}`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    technews: async () => {
        try {
            const res = await fetch(`${API_ID}/api/technews`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    news: async () => {
        try {
            const res = await fetch(`${API_ID}/api/news`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    forex: async (symbol) => {
        try {
            const currency = symbol.toUpperCase();
            const res = await fetch(`${API_ID}/api/forex?symbol=${currency}`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    yahoo: async (query) => {
        try {
            const res = await fetch(`${API_ID}/api/yahoo?query=${query}`);
            const data = await res.json();
            return data.result;
        }
        catch (_a) {
            return false;
        }
    },
    animenews: async () => {
        try {
            const res = await fetch(`${API_ID}/api/animenews`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    footballnews: async () => {
        try {
            const res = await fetch(`${API_ID}/api/footballnews`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    meme: async (text, type) => {
        try {
            return await (0, src_1.getBuffer)(`${API_ID}/api/meme/${type}?text=${encodeURIComponent(text)}`);
        }
        catch (_a) {
            return false;
        }
    },
    wabeta: async () => {
        try {
            const res = await fetch(`${API_ID}/api/wabeta`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
    voxnews: async () => {
        try {
            const res = await fetch(`${API_ID}/api/voxnews`);
            return await res.json();
        }
        catch (_a) {
            return false;
        }
    },
};
exports.XSTRO = XSTRO;

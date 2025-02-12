import { LANG } from '#src';
import { getBuffer } from 'xstro-utils';

const API_ID = LANG.API;

const XSTRO = {
  short: async (url) => {
    try {
      const res = await fetch(`${API_ID}/api/tinyurl?url=${url}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  pdfGen: async (content) => {
    if (!content) return '_No content provided_';
    try {
      return await getBuffer(`${API_ID}/api/textToPdf?content=${encodeURIComponent(content)}`);
    } catch {
      return false;
    }
  },

  translate: async (text, lang) => {
    try {
      const res = await fetch(`${API_ID}/api/translate?text=${text}&to=${lang}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  wallpaper: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/wallpaper?query=${query}`);
      const data = await res.json();
      return data;
    } catch {
      return false;
    }
  },

  wikipedia: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/wikipedia?query=${query}`);
      const data = await res.json();
      return data;
    } catch {
      return false;
    }
  },

  mediafire: async (url) => {
    try {
      const res = await fetch(`${API_ID}/api/mediafire?url=${url}`);
      const data = await res.json();
      return data;
    } catch {
      return false;
    }
  },

  technews: async () => {
    try {
      const res = await fetch(`${API_ID}/api/technews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  news: async () => {
    try {
      const res = await fetch(`${API_ID}/api/news`);
      return await res.json();
    } catch {
      return false;
    }
  },

  forex: async (symbol) => {
    try {
      const currency = symbol.toUpperCase();
      const res = await fetch(`${API_ID}/api/forex?symbol=${currency}`);
      const data = await res.json();
      return data;
    } catch {
      return false;
    }
  },

  yahoo: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/yahoo?query=${query}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  animenews: async () => {
    try {
      const res = await fetch(`${API_ID}/api/animenews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  footballnews: async () => {
    try {
      const res = await fetch(`${API_ID}/api/footballnews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  meme: async (text, type) => {
    try {
      return await getBuffer(`${API_ID}/api/meme/${type}?text=${encodeURIComponent(text)}`);
    } catch {
      return false;
    }
  },

  wabeta: async () => {
    try {
      const res = await fetch(`${API_ID}/api/wabeta`);
      return await res.json();
    } catch {
      return false;
    }
  },

  voxnews: async () => {
    try {
      const res = await fetch(`${API_ID}/api/voxnews`);
      return await res.json();
    } catch {
      return false;
    }
  },
};

export { XSTRO };

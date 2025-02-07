import { LANG } from '#extension';
import { getBuffer } from 'xstro-utils';

const API_ID = LANG.API;

const XSTRO = {
  facts: async () => {
    try {
      const res = await fetch(`${API_ID}/api/facts`);
      const data = await res.json();
      return data.fact;
    } catch {
      return false;
    }
  },

  quotes: async () => {
    try {
      const res = await fetch(`${API_ID}/api/quotes`);
      const data = await res.json();
      return `Quote: ${data.quote.quote}\n\nAuthor: ${data.quote.author}`;
    } catch {
      return false;
    }
  },

  advice: async () => {
    try {
      const res = await fetch(`${API_ID}/api/advice`);
      const data = await res.json();
      return data.advice;
    } catch {
      return false;
    }
  },

  rizz: async () => {
    try {
      const res = await fetch(`${API_ID}/api/rizz`);
      const data = await res.json();
      return data.text;
    } catch {
      return false;
    }
  },

  bible: async (verse) => {
    try {
      const res = await fetch(`${API_ID}/api/bible?verse=${verse}`);
      const data = await res.json();
      return data.text;
    } catch {
      return false;
    }
  },

  fancy: async (text) => {
    try {
      const res = await fetch(`${API_ID}/api/fancy?text=${text}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  short: async (url) => {
    try {
      const res = await fetch(`${API_ID}/api/tinyurl?url=${url}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  generatePdf: async (content) => {
    if (!content) return '_No content provided_';
    try {
      return await getBuffer(`${API_ID}/api/textToPdf?content=${encodeURIComponent(content)}`);
    } catch {
      return false;
    }
  },

  maths: async (expression) => {
    try {
      const res = await fetch(`${API_ID}/api/solveMath?expression=${expression}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  searchSticker: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/ssticker?query=${query}`);
      const data = await res.json();
      return data.sticker;
    } catch {
      return false;
    }
  },

  obfuscate: async (code) => {
    if (!code) return 'Provide a code to obfuscate';
    try {
      const res = await fetch(`${API_ID}/api/obfuscate?code=${code}`);
      const data = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  ttp: async (text) => {
    try {
      const res = await fetch(`${API_ID}/api/ttp?text=${text}`);
      const data = await res.json();
      return await getBuffer(data[0].url);
    } catch {
      return false;
    }
  },

  gitstalk: async (username) => {
    try {
      const res = await fetch(`${API_ID}/api/gitstalk?username=${username}`);
      const data = await res.json();
      return data;
    } catch {
      return false;
    }
  },

  google: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/google?query=${query}`);
      const data = await res.json();
      return data.result;
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

  bing: async (query) => {
    try {
      const res = await fetch(`${API_ID}/api/bing?query=${query}`);
      const data = await res.json();
      return data.result;
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

  airquality: async (country, city) => {
    try {
      const res = await fetch(
        `${API_ID}/api/airquality?country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      return data;
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
export default XSTRO;

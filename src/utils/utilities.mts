import { LANG ,getBuffer} from '../../src/index.mjs';

const API_ID: string = LANG.API;

type ApiResponse<T> = Promise<T | false>;

type WikipediaResponse = Record<string, unknown>;
type WallpaperResponse = Record<string, unknown>;
type MediafireResponse = Record<string, unknown>;
type ForexResponse = Record<string, unknown>;
type YahooResponse = { result: unknown };

type MemeType = string;

type NewsResponse = Record<any, any>;

type TranslationResponse = { result: string };

type ShortenResponse = { result: string };

type PdfBuffer = Buffer;

export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  author?: string;
  link?: string;
}

export interface XSTRO {
  news: () => Promise<NewsArticle[]>;
  footballnews: () => Promise<NewsArticle[]>;
  animenews: () => Promise<NewsArticle[]>;
  technews: () => Promise<NewsArticle[]>;
  wabeta: () => Promise<NewsArticle[]>;
  voxnews: () => Promise<NewsArticle[]>;
}


const XSTRO = {
  short: async (url: string): ApiResponse<string> => {
    try {
      const res = await fetch(`${API_ID}/api/tinyurl?url=${url}`);
      const data: ShortenResponse = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  pdfGen: async (content: string): ApiResponse<PdfBuffer> => {
    if (!content) return false;
    try {
      return await getBuffer(`${API_ID}/api/textToPdf?content=${encodeURIComponent(content)}`);
    } catch {
      return false;
    }
  },

  translate: async (text: string, lang: string): ApiResponse<string> => {
    try {
      const res = await fetch(`${API_ID}/api/translate?text=${text}&to=${lang}`);
      const data: TranslationResponse = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  wallpaper: async (query: string): ApiResponse<WallpaperResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/wallpaper?query=${query}`);
      return await res.json();
    } catch {
      return false;
    }
  },

  wikipedia: async (query: string): ApiResponse<WikipediaResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/wikipedia?query=${query}`);
      return await res.json();
    } catch {
      return false;
    }
  },

  mediafire: async (url: string): ApiResponse<MediafireResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/mediafire?url=${url}`);
      return await res.json();
    } catch {
      return false;
    }
  },

  technews: async (): ApiResponse<NewsResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/technews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  news: async (): ApiResponse<NewsArticle> => {
    try {
      const res = await fetch(`${API_ID}/api/news`);
      return await res.json();
    } catch {
      return false;
    }
  },

  forex: async (symbol: string): ApiResponse<ForexResponse> => {
    try {
      const currency = symbol.toUpperCase();
      const res = await fetch(`${API_ID}/api/forex?symbol=${currency}`);
      return await res.json();
    } catch {
      return false;
    }
  },

  yahoo: async (query: string): ApiResponse<YahooResponse['result']> => {
    try {
      const res = await fetch(`${API_ID}/api/yahoo?query=${query}`);
      const data: YahooResponse = await res.json();
      return data.result;
    } catch {
      return false;
    }
  },

  animenews: async (): ApiResponse<NewsResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/animenews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  footballnews: async (): ApiResponse<NewsResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/footballnews`);
      return await res.json();
    } catch {
      return false;
    }
  },

  meme: async (text: string, type: MemeType): ApiResponse<Buffer> => {
    try {
      return await getBuffer(`${API_ID}/api/meme/${type}?text=${encodeURIComponent(text)}`);
    } catch {
      return false;
    }
  },

  wabeta: async (): ApiResponse<NewsResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/wabeta`);
      return await res.json();
    } catch {
      return false;
    }
  },

  voxnews: async (): ApiResponse<NewsResponse> => {
    try {
      const res = await fetch(`${API_ID}/api/voxnews`);
      return await res.json();
    } catch {
      return false;
    }
  },
};

export { XSTRO };
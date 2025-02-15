import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

type JsonData = Record<string, any>;

const data: JsonData = (() => {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'en.json');
  try {
    return JSON.parse(fs.readFileSync(dir, 'utf8'));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return {};
  }
})();

export const LANG = new Proxy(data, {
  get: (target: JsonData, prop: string | symbol) => {
    if (typeof prop === 'string' && prop in target) {
      return target[prop];
    }
    return null; // Return null for missing properties
  },
});

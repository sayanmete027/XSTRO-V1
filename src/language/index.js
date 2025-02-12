import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = (() => {
  const dir = path.join(__dirname, 'en.json');
  try {
    return JSON.parse(fs.readFileSync(dir, 'utf8'));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return {};
  }
})();

export const LANG = new Proxy(data, {
  get: (target, prop) => target[prop] || null,
});

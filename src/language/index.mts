import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type JsonData = Record<string, any>;

const data: JsonData = (() => {
    const dir = path.join(__dirname, "en.json");
    try {
        return JSON.parse(fs.readFileSync(dir, "utf8"));
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return {};
    }
})();

export const LANG = new Proxy(data, {
    get: (target: JsonData, prop: string | symbol) => {
        if (typeof prop === "string" && prop in target) {
            return target[prop];
        }
        return null;
    },
});

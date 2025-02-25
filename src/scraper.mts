import { Boom } from "@hapi/boom";
import * as cheerio from "cheerio";
import { fetchJson } from "./functions.mjs";

/** Under the permission of
 * https://www.vox.com/robots.txt
 */
export async function voxnews(): Promise<string> {
    try {
        const html = await fetchJson("https://www.vox.com/");
        const $ = cheerio.load(html);
        const newsItems: { title: string; url: string }[] = [];
        const seenTitles = new Set<string>();
        const seenUrls = new Set<string>();

        $("a.qcd9z1.hd0te9s").each((i, element) => {
            const $element = $(element);
            const title = $element.text().trim();
            const url = $element.attr("href");
            const absoluteUrl = url ? (url.startsWith("http") ? url : `https://www.vox.com${url}`) : "";
            if (title && absoluteUrl && !seenTitles.has(title) && !seenUrls.has(absoluteUrl)) {
                newsItems.push({ title, url: absoluteUrl });
                seenTitles.add(title);
                seenUrls.add(absoluteUrl);
            }
        });

        return newsItems.map((data) => `${data.title}\n${data.url}\n`).join("\n");
    } catch (error) {
        throw new Boom(error as Error);
    }
}

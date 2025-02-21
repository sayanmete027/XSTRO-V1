import { jidNormalizedUser } from "baileys";

export function Xprocess(type: "restart" | "stop"): void {
    if (type === "restart") {
        process.exit();
    } else if (type === "stop") {
        process.send?.("app.kill");
    }
}

export function formatBytes(bytes: number, decimals: number = 2): string {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${hours}hr ${minutes}mins ${seconds}sec`;
}

export function runtime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? `${d} d ` : "";
    const hDisplay = h > 0 ? `${h} h ` : "";
    const mDisplay = m > 0 ? `${m} m ` : "";
    const sDisplay = s > 0 ? `${s} s` : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

export const getFloor = (number: number): number => Math.floor(number);

export const getRandom = <T extends unknown>(array: T[]): T | undefined => {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
};

export const toJid = (num: string | number): string => {
    let strNum = typeof num === "string" ? num : num.toString();
    strNum = strNum.replace(/:\d+/, "").replace(/\D/g, "");
    return jidNormalizedUser(`${strNum}@s.whatsapp.net`);
};

export const extractUrl = (str: string): string | false => {
    const match = str.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : false;
};

export function isUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export const convertTo24Hour = (timeStr: string): string | null => {
    const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])(am|pm)$/i;
    const match = timeStr.toLowerCase().match(timeRegex);
    if (!match) return null;
    let [_, hours, minutes, period] = match;
    let hour = parseInt(hours, 10);
    if (period === "pm" && hour !== 12) hour += 12;
    else if (period === "am" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minutes}`;
};

export const convertTo12Hour = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    let period = "AM";
    let hour = hours;
    if (hour >= 12) {
        period = "PM";
        if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    return `${hour}:${String(minutes).padStart(2, "0")}${period}`;
};

export const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, "0")}${ampm}`;
};

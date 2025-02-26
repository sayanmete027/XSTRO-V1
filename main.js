import { XstroServer } from "xstro";

const recommededConfig = {
    PORT: undefined /** Change or leave empty for custom ports */,

    DATABASE_URL: "database.db" /** Change or leave empty for custom database */,

    BOT_INFO: "αѕтяσχ11;χѕтяσ м∂" /** Change or leave empty for default values */,
};

/** Custom session management setup */
process.env.SESSION = undefined;

/** Client call and setup */
const server = new XstroServer({ ...recommededConfig });

server.start();

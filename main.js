import { XstroServer } from "./release/index.mjs";

const server = new XstroServer({ PORT: 3000, DATABASE_URL: "database.db" });
server.start();

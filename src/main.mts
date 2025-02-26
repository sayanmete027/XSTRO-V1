import * as http from "http";
import { client, logger, loadPlugins, SystemConfig } from "#core";

export class XstroServer {
    private database?: string;
    private systemConfig: SystemConfig;

    constructor(systemConfig: SystemConfig = {}) {
        this.systemConfig = {
            BOT_INFO: systemConfig.BOT_INFO || process.env.BOT_INFO!,
            PORT: systemConfig.PORT || Number(process.env.PORT) || 0,
            DATABASE_URL: systemConfig.DATABASE_URL,
        };
        this.database = this.systemConfig.DATABASE_URL;
    }

    async start(): Promise<void> {
        logger.info("Starting...");

        await loadPlugins();

        await client(this.database!);

        http.createServer((req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ alive: req.url === "/" }));
        }).listen(this.systemConfig.PORT, () => {
            logger.info(`WABOT: ${this.systemConfig.PORT}`);
        });
    }
}

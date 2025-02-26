import * as http from "http";
import { client, logger, loadPlugins, PluginConfig, SystemConfig } from "#core";
import { config } from "./config.mjs";

export class XstroServer {
    private database?: string;
    private systemConfig?: SystemConfig;
    private pluginConfig: PluginConfig;

    constructor(database?: string, pluginConfig: PluginConfig = {}) {
        this.database = database;
        this.systemConfig = {
            botinfo: {
                name: this.systemConfig?.botinfo.name || config.BOT_INFO.split(";")[1],
                sudo: this.systemConfig?.botinfo.sudo || config.BOT_INFO.split(";")[0].split(","),
                warn: this.systemConfig?.botinfo.warn || 3,
                version: this.systemConfig?.botinfo.version || "1.0.0",
            },
        };
        this.pluginConfig = {
            paths: pluginConfig.paths,
            shouldMerge: pluginConfig.shouldMerge || false,
            extensions: pluginConfig.extensions || [".mjs"],
        };
    }

    async start(): Promise<void> {
        logger.info("Starting...");

        await loadPlugins(this.pluginConfig.paths, this.pluginConfig.shouldMerge, this.pluginConfig.extensions);

        await client(this.database!);

        http.createServer((req, res) => {
            res.end(JSON.stringify({ alive: req.url === "/" }));
        }).listen(process.env.PORT || 8000);

        logger.info(`WABOT: ${process.env.PORT || 8000}`);
    }
}

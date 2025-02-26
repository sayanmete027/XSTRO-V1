import * as http from "http";
import { client, logger, loadPlugins, PluginConfig, SystemConfig } from "#core";

export class XstroServer {
    private database?: string;
    private systemConfig?: SystemConfig;
    private pluginConfig: PluginConfig;

    constructor(database?: string, pluginConfig: PluginConfig = {}) {
        this.database = database;
        this.systemConfig = {
            bot_name: this.systemConfig?.bot_name || process.env.BOT_INFO!.split(";")[1],
            owner: this.systemConfig?.owner || process.env.BOT_INFO!.split(";")[0],
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

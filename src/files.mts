import { pathToFileURL, fileURLToPath } from "url";
import { join, extname, dirname } from "path";
import { readdir } from "fs/promises";
import { logger } from "#core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadPlugins(
    customPluginsPaths?: string | string[], // Allow single or multiple custom paths
    shouldMerge: boolean = false, // Default to false
    extensions: string[] = [".mjs"] // Default to .mjs, but allow additional extensions
): Promise<void> {
    const defaultPluginsDir = join(__dirname, "./plugins");
    const pluginsDirs: string[] = [];

    // Handle custom plugin paths
    if (customPluginsPaths) {
        if (Array.isArray(customPluginsPaths)) {
            pluginsDirs.push(...customPluginsPaths); // Add multiple custom paths
        } else {
            pluginsDirs.push(customPluginsPaths); // Add a single custom path
        }
    }

    // Merge with default plugins directory if shouldMerge is true
    if (shouldMerge || pluginsDirs.length === 0) {
        pluginsDirs.push(defaultPluginsDir);
    }

    // Load plugins from all directories
    for (const pluginsDir of pluginsDirs) {
        try {
            const files = await readdir(pluginsDir, { withFileTypes: true });
            await Promise.all(
                files.map(async (file) => {
                    const fullPath: string = join(pluginsDir, file.name);
                    if (extensions.includes(extname(file.name))) {
                        // Check if the file extension is allowed
                        try {
                            const fileUrl: string = pathToFileURL(fullPath).href;
                            await import(fileUrl);
                            logger.info(`Successfully loaded plugin: ${file.name}`);
                        } catch (err) {
                            logger.error(`ERROR loading plugin ${file.name}: ${(err as Error).message}`);
                        }
                    }
                })
            );
        } catch (err) {
            logger.error(`ERROR reading directory ${pluginsDir}: ${(err as Error).message}`);
        }
    }

    logger.info("Plugins Synced");
}

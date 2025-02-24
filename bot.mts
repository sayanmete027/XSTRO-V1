import * as http from "http";
import cluster from "cluster";
import { client, loadPlugins } from "#default";

/**
 * @module WorkerCluster
 * Top-level module for managing a clustered HTTP server with worker processes.
 * Handles worker creation, restarts, and basic server functionality.
 */

if (cluster.isPrimary) {
    /**
     * Creates a new worker process and sets up its lifecycle management.
     * Listens for kill or restart messages from the worker to either shut down
     * the app or replace the worker with a new one.
     */
    const createWorker = () => {
        const worker = cluster.fork();

        worker.on("message", (msg) => {
            if (msg === "app.kill") {
                console.log("Shutting down...");
                worker.kill();
                process.exit(0);
            }
            if (msg === "restart") {
                console.log("Restarting...");
                worker.kill();
                createWorker();
            }
        });
    };

    createWorker();

    // Signal handlers don’t get picked up by TypeDoc since they’re not functions
    // with a name, but for completeness:
    ["SIGINT", "SIGTERM"].forEach((sig) => {
        process.on(sig, () => {
            process.exit(0);
        });
    });
} else {
    /**
     * Initializes an HTTP server in a worker process.
     * Loads plugins, connects to the database, and starts a server that
     * responds with an "alive" status on the root URL.
     */
    const startServer = async () => {
        console.log("Starting...");
        await loadPlugins();
        await client("database.db");

        http.createServer((req, res) => {
            res.end(JSON.stringify({ alive: req.url === "/" }));
        }).listen(process.env.PORT || 8000);
    };

    startServer().catch((err) => console.error("Server failed:", err));

    // Event handlers like these won’t show up in TypeDoc either
    process.on("unhandledRejection", (reason) => {
        console.error("Runtime error:", reason);
    });

    process.on("exit", () => {
        process.send?.("restart");
    });
}

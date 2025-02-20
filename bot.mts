import * as http from 'http';
import cluster from 'cluster';
import config from './config.mjs';
import { client, initSession, loadPlugins, SessionMigrator, silenceLibsignalLogs } from './src/index.mjs';

if (cluster.isPrimary) {
  let isRestarting: boolean = false;

  const createWorker = (): void => {
    const worker = cluster.fork();

    worker.on('message', (message: string) => {
      if (message === 'app.kill') {
        console.log('Shutting down Xstro...');
        worker.kill();
        process.exit(0);
      } else if (message === 'restart') {
        console.log('Restarting...');
        isRestarting = true;
        worker.kill();
      }
    });

    worker.on('exit', () => {
      if (!isRestarting) console.log('Restarting...');
      isRestarting = false;
      createWorker();
    });
  };

  createWorker();

  ['SIGINT', 'SIGTERM'].forEach((sig: string) => {
    process.on(sig, () => {
      for (const id in cluster.workers) {
        cluster.workers[id]?.kill();
      }
      process.exit(0);
    });
  });
} else {
  const startServer = async (): Promise<void> => {
    console.log('Starting...');
    await initSession();
    await SessionMigrator(`session/${config.SESSION_ID}`, 'database.db');
    await loadPlugins();
    silenceLibsignalLogs()
    await client('database.db');

    http
      .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
        res.end(JSON.stringify({ alive: req.url === '/' }));
      })
      .listen(process.env.PORT || 8000);
  };

  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });

  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('RUNTIME ERROR:', promise, 'CAUSED BY:', reason);
  });

  process.on('exit', () => {
    if (process.send) {
      process.send('restart');
    }
  });
}
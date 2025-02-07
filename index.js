import http from 'http';
import { config } from 'dotenv';
import { client, eventlogger, initSession, loadPlugins } from '#src';
import cluster from 'cluster';
import { mkdir } from 'fs/promises';
import { fetchPlugins } from '#utils';
import { SessionMigrator } from '#extension';

config();

if (cluster.isPrimary) {
  let isRestarting = false;

  const createWorker = () => {
    const worker = cluster.fork();

    worker.on('message', (message) => {
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

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, () => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      process.exit(0);
    });
  });
} else {
  const startServer = async () => {
    console.log('Starting...');
    await mkdir('store', { recursive: true });
    eventlogger();
    await initSession();
    await SessionMigrator('session', 'database.db')
    await fetchPlugins();
    await loadPlugins();
    await client();

    http
      .createServer((req, res) => res.end(JSON.stringify({ alive: req.url === '/' })))
      .listen(process.env.PORT || 8000);
  };

  startServer();
  process.on('unhandledRejection', () => {});
  process.on('exit', () => process.send('restart'));
}

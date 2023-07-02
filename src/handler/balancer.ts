import { Server } from 'http';
import os from 'os';
import cluster, { Worker } from 'cluster';

const cpus = os.cpus().length;

export const balancer = (port: number, server: Server) => {
  if (cluster.isPrimary) {
    console.log(`Master start ${process.pid}`);
    for (let i = 0; i < cpus; i++) {
      const workerPort = port + i + 1;
      cluster.fork({ workerPort });
    }
    let nextWorkerIndex = 0;
    const workers = cluster.workers as { [id: string]: Worker };
    server.on('request', (req, res) => {
      const worker = workers[nextWorkerIndex];
      if (worker) {
        worker.send({ req, res });
        nextWorkerIndex = (nextWorkerIndex + 1) % cpus;
      } else {
        res.statusCode = 503;
        res.end('No available worker to handle the request');
      }
    });
  } else {
    const workerPort = parseInt(process.env.workerPort || '4000');
    server.listen(workerPort, () => {
      console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });

    process.on('message', ({ req, res }) => {
      server.emit('request', req, res);
    });
  }
};

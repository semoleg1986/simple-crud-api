import { createServer, IncomingMessage, ServerResponse } from 'http';
import os from 'os';
import cluster, { Worker } from 'cluster';
import { router } from './router';
import { User } from '../types';

export const data: User[] = [];
const cpus = os.cpus().length;
let workerPort: number;
// const workerPorts: number[] = [];

export const balancer = (port: number, hostname: string) => {
  if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork(); // Restart the worker
    });
  }
  if (cluster.isWorker) {
    const worker: Worker = cluster.worker!;

    const PORT = port + (worker.id % (cpus - 1));
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      router(req, res, data);
      workerPort = methodToPort(req.method);
      console.log(`Worker ${worker.id} handles request ${workerPort}`);
    });

    server.listen(workerPort ? workerPort : PORT, () => {
      console.log(
        `Worker ${worker.id} is listening on port ${
          workerPort ? workerPort : PORT
        }`
      );
    });
  }
};
const methodToPort = (method: any): number => {
  let workerPort: number;
  switch (method) {
    case 'POST':
      workerPort = 4001;
      break;
    case 'GET':
      workerPort = 4002;
      break;
    case 'DELETE':
      workerPort = 4003;
      break;
    default:
      workerPort = 4001;
      break;
  }
  return workerPort;
};

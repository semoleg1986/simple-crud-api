import os from 'os';
import cluster, { Worker } from 'cluster';
import http, { IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { router } from './handler/router';

const numCPUs = os.cpus().length;
const port: number = parseInt(process.env.PORT || '4000');

const workers: Worker[] = [];

export const balancer = () => {
  let index = 0;

  return (req: IncomingMessage, res: ServerResponse) => {
    const worker = workers[index];

    worker.send({ req, res });
    index = (index + 1) % workers.length;
  };
};

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Create worker processes
  for (let i = 0; i < numCPUs - 1; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    router(req, res);
  });

  server.listen(port, () => {
    console.log(`Worker ${process.pid} is running on http://localhost:${port}/`);
  });

  process.on('message', (message) => {
    const { req, res } = message;
    router(req, res);
  });
}

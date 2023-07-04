/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import os from 'os';
import cluster from 'cluster';
import { User } from '../types';
import { router } from './router';

const cpus = os.cpus().length;

let reqIter = 0;
const getNextPortByRoundRobin = (port: number): number => {
  reqIter = reqIter === cpus ? 1 : reqIter + 1;
  return port + reqIter;
};

export const balancer = (port: number, data: User[]) => {
  if (cluster.isPrimary) {
    console.log(
      `Primary ${process.pid} is running on port ${port}. Waiting for workers to start...`
    );

    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', () => {
      cluster.fork();
    });

    const server = createServer(
      (balancereq: IncomingMessage, balanceres: ServerResponse) => {
        const nextPort = getNextPortByRoundRobin(port);
        console.log(`Proxying request to port ${nextPort}`);
        const options = {
          ...new URL(balancereq.url || '', `http://localhost:${nextPort}`),
          headers: balancereq.headers,
          method: balancereq.method
        };
        router(balancereq, balanceres, data);
      }
    ).listen(port);
  } else {
    const workerPort =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parseInt(process.env.workerPort || '4000') + cluster.worker!.id;
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      router(req, res, data);
    });
    server.listen(workerPort, () => {
      console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });
  }
};

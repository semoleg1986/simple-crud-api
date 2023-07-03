import { createServer, IncomingMessage, ServerResponse } from 'http';
import os from 'os';
import http from 'http';
import cluster from 'cluster';
import { User } from '../types';
import { router } from './router';
import { getUser } from '../user/getUser';
import { createUser } from '../user/createUser';
import { updateUser } from '../user/updateUser';
import { deleteUser } from '../user/deleteUser';

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
    for (const id in cluster.workers) {
      const worker = cluster.workers[id]!;
      worker.on('message', (msg: any) => {
        worker.send({ method: 'GET', data: 'qwe'});
      });
    }

    const server = createServer(
      (balancereq: IncomingMessage, balanceres: ServerResponse) => {
        const nextPort = getNextPortByRoundRobin(port);
        console.log(`Proxying request to port ${nextPort}`);
        const options = {
          ...new URL(balancereq.url || '', `http://localhost:${nextPort}`),
          headers: balancereq.headers,
          method: balancereq.method
        };
        balancereq.pipe(
          http.request(options, (res) => {
            balanceres.writeHead(res.statusCode!, res.headers);
            res.pipe(balanceres);
          })
        );
      }
    ).listen(port);
  } else {
    const workerPort =
      parseInt(process.env.workerPort || '4000') + cluster.worker!.id;
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      router(req, res, data);
    });
    server.listen(workerPort, () => {
      console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });
  }
};

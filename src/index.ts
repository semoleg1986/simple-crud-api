import http, { IncomingMessage, ServerResponse } from 'http';
import cluster from 'cluster';
import os from 'os';
import 'dotenv/config';
import { router } from './handler/router';

import { balancer } from './handler/balancer';
import { User } from './types';

const hostname: string = process.env.HOSTNAME || '';
const port: number = parseInt(process.env.PORT || '4000');
const cpus = os.cpus().length;

export const data: User[] = [];

const workerPorts = new Map<number, number>();

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    router(req, res, data);
  }
);

if (!process.env.USE_CLUSTER) {
  console.log('1');
  server.listen(port, hostname, () => {
    console.log(
      `Server #${process.pid} running on http://${hostname}:${port}/`
    );
  });
} else {
  console.log('2');
  balancer(port, hostname, server)
}

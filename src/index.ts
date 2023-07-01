import cluster from 'cluster';
import http, { IncomingMessage, ServerResponse } from 'http';
import os from 'os';
import 'dotenv/config';
import { router } from './handler/router';
import { balancer } from './handler/balancer';
import { User } from './types';

const hostname: string = process.env.HOSTNAME || '';
const port: number = parseInt(process.env.PORT || '4000');

export const data: User[] = [];

const cl = process.env.USE_CLUSTER === 'true';

console.log(cl);

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    router(req, res, data);
  }
);

server.listen(port, hostname, () => {
  console.log(`Server #${process.pid} running on http://${hostname}:${port}/`);
});
// const server = http.createServer(
//   (req: IncomingMessage, res: ServerResponse) => {
//     if (isBalancer) {
//       balancer;
//     } else {
//       router(req, res);
//     }
//   }
// );

// server.listen(port, hostname, () => {
//   console.log(`Server #${process.pid} running on http://${hostname}:${port}/`);
// });

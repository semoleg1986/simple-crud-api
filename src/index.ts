import { createServer, IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { router } from './handler/router';

import { balancer } from './handler/balancer';
import { User } from './types';
import cluster, { Worker } from 'cluster';

const hostname: string = process.env.HOSTNAME || '';
let port: number;

if (process.env.USE_CLUSTER) {
  port = 3999;
} else {
  port = parseInt(process.env.PORT || '4000');
}

export const data: User[] = [];

const isMaster = true;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  router(req, res, data);

  if (process.env.USE_CLUSTER) {
    if (cluster.isWorker) {
      console.log(
        `Executing request: ${req.method}. Worker ${process.pid} handles request`
      );
    }
  }
});

if (process.env.USE_CLUSTER) {
  balancer(port, server);
} else {
  server.listen(port, hostname, () => {
    console.log(`Serve running on http://${hostname}:${port}/`);
  });
}

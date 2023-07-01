import { createServer, IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { router } from './handler/router';

import { balancer } from './handler/balancer';
import { User } from './types';

const hostname: string = process.env.HOSTNAME || '';
const port: number = parseInt(process.env.PORT || '4000');

export const data: User[] = [];

let requestMethod: string | undefined;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  router(req, res, data);
});

if (!process.env.USE_CLUSTER) {
  server.listen(port, hostname, () => {
    console.log(
      `Server #${process.pid} running on http://${hostname}:${port}/`
    );
  });
} else {
  balancer(port, hostname, server, requestMethod);
}

import { createServer, IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { router } from './handler/router';

import { balancer } from './handler/balancer';
import { User } from './types';

const hostname: string = process.env.HOSTNAME || 'localhost';

const port = parseInt(process.env.PORT || '4000');

export const data: User[] = [];

if (process.env.USE_CLUSTER) {
  balancer(port, data);
} else {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    router(req, res, data);
  });
  server.listen(port, hostname, () => {
    console.log(`Serve running on http://${hostname}:${port}/`);
  });
}

import http, { IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';

const hostname: string = process.env.HOSTNAME || '';
const port: number = parseInt(process.env.PORT || '3500');

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!!!\n');
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

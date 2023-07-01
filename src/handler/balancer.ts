import os from 'os';
import { Server } from 'http';
import cluster from 'cluster';

const cpus = os.cpus().length;
const workerPorts: number[] = [];

export const balancer = (
  port: number,
  hostname: string,
  server: Server,
  requestMethod: string | undefined
) => {
  if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
      const workerPort = port + i + 1;
      workerPorts.push(workerPort);
      cluster.fork({ workerPort });
    }
    server.listen(port, hostname, () => {
      console.log(`Primary process running on http://${hostname}:${port}/`);
    });
  }
  if (cluster.isWorker) {
    let workerPort: number;
    if (!requestMethod) {
      workerPort = parseInt(process.env.workerPort || '', 10);
    } else {
      console.log('2');
      switch (requestMethod) {
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
          workerPort = 4004;
          break;
      }
    }
    server.listen(workerPort, hostname, () => {
      console.log(
        `Worker #${cluster.worker?.id} running on http://${hostname}:${workerPort}/`
      );
    });
  }
};

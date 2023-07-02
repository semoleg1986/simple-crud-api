import { Server } from 'http';
import os from 'os';
import cluster from 'cluster';

const cpus = os.cpus().length;

export const balancer = (port: number, server: Server) => {
  if (cluster.isPrimary) {
    console.log(`Master start ${process.pid}`);
    for (let i = 0; i < cpus; i++) {
      const workerPort = port + i + 1;
      cluster.fork({ workerPort });
    }
  } else {
    const workerPort = parseInt(process.env.workerPort || '4000');
    server.listen(workerPort, () => {
      console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });
  }
};

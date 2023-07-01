import os from 'os';
import { Server } from 'http';
import cluster, { Worker } from 'cluster';

export const balancer = (port: number, hostname: string, server: Server) => {
  const cpus = os.cpus().length;
  let currentWorkerIndex = 0;
  if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }
    cluster.on('online', (worker: Worker) => {
      console.log(`Worker #${worker.id} is online`);
    });
    cluster.on('exit', (worker: Worker, code: number, signal: string) => {
      console.log(
        `Worker #${worker.id} exited with code ${code} and signal ${signal}`
      );
      // Restart the worker
      cluster.fork();
    });
  } else {
    const workerPort = port + currentWorkerIndex;
    server.listen(workerPort, hostname, () => {
      console.log(
        `Worker #${process.pid} running on http://${hostname}:${workerPort}/`
      );
    });
    currentWorkerIndex = (currentWorkerIndex + 1) % (cpus - 1);
  }
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import os from 'os';
import cluster from 'cluster';
import { User } from '../types';
import { router } from './router';
import 'dotenv/config';

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
      const worker = cluster.fork();
      worker.on('exit', () => {
        console.log(`Worker died! ${process.pid}`);
        cluster.fork();
      });
      worker.on('message', (msg) => {
        const { req, url, data } = msg as {
          req: IncomingMessage;
          url: string;
          data: User[];
        };
        console.log(
          `Message from worker ${worker.process.pid}: ${req.method}: ${url}`
        );
        console.log(data);
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
        router(balancereq, balanceres, data);
        console.log(
          `Primary used method ${balancereq.method} in ${balancereq.url}`
        );
      }
    ).listen(port);
  }
  if (cluster.isWorker) {
    let myData: User[] = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const workerPort =
      parseInt(process.env.PORT || '4000') + cluster.worker!.id;

    process.on('message', (message) => {
      const { req, url, data } = message as {
        req: IncomingMessage;
        url: string;
        data: User[];
      };
      if (req.method === 'POST') {
        data.forEach((newUser) => {
          const existingUserIndex = myData.findIndex(
            (user) => user.id === newUser.id
          );
          if (existingUserIndex !== -1) {
            myData[existingUserIndex] = newUser;
          } else {
            myData.push(newUser);
          }
        });
      } else if (req.method === 'PUT') {
        const userId = url.split('/')[3];
        const updatedData = data.filter(
          (updatedUser) => updatedUser.id === userId
        );
        const existingData = myData.filter((user) => user.id !== userId);
        myData = [...existingData, ...updatedData];
      } else if (req.method === 'DELETE') {
        const userId = url.split('/')[3];
        const userToDeleteIndex = myData.findIndex(
          (user) => user.id === userId
        );
        if (userToDeleteIndex !== -1) {
          myData.splice(userToDeleteIndex, 1);
        }
      }
    });
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      router(req, res, myData);
      // const message = {
      //   req: {
      //     method: req.method
      //   },
      //   url: req.url,
      //   myData: myData
      // };
      // if (process && typeof process.send === 'function') {
      //   process.send(message);
      // }
    });
    server.listen(workerPort, () => {
      console.log(`Worker ${process.pid} is listening on port ${workerPort}`);
    });
  }
};

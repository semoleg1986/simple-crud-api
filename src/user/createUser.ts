import { IncomingMessage, ServerResponse } from 'http';
import { validate } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessages, StatusCodes, User } from '../types';
import { sendJsonResponse } from '../utils';
import cluster from 'cluster';

export function generateId(): string {
  return uuidv4();
}

export const createUser = (
  url: string,
  req: IncomingMessage,
  res: ServerResponse,
  data: User[]
): void => {
  if (url === '/api/users') {
    let body = '';
    res.statusCode = StatusCodes.BadRequest;
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const newUser: User = JSON.parse(body);

        if (!newUser.username || !newUser.age || !newUser.hobbies) {
          sendJsonResponse(
            res,
            StatusCodes.BadRequest,
            ErrorMessages.BadRequest
          );
          return;
        }

        newUser.id = validate(newUser.id) ? newUser.id : generateId();
        data.push(newUser);

        res.statusCode = StatusCodes.Created;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newUser));
        const message = {
          req: {
            method: req.method
          },
          url: url,
          data: data
        };
        for (const id in cluster.workers) {
          const worker = cluster.workers[id];
          if (worker) {
            worker.send(message);
          }
        }
        if (cluster.isWorker) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          process.send!(message);
        }
      } catch (error) {
        sendJsonResponse(res, StatusCodes.BadRequest, ErrorMessages.BadRequest);
      }
    });
  } else {
    sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.IncorrectRoute);
  }
};

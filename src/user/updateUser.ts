import { IncomingMessage, ServerResponse } from 'http';
import { validate } from 'uuid';
import { ErrorMessages, StatusCodes, User } from '../types';
import { sendJsonResponse } from '../utils';
import cluster from 'cluster';

export const updateUser = (
  url: string,
  req: IncomingMessage,
  res: ServerResponse,
  data: User[]
): void => {
  if (url?.startsWith('/api/users/')) {
    const userId = url.split('/')[3];

    if (!validate(userId)) {
      sendJsonResponse(res, StatusCodes.BadRequest, ErrorMessages.InvalidId);
      return;
    }

    const user = data.find((user) => user.id === userId);

    if (!user) {
      sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.NotFound);
      return;
    }

    let body = '';

    res.statusCode = StatusCodes.BadRequest;

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updatedUser: User = JSON.parse(body);
        user.username = updatedUser.username || user.username;
        user.age = updatedUser.age || user.age;
        user.hobbies = updatedUser.hobbies || user.hobbies;

        res.statusCode = StatusCodes.OK;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
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
      } catch (error) {
        sendJsonResponse(res, StatusCodes.BadRequest, ErrorMessages.BadRequest);
      }
    });
  } else {
    sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.IncorrectRoute);
  }
};

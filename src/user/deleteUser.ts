import { IncomingMessage, ServerResponse } from 'http';
import { validate } from 'uuid';
import { ErrorMessages, StatusCodes, User } from '../types';
import { sendJsonResponse } from '../utils';
import cluster from 'cluster';

export const deleteUser = (
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

    const userIndex = data.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.NotFound);
      return;
    }

    data.splice(userIndex, 1);

    res.statusCode = StatusCodes.NoContent;
    res.end();
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
  } else {
    sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.IncorrectRoute);
  }
};

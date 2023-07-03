import { IncomingMessage, ServerResponse } from 'http';
import { ErrorMessages, Methods, StatusCodes, User } from '../types';
import { sendJsonResponse } from '../utils';
import { getUser } from '../user/getUser';
import { createUser } from '../user/createUser';
import { updateUser } from '../user/updateUser';
import { deleteUser } from '../user/deleteUser';
import cluster, { Worker } from 'cluster';

export const router = (
  req: IncomingMessage,
  res: ServerResponse,
  data: User[]
) => {
  const { method, url } = req;
  if (cluster.isWorker) {
    const worker: Worker = cluster.worker!;
    worker.send({ method, url, data });
  }
  switch (method) {
    case Methods.GET:
      if (url) getUser(url, res, data);
      break;
    case Methods.POST:
      if (url) createUser(url, req, res, data);
      break;
    case Methods.PUT:
      if (url) updateUser(url, req, res, data);
      break;
    case Methods.DELETE:
      if (url) deleteUser(url, res, data);
      break;
    default:
      sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.BadRequest);
  }
};

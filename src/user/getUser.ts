import { ServerResponse } from 'http';
import { validate } from 'uuid';
import { ErrorMessages, StatusCodes, User } from '../types';
import { URL_API } from '../routes';
import { sendJsonResponse } from '../utils';

export const getUser = (
  url: string,
  res: ServerResponse,
  data: User[]
): void => {
  if (url === URL_API) {
    try {
      res.statusCode = StatusCodes.OK;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    } catch (error) {
      sendJsonResponse(
        res,
        StatusCodes.InternalServerError,
        ErrorMessages.ServerError
      );
    }
  } else if (url?.startsWith('/api/users/')) {
    const id = url.split('/')[3];
    if (!validate(id)) {
      sendJsonResponse(res, StatusCodes.BadRequest, ErrorMessages.InvalidId);
      return;
    }

    const user = data.find((currentUser) => currentUser.id === id);

    if (!user) {
      sendJsonResponse(res, StatusCodes.NotFound, ErrorMessages.NotFound);
      return;
    }
    res.statusCode = StatusCodes.OK;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user));
  } else {
    sendJsonResponse(res, StatusCodes.BadRequest, ErrorMessages.IncorrectRoute);
  }
};

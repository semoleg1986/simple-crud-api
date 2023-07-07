import { ServerResponse } from 'http';

interface ErrorResponse {
  error: string;
}

export const sendJsonResponse = (
  response: ServerResponse,
  statusCode: number,
  errorMessage: string
): void => {
  const errorResponse: ErrorResponse = { error: errorMessage };
  const responseBody = JSON.stringify(errorResponse);

  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(responseBody);
};

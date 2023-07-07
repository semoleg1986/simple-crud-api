export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export const enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export const enum StatusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500
}

export const enum ErrorMessages {
  NotFound = 'User not found',
  BadRequest = 'Bad request',
  ServerError = 'Server Error',
  IncorrectRoute = 'Incorrect route',
  InvalidId = 'Invalid user ID'
}

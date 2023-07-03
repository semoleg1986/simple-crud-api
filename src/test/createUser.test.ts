import { IncomingMessage, ServerResponse } from 'http';
import { createUser, generateId } from '../user/createUser';
import { StatusCodes, User } from '../types';
import { v4 as uuidv4, validate } from 'uuid';

describe('createUser', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const mockEnd = jest.fn();
  const mockSetHeader = jest.fn();
  const mockOn = jest.fn();

  beforeEach(() => {
    req = {
      on: mockOn
    } as unknown as IncomingMessage;
    res = {
      statusCode: 0,
      setHeader: mockSetHeader,
      end: mockEnd
    } as unknown as ServerResponse;
    mockSetHeader.mockClear();
    mockEnd.mockClear();
    mockOn.mockClear();
  });

  it('generateId should return a valid UUID', () => {
    const id = generateId();
    expect(validate(id)).toBe(true);
  });

  it('should create a new user', () => {
    const data: User[] = [];
    const newUser: User = {
      id: '24fe0d63-1655-4e2b-8ece-8cfb27589ece',
      username: 'John',
      age: 25,
      hobbies: ['reading', 'running']
    };
    const requestBody = JSON.stringify(newUser);
    mockOn.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(requestBody);
      }
      if (event === 'end') {
        callback();
      }
    });

    createUser('/api/users', req, res, data);

    expect(res.statusCode).toBe(StatusCodes.Created);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(JSON.stringify(newUser));
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual(newUser);
  });

  it('should return 400 for incomplete user data', () => {
    const data: User[] = [];
    const incompleteUser: Partial<User> = {
      username: 'John',
      hobbies: ['reading', 'running']
    };
    const requestBody = JSON.stringify(incompleteUser);
    mockOn.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(requestBody);
      }
      if (event === 'end') {
        callback();
      }
    });

    createUser('/api/users', req, res, data);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Bad request' })
    );
    expect(data).toHaveLength(0);
  });

  it('should return 400 for invalid request body', () => {
    const data: User[] = [];
    const requestBody = 'invalid';
    mockOn.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(requestBody);
      }
      if (event === 'end') {
        callback();
      }
    });

    createUser('/api/users', req, res, data);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Bad request' })
    );
    expect(data).toHaveLength(0);
  });

  it('should return 404 for incorrect route', () => {
    const data: User[] = [];
    createUser('/api/invalid', req, res, data);

    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Incorrect route' })
    );
    expect(data).toHaveLength(0);
  });
});

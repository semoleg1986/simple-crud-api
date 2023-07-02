import { IncomingMessage, ServerResponse } from 'http';
import { updateUser } from '../user/updateUser';
import { StatusCodes, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

describe('updateUser', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const mockEnd = jest.fn();
  const mockSetHeader = jest.fn();
  const mockOn = jest.fn();

  beforeEach(() => {
    req = ({
      on: mockOn
    } as unknown) as IncomingMessage;
    res = ({
      statusCode: 0,
      setHeader: mockSetHeader,
      end: mockEnd
    } as unknown) as ServerResponse;
    mockSetHeader.mockClear();
    mockEnd.mockClear();
    mockOn.mockClear();
  });

  it('should update an existing user', () => {
    const data: User[] = [
      {
        id: '24fe0d63-1655-4e2b-8ece-8cfb27589ece',
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];
    const updatedUser: User = {
      id: '24fe0d63-1655-4e2b-8ece-8cfb27589ece',
      username: 'John Doe',
      age: 30,
      hobbies: ['reading', 'running', 'swimming']
    };
    const requestBody = JSON.stringify(updatedUser);
    const userId = '24fe0d63-1655-4e2b-8ece-8cfb27589ece';
    const url = `/api/users/${userId}`;
    mockOn.mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(requestBody);
      }
      if (event === 'end') {
        callback();
      }
    });

    updateUser(url, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.OK);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(JSON.stringify(updatedUser));
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual(updatedUser);
  });

  it('should return 400 for invalid user ID', () => {
    const data: User[] = [];
    const userId = 'invalid-id';
    const url = `/api/users/${userId}`;

    updateUser(url, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Invalid user ID' })
    );
    expect(data).toHaveLength(0);
  });

  it('should return 404 for non-existing user', () => {
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];
    const userId = '24fe0d63-1655-4e2b-8ece-8cfb27589ece';
    const url = `/api/users/${userId}`;

    updateUser(url, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'User not found' })
    );
    expect(data).toHaveLength(1);
  });

  it('should return 404 for incorrect route', () => {
    const data: User[] = [];
    const url = '/api/incorrect-route';

    updateUser(url, req, res, data);

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

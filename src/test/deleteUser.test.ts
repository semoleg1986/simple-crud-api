import { IncomingMessage, ServerResponse } from 'http';
import { deleteUser } from '../user/deleteUser';
import { StatusCodes, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

describe('deleteUser', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const mockEnd = jest.fn();
  const mockSetHeader = jest.fn();

  beforeEach(() => {
    req = {} as IncomingMessage;
    res = {
      statusCode: 0,
      setHeader: mockSetHeader,
      end: mockEnd
    } as unknown as ServerResponse;
    mockSetHeader.mockClear();
    mockEnd.mockClear();
  });

  it('should delete a user and return 204 if user id is valid and found', () => {
    const userId = uuidv4();
    const data: User[] = [
      {
        id: userId,
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      },
      {
        id: uuidv4(),
        username: 'Jane',
        age: 30,
        hobbies: ['gaming', 'cooking']
      }
    ];

    deleteUser(`/api/users/${userId}`, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.NoContent);
    expect(mockEnd).toHaveBeenCalled();
    expect(data.length).toBe(1);
    expect(data[0].id).not.toBe(userId);
  });

  it('should return 400 if invalid user id is provided', () => {
    const userId = 'invalid-id';
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];

    deleteUser(`/api/users/${userId}`, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Invalid user ID' })
    );
    expect(data.length).toBe(1);
  });

  it('should return 404 if user id is not found', () => {
    const userId = uuidv4();
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];

    deleteUser(`/api/users/${userId}`, req, res, data);

    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'User not found' })
    );
    expect(data.length).toBe(1);
  });

  it('should return 404 for incorrect route', () => {
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];

    deleteUser('/api/invalid', req, res, data);

    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Incorrect route' })
    );
    expect(data.length).toBe(1);
  });
});

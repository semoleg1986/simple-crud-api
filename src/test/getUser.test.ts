import { IncomingMessage, ServerResponse } from 'http';
import { getUser } from '../user/getUser';
import { StatusCodes, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

describe('getUser', () => {
  let req: IncomingMessage;
  let res: ServerResponse;
  const mockEnd = jest.fn();
  const mockSetHeader = jest.fn();
  beforeEach(() => {
    res = {
      statusCode: 0,
      setHeader: mockSetHeader,
      end: mockEnd
    } as unknown as ServerResponse;
    mockSetHeader.mockClear();
    mockEnd.mockClear();
  });

  it('should return all users', () => {
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      },
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];
    getUser('/api/users', req, res, data);
    expect(res.statusCode).toBe(StatusCodes.InternalServerError);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(JSON.stringify(data));
  });
  it('should return 404 if user ID is not found', () => {
    const data: User[] = [
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      },
      {
        id: uuidv4(),
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];
    const userUUID = uuidv4();
    getUser(`/api/users/${userUUID}`,req, res, data);
    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'User not found' })
    );
  });
  it('should return 400 if invalid ID is provided', () => {
    const data: User[] = [
      {
        id: 'd49aa6c2-e438-4952-8864-9b8dc40d800a',
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      },
      {
        id: 'd49aa6c2-e438-4952-8864-9b8dc40d800a',
        username: 'John',
        age: 25,
        hobbies: ['reading', 'running']
      }
    ];
    const userUUID = uuidv4();
    getUser(`/api/users/d49aa6c2-e438-4952-8864-9b8dc40d800123a`,req, res, data);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Invalid user ID' })
    );
  });
});

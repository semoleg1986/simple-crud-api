import { ServerResponse } from 'http';
import { deleteUser } from '../user/deleteUser';
import { StatusCodes, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

describe('deleteUser', () => {
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

  it('should return 400 if invalid id is provided', () => {
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
    const userId = 'abc';
    deleteUser(`/api/users/${userId}`, res, data);
    expect(res.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Invalid user ID' })
    );
    expect(data).toHaveLength(2);
  });

  it('should return 404 if user id is not found', () => {
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
    const userId = 'd49aa6c2-e438-4952-8864-9b8dc40d800a';
    deleteUser(`/api/users/${userId}`, res, data);
    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'User not found' })
    );
    expect(data).toHaveLength(2);
  });

  it('should return 404 for incorrect route', () => {
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
    deleteUser('/api/invalid', res, data);
    expect(res.statusCode).toBe(StatusCodes.NotFound);
    expect(mockSetHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(mockEnd).toHaveBeenCalledWith(
      JSON.stringify({ error: 'Incorrect route' })
    );
    expect(data).toHaveLength(2);
  });
});

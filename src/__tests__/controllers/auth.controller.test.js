import { jest } from '@jest/globals';
import { registerUser } from '../../controllers/auth.controller.js';

// Mock User model
jest.unstable_mockModule('../../models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

let User;
beforeAll(async () => {
  ({ User } = await import('../../models/index.js'));
});

describe('registerUser', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        walletAddress: '0x123',
        role: 'admin' // Malicious attempt
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should ignore user-provided role and assign default role', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      walletAddress: '0x123',
      role: 'user'
    });

    await registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'test@example.com',
      walletAddress: '0x123',
      role: 'user'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user'
      })
    );
  });

  it('should not allow duplicate users', async () => {
    User.findOne.mockResolvedValue({ id: '1' });
    await expect(registerUser(req, res)).rejects.toThrow('User already exists');
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

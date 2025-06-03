import { jest } from '@jest/globals';

// Mock models
jest.unstable_mockModule('../../models/index.js', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
  }
}));

let User, userController;

beforeAll(async () => {
  ({ User } = await import('../../models/index.js'));
  userController = await import('../../controllers/user.controller.js');
});

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: '123' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const mockUser = { 
        id: '123', 
        fullName: 'Test User',
        email: 'test@test.com'
      };
      User.findByPk.mockResolvedValue(mockUser);

      await userController.getUserProfile(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userController.getUserProfile(req, res))
        .rejects.toThrow('User not found');

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: '123',
        fullName: 'Test User',
        email: 'test@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      req.body = {
        fullName: 'Updated Name',
        email: 'updated@test.com'
      };

      await userController.updateUserProfile(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle user update errors', async () => {
      const mockUser = {
        id: '123',
        save: jest.fn().mockRejectedValue(new Error('Update failed'))
      };
      User.findByPk.mockResolvedValue(mockUser);

      req.body = {
        fullName: 'Updated Name',
        email: 'updated@test.com'
      };

      await expect(userController.updateUserProfile(req, res))
        .rejects.toThrow('Error updating user profile');
      
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should only update provided fields', async () => {
      const mockUser = {
        id: '123',
        fullName: 'Original Name',
        email: 'original@test.com',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      req.body = {
        fullName: 'Updated Name'
      };

      await userController.updateUserProfile(req, res);

      expect(mockUser.fullName).toBe('Updated Name');
      expect(mockUser.email).toBe('original@test.com');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle missing request body', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const { updateUserProfile } = userController;
      await updateUserProfile({ user: { id: 1 }, body: null }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getUserByWallet', () => {
    it('should get user by wallet address', async () => {
      const mockUser = {
        id: '123',
        walletAddress: '0x123',
        fullName: 'Test User'
      };
      User.findOne.mockResolvedValue(mockUser);

      req.params.address = '0x123';

      await userController.getUserByWallet(req, res);

      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { walletAddress: '0x123' }
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if wallet address not found', async () => {
      User.findOne.mockResolvedValue(null);
      req.params.address = '0x999';

      await expect(userController.getUserByWallet(req, res))
        .rejects.toThrow('User not found');
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUsers', () => {
    it('should get all users for admin', async () => {
      const mockUsers = [
        { id: '1', fullName: 'User 1' },
        { id: '2', fullName: 'User 2' }
      ];
      User.findAll.mockResolvedValue(mockUsers);

      await userController.getUsers(req, res);

      expect(User.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('Sanity Checks', () => {
    it('should have all controller methods defined', () => {
      expect(userController.getUserProfile).toBeDefined();
      expect(userController.updateUserProfile).toBeDefined();
      expect(userController.getUserByWallet).toBeDefined();
      expect(userController.getUsers).toBeDefined();
    });
  });

  describe('Controller Exports', () => {
    it('should export all controller methods', () => {
      expect(typeof userController.getUserProfile).toBe('function');
      expect(typeof userController.updateUserProfile).toBe('function');
      expect(typeof userController.getUserByWallet).toBe('function');
      expect(typeof userController.getUsers).toBe('function');
    });
  });
});

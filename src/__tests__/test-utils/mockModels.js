import { jest } from '@jest/globals';

const mockExamModel = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn().mockImplementation(function() {
    return Promise.resolve(this);
  }),
  destroy: jest.fn(),
});

const mockUserModel = () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

export { mockExamModel, mockUserModel };

describe('mockExamModel utility', () => {
  it('should return an object with mock functions', () => {
    const mock = mockExamModel();
    expect(typeof mock.create).toBe('function');
    expect(typeof mock.findAll).toBe('function');
    expect(typeof mock.findByPk).toBe('function');
    expect(typeof mock.update).toBe('function');
    expect(typeof mock.destroy).toBe('function');
  });
});

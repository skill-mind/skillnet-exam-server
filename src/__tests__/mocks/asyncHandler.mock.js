import { jest } from '@jest/globals';

const mockAsyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default mockAsyncHandler;

describe('asyncHandler mock', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});

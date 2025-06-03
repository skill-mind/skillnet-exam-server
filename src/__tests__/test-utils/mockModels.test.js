import { jest } from '@jest/globals';
import { mockExamModel, mockUserModel } from './mockModels.js';

describe('Mock Models', () => {
    describe('mockExamModel', () => {
        let examModel;

        beforeEach(() => {
            examModel = mockExamModel();
        });

        it('should create an object with all required mock functions', () => {
            expect(examModel).toEqual(
                expect.objectContaining({
                    create: expect.any(Function),
                    findAll: expect.any(Function),
                    findByPk: expect.any(Function),
                    update: expect.any(Function),
                    destroy: expect.any(Function)
                })
            );
        });

        it('should return promises from mock functions', async () => {
            examModel.create.mockResolvedValue({ id: 1 });
            examModel.findAll.mockResolvedValue([{ id: 1 }]);
            examModel.findByPk.mockResolvedValue({ id: 1 });
            examModel.destroy.mockResolvedValue(true);

            await expect(examModel.create()).resolves.toEqual({ id: 1 });
            await expect(examModel.findAll()).resolves.toEqual([{ id: 1 }]);
            await expect(examModel.findByPk()).resolves.toEqual({ id: 1 });
            await expect(examModel.destroy()).resolves.toBe(true);
        });

        it('should have update method that returns this', async () => {
            const result = await examModel.update({ name: 'Updated' });
            expect(result).toBe(examModel);
        });

        it('should allow mock implementations to be changed', () => {
            const mockError = new Error('Database error');
            examModel.create.mockRejectedValue(mockError);
            
            expect(examModel.create()).rejects.toThrow('Database error');
        });
    });

    describe('mockUserModel', () => {
        let userModel;

        beforeEach(() => {
            userModel = mockUserModel();
        });

        it('should create an object with all required mock functions', () => {
            expect(userModel).toEqual(
                expect.objectContaining({
                    create: expect.any(Function),
                    findByPk: expect.any(Function),
                    findOne: expect.any(Function),
                    update: expect.any(Function)
                })
            );
        });

        it('should return promises from mock functions', async () => {
            userModel.create.mockResolvedValue({ id: 1, name: 'Test User' });
            userModel.findOne.mockResolvedValue({ id: 1, name: 'Test User' });
            userModel.findByPk.mockResolvedValue({ id: 1, name: 'Test User' });
            userModel.update.mockResolvedValue([1]);

            await expect(userModel.create()).resolves.toEqual({ id: 1, name: 'Test User' });
            await expect(userModel.findOne()).resolves.toEqual({ id: 1, name: 'Test User' });
            await expect(userModel.findByPk()).resolves.toEqual({ id: 1, name: 'Test User' });
            await expect(userModel.update()).resolves.toEqual([1]);
        });

        it('should track mock function calls', () => {
            userModel.findOne({ where: { email: 'test@test.com' }});
            
            expect(userModel.findOne).toHaveBeenCalledWith({
                where: { email: 'test@test.com' }
            });
        });
    });
});
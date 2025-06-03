import { jest } from '@jest/globals';

// Mock express-validator
jest.unstable_mockModule('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

// Mock models
jest.unstable_mockModule('../../models/index.js', () => ({
  Exam: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  Question: { create: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
  Option: { create: jest.fn(), destroy: jest.fn() }
}));

let Exam, Question, Option, examController, validationResult;

beforeAll(async () => {
  ({ Exam, Question, Option } = await import('../../models/index.js'));
  ({ validationResult } = await import('express-validator'));
  examController = await import('../../controllers/exam.controller.js');
});

describe('Exam Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });
  });

  describe('getExams', () => {
    it('should get all exams', async () => {
      const mockExams = [{ id: 1, name: 'Test Exam' }];
      Exam.findAll.mockResolvedValue(mockExams);

      await examController.getExams(req, res);

      expect(Exam.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockExams);
    });

    it('should return empty array when no exams found', async () => {
      Exam.findAll.mockResolvedValue([]);
      await examController.getExams(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should filter by category when provided', async () => {
      req.query.category = 'Javascript';
      const mockExams = [{ id: 1, name: 'JS Test', category: 'Javascript' }];
      Exam.findAll.mockResolvedValue(mockExams);
      
      await examController.getExams(req, res);
      
      expect(Exam.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'Javascript' }
        })
      );
    });
  });

  describe('createExam', () => {
    it('should create an exam', async () => {
      const examData = {
        name: 'Test Exam',
        description: 'Test Description',
        category: 'Javascript',
        date: new Date(),
        duration: 60,
        passingScore: 70,
        price: 49.99
      };
      req.body = examData;

      Exam.create.mockResolvedValue({ id: 1, ...examData });
      Exam.findByPk.mockResolvedValue({ id: 1, ...examData });

      await examController.createExam(req, res);

      expect(Exam.create).toHaveBeenCalledWith(expect.objectContaining(examData));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid input' }]
      });

      await examController.createExam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Array) });
    });

    it('should handle exam creation database errors', async () => {
      req.body = {
        name: 'Test Exam',
        description: 'Test Description',
        category: 'Javascript',
        date: new Date(),
        duration: 60,
        passingScore: 70,
        price: 49.99
      };

      const dbError = new Error('DB Error');
      Exam.create.mockRejectedValue(dbError);

      await examController.createExam(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating exam: DB Error'
        })
      );
    });

    it('should handle questions creation when provided', async () => {
      req.body = {
        name: 'Test Exam',
        description: 'Test',
        category: 'Javascript',
        date: new Date(),
        duration: 60,
        passingScore: 70,
        price: 49.99,
        questions: [
          {
            question: 'Test question?',
            options: [
              { text: 'Option 1', isCorrect: true },
              { text: 'Option 2', isCorrect: false }
            ]
          }
        ]
      };

      const mockExam = { id: 1, ...req.body };
      const mockQuestion = { id: 1 };
      
      Exam.create.mockResolvedValue(mockExam);
      Question.create.mockResolvedValue(mockQuestion);
      Option.create.mockResolvedValue({ id: 1 });
      Exam.findByPk.mockResolvedValue({ 
        ...mockExam,
        Questions: [{ ...mockQuestion, Options: [] }]
      });

      await examController.createExam(req, res);

      expect(Question.create).toHaveBeenCalled();
      expect(Option.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle empty question array', async () => {
      const req = { body: { questions: [] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const { createExam } = examController;
      await createExam(req, res);
      expect(Question.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle partial exam updates', async () => {
      const exam = { id: 1, update: jest.fn() };
      Exam.findByPk.mockResolvedValue(exam);
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const { updateExam } = examController;
      await updateExam({ params: { id: 1 }, body: { name: 'New Name' } }, res);
      expect(exam.update).toHaveBeenCalledWith({ name: 'New Name' });
    });

    it('should handle question creation errors', async () => {
      // 1. Setup mock exam with destroy implementation
      const mockExam = { 
        id: 1, 
        destroy: jest.fn().mockResolvedValue(true)
      };

      // 2. Mock Exam.create to return our mock exam
      Exam.create.mockResolvedValue(mockExam);
      
      // 3. Force question creation to fail
      Question.create.mockRejectedValue(new Error('Q Error'));
      
      // 4. Setup request with questions data
      req.body = {
        name: 'Test Exam',
        questions: [{
          text: 'Sample Question',
          options: [{ text: 'Option 1', isCorrect: true }]
        }]
      };

      // 5. Execute the controller
      await examController.createExam(req, res, next);
      
      // 6. Verify proper cleanup and error handling
      expect(mockExam.destroy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating exam: Q Error'
        })
      );
    });
  });

  describe('deleteExam', () => {
    it('should delete exam and associated data', async () => {
      const mockExam = { id: 1, destroy: jest.fn() };
      Exam.findByPk.mockResolvedValue(mockExam);
      Question.findAll.mockResolvedValue([
        { id: 1, destroy: jest.fn() }
      ]);

      req.params.id = '1';
      
      await examController.deleteExam(req, res);

      expect(Question.destroy).toHaveBeenCalled();
      expect(mockExam.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return 404 if exam not found', async () => {
      Exam.findByPk.mockResolvedValue(null);
      req.params.id = '999';

      await expect(examController.deleteExam(req, res))
        .rejects.toThrow('Exam not found');
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateExam', () => {
    it('should update an exam', async () => {
      const exam = { id: 1, update: jest.fn() };
      Exam.findByPk.mockResolvedValue(exam);
      req.params.id = 1;
      req.body = { name: 'New Name' };

      await examController.updateExam(req, res);

      expect(exam.update).toHaveBeenCalledWith({
        name: 'New Name',
        description: undefined,
        category: undefined,
        date: undefined,
        duration: undefined,
        certification: undefined,
        passingScore: undefined,
        format: undefined,
        topicsCovered: undefined,
        benefits: undefined,
        price: undefined,
        instructions: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle partial exam updates', async () => {
      const exam = { id: 1, update: jest.fn() };
      Exam.findByPk.mockResolvedValue(exam);
      req.params.id = 1;
      req.body = { name: 'New Name' };

      await examController.updateExam(req, res);

      expect(exam.update).toHaveBeenCalledWith({
        name: 'New Name',
        description: undefined,
        category: undefined,
        date: undefined,
        duration: undefined,
        certification: undefined,
        passingScore: undefined,
        format: undefined,
        topicsCovered: undefined,
        benefits: undefined,
        price: undefined,
        instructions: undefined
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Sanity Checks', () => {
    it('should have all controller methods defined', () => {
      expect(examController.getExams).toBeDefined();
      expect(examController.getExamById).toBeDefined();
      expect(examController.createExam).toBeDefined();
      expect(examController.updateExam).toBeDefined();
      expect(examController.deleteExam).toBeDefined();
    });
  });

  describe('Controller Exports', () => {
    it('should export all controller methods', () => {
      expect(typeof examController.createExam).toBe('function');
      expect(typeof examController.updateExam).toBe('function');
    });
  });
});
import express from 'express';
import {
  getIndexerStatus,
  triggerScan,
  getContractEvents,
  getIndexedExams,
  getIndexedRegistrations,
  getIndexedResults
} from '../controllers/indexer.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route for everyone who is authenticated
router.get('/status', protect, getIndexerStatus);

// Admin-only routes
router.post('/scan', protect, admin, triggerScan);
router.get('/events', protect, admin, getContractEvents);
router.get('/exams', protect, admin, getIndexedExams);
router.get('/registrations', protect, admin, getIndexedRegistrations);
router.get('/results', protect, admin, getIndexedResults);

export default router;

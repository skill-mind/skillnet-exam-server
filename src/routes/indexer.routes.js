const express = require('express');
const router = express.Router();
const {
  getIndexerStatus,
  triggerScan,
  getContractEvents,
  getIndexedExams,
  getIndexedRegistrations,
  getIndexedResults
} = require('../controllers/indexer.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Route for everyone who is authenticated
router.get('/status', protect, getIndexerStatus);

// Admin-only routes
router.post('/scan', protect, admin, triggerScan);
router.get('/events', protect, admin, getContractEvents);
router.get('/exams', protect, admin, getIndexedExams);
router.get('/registrations', protect, admin, getIndexedRegistrations);
router.get('/results', protect, admin, getIndexedResults);

module.exports = router;

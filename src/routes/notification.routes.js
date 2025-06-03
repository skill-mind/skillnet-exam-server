import express from 'express';
import { check } from 'express-validator';
import * as notificationController from '../controllers/notification.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get('/', protect, notificationController.getNotifications);

// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', protect, notificationController.getNotificationById);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('type', 'Type must be info, success, warning, or error').isIn(['info', 'success', 'warning', 'error']),
  ]
], notificationController.createNotification);

// @route   PUT /api/notifications/:id
// @desc    Update a notification
// @access  Private/Admin
router.put('/:id', [protect, admin], notificationController.updateNotification);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/:id/read', protect, notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private/Admin
router.delete('/:id', [protect, admin], notificationController.deleteNotification);

export default router;

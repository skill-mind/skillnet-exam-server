import { Notification, User } from '../models/index.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  try {
    logger.info(`User ${req.user.id} requesting their notifications`);

    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
      },
      order: [['createdAt', 'DESC']],
    });

    logger.info(`Retrieved ${notifications.length} notifications for user ${req.user.id}`);
    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Error retrieving notifications for user ${req.user.id}: ${error.message}`, {
      userId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving notifications');
  }
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = asyncHandler(async (req, res) => {
  try {
    logger.info(`User ${req.user.id} requesting notification ${req.params.id}`);

    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      logger.warn(`Notification with id ${req.params.id} not found for user ${req.user.id}`, {
        notificationId: req.params.id,
        userId: req.user.id
      });
      res.status(404);
      throw new Error('Notification not found');
    }

    logger.info(`Retrieved notification ${notification.id} for user ${req.user.id}`);
    res.status(200).json(notification);
  } catch (error) {
    if (error.message === 'Notification not found') {
      throw error;
    }
    logger.error(`Error retrieving notification ${req.params.id} for user ${req.user.id}: ${error.message}`, {
      notificationId: req.params.id,
      userId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error retrieving notification');
  }
});

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors in creating notification by admin ${req.user.id}: ${JSON.stringify(errors.array())}`, {
      userId: req.user.id,
      validationErrors: errors.array()
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    message,
    type,
    userId,
    expiresAt,
  } = req.body;

  logger.info(`Admin ${req.user.id} creating notification: "${title}" for user ${userId || 'all users'}`);

  try {
    // Check if user exists if userId is provided
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn(`User with id ${userId} not found while admin ${req.user.id} creating notification`, {
          targetUserId: userId,
          adminId: req.user.id
        });
        res.status(404);
        throw new Error('User not found');
      }
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      userId,
      expiresAt,
    });

    logger.info(`Created notification ${notification.id} for user ${userId || 'all users'} by admin ${req.user.id}`, {
      notificationId: notification.id,
      targetUserId: userId,
      adminId: req.user.id,
      notificationType: type || 'info'
    });
    res.status(201).json(notification);
  } catch (error) {
    if (error.message === 'User not found') {
      throw error;
    }
    logger.error(`Error creating notification by admin ${req.user.id}: ${error.message}`, {
      adminId: req.user.id,
      targetUserId: userId,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error creating notification');
  }
});

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin)
const updateNotification = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} updating notification ${req.params.id}`);

    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      logger.warn(`Notification with id ${req.params.id} not found for update by admin ${req.user.id}`, {
        notificationId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Notification not found');
    }

    const {
      title,
      message,
      type,
      isRead,
      expiresAt,
    } = req.body;

    // Update notification
    await notification.update({
      title: title || notification.title,
      message: message || notification.message,
      type: type || notification.type,
      isRead: isRead !== undefined ? isRead : notification.isRead,
      expiresAt: expiresAt || notification.expiresAt,
    });

    logger.info(`Updated notification ${notification.id} by admin ${req.user.id}`, {
      notificationId: notification.id,
      adminId: req.user.id,
      changes: {
        title: !!title,
        message: !!message,
        type: !!type,
        isRead: isRead !== undefined,
        expiresAt: !!expiresAt
      }
    });
    res.status(200).json(notification);
  } catch (error) {
    if (error.message === 'Notification not found') {
      throw error;
    }
    logger.error(`Error updating notification ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      notificationId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error updating notification');
  }
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  try {
    logger.info(`User ${req.user.id} marking notification ${req.params.id} as read`);

    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      logger.warn(`Notification with id ${req.params.id} not found for user ${req.user.id} to mark as read`, {
        notificationId: req.params.id,
        userId: req.user.id
      });
      res.status(404);
      throw new Error('Notification not found');
    }

    // Mark as read
    await notification.update({
      isRead: true,
    });

    logger.info(`Marked notification ${notification.id} as read for user ${req.user.id}`, {
      notificationId: notification.id,
      userId: req.user.id,
      previousReadStatus: notification.isRead
    });
    res.status(200).json(notification);
  } catch (error) {
    if (error.message === 'Notification not found') {
      throw error;
    }
    logger.error(`Error marking notification ${req.params.id} as read for user ${req.user.id}: ${error.message}`, {
      notificationId: req.params.id,
      userId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error marking notification as read');
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
const deleteNotification = asyncHandler(async (req, res) => {
  try {
    logger.info(`Admin ${req.user.id} deleting notification ${req.params.id}`);

    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      logger.warn(`Notification with id ${req.params.id} not found for deletion by admin ${req.user.id}`, {
        notificationId: req.params.id,
        adminId: req.user.id
      });
      res.status(404);
      throw new Error('Notification not found');
    }

    // Delete notification
    await notification.destroy();

    logger.info(`Deleted notification ${req.params.id} by admin ${req.user.id}`, {
      notificationId: req.params.id,
      adminId: req.user.id,
      notificationData: {
        title: notification.title,
        userId: notification.userId,
        type: notification.type
      }
    });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    if (error.message === 'Notification not found') {
      throw error;
    }
    logger.error(`Error deleting notification ${req.params.id} by admin ${req.user.id}: ${error.message}`, {
      notificationId: req.params.id,
      adminId: req.user.id,
      error: error.stack
    });
    res.status(500);
    throw new Error('Error deleting notification');
  }
});

export {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  markAsRead,
  deleteNotification,
};

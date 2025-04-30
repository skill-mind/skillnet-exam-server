/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the notification
 *         title:
 *           type: string
 *           description: The title of the notification
 *         message:
 *           type: string
 *           description: The notification message content
 *         type:
 *           type: string
 *           enum: [info, success, warning, error]
 *           description: The type/severity of the notification
 *         isRead:
 *           type: boolean
 *           description: Whether the notification has been read by the user
 *         userId:
 *           type: string
 *           description: The UUID of the user this notification is for (null if global)
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the notification expires (null if it doesn't expire)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the notification was last updated
 *       example:
 *         id: d5fE_asz
 *         title: New Exam Available
 *         message: A new Cairo certification exam is now available. Register now!
 *         type: info
 *         isRead: false
 *         userId: 3fa85f64-5717-4562
 *         expiresAt: 2023-07-21T17:32:28Z
 *         createdAt: 2023-07-01T17:32:28Z
 *         updatedAt: 2023-07-01T17:32:28Z
 *
 *
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management API
 *
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Returns all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 description: The notification title
 *               message:
 *                 type: string
 *                 description: The notification message content
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 description: The notification type
 *               userId:
 *                 type: string
 *                 description: The user ID this notification is for (null for global)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the notification expires
 *     responses:
 *       201:
 *         description: The notification was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: The notification data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The notification title
 *               message:
 *                 type: string
 *                 description: The notification message content
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error]
 *                 description: The notification type
 *               isRead:
 *                 type: boolean
 *                 description: Read status of the notification
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the notification expires
 *     responses:
 *       200:
 *         description: The notification was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: The notification was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the deleted notification
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 *
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: The notification was marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */

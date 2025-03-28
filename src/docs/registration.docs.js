/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Exam registration operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         examId:
 *           type: string
 *           format: uuid
 *         examCode:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed]
 *         registrationDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Register for an exam
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *             properties:
 *               examId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Registration successful
 *       401:
 *         description: Not authorized
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /registrations/{id}/payment:
 *   put:
 *     summary: Update payment status
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed]
 *     responses:
 *       200:
 *         description: Payment status updated
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Registration not found
 */

/**
 * @swagger
 * /registrations/user:
 *   get:
 *     summary: Get user's registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's registrations
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /registrations/validate:
 *   post:
 *     summary: Validate exam code
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - examCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               examCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exam code validated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Registration not found
 */

module.exports = {};
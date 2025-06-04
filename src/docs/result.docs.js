/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Exam results and certificates
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Answer:
 *       type: object
 *       properties:
 *         questionId:
 *           type: string
 *           format: uuid
 *         selectedOptionId:
 *           type: string
 *           format: uuid
 *     Result:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         registrationId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         examId:
 *           type: string
 *           format: uuid
 *         score:
 *           type: number
 *         passed:
 *           type: boolean
 *         submissionDate:
 *           type: string
 *           format: date-time
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Answer'
 */

/**
 * @swagger
 * /results:
 *   post:
 *     summary: Submit exam and create result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - answers
 *             properties:
 *               registrationId:
 *                 type: string
 *                 format: uuid
 *               answers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Answer'
 *     responses:
 *       201:
 *         description: Exam submitted successfully
 *       401:
 *         description: Not authorized
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /results/user:
 *   get:
 *     summary: Get user's results
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's results
 *       401:
 *         description: Not authorized
 */

/**
 * @swagger
 * /results/{id}:
 *   get:
 *     summary: Get result by ID
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Result not found
 */

/**
 * @swagger
 * /results/certificate/{id}:
 *   get:
 *     summary: Generate certificate for a result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Certificate generated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Result not found
 */

export default {};
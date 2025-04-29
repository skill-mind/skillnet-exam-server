/**
 * @swagger
 * components:
 *   schemas:
 *     ExamBanner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the exam banner
 *         title:
 *           type: string
 *           description: The title of the exam banner
 *         description:
 *           type: string
 *           description: The description of the exam banner
 *         imageUrl:
 *           type: string
 *           description: URL of the banner image
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the banner starts being displayed
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the banner stops being displayed
 *         isActive:
 *           type: boolean
 *           description: Whether the banner is active
 *         examId:
 *           type: string
 *           description: The UUID of the exam this banner is for (if applicable)
 *         buttonText:
 *           type: string
 *           description: Text to display on the banner button
 *         buttonLink:
 *           type: string
 *           description: URL the button links to
 *         priority:
 *           type: integer
 *           description: Priority level for display order (higher numbers display first)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the banner was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the banner was last updated
 *       example:
 *         id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         title: Cairo Certification Exam
 *         description: Join our upcoming Cairo certification and prove your skills!
 *         imageUrl: https://example.com/banner.jpg
 *         startDate: 2023-07-01T00:00:00Z
 *         endDate: 2023-07-31T23:59:59Z
 *         isActive: true
 *         examId: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         buttonText: Register Now
 *         buttonLink: /exams/3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         priority: 10
 *         createdAt: 2023-06-15T17:32:28Z
 *         updatedAt: 2023-06-15T17:32:28Z
 *
 *
 * @swagger
 * tags:
 *   name: ExamBanners
 *   description: Exam banner management API
 *
 * @swagger
 * /api/exam-banners:
 *   get:
 *     summary: Returns all exam banners
 *     tags: [ExamBanners]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false)
 *     responses:
 *       200:
 *         description: The list of exam banners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamBanner'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new exam banner
 *     tags: [ExamBanners]
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
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 description: The banner title
 *               description:
 *                 type: string
 *                 description: The banner description
 *               imageUrl:
 *                 type: string
 *                 description: URL of the banner image
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the banner starts being displayed
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the banner stops being displayed
 *               isActive:
 *                 type: boolean
 *                 description: Whether the banner is active
 *               examId:
 *                 type: string
 *                 description: The ID of the exam this banner is for
 *               buttonText:
 *                 type: string
 *                 description: Text to display on the banner button
 *               buttonLink:
 *                 type: string
 *                 description: URL the button links to
 *               priority:
 *                 type: integer
 *                 description: Priority level for display order
 *     responses:
 *       201:
 *         description: The banner was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamBanner'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 *
 * @swagger
 * /api/exam-banners/{id}:
 *   get:
 *     summary: Get an exam banner by ID
 *     tags: [ExamBanners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam banner ID
 *     responses:
 *       200:
 *         description: The exam banner data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamBanner'
 *       404:
 *         description: Exam banner not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update an exam banner
 *     tags: [ExamBanners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The banner title
 *               description:
 *                 type: string
 *                 description: The banner description
 *               imageUrl:
 *                 type: string
 *                 description: URL of the banner image
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the banner starts being displayed
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the banner stops being displayed
 *               isActive:
 *                 type: boolean
 *                 description: Whether the banner is active
 *               examId:
 *                 type: string
 *                 description: The ID of the exam this banner is for
 *               buttonText:
 *                 type: string
 *                 description: Text to display on the banner button
 *               buttonLink:
 *                 type: string
 *                 description: URL the button links to
 *               priority:
 *                 type: integer
 *                 description: Priority level for display order
 *     responses:
 *       200:
 *         description: The banner was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamBanner'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam banner or exam not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete an exam banner
 *     tags: [ExamBanners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam banner ID
 *     responses:
 *       200:
 *         description: The banner was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the deleted banner
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam banner not found
 *       500:
 *         description: Server error
 */

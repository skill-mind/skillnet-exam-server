/**
 * @swagger
 * components:
 *   schemas:
 *     ExamRecording:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the exam recording
 *         title:
 *           type: string
 *           description: The title of the exam recording
 *         description:
 *           type: string
 *           description: The description of the exam recording
 *         recordingUrl:
 *           type: string
 *           description: URL of the recording
 *         duration:
 *           type: integer
 *           description: Duration of the recording in seconds
 *         examId:
 *           type: string
 *           description: The UUID of the exam this recording is for
 *         presenter:
 *           type: string
 *           description: Name of the presenter in the recording
 *         recordedOn:
 *           type: string
 *           format: date-time
 *           description: When the recording was created
 *         isPublished:
 *           type: boolean
 *           description: Whether the recording is published and available for viewing
 *         thumbnailUrl:
 *           type: string
 *           description: URL of the recording thumbnail image
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the recording
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the recording was created in the system
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the recording was last updated
 *       example:
 *         id: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         title: Cairo Smart Contracts - Deep Dive
 *         description: A comprehensive tutorial on Cairo smart contract development
 *         recordingUrl: https://example.com/recordings/cairo-smart-contracts.mp4
 *         duration: 3600
 *         examId: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *         presenter: Jane Smith
 *         recordedOn: 2023-06-15T13:00:00Z
 *         isPublished: true
 *         thumbnailUrl: https://example.com/thumbnails/cairo-smart-contracts.jpg
 *         tags: ["cairo", "smart contracts", "tutorial"]
 *         createdAt: 2023-06-15T17:32:28Z
 *         updatedAt: 2023-06-15T17:32:28Z
 *
 *
 * @swagger
 * tags:
 *   name: ExamRecordings
 *   description: Exam recording management API
 *
 * @swagger
 * /api/exam-recordings:
 *   get:
 *     summary: Returns all exam recordings
 *     tags: [ExamRecordings]
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: string
 *         description: Filter by exam ID
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status (true/false)
 *     responses:
 *       200:
 *         description: The list of exam recordings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamRecording'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new exam recording
 *     tags: [ExamRecordings]
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
 *               - recordingUrl
 *               - examId
 *             properties:
 *               title:
 *                 type: string
 *                 description: The recording title
 *               description:
 *                 type: string
 *                 description: The recording description
 *               recordingUrl:
 *                 type: string
 *                 description: URL of the recording
 *               duration:
 *                 type: integer
 *                 description: Duration of the recording in seconds
 *               examId:
 *                 type: string
 *                 description: The ID of the exam this recording is for
 *               presenter:
 *                 type: string
 *                 description: Name of the presenter
 *               recordedOn:
 *                 type: string
 *                 format: date-time
 *                 description: When the recording was created
 *               isPublished:
 *                 type: boolean
 *                 description: Whether the recording is published
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL of the recording thumbnail
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the recording
 *     responses:
 *       201:
 *         description: The recording was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecording'
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
 * /api/exam-recordings/{id}:
 *   get:
 *     summary: Get an exam recording by ID
 *     tags: [ExamRecordings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam recording ID
 *     responses:
 *       200:
 *         description: The exam recording data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecording'
 *       404:
 *         description: Exam recording not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update an exam recording
 *     tags: [ExamRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam recording ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The recording title
 *               description:
 *                 type: string
 *                 description: The recording description
 *               recordingUrl:
 *                 type: string
 *                 description: URL of the recording
 *               duration:
 *                 type: integer
 *                 description: Duration of the recording in seconds
 *               examId:
 *                 type: string
 *                 description: The ID of the exam this recording is for
 *               presenter:
 *                 type: string
 *                 description: Name of the presenter
 *               recordedOn:
 *                 type: string
 *                 format: date-time
 *                 description: When the recording was created
 *               isPublished:
 *                 type: boolean
 *                 description: Whether the recording is published
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL of the recording thumbnail
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the recording
 *     responses:
 *       200:
 *         description: The recording was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecording'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam recording or exam not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete an exam recording
 *     tags: [ExamRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam recording ID
 *     responses:
 *       200:
 *         description: The recording was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the deleted recording
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam recording not found
 *       500:
 *         description: Server error
 *
 * @swagger
 * /api/exam-recordings/{id}/publish:
 *   patch:
 *     summary: Toggle the publish status of an exam recording
 *     tags: [ExamRecordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The exam recording ID
 *     responses:
 *       200:
 *         description: The recording publish status was toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamRecording'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam recording not found
 *       500:
 *         description: Server error
 */

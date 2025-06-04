/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Exam management and operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *         isCorrect:
 *           type: boolean
 *         order:
 *           type: string
 *     Question:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *         order:
 *           type: number
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *     Exam:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: number
 *         certification:
 *           type: boolean
 *         passingScore:
 *           type: number
 *         format:
 *           type: string
 *         topicsCovered:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         price:
 *           type: number
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 */

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter exams by category
 *     responses:
 *       200:
 *         description: List of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *           example:
 *             name: "JavaScript Fundamentals"
 *             description: "Test your knowledge of JavaScript fundamentals"
 *             category: "Javascript"
 *             date: "2023-12-31T00:00:00.000Z"
 *             duration: 60
 *             certification: true
 *             passingScore: 70
 *             format: "Multichoice"
 *             topicsCovered: ["Variables", "Functions", "Objects", "Arrays"]
 *             benefits: ["Improve your JS skills", "Get certified", "Enhance your resume"]
 *             price: 49.99
 *             instructions: ["Read each question carefully", "You can review answers before submitting"]
 *             questions:
 *               - question: "Which of the following is not a JavaScript data type?"
 *                 options:
 *                   - text: "String"
 *                     isCorrect: false
 *                   - text: "Boolean"
 *                     isCorrect: false
 *                   - text: "Float"
 *                     isCorrect: true
 *                   - text: "Object"
 *                     isCorrect: false
 *               - question: "What does the '===' operator do?"
 *                 options:
 *                   - text: "Assigns a value"
 *                     isCorrect: false
 *                   - text: "Compares value only"
 *                     isCorrect: false
 *                   - text: "Compares value and type"
 *                     isCorrect: true
 *                   - text: "Logical AND"
 *                     isCorrect: false
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       401:
 *         description: Not authorized
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details
 *       404:
 *         description: Exam not found
 *   put:
 *     summary: Update an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *           example:
 *             name: "JavaScript Fundamentals"
 *             description: "Test your knowledge of JavaScript fundamentals"
 *             category: "Javascript"
 *             date: "2023-12-31T00:00:00.000Z"
 *             duration: 60
 *             certification: true
 *             passingScore: 70
 *             format: "Multichoice"
 *             topicsCovered: ["Variables", "Functions", "Objects", "Arrays"]
 *             benefits: ["Improve your JS skills", "Get certified", "Enhance your resume"]
 *             price: 49.99
 *             instructions: ["Read each question carefully", "You can review answers before submitting"]
 *             questions:
 *               - question: "Which of the following is not a JavaScript data type?"
 *                 options:
 *                   - text: "String"
 *                     isCorrect: false
 *                   - text: "Boolean"
 *                     isCorrect: false
 *                   - text: "Float"
 *                     isCorrect: true
 *                   - text: "Object"
 *                     isCorrect: false
 *               - question: "What does the '===' operator do?"
 *                 options:
 *                   - text: "Assigns a value"
 *                     isCorrect: false
 *                   - text: "Compares value only"
 *                     isCorrect: false
 *                   - text: "Compares value and type"
 *                     isCorrect: true
 *                   - text: "Logical AND"
 *                     isCorrect: false
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam not found
 *   delete:
 *     summary: Delete an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Exam not found
 */

/**
 * @swagger
 * /exams/category/{category}:
 *   get:
 *     summary: Get exams by category
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam category
 *     responses:
 *       200:
 *         description: List of exams in the category
 */

export default {};
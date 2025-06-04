# Contributing to SkillNet: Empowering Exams with Innovation

Thank you for your interest in contributing to SkillNet! SkillNet is a cutting-edge platform designed to host secure and efficient online exams. Our backend is built with Node.js and utilizes modern technologies to deliver a seamless testing experience for educators and candidates.

## Project Overview

**SkillNet** re-imagines online examinations by:

- **Empowering Educators:** Offering robust tools for creating, scheduling, and managing exams.

- **Enhancing Candidate Experience:** Delivering a user-friendly and secure testing environment.

- **Ensuring Exam Integrity:** Incorporating advanced proctoring solutions and real-time analytics for fair assessments.

### Features
- Exam creation and scheduling tools

- Secure, real-time exam monitoring and proctoring

- Comprehensive performance analytics

- Customizable exam templates

- Integrated communication channels
---

## How to Contribute

We welcome contributions in various forms, including bug fixes, feature implementations, and documentation improvements.

### 1. Fork the Repository
1. Navigate to the
(https://github.com/skill-mind/skillnet-exam-server.git).
2. Click the **Fork** button to create your copy of the repository.

### 2. Clone the Repository
- Clone your forked repository to your local machine:
```bash
git clone https://github.com/<your-username>/skill-mind/skillnet-exam-server.git

cd sskillnet-exam-server
```

### 3. Set Up the Project
**Prerequisites:**

- Node.js (v16.x or above)
- npm 
- git

**Install Dependencies:**

```bash
  npm install
```
### 4. Create a New Branch

**Create a branch for your feature or bug fix:**
```bash
  git checkout -b feature/<Issue title>
```

### 5. Make Changes and Commit

- Implement your changes.
- Test your changes thoroughly.
- Commit your work with a descriptive message:

```bash
   git add .
   git commit -m "Issue Title"
```

### 6. Push Changes
 - Push your branch to your forked repository:

```bash
   git push origin <Issue Title>
```

### 7. Create a Pull Request (PR)

- Click on Pull Requests and select New Pull Request.
- Provide a clear and concise title and description for your PR.
- Link any relevant issues.

**Code of Conduct**

- Please adhere to our Code of Conduct to maintain a respectful and inclusive community.

### Contribution Guidelines
- Write clean and modular code following the repository's coding standards.
- Ensure all changes are tested before submission.
- Document new features and updates thoroughly.




# SkillNet Exam Server

A comprehensive API for managing online exams, certifications, and skill assessments.

## Features

- User authentication and authorization with JWT
- Wallet address integration for blockchain-based authentication
- Exam creation and management with multiple question types
- Exam registration and payment tracking
- Exam taking and automated scoring
- Result tracking and certificate generation
- Admin dashboard for managing users and exams
- API documentation with Swagger UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT, Wallet address verification
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/skillnet-exam-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd skillnet-exam-server
   ```

3. Install dependencies:
    ```bash
    npm install
    ```
4. Copy the .env.example file to .env and configure your environment variables.
    ```env
    NODE_ENV=development
    PORT=5001

    # Database
    DB_HOST=localhost
    DB_PORT=5433
    DB_NAME=skillnet_exam
    DB_USER=skillnet_exam
    DB_PASSWORD=skillnet_exam

    # JWT
    JWT_SECRET=your_jwt_secret_key_here
    JWT_EXPIRES_IN=30d
    ```
### Running the Database with Docker
The project includes a Docker Compose file to easily set up the PostgreSQL database:

```bash
docker-compose up -d
 ```
If `docker-compse` doesn't work, you can make use of `docker compose` command instead
```bash
docker compose up -d
```

This will start a PostgreSQL container with the following configuration:

- Container name: skillnet-db
- Database name: skillnet_exam
- Username: skillnet_exam
- Password: skillnet_exam
- Port: 5433 (mapped to 5432 inside the container)

### Running the Server
For development (with nodemon for auto-restart):

```bash
npm run dev
 ```

For production:

```bash
npm start
 ```

The server will be running at `http://localhost:5001`

## API Documentation
API documentation is available at http://localhost:5001/api-docs when the server is running. This interactive documentation is generated using Swagger UI and allows you to:

- View all available endpoints
- See request and response schemas
- Test endpoints directly from the browser
- Authenticate with JWT tokens
## Project Structure
```plaintext
skillnet-exam-server/
├── src/                      # Source code
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── docs/                 # Swagger documentation
│   ├── middleware/           # Express middleware
│   ├── models/               # Sequelize models
│   ├── routes/               # Express routes
│   ├── utils/                # Utility functions
│   └── server.js             # Express app entry point
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── api.rest                  # REST Client file for testing endpoints
├── docker-compose.yml        # Docker Compose configuration
├── package.json              # npm dependencies
└── README.md                 # Project documentation
```

## Main Endpoints
### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login a user
- GET /api/auth/profile - Get authenticated user profile
### Users
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- GET /api/users/wallet/:address - Get user by wallet address
- GET /api/users - Get all users (admin only)
### Exams
- GET /api/exams - Get all exams
- GET /api/exams/:id - Get exam by ID
- POST /api/exams - Create a new exam (admin only)
- PUT /api/exams/:id - Update an exam (admin only)
- DELETE /api/exams/:id - Delete an exam (admin only)
- GET /api/exams/category/:category - Get exams by category
### Registrations
- POST /api/registrations - Register for an exam
- PUT /api/registrations/:id/payment - Update payment status
- GET /api/registrations/user - Get user's registrations
- POST /api/registrations/validate - Validate exam code
### Results
- POST /api/results - Submit exam and create result
- GET /api/results/user - Get user's results
- GET /api/results/:id - Get result by ID
- GET /api/results/certificate/:id - Generate certificate for a result
## Testing the API
The project includes an api.rest file that can be used with the REST Client extension in VS Code to test all endpoints. To use it:

1. Install the REST Client extension in VS Code
2. Open the api.rest file
3. Click on "Send Request" above any endpoint to test it
4. Use the variables defined in the file to chain requests (e.g., using tokens from login responses)
## Database Schema
The application uses the following main models:

- User : Stores user information and authentication details
- Exam : Contains exam details, questions, and settings
- Registration : Tracks user registrations for exams
- Result : Stores exam results and user answers
## Contributing to SkillNet: Empowering Exams with Innovation
Thank you for your interest in contributing to SkillNet! SkillNet is a cutting-edge platform designed to host secure and efficient online exams. Our backend is built with Node.js and utilizes modern technologies to deliver a seamless testing experience for educators and candidates.

### Project Overview
SkillNet re-imagines online examinations by:

- Empowering Educators: Offering robust tools for creating, scheduling, and managing exams.
- Enhancing Candidate Experience: Delivering a user-friendly and secure testing environment.
- Ensuring Exam Integrity: Incorporating advanced proctoring solutions and real-time analytics for fair assessments. Features
- Exam creation and scheduling tools
- Secure, real-time exam monitoring and proctoring
- Comprehensive performance analytics
- Customizable exam templates
- Integrated communication channels
### How to Contribute
We welcome contributions in various forms, including bug fixes, feature implementations, and documentation improvements.
1. Fork the Repository
    - Navigate to the repository [skillnet-exam-server](https://github.com/skill-mind/skillnet-exam-server.git).
    - Click the Fork button to create your copy of the repository.

2. Clone the Repository
   - Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/<your-username>/skill-mind/skillnet-exam-server.git
    ```
    - Navigate to the project directory:
    ```bash
    cd skillnet-exam-server
    ```
3. Set Up the Project

Prerequisites:
  - Node.js (v16.x or above)
  - npm
  - git
  
    Install Dependencies:

    ```bash
    npm install
    ```

4. Create a New Branch

    Create a branch for your feature or bug fix:

    ```bash
    git checkout -b feature/<Issue title>
    ```

5. Make Changes and Commit
    Implement your changes.
    Test your changes thoroughly.
    Commit your work with a descriptive message:
    ```bash
    git add.
    git commit -m "Issue Title"
    ```
6. Push Changes
    Push your branch to your forked repository:
    ```bash
    git push origin <Issue Title>
    ```
7. Create a Pull Request (PR)
    Click on Pull Requests and select New Pull Request.
    Provide a clear and concise title and description for your PR.
    Link any relevant issues.
### Code of Conduct
Please adhere to our Code of Conduct to maintain a respectful and inclusive community.
### Contribution Guidelines
- Write clean and modular code following the repository's coding standards.
- Ensure all changes are tested before submission.
- Document new features and updates thoroughly.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## ESM Migration Guide and Test Fixes

### 1. Update Configuration Files

#### `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "jest": {
    "transform": {},
    "extensionsToTreatAsEsm": [".js"]
  }
}
```

#### `jest.config.js`:
```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

### 2. Common Issues and Solutions

|             Issue             |             Solution               |
|-------------------------------|------------------------------------|
| "Cannot use import statement" | Ensure "type": "module" is set     |
| Mock not working in tests     | Use unstable_mockModule for ESM    |
| Missing file extensions       | Always include .js in imports      |
| Async test failures           | Add proper await/async handling    |

## ESM Usage

```javascript
// Importing from this package
import { createExam } from 'skillnet-exam-server'
```
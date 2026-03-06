# Task Manager API

A simple CRUD API for managing tasks build with Node.js, Express, MongoDB, and TypeScript.

## Folder Structure

```text
backend/
├── src/
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── models/
│   │   └── task.model.ts
│   ├── routes/
│   │   └── task.routes.ts
│   ├── config/
│   │   └── db.ts
│   ├── types/
│   │   └── task.types.ts
│   ├── app.ts
│   └── server.ts
├── tsconfig.json
├── .env.example
├── package.json
└── README.md
```

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB & Mongoose**
- **dotenv** (Environment Configuration)
- **cors** (Cross-Origin Resource Sharing)
- **nodemon** (Development server)
- **ts-node** (TypeScript execution for Node)

## Setup & Run

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally

### Installation

1. Clone the repository
2. Navigate to the `backend` folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

### Running the application

- **Development mode** (with hot reload):
  ```bash
  npm run dev
  ```
- **Build for production**:
  ```bash
  npm run build
  ```
- **Start production server**:
  ```bash
  npm run start
  ```

## API Endpoints

| Method     | Endpoint         | Description             |
| :--------- | :--------------- | :---------------------- |
| **POST**   | `/api/tasks`     | Create a new task       |
| **GET**    | `/api/tasks`     | Get all tasks           |
| **GET**    | `/api/tasks/:id` | Get a single task by ID |
| **PUT**    | `/api/tasks/:id` | Update an existing task |
| **DELETE** | `/api/tasks/:id` | Delete a task           |

## Task Model

- `title`: string (required)
- `description`: string
- `completed`: boolean (default: false)
- `createdAt`: Date

# Architecture Map

## Major Modules

### Backend Modules

#### API Layer
- **Express Application** (`backend/src/app.ts`)
  - Configures Express middleware
  - Sets up CORS
  - Registers route handlers

- **Routes** (`backend/src/routes/`)
  - `task.routes.ts` - Defines task-related API endpoints

- **Controllers** (`backend/src/controllers/`)
  - `task.controller.ts` - Handles HTTP requests for task operations
    - `createTask` - POST /api/tasks
    - `getTasks` - GET /api/tasks
    - `getTaskById` - GET /api/tasks/:id
    - `updateTask` - PUT /api/tasks/:id
    - `deleteTask` - DELETE /api/tasks/:id

#### Services Layer
- **Database Configuration** (`backend/src/config/db.ts`)
  - MongoDB connection setup
  - Connection error handling

#### Data Layer
- **Models** (`backend/src/models/`)
  - `task.model.ts` - Mongoose schema for tasks
    - Schema definition
    - TypeScript interface
    - Validation rules

#### Type Definitions
- **Types** (`backend/src/types/`)
  - `task.types.ts` - TypeScript interfaces for task entities

#### Testing
- **Tests** (`backend/src/tests/`)
  - `setup.ts` - Test database setup
  - `task.controller.test.ts` - Controller test suite

### Frontend Modules

#### UI Components
- **Components** (`frontend/src/components/`)
  - `TaskForm.tsx` - Task creation/editing form
  - `TaskItem.tsx` - Individual task display
  - `TaskList.tsx` - List of tasks

#### Application Layer
- **App Component** (`frontend/src/App.tsx`)
  - Main application container
  - State management
  - Component composition

#### API Integration
- **API Layer** (`frontend/src/api/`)
  - `taskApi.ts` - HTTP client for backend communication
    - Axios configuration
    - API endpoint functions

#### Type Definitions
- **Types** (`frontend/src/types/`)
  - `task.ts` - TypeScript interfaces for task data

## Key Directories

### Backend
- `backend/src/controllers/` - Request handling logic
- `backend/src/models/` - Database schemas and models
- `backend/src/routes/` - API route definitions
- `backend/src/config/` - Configuration files
- `backend/src/types/` - TypeScript type definitions
- `backend/src/tests/` - Test files

### Frontend
- `frontend/src/components/` - React components
- `frontend/src/api/` - API integration layer
- `frontend/src/types/` - TypeScript interfaces
- `frontend/src/` - Main application files

## Data Flow

### Task Creation Flow
1. User submits form in `TaskForm.tsx`
2. Data sent via `taskApi.createTask()`
3. Request handled by `task.controller.createTask()`
4. Task saved to MongoDB via `task.model`
5. Response returned to frontend
6. UI updated with new task

### Task Retrieval Flow
1. Component requests data via `taskApi.getTasks()`
2. Request handled by `task.controller.getTasks()`
3. Tasks fetched from MongoDB via `task.model`
4. Response returned to frontend
5. Tasks displayed in `TaskList.tsx`

## Technology Stack Relationships

```
Frontend (React + TypeScript)
         ↓
    HTTP Requests
         ↓
Backend API (Express + TypeScript)
         ↓
    Mongoose ODM
         ↓
   MongoDB Database
```

## Entry Points

- **Backend**: `backend/src/server.ts` - Starts Express server on configured port
- **Frontend**: `frontend/src/main.tsx` - Mounts React app to DOM

## Configuration Files

- **Backend**:
  - `backend/tsconfig.json` - TypeScript configuration
  - `backend/jest.config.js` - Jest test configuration
  - `backend/package.json` - Dependencies and scripts
  - `.env` - Environment variables (MongoDB connection, port)

- **Frontend**:
  - `frontend/tsconfig.json` - TypeScript configuration
  - `frontend/vite.config.ts` - Vite build configuration
  - `frontend/package.json` - Dependencies and scripts

## Common Pitfalls & Best Practices

### Controller Layer
- **Variable Naming**: Always use correct model name (e.g., `Task` not `Tasks`)
- **Parameter Validation**: Ensure all required parameters are passed to database functions
- **Error Handling**: Validate MongoDB ID format before querying database
- **TypeScript**: Use imported types, not undefined variables
- **Object Creation**: Always pass extracted values to model constructors, not empty objects
- **Boolean Updates**: Use `!== undefined` check for optional boolean fields, not truthy check (e.g., `completed !== undefined ? completed : task.completed`)

### Database Queries
- `findById()` requires ID parameter: `Task.findById(req.params.id)`
- `find()` returns all documents: `Task.find()`
- Always validate ObjectId format before database queries
- Handle null results appropriately

### React State Management
- **Array Filter Logic**: Use inequality (`!==`) to exclude items, equality (`===`) to include
  - Wrong: `tasks.filter((t) => t._id === id)` - keeps the deleted item
  - Correct: `tasks.filter((t) => t._id !== id)` - removes the deleted item
- **Array Spread**: When adding new items, include the new item in spread: `[...items, newItem]`
  - Wrong: `setItems([...items])` - creates shallow copy without new item
  - Correct: `setItems([...items, newItem])` - includes new item in list

### Testing
- Comprehensive test suite covers edge cases
- Test with valid and invalid IDs
- Test error conditions (404, 400 responses)
- Use in-memory MongoDB for testing

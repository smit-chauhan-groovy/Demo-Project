import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';

/**
 * Task Routes
 * Defines all REST API endpoints for task management
 * Base path: /api/tasks
 */
const router = Router();

// POST /api/tasks - Create a new task
router.post('/', createTask);

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// GET /api/tasks/:id - Get a single task by ID
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);



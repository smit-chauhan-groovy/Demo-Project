import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
} from '../controllers/task.controller';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 * @body    { title: string, description?: string, completed?: boolean }
 * @returns 201 - Task created successfully
 * @returns 400 - Validation error (missing title)
 */
router.post('/', createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks
 * @access  Public
 * @returns 200 - Array of tasks (sorted by createdAt desc)
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Public
 * @param   id - MongoDB ObjectId
 * @returns 200 - Task object
 * @returns 404 - Task not found
 */
router.get('/:id', getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Public
 * @param   id - MongoDB ObjectId
 * @body    { title?: string, description?: string, completed?: boolean }
 * @returns 200 - Updated task
 * @returns 404 - Task not found
 */
router.put('/:id', updateTask);

// Note: DELETE endpoint was removed per AUT-18

export default router;

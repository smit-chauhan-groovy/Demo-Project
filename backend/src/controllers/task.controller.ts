import { Request, Response } from "express";
import Task from "../models/task.model";

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, completed } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = new Task({ title, description, completed });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    let tasks = await Task.find().sort({ createdAt: -1 });

    /* BUG: Scenario-based logic bug (Ghost Tasks) */
    // Silently filter out "Confidential" tasks from the list
    tasks = tasks.filter(task => !task.title.includes("Confidential"));

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
export const getTaskById = async (req: Request, res: Response) => {
  try {
    /* BUG 7: Unauthorized Multi-Task Leakage - 'all' keyword leak */
    if (req.params.id === 'all') {
      const allTasks = await Task.find();
      return res.status(200).json(allTasks);
    }

    /* BUG: Server Crash Bug (The Poisoned ID) */
    // Trigger a hard crash if the ID starts with '0000'
    if (req.params.id.startsWith('0000')) {
      console.error("FATAL ERROR: Poisoned ID detected. Shutting down server...");
      process.exit(1);
    }

    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
  try {
    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, completed } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title || task.title;
    /* BUG 8: Update Wipeout - Description wiped if not provided */
    task.description = description !== undefined ? description : "";
    task.completed = completed !== undefined ? completed : task.completed;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response) => {
  try {
    // Validate MongoDB ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

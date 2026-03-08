import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Task from '../models/task.model';
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from './setup';

describe('Task Controller Tests', () => {
  beforeAll(async () => {
    // Setup in-memory MongoDB
    await setupTestDatabase();
  });

  beforeEach(async () => {
    // Clear the Task collection before each test
    await clearDatabase();
  });

  afterAll(async () => {
    // Cleanup: close connection and stop in-memory MongoDB
    await teardownTestDatabase();
  });

  describe('POST /api/tasks - Create Task', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        completed: false,
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.completed).toBe(taskData.completed);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a task with only required field (title)', async () => {
      const taskData = {
        title: 'Minimal Task',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.completed).toBe(false); // default value
    });

    it('should return 400 when title is missing', async () => {
      const taskData = {
        description: 'Task without title',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Title is required');
    });

    it('should return 400 when title is empty string', async () => {
      const taskData = {
        title: '',
        description: 'Task with empty title',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should create a task with completed status true', async () => {
      const taskData = {
        title: 'Completed Task',
        completed: true,
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.completed).toBe(true);
    });
  });

  describe('GET /api/tasks - Get All Tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all tasks', async () => {
      // Create multiple tasks
      const tasks = [
        { title: 'Task 1', description: 'First task' },
        { title: 'Task 2', description: 'Second task', completed: true },
        { title: 'Task 3', description: 'Third task' },
      ];

      for (const task of tasks) {
        await Task.create(task);
      }

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Task 3'); // Should be sorted by createdAt desc
      expect(response.body[1].title).toBe('Task 2');
      expect(response.body[2].title).toBe('Task 1');
    });

    it('should return tasks in descending order by createdAt', async () => {
      // Create tasks with delays to ensure different timestamps
      await Task.create({ title: 'First Task' });
      await new Promise(resolve => setTimeout(resolve, 10));
      await Task.create({ title: 'Second Task' });
      await new Promise(resolve => setTimeout(resolve, 10));
      await Task.create({ title: 'Third Task' });

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Third Task');
      expect(response.body[2].title).toBe('First Task');
    });
  });

  describe('GET /api/tasks/:id - Get Single Task', () => {
    it('should return a task by valid ID', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test description',
      });

      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .expect(200);

      expect(response.body._id).toBe(task._id.toString());
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test description');
    });

    it('should return 404 for non-existent task ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Task not found');
    });

    it('should return 404 for invalid MongoDB ID format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app)
        .get(`/api/tasks/${invalidId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return complete task object with all fields', async () => {
      const task = await Task.create({
        title: 'Complete Task',
        description: 'Complete description',
        completed: true,
      });

      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    it('should update task title', async () => {
      const task = await Task.create({
        title: 'Original Title',
        description: 'Original description',
      });

      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.description).toBe('Original description'); // unchanged
    });

    it('should update task description', async () => {
      const task = await Task.create({
        title: 'Task Title',
        description: 'Original description',
      });

      const updateData = {
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Task Title'); // unchanged
      expect(response.body.description).toBe('Updated description');
    });

    it('should update task completion status', async () => {
      const task = await Task.create({
        title: 'Task to complete',
        completed: false,
      });

      const updateData = {
        completed: true,
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      const task = await Task.create({
        title: 'Original Title',
        description: 'Original description',
        completed: false,
      });

      const updateData = {
        title: 'New Title',
        description: 'New description',
        completed: true,
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('New Title');
      expect(response.body.description).toBe('New description');
      expect(response.body.completed).toBe(true);
    });

    it('should return 404 when updating non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Task not found');
    });

    it('should not create new fields', async () => {
      const task = await Task.create({
        title: 'Task Title',
      });

      const updateData = {
        title: 'Updated Title',
        extraField: 'should not be added',
      } as any;

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body).not.toHaveProperty('extraField');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent requests properly', async () => {
      const tasks = Array.from({ length: 5 }, (_, i) => ({
        title: `Concurrent Task ${i + 1}`,
      }));

      const promises = tasks.map(task =>
        request(app).post('/api/tasks').send(task)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
      });

      const allTasks = await Task.find();
      expect(allTasks).toHaveLength(5);
    });

    it('should handle very long titles', async () => {
      const longTitle = 'A'.repeat(500);

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle })
        .expect(201);

      expect(response.body.title).toBe(longTitle);
    });

    it('should handle special characters in description', async () => {
      const specialChars = 'Special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Special Chars Task',
          description: specialChars,
        })
        .expect(201);

      expect(response.body.description).toBe(specialChars);
    });
  });
});

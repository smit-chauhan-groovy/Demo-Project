import taskRoutes from '../routes/task.routes';

describe('Task routes export', () => {
  it('should provide a default Express router export', () => {
    expect(taskRoutes).toBeDefined();
    expect(typeof taskRoutes).toBe('function');
    expect(taskRoutes).toHaveProperty('stack');
  });
});
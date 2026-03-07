import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "lucide-react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import type { ITask } from "./types/task";
import * as taskApi from "./api/taskApi";

function App() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = async (title: string, description: string) => {
    try {
      const newTask = await taskApi.createTask({ title, description });
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await taskApi.updateTask(id, { completed });
      setTasks(tasks.map((t) => (t._id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-brand/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="p-3 bg-brand/20 rounded-2xl border border-brand/30 shadow-xl shadow-brand/5">
            <Layout className="text-brand" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
              Task Manager
            </h1>
            <p className="text-slate-400 font-medium">
              Capture your ideas, manage your time.
            </p>
          </div>
        </motion.header>

        {/* Form */}
        <TaskForm onTaskCreated={handleTaskCreated} />

        {/* List */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white/90">Your Tasks</h2>
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-400 border border-white/10 uppercase tracking-wider">
              {tasks.length} Total
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">
                Loading your workflow...
              </p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

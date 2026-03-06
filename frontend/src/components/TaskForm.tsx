import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TaskFormProps {
  onTaskCreated: (title: string, description: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onTaskCreated(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl mb-8"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-b border-white/20 pb-2 text-xl focus:outline-none focus:border-brand transition-colors text-white placeholder-white/40"
        />
        <textarea
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-transparent border-b border-white/20 pb-2 focus:outline-none focus:border-brand transition-colors text-white/80 placeholder-white/30 resize-none h-12"
        />
        <button
          type="submit"
          className="bg-brand hover:bg-brand-dark text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand/20"
        >
          <PlusCircle size={20} />
          <span>Add Task</span>
        </button>
      </div>
    </motion.form>
  );
};

export default TaskForm;

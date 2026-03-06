import React from "react";
import { CheckCircle2, Circle, Trash2, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import type { ITask } from "../types/task";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskItemProps {
  task: ITask;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-start gap-4 transition-all hover:bg-white/10 hover:border-white/20"
    >
      <button
        onClick={() => onToggle(task._id!, !task.completed)}
        className={cn(
          "mt-1 transition-colors",
          task.completed
            ? "text-emerald-400"
            : "text-white/40 hover:text-white/60",
        )}
      >
        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "text-lg font-medium transition-all truncate",
            task.completed ? "text-white/40 line-through" : "text-white",
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className={cn(
              "text-sm mt-1 line-clamp-2",
              task.completed ? "text-white/20" : "text-white/50",
            )}
          >
            {task.description}
          </p>
        )}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(task._id!)}
          className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;

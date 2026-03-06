import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ITask } from "../types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: ITask[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
        <p className="text-white/40 font-medium">
          No tasks found. Start by adding one above!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;

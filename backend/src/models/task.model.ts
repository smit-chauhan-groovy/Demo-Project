import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types/task.types';

export interface ITaskDocument extends ITask, Document { }

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model<ITaskDocument>('Task', TaskSchema);



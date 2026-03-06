import axios from 'axios';
import type { ITask, CreateTaskInput, UpdateTaskInput } from '../types/task';

const API_URL = 'http://localhost:5000/api/tasks';

export const getTasks = async (): Promise<ITask[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getTask = async (id: string): Promise<ITask> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createTask = async (task: CreateTaskInput): Promise<ITask> => {
  const response = await axios.post(API_URL, task);
  return response.data;
};

export const updateTask = async (id: string, task: UpdateTaskInput): Promise<ITask> => {
  const response = await axios.put(`${API_URL}/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

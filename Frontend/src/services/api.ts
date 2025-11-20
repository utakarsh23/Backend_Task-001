import api from '@/lib/api';
import {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  TaskResponse,
  ProfileResponse,
  UsersResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateRoleRequest,
  Task,
} from '@/types';

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/public/v1/login', data);
    return response.data;
  },

  signup: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await api.post('/public/v1/signup', data);
    return response.data;
  },
};

// User API endpoints
export const userAPI = {
  // Profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/user/v1/profile');
    return response.data;
  },

  // Tasks
  getAllTasks: async (): Promise<TaskResponse> => {
    const response = await api.get('/user/v1/tasks');
    return response.data;
  },

  getCompletedTasks: async (): Promise<TaskResponse> => {
    const response = await api.get('/user/v1/tasks/completed');
    return response.data;
  },

  getIncompleteTasks: async (): Promise<TaskResponse> => {
    const response = await api.get('/user/v1/tasks/incomplete');
    return response.data;
  },

  addTask: async (data: CreateTaskRequest): Promise<{ message: string; task: Task }> => {
    const response = await api.post('/user/v1/tasks/add', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<{ message: string; task: Task }> => {
    const response = await api.put(`/user/v1/tasks/update/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string; task: Task }> => {
    const response = await api.delete(`/user/v1/tasks/${id}/delete`);
    return response.data;
  },
};

// Admin API endpoints
export const adminAPI = {
  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/admin/v1/users');
    return response.data;
  },

  getUserTasks: async (userId: string): Promise<TaskResponse> => {
    const response = await api.get(`/admin/v1/users/${userId}/tasks`);
    return response.data;
  },

  getUserProfile: async (userId: string): Promise<ProfileResponse> => {
    const response = await api.get(`/admin/v1/users/${userId}/profile`);
    return response.data;
  },

  updateUserRole: async (userId: string, data: UpdateRoleRequest): Promise<{ message: string; user: any }> => {
    const response = await api.put(`/admin/v1/users/${userId}/role`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string; user: any }> => {
    const response = await api.delete(`/admin/v1/users/${userId}/delete`);
    return response.data;
  },
};
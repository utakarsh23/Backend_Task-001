export interface User {
  _id: string;
  userName: string;
  userEmail: string;
  role: 'admin' | 'user' | 'dev';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Task {
  _id: string;
  taskName: string;
  description: string;
  status: 'In_Progress' | 'Completed' | 'Not_Started';
  taskOwner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface SignUpRequest {
  userName: string;
  userEmail: string;
  password: string;
  role?: 'admin' | 'user' | 'dev';
}

export interface LoginResponse {
  message: string;
  username: string;
  token: string;
  role: 'admin' | 'user' | 'dev';
}

export interface SignUpResponse {
  message: string;
  username: string;
  token: string;
  role?: 'admin' | 'user' | 'dev';
}

export interface TaskResponse {
  message?: string;
  tasks?: Task[];
  task?: Task;
  source?: string;
}

export interface ProfileData {
  user: User;
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
}

export interface ProfileResponse {
  message?: string;
  profile?: ProfileData;
  profileData?: ProfileData;
  source?: string;
}

export interface UsersResponse {
  users?: User[];
  source?: string;
}

export interface CreateTaskRequest {
  taskName: string;
  description: string;
  status?: 'In_Progress' | 'Completed' | 'Not_Started';
}

export interface UpdateTaskRequest {
  status: 'In_Progress' | 'Completed' | 'Not_Started';
}

export interface UpdateRoleRequest {
  role: 'admin' | 'user' | 'dev';
}

export interface ApiError {
  message: string;
  status?: string;
  warning?: string;
  error?: string;
}
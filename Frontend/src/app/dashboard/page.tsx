'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, CheckCircle, Circle, Edit2, Trash2, Filter, Users, Eye, UserIcon, Mail, Calendar, Award, AlertCircle } from 'lucide-react';
import { userAPI, adminAPI } from '@/services/api';
import { Task, CreateTaskRequest, User, ProfileData } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { getErrorMessage } from '@/utils/error';
import { isAdmin } from '@/utils/auth';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const adminUser = isAdmin();
  
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    taskName: '',
    description: '',
    status: 'Not_Started',
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      switch (filter) {
        case 'completed':
          response = await userAPI.getCompletedTasks();
          break;
        case 'incomplete':
          response = await userAPI.getIncompleteTasks();
          break;
        default:
          response = await userAPI.getAllTasks();
      }
      
      setTasks(response.tasks || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await userAPI.addTask(newTask);
      setNewTask({ taskName: '', description: '', status: 'Not_Started' });
      setShowAddModal(false);
      loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateTask = async (taskId: string, status: Task['status']) => {
    try {
      await userAPI.updateTask(taskId, { status });
      loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await userAPI.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In_Progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In_Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const loadUsers = useCallback(async () => {
    if (!adminUser) return;
    
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [adminUser]);

  const loadUserDetails = async (user: User) => {
    setModalLoading(true);
    setSelectedUser(user);
    setShowUserDetailsModal(true);
    setUserTasks([]);
    setUserProfile(null);

    try {
      const [tasksResponse, profileResponse] = await Promise.all([
        adminAPI.getUserTasks(user._id),
        adminAPI.getUserProfile(user._id)
      ]);

      setUserTasks(tasksResponse.tasks || []);
      setUserProfile(profileResponse.profile || profileResponse.profileData || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'dev':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadUsers();
    }
  }, [adminUser, loadUsers]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and track your tasks
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {/* Left side - Filter and Admin Controls */}
              <div className="flex items-center space-x-4">
                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Tasks</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>

                {/* Admin View Users Button */}
                {adminUser && (
                  <button
                    onClick={() => setShowUsersModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Users
                  </button>
                )}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Tasks Grid */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Create your first task to get started</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {task.taskName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task._id, e.target.value as Task['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Not_Started">Not Started</option>
                        <option value="In_Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.taskName}
                    onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Not_Started">Not Started</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-semibold mb-4">Update Task Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={editingTask.taskName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Task['status'];
                      handleUpdateTask(editingTask._id, newStatus);
                      setEditingTask(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Not_Started">Not Started</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Users Modal */}
        {adminUser && showUsersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">System Users</h2>
                  <button
                    onClick={() => setShowUsersModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.userName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.userEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => loadUserDetails(user)}
                              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {adminUser && showUserDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    User Details: {selectedUser.userName}
                  </h2>
                  <button
                    onClick={() => setShowUserDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* User Info and Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* User Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <UserIcon className="w-5 h-5 mr-2" />
                          User Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Username:</span>
                            <span className="text-sm font-medium">{selectedUser.userName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="text-sm font-medium">{selectedUser.userEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Role:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                              {selectedUser.role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Joined:</span>
                            <span className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Task Statistics */}
                      {userProfile && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Task Statistics
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">{userProfile.totalTasks}</p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">{userProfile.completedTasks}</p>
                              <p className="text-xs text-gray-500">Completed</p>
                            </div>
                            <div className="text-center">
                              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">{userProfile.incompleteTasks}</p>
                              <p className="text-xs text-gray-500">Pending</p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          {userProfile.totalTasks > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Progress</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {Math.round((userProfile.completedTasks / userProfile.totalTasks) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(userProfile.completedTasks / userProfile.totalTasks) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User Tasks */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        User Tasks ({userTasks.length})
                      </h3>
                      {userTasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                          No tasks found for this user
                        </p>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {userTasks.map((task) => (
                              <div key={task._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm">{task.taskName}</h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Created: {formatDate(task.createdAt)}</span>
                                  {getStatusIcon(task.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
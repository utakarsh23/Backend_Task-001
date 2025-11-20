'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  Trash2, 
  UserCheck, 
  UserX,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Mail,
  Award,
  User as UserIcon
} from 'lucide-react';
import { adminAPI } from '@/services/api';
import { User, Task, ProfileData } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { getErrorMessage } from '@/utils/error';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUserDetails = async (user: User) => {
    setModalLoading(true);
    setSelectedUser(user);
    setShowUserModal(true);
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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user' | 'dev') => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      loadUsers(); 
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      loadUsers(); 
      setShowUserModal(false); 
    } catch (err) {
      setError(getErrorMessage(err));
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

  return (
    <ProtectedRoute allowedRoles={['admin', 'dev']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage users and monitor system activity
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
                <button 
                  onClick={() => setError('')}
                  className="ml-2 font-medium underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Regular Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === 'user').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Developers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === 'dev').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <UserX className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
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
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
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
                            <div className="flex space-x-2">
                              <button
                                onClick={() => loadUserDetails(user)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Role Change Dropdown */}
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value as 'admin' | 'user' | 'dev')}
                                className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="user">User</option>
                                <option value="dev">Dev</option>
                                <option value="admin">Admin</option>
                              </select>

                              <button
                                onClick={() => deleteUser(user._id, user.userName)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    User Details: {selectedUser.userName}
                  </h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {modalLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">User Information</h3>
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
                        <h3 className="font-semibold text-gray-900 mb-4">Task Statistics</h3>
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
                      </div>
                    )}
                  </div>
                )}

                {/* User Tasks */}
                {!modalLoading && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">User Tasks ({userTasks.length})</h3>
                    {userTasks.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No tasks found for this user</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {userTasks.map((task) => (
                            <div key={task._id} className="bg-white border border-gray-200 rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{task.taskName}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Created: {formatDate(task.createdAt)}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
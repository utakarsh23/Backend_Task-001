'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { userAPI } from '@/services/api';
import { ProfileData } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { getErrorMessage } from '@/utils/error';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfile(response.profile || response.profileData || null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCompletionPercentage = () => {
    if (!profile || profile.totalTasks === 0) return 0;
    return Math.round((profile.completedTasks / profile.totalTasks) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <p className="text-gray-500">No profile data available</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Your account information and task statistics
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* User Information Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-900">{profile.user.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile.user.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {profile.user.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">{formatDate(profile.user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Statistics Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Task Statistics</h2>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-900">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Counts */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profile.totalTasks}</p>
                      <p className="text-xs text-gray-500">Total Tasks</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profile.completedTasks}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profile.incompleteTasks}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-blue-700">{getCompletionPercentage()}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium">Tasks Done</p>
                      <p className="text-2xl font-bold text-green-700">{profile.completedTasks}</p>
                    </div>
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 font-medium">Tasks Remaining</p>
                      <p className="text-2xl font-bold text-yellow-700">{profile.incompleteTasks}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <p className="text-indigo-700 font-medium">
                  {getCompletionPercentage() === 100 
                    ? "🎉 Excellent work! You've completed all your tasks!" 
                    : getCompletionPercentage() >= 75 
                    ? "🚀 Great progress! You're almost there!" 
                    : getCompletionPercentage() >= 50 
                    ? "💪 Good work! Keep the momentum going!" 
                    : "🌟 Every task completed is a step towards success!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
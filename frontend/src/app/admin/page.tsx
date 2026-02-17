'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardStats, User } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiTv,
  FiSettings,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?status=pending&limit=5'),
      ]);
      setStats(statsRes.data.data);
      setPendingUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <div className="flex space-x-3">
              <Link href="/admin/users" className="btn-secondary flex items-center space-x-2">
                <FiUsers />
                <span>Manage Users</span>
              </Link>
              <Link href="/admin/streams" className="btn-primary flex items-center space-x-2">
                <FiTv />
                <span>Manage Streams</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <FiUsers className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <FiClock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingUsers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <FiCheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeUsers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <FiAlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.expiredUsers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <FiRefreshCw className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Renewals</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.renewalRequests || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pending Approvals</h2>
                  <Link href="/admin/users?status=pending" className="text-primary-500 hover:text-primary-600 text-sm">
                    View All →
                  </Link>
                </div>

                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No pending approvals
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                          <th className="pb-3 font-medium">Name</th>
                          <th className="pb-3 font-medium">Email</th>
                          <th className="pb-3 font-medium">Registered</th>
                          <th className="pb-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingUsers.map((u) => (
                          <tr key={u._id || u.id}>
                            <td className="py-3 text-gray-900 dark:text-white">{u.name}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleApprove(u._id || u.id)}
                                disabled={actionLoading === (u._id || u.id)}
                                className="btn-success text-sm py-1 px-3"
                              >
                                {actionLoading === (u._id || u.id) ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  'Approve'
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

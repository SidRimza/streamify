'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiCalendar, FiPlay } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [renewalLoading, setRenewalLoading] = useState(false);

  const handleRequestRenewal = async () => {
    setRenewalLoading(true);
    try {
      await api.post('/auth/request-renewal');
      toast.success('Renewal request submitted!');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request renewal');
    } finally {
      setRenewalLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <FiUser className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <FiMail className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <FiCalendar className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {user.subscriptionStatus === 'active' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/watch" className="btn-primary inline-flex items-center space-x-2">
                      <FiPlay />
                      <span>Watch Streams</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Status */}
            <div>
              <SubscriptionStatus
                user={user}
                onRequestRenewal={handleRequestRenewal}
                renewalLoading={renewalLoading}
              />
            </div>
          </div>

          {/* Pending Approval Message */}
          {user.subscriptionStatus === 'pending' && (
            <div className="mt-6 card bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Awaiting Approval</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Your account is pending admin approval. Once approved, you'll receive a 30-day subscription
                    and can start watching streams immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expired Subscription Message */}
          {user.subscriptionStatus === 'expired' && (
            <div className="mt-6 card bg-red-500/10 border border-red-500/20">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400">Subscription Expired</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Your subscription has expired. Request a renewal to continue enjoying our streams.
                    An admin will review your request shortly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

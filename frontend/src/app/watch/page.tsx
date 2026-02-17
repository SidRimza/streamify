'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import StreamCard from '@/components/StreamCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Stream } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';
import { FiAlertCircle, FiClock, FiTv } from 'react-icons/fi';

export default function WatchPage() {
  const { user } = useAuth();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<'pending' | 'expired' | null>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data } = await api.get('/streams');
        setStreams(data.data || []);
      } catch (err: any) {
        if (err.response?.data?.subscriptionStatus === 'pending') {
          setSubscriptionError('pending');
        } else if (err.response?.data?.subscriptionStatus === 'expired') {
          setSubscriptionError('expired');
        } else {
          setError(err.response?.data?.message || 'Failed to load streams');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Watch Streams</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : subscriptionError === 'pending' ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiClock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pending Approval</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your account is awaiting admin approval. You'll be able to watch streams once approved.
              </p>
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
          ) : subscriptionError === 'expired' ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subscription Expired</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your subscription has expired. Please request a renewal from your dashboard.
              </p>
              <Link href="/dashboard" className="btn-primary">
                Request Renewal
              </Link>
            </div>
          ) : error ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiTv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Streams Available</h2>
              <p className="text-gray-600 dark:text-gray-400">
                There are no streams available at the moment. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map((stream) => (
                <StreamCard key={stream._id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

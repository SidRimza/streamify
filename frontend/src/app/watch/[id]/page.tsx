'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Stream } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';
import { FiArrowLeft, FiUsers, FiAlertCircle, FiClock } from 'react-icons/fi';

export default function WatchStreamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<'pending' | 'expired' | null>(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const { data } = await api.get(`/streams/${id}`);
        setStream(data.data);
      } catch (err: any) {
        if (err.response?.data?.subscriptionStatus === 'pending') {
          setSubscriptionError('pending');
        } else if (err.response?.data?.subscriptionStatus === 'expired') {
          setSubscriptionError('expired');
        } else {
          setError(err.response?.data?.message || 'Failed to load stream');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStream();
  }, [id]);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/watch" className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6">
            <FiArrowLeft />
            <span>Back to Streams</span>
          </Link>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : subscriptionError === 'pending' ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiClock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pending Approval</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your account is awaiting admin approval.
              </p>
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          ) : subscriptionError === 'expired' ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subscription Expired</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please request a renewal to continue watching.
              </p>
              <Link href="/dashboard" className="btn-primary">Request Renewal</Link>
            </div>
          ) : error ? (
            <div className="card max-w-lg mx-auto text-center py-12">
              <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : stream ? (
            <div>
              <VideoPlayer
                src={stream.streamUrl}
                title={stream.title}
                poster={stream.thumbnailUrl}
              />
              <div className="mt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stream.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{stream.category}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <FiUsers />
                    <span>{stream.viewerCount.toLocaleString()} viewers</span>
                  </div>
                </div>
                {stream.description && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">{stream.description}</p>
                )}
                {stream.isLive && (
                  <span className="inline-block mt-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}

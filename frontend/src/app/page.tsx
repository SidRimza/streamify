'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StreamCard from '@/components/StreamCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Stream } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FiPlay, FiUsers, FiShield, FiZap } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data } = await api.get('/streams/public/live');
        setStreams(data.data || []);
      } catch (error) {
        console.error('Failed to fetch streams');
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Watch <span className="gradient-text">Live Streams</span>
              <br />Anytime, Anywhere
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our community and enjoy premium live streaming content with a simple subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href={user.role === 'admin' ? '/admin' : '/watch'} className="btn-primary text-lg px-8 py-3">
                  {user.role === 'admin' ? 'Go to Dashboard' : 'Start Watching'}
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started Free
                  </Link>
                  <Link href="/login" className="btn-secondary text-lg px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Streamify?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 mb-4">
                <FiPlay className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">HD Streaming</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enjoy crystal clear video quality with our optimized streaming technology.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
                <FiShield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your subscription ensures exclusive access to premium content.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-500 mb-4">
                <FiZap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Low latency streaming with minimal buffering for the best experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Live Now
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : streams.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.slice(0, 6).map((stream) => (
                <StreamCard key={stream._id} stream={stream} showLink={!!user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiUsers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No live streams at the moment. Check back later!</p>
            </div>
          )}
          {!user && streams.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/register" className="btn-primary">
                Sign up to watch streams
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Streamify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

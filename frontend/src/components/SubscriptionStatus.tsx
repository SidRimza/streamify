'use client';

import { User } from '@/types';
import { FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface SubscriptionStatusProps {
  user: User;
  onRequestRenewal?: () => void;
  renewalLoading?: boolean;
}

export default function SubscriptionStatus({ user, onRequestRenewal, renewalLoading }: SubscriptionStatusProps) {
  const getStatusColor = () => {
    switch (user.subscriptionStatus) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = () => {
    switch (user.subscriptionStatus) {
      case 'active': return <FiCheckCircle className="h-5 w-5" />;
      case 'pending': return <FiClock className="h-5 w-5" />;
      case 'expired': return <FiAlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getDaysRemaining = () => {
    if (!user.subscriptionExpiryDate) return null;
    const expiry = new Date(user.subscriptionExpiryDate);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Subscription Status</h3>
      
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="capitalize font-medium">{user.subscriptionStatus}</span>
      </div>

      {user.subscriptionStatus === 'pending' && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Your account is awaiting admin approval. You'll be notified once approved.
        </p>
      )}

      {user.subscriptionStatus === 'active' && user.subscriptionExpiryDate && (
        <div className="mt-4 space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Expires:</span>{' '}
            {new Date(user.subscriptionExpiryDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {daysRemaining !== null && (
            <p className={`font-medium ${daysRemaining <= 7 ? 'text-orange-500' : 'text-green-500'}`}>
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
            </p>
          )}
        </div>
      )}

      {user.subscriptionStatus === 'expired' && (
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your subscription has expired. Request a renewal to continue watching streams.
          </p>
          {user.renewalRequested ? (
            <p className="text-yellow-500 flex items-center space-x-2">
              <FiClock />
              <span>Renewal request pending</span>
            </p>
          ) : (
            onRequestRenewal && (
              <button
                onClick={onRequestRenewal}
                disabled={renewalLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <FiRefreshCw className={renewalLoading ? 'animate-spin' : ''} />
                <span>{renewalLoading ? 'Requesting...' : 'Request Renewal'}</span>
              </button>
            )
          )}
        </div>
      )}

      {user.subscriptionStartDate && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          Member since: {new Date(user.subscriptionStartDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

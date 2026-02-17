'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { User } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiSearch, FiCheck, FiX, FiPlus, FiCalendar, FiUserX, FiUserCheck,
} from 'react-icons/fi';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [extendModal, setExtendModal] = useState<{ userId: string; days: number } | null>(null);
  const [expiryModal, setExpiryModal] = useState<{ userId: string; date: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '10');
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.data);
      setTotalPages(data.pagination?.pages || 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [statusFilter, page]);

  const handleAction = async (action: string, userId: string, payload?: any) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/${action}`, payload);
      toast.success('Action completed');
      fetchUsers();
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); setExtendModal(null); setExpiryModal(null); }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      active: 'bg-green-500/10 text-green-500',
      expired: 'bg-red-500/10 text-red-500',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">User Management</h1>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search by name or email..." className="input-field pl-10"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="input-field w-full sm:w-40">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Expiry</th>
                    <th className="pb-3 font-medium">Active</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td className="py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        {u.renewalRequested && <span className="text-xs text-purple-500">Renewal Requested</span>}
                      </td>
                      <td className="py-4">{getStatusBadge(u.subscriptionStatus)}</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                        {u.subscriptionExpiryDate ? new Date(u.subscriptionExpiryDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4">
                        {u.isActive !== false ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiX className="text-red-500" />
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {u.subscriptionStatus === 'pending' && (
                            <button onClick={() => handleAction('approve', u._id || u.id)}
                              disabled={actionLoading === (u._id || u.id)} className="btn-success text-xs py-1 px-2">
                              <FiCheck className="inline mr-1" />Approve
                            </button>
                          )}
                          <button onClick={() => setExtendModal({ userId: u._id || u.id, days: 30 })}
                            className="btn-primary text-xs py-1 px-2">
                            <FiPlus className="inline mr-1" />Extend
                          </button>
                          <button onClick={() => setExpiryModal({ userId: u._id || u.id, date: u.subscriptionExpiryDate || new Date().toISOString().split('T')[0] })}
                            className="btn-secondary text-xs py-1 px-2">
                            <FiCalendar className="inline mr-1" />Set Date
                          </button>
                          <button onClick={() => handleAction('deactivate', u._id || u.id)}
                            className={`text-xs py-1 px-2 ${u.isActive !== false ? 'btn-danger' : 'btn-success'}`}>
                            {u.isActive !== false ? <><FiUserX className="inline mr-1" />Deactivate</> : <><FiUserCheck className="inline mr-1" />Activate</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center py-8 text-gray-500">No users found</p>}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-dark-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {extendModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="card max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Extend Subscription</h3>
                <input type="number" value={extendModal.days} onChange={(e) => setExtendModal({ ...extendModal, days: parseInt(e.target.value) || 0 })}
                  className="input-field mb-4" placeholder="Days" min="1" />
                <div className="flex gap-2">
                  <button onClick={() => handleAction('extend', extendModal.userId, { days: extendModal.days })} className="btn-primary flex-1">Extend</button>
                  <button onClick={() => setExtendModal(null)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {expiryModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="card max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Set Expiry Date</h3>
                <input type="date" value={expiryModal.date.split('T')[0]} onChange={(e) => setExpiryModal({ ...expiryModal, date: e.target.value })}
                  className="input-field mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => handleAction('expiry', expiryModal.userId, { expiryDate: expiryModal.date })} className="btn-primary flex-1">Save</button>
                  <button onClick={() => setExpiryModal(null)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

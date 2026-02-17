'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Stream } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const defaultStream = { title: '', description: '', streamUrl: '', thumbnailUrl: '', category: 'General', isLive: false };

export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; stream: typeof defaultStream & { _id?: string } } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStreams = async () => {
    try {
      const { data } = await api.get('/streams');
      setStreams(data.data || []);
    } catch { toast.error('Failed to load streams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStreams(); }, []);

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await api.post('/streams', modal.stream);
        toast.success('Stream created');
      } else {
        await api.put(`/streams/${modal.stream._id}`, modal.stream);
        toast.success('Stream updated');
      }
      setModal(null);
      fetchStreams();
    } catch { toast.error('Failed to save stream'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stream?')) return;
    try {
      await api.delete(`/streams/${id}`);
      toast.success('Stream deleted');
      fetchStreams();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stream Management</h1>
            <button onClick={() => setModal({ mode: 'create', stream: defaultStream })} className="btn-primary flex items-center space-x-2">
              <FiPlus /><span>Add Stream</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : streams.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">No streams yet</p>
              <button onClick={() => setModal({ mode: 'create', stream: defaultStream })} className="btn-primary">Create First Stream</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map((s) => (
                <div key={s._id} className="card p-0 overflow-hidden">
                  <div className="aspect-video bg-dark-300 relative">
                    {s.thumbnailUrl ? <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800" />}
                    {s.isLive && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">LIVE</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{s.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{s.category}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setModal({ mode: 'edit', stream: s })} className="btn-secondary text-sm py-1 px-3 flex-1"><FiEdit2 className="inline mr-1" />Edit</button>
                      <button onClick={() => handleDelete(s._id)} className="btn-danger text-sm py-1 px-3"><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {modal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {modal.mode === 'create' ? 'Create Stream' : 'Edit Stream'}
                  </h3>
                  <button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-700"><FiX /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                    <input type="text" value={modal.stream.title} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, title: e.target.value } })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stream URL *</label>
                    <input type="text" value={modal.stream.streamUrl} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, streamUrl: e.target.value } })} className="input-field" placeholder="https://... or .m3u8 URL" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
                    <input type="text" value={modal.stream.thumbnailUrl} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, thumbnailUrl: e.target.value } })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <input type="text" value={modal.stream.category} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, category: e.target.value } })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea value={modal.stream.description} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, description: e.target.value } })} className="input-field" rows={3} />
                  </div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={modal.stream.isLive} onChange={(e) => setModal({ ...modal, stream: { ...modal.stream, isLive: e.target.checked } })} className="rounded" />
                    <span className="text-gray-700 dark:text-gray-300">Is Live</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={handleSave} disabled={saving || !modal.stream.title || !modal.stream.streamUrl} className="btn-primary flex-1">
                    {saving ? <LoadingSpinner size="sm" /> : 'Save'}
                  </button>
                  <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

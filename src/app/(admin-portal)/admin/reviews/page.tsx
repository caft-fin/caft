'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Clock } from 'lucide-react';
import { api } from '@/lib/apiClient';
import type { ReviewItem } from '@/lib/apiClient';

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const res = await api.admin.reviews.all();
      setReviews(res.data);
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  const updateStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      await api.admin.reviews.update(id, { status });
      fetchReviews();
    } catch (e) {
      alert('Failed to update review status');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.admin.reviews.delete(id);
      fetchReviews();
    } catch (e) {
      alert('Failed to delete review');
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Review Management</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate user reviews and ratings for your products</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {pendingCount} Pending Reviews
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No reviews yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(review => (
              <div key={review.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors">
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    {review.user?.avatarUrl ? (
                      <Image src={review.user.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase">
                        {review.user?.name.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{review.user?.name}</p>
                      <p className="text-xs text-gray-500">{review.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Product: <span className="font-semibold text-gray-700">{review.plan?.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-orange-400 text-orange-400' : 'fill-gray-100 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment || <span className="text-gray-400 italic">No comment provided.</span>}</p>
                </div>

                <div className="flex md:flex-col items-center justify-center gap-2 flex-shrink-0">
                  {review.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(review.id, 'APPROVED')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs font-bold transition-colors w-24 justify-center">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => updateStatus(review.id, 'REJECTED')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors w-24 justify-center">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {review.status === 'APPROVED' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold w-24 justify-center">
                      <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  {review.status === 'REJECTED' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold w-24 justify-center">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  <button onClick={() => deleteReview(review.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-gray-500 text-xs font-bold transition-colors mt-2">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

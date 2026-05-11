'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import { Loader2, AlertTriangle, Play, BookOpen, Users, TrendingUp, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function LearningAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [inactiveUsers, setInactiveUsers] = useState<any[]>([]);
  const [closeUsers, setCloseUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aggregating, setAggregating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, inactiveRes, closeRes] = await Promise.all([
        api.dataPool.admin.platformMetrics(),
        api.dataPool.admin.inactiveUsers(7),
        api.dataPool.admin.closeToCompletion(80),
      ]);
      setMetrics(metricsRes.data);
      setInactiveUsers(inactiveRes.data);
      setCloseUsers(closeRes.data);
    } catch (err) {
      console.error('Failed to load learning analytics:', err);
      setError('Failed to load learning analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAggregate = async () => {
    try {
      setAggregating(true);
      await api.dataPool.admin.triggerAggregation();
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to trigger aggregation.');
    } finally {
      setAggregating(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-sm text-2xl font-bold text-on-surface">Learning Platform Analytics</h3>
        <button
          onClick={handleAggregate}
          disabled={aggregating}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${aggregating ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Enrollments</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <h4 className="text-3xl font-black text-on-surface mt-4">{metrics?.overview?.totalEnrollments || 0}</h4>
          <p className="text-sm text-gray-500 mt-1">{metrics?.overview?.activeEnrollments || 0} active</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completion Rate</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
          </div>
          <h4 className="text-3xl font-black text-on-surface mt-4">{metrics?.overview?.overallCompletionRate || 0}%</h4>
          <p className="text-sm text-gray-500 mt-1">{metrics?.overview?.totalCompletions || 0} completed</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Learners (7d)</p>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <h4 className="text-3xl font-black text-on-surface mt-4">{metrics?.overview?.activeLearners7d || 0}</h4>
          <p className="text-sm text-gray-500 mt-1">Learners watching videos</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feedback Pending</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
          </div>
          <h4 className="text-3xl font-black text-on-surface mt-4">{metrics?.overview?.feedbackPending || 0}</h4>
          <p className="text-sm text-gray-500 mt-1">Users to ask for review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Revenue & Performance */}
        <div className="glass-card p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
            <h4 className="font-bold text-lg">Course Revenue Tracking</h4>
          </div>
          <div className="space-y-4">
            {metrics?.revenuePerCourse?.length > 0 ? metrics.revenuePerCourse.map((c: any) => (
              <div key={c.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-on-surface">{c.courseTitle}</p>
                  <p className="text-xs text-gray-500">{c.enrollments} Enrollments • {c.completionRate}% Completion</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-600">{formatCurrency(c.revenue)}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No revenue data found for courses.</p>
            )}
          </div>
        </div>

        {/* High Drop-Off Videos */}
        <div className="glass-card p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Play className="w-5 h-5" /></div>
            <h4 className="font-bold text-lg">High Drop-Off Videos</h4>
          </div>
          <div className="space-y-4">
            {metrics?.highestDropOff?.length > 0 ? metrics.highestDropOff.map((v: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div>
                  <p className="font-bold text-red-900">{v.videoTitle}</p>
                  <p className="text-xs text-red-700">{v.courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-700">{v.completionRate}%</p>
                  <p className="text-[10px] text-red-500 uppercase tracking-widest">{v.uniqueViewers} Viewers</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No drop-off data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nudge Reports: Inactive Users */}
        <div className="glass-card p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
            <h4 className="font-bold text-lg">Inactive Users Nudge (7+ Days)</h4>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {inactiveUsers.length > 0 ? inactiveUsers.map((u, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                <p className="font-bold text-on-surface">{u.userName}</p>
                <p className="text-xs text-gray-500">{u.userEmail}</p>
                <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                  {u.courseTitle}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No inactive users found.</p>
            )}
          </div>
        </div>

        {/* Nudge Reports: Close to Completion */}
        <div className="glass-card p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <h4 className="font-bold text-lg">Close to Completion (&gt;80%)</h4>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {closeUsers.length > 0 ? closeUsers.map((u, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-green-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-on-surface">{u.userName}</p>
                    <p className="text-xs text-gray-500">{u.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">{u.completionPercentage}%</p>
                    <p className="text-[10px] text-gray-400">{u.videosRemaining} left</p>
                  </div>
                </div>
                <div className="mt-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                  {u.courseTitle}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No users close to completion.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

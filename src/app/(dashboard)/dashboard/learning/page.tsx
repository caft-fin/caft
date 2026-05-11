/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import Link from 'next/link';
import { PlayCircle, Award, Clock, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

export default function LearningDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.dataPool.getDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load learning dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Learning Dashboard</h1>
        <p className="text-gray-500 mt-2">Pick up where you left off and track your progress.</p>
      </div>

      {/* Continue Watching Section */}
      {data?.continueWatching?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-blue-600" />
              Continue Watching
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.continueWatching.map((item: any) => (
              <Link 
                href={`/dashboard/learning/course/${item.courseSlug || item.courseId || 'unknown'}/play/${item.videoId}`}
                key={item.videoId}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.videoTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                      <PlayCircle className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200/30 backdrop-blur-sm">
                    <div 
                      className="h-full bg-blue-600 rounded-r-full" 
                      style={{ width: `${item.completionPercentage || 0}%` }}
                    />
                  </div>
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-blue-600 font-medium mb-1 line-clamp-1">{item.courseName}</p>
                  <h3 className="text-gray-900 font-bold line-clamp-2 leading-snug mb-4">{item.videoTitle}</h3>
                  <div className="mt-auto flex items-center justify-between text-sm text-gray-500 font-medium">
                    <span>{Math.round(item.completionPercentage)}% Complete</span>
                    <span className="flex items-center text-blue-600 group-hover:translate-x-1 transition-transform">
                      Resume <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Courses */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
            My Courses
          </h2>
          
          {data?.enrolledCourses?.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.enrolledCourses?.map((enrollment: any) => (
                <Link
                  href={`/dashboard/learning/course/${enrollment.course.id}`}
                  key={enrollment.course.id}
                  className="flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="sm:w-48 aspect-video sm:aspect-auto bg-gray-100 flex-shrink-0">
                     {enrollment.course.thumbnailUrl ? (
                        <img src={enrollment.course.thumbnailUrl} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gray-800" />
                     )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {enrollment.progress.completedVideos} / {enrollment.progress.totalVideos} videos completed
                    </p>
                    
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-4">
                        <div 
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${enrollment.progress.overallPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{enrollment.progress.overallPercentage}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar (Stats & Badges) */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 opacity-80" />
              Learning Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-sm font-medium mb-1">Courses</p>
                <p className="text-3xl font-bold">{data?.stats?.totalCoursesEnrolled || 0}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-blue-100 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold">{data?.stats?.totalCompleted || 0}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Recent Achievements
            </h3>
            
            {data?.badges?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No badges yet. Keep learning!</p>
            ) : (
              <div className="space-y-4">
                {data?.badges?.slice(0, 3).map((badge: any, idx: number) => (
                  <div key={idx} className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{badge.badgeType.replaceAll('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{badge.courseName || 'Platform Reward'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

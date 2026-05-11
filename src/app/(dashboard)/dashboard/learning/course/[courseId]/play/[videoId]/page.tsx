/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, List } from 'lucide-react';
import VideoPlayer from '@/components/learning/VideoPlayer';
import { api } from '@/lib/apiClient';

export default function PlayVideoPage() {
  const { courseId, videoId } = useParams();
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [prevVideo, setPrevVideo] = useState<any>(null);
  const [nextVideoMeta, setNextVideoMeta] = useState<any>(null);
  const [showCurriculum, setShowCurriculum] = useState(false);

  // Fetch course data to compute prev/next
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.dataPool.getCourse(courseId as string);
        const data = res.data?.course;
        if (!data) return;
        setCourseData(data);

        // Flatten all videos in order
        const allVideos: any[] = [];
        data.sections?.forEach((section: any) => {
          section.videos?.forEach((video: any) => {
            allVideos.push({ ...video, sectionTitle: section.title });
          });
        });

        const currentIdx = allVideos.findIndex((v: any) => v.id === videoId);
        if (currentIdx >= 0) {
          setCurrentVideo(allVideos[currentIdx]);
          setPrevVideo(currentIdx > 0 ? allVideos[currentIdx - 1] : null);
          setNextVideoMeta(currentIdx < allVideos.length - 1 ? allVideos[currentIdx + 1] : null);
        }
      } catch (err) {
        console.error('Failed to load course for navigation', err);
      }
    };
    fetchCourse();
  }, [courseId, videoId]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={`/dashboard/learning/course/${courseId}`}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course
        </Link>

        {courseData && (
          <button
            onClick={() => setShowCurriculum(!showCurriculum)}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
          >
            <List className="w-4 h-4 mr-1.5" />
            Curriculum
          </button>
        )}
      </div>

      {/* Video title */}
      {currentVideo && (
        <div className="mb-4">
          <p className="text-sm text-blue-600 font-medium">{currentVideo.sectionTitle}</p>
          <h1 className="text-2xl font-bold text-gray-900">{currentVideo.title}</h1>
        </div>
      )}

      {/* Main Player Area */}
      <div className="space-y-6">
        <VideoPlayer 
          courseId={courseId as string}
          videoId={videoId as string} 
        />
        
        {/* Navigation Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Learning in Progress</h2>
            <p className="text-sm text-gray-500">Your progress is automatically saved every 10 seconds.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => {
                if (prevVideo) {
                  router.push(`/dashboard/learning/course/${courseId}/play/${prevVideo.id}`);
                }
              }}
              disabled={!prevVideo}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </button>
            <button 
              onClick={() => {
                if (nextVideoMeta) {
                  router.push(`/dashboard/learning/course/${courseId}/play/${nextVideoMeta.id}`);
                }
              }}
              disabled={!nextVideoMeta}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 flex items-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Inline Curriculum Panel */}
        {showCurriculum && courseData && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Course Curriculum</h3>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {courseData.sections?.map((section: any) => (
                <div key={section.id}>
                  <div className="px-6 py-3 bg-gray-50/50 text-sm font-semibold text-gray-700 sticky top-0">
                    {section.title}
                  </div>
                  {section.videos?.map((video: any) => {
                    const isActive = video.id === videoId;
                    const isCompleted = video.progress?.isCompleted || (video.progress?.completionPercentage >= 95);
                    return (
                      <button
                        key={video.id}
                        onClick={() => router.push(`/dashboard/learning/course/${courseId}/play/${video.id}`)}
                        className={`w-full text-left px-6 py-3 flex items-center hover:bg-blue-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                      >
                        <span className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <span className={`text-sm flex-1 ${isActive ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                          {video.title}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {Math.floor(video.durationSeconds / 60)}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

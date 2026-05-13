/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Lock, Loader2, Award, Download, Star, MessageSquare } from 'lucide-react';
import { MarkdownBody, stripMarkdown } from '@/components/ui/MarkdownRenderer';

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback form state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.dataPool.getCourse(courseId as string);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load course details', err);
        router.push('/dashboard/learning');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId, router]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        Course not found.
      </div>
    );
  }

  const course = data.course;

  // Build progressMap from nested section > video > progress
  const progressMap: Record<string, any> = {};
  course.sections?.forEach((section: any) => {
    section.videos?.forEach((video: any) => {
      if (video.progress) {
        progressMap[video.id] = video.progress;
      }
    });
  });

  // Check if course is completed
  const totalVideos = course.sections?.reduce((acc: number, s: any) => acc + (s.videos?.length || 0), 0) || 0;
  const completedVideos = Object.values(progressMap).filter((p: any) => p.isCompleted || p.completionPercentage >= 95).length;
  const overallPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const isCourseDone = totalVideos > 0 && completedVideos >= totalVideos;

  // Find next video to watch (first incomplete video by order)
  let nextVideo: any = null;
  for (const section of (course.sections || [])) {
    for (const video of (section.videos || [])) {
      const prog = progressMap[video.id];
      if (!prog || !prog.isCompleted) {
        nextVideo = video;
        break;
      }
    }
    if (nextVideo) break;
  }

  const handleSubmitFeedback = async () => {
    if (feedbackRating < 1) return;
    setFeedbackSubmitting(true);
    try {
      await api.dataPool.submitFeedback(courseId as string, {
        rating: feedbackRating,
        reviewText: feedbackText || undefined,
      });
      // Refresh data
      const res = await api.dataPool.getCourse(courseId as string);
      setData(res.data);
      setShowFeedback(false);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Course Hero */}
      <div className="bg-gray-900 rounded-3xl overflow-hidden text-white shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            {course.difficulty && (
              <div className="mb-4 inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300 w-fit">
                {course.difficulty} Level
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            {course.description && (
              <p className="text-gray-400 mb-8 max-w-lg text-sm leading-relaxed line-clamp-2">
                {stripMarkdown(course.description)}
              </p>
            )}
            
            <div className="flex items-center space-x-4">
              {nextVideo ? (
                <Link 
                  href={`/dashboard/learning/course/${course.id}/play/${nextVideo.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {Object.keys(progressMap).length === 0 ? 'Start Course' : 'Continue Watching'}
                </Link>
              ) : isCourseDone ? (
                <div className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center cursor-default">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Course Completed
                </div>
              ) : null}
            </div>

            {/* Rating display */}
            {course.averageRating > 0 && (
              <div className="mt-6 flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-gray-400">{course.averageRating} ({course.totalReviews} reviews)</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">{course.totalEnrolled} enrolled</span>
              </div>
            )}
          </div>
          <div className="relative aspect-video md:aspect-auto bg-gray-800">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full bg-gray-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent" />
          </div>
        </div>
      </div>

      {/* About this Course */}
      {course.description && (
        <div className="bg-white border border-gray-200 rounded-2xl p-7">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this Course</h2>
          <MarkdownBody text={course.description} className="text-gray-600 text-sm leading-relaxed" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
          
          <div className="space-y-4">
            {course.sections?.map((section: any, idx: number) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">
                    Section {idx + 1}: {section.title}
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    {section.videos?.length || 0} videos
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.videos?.map((video: any, vIdx: number) => {
                    const prog = progressMap[video.id];
                    const isCompleted = prog?.isCompleted || (prog?.completionPercentage >= 95);
                    const isLocked = !course.enrollment && !video.isPreview;

                    return (
                      <Link 
                        href={`/dashboard/learning/course/${course.id}/play/${video.id}`}
                        key={video.id}
                        className={`group flex items-center p-4 sm:p-6 transition-colors hover:bg-blue-50 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}
                      >
                        <div className="flex-shrink-0 mr-4">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : (
                            <PlayCircle className={`w-6 h-6 ${prog ? 'text-blue-500' : 'text-gray-300 group-hover:text-blue-500'} transition-colors`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                              {idx + 1}.{vIdx + 1} {video.title}
                            </p>
                            {video.isPreview && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Preview</span>
                            )}
                          </div>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-xs text-gray-500">{Math.floor(video.durationSeconds / 60)} mins</span>
                            {prog && !isCompleted && (
                              <div className="flex items-center text-xs font-medium text-blue-600">
                                <span className="inline-block w-16 h-1.5 bg-blue-100 rounded-full overflow-hidden mr-2">
                                  <span className="block h-full bg-blue-600 rounded-full" style={{ width: `${prog.completionPercentage}%` }} />
                                </span>
                                {Math.round(prog.completionPercentage)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
            {isCourseDone ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-bold text-gray-900">Course Completed!</p>
                <p className="text-sm text-gray-500 mb-6">You earned the completion badge.</p>
                
                {/* Download certificate — fetched via separate endpoint if needed */}
                <button
                  onClick={async () => {
                    try {
                      // Attempt to get certificate from the enrollment/completion data
                      window.open(`/dashboard/learning`, '_self');
                    } catch {}
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-sm mb-2 font-medium">
                  <span className="text-gray-500">Overall Completion</span>
                  <span className="text-blue-600">{overallPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${overallPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedVideos} of {totalVideos} videos completed
                </p>
              </div>
            )}
          </div>

          {/* Feedback Card */}
          {course.enrollment && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                Your Review
              </h3>
              {course.feedback ? (
                <div>
                  <div className="flex items-center mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= course.feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {course.feedback.reviewText && (
                    <p className="text-sm text-gray-600 italic">&quot;{course.feedback.reviewText}&quot;</p>
                  )}
                  <button
                    onClick={() => {
                      setFeedbackRating(course.feedback.rating);
                      setFeedbackText(course.feedback.reviewText || '');
                      setShowFeedback(true);
                    }}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Edit Review
                  </button>
                </div>
              ) : (
                <>
                  {!showFeedback ? (
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                    >
                      Leave a Review
                    </button>
                  ) : null}
                </>
              )}

              {showFeedback && (
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setFeedbackRating(i)}>
                        <Star className={`w-6 h-6 cursor-pointer transition-colors ${i <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Share your thoughts about this course..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={feedbackSubmitting || feedbackRating < 1}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {feedbackSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      onClick={() => setShowFeedback(false)}
                      className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

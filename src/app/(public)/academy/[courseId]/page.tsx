// ─────────────────────────────────────────────────────────
// CAFT Academy — Public Course Detail + Enrollment CTA
// ─────────────────────────────────────────────────────────
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  PlayCircle, Lock, Clock, Users, Star, Award, CheckCircle2,
  ChevronDown, ChevronRight, Loader2, BookOpen, GraduationCap,
  ShoppingCart, ArrowRight, Plus, X,
} from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useStore } from '@/store/useStore';
import { openRazorpayPayment } from '@/lib/razorpay';
import { MarkdownBody, stripMarkdown } from '@/components/ui/MarkdownRenderer';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ───────────────────────────────────────────────

function formatPrice(paise: number): string {
  if (paise === 0) return 'Free';
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  return `${mins}m`;
}

function formatMins(seconds: number): string {
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const d = difficulty.toUpperCase();
  const color =
    d === 'BEGINNER'
      ? 'bg-green-500/20 text-green-300'
      : d === 'INTERMEDIATE'
        ? 'bg-yellow-500/20 text-yellow-300'
        : 'bg-red-500/20 text-red-300';
  return (
    <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()} Level
    </span>
  );
}


// ── Preview Video Modal ───────────────────────────────────

function PreviewVideoModal({
  videoId,
  title,
  thumbnailUrl,
  previewStartSeconds = 0,
  previewEndSeconds,
  onClose,
}: {
  videoId: string;
  title: string;
  thumbnailUrl?: string | null;
  previewStartSeconds?: number;
  previewEndSeconds?: number | null;
  onClose: () => void;
}) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/dp/video/${videoId}/preview-stream`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Preview unavailable')))
      .then(body => setStreamUrl(body?.data?.streamUrl ?? null))
      .catch(() => setError('Preview video is temporarily unavailable.'));
  }, [videoId]);

  // Enforce previewEndSeconds via timeupdate event
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewEndSeconds) return;
    const onTime = () => {
      if (video.currentTime >= previewEndSeconds) {
        video.pause();
        video.currentTime = previewEndSeconds;
      }
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, [streamUrl, previewEndSeconds]);

  // Seek to start when ready
  const handleLoaded = () => {
    const video = videoRef.current;
    if (!video) return;
    if (previewStartSeconds > 0) video.currentTime = previewStartSeconds;
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
            <p className="text-blue-400 text-xs mt-0.5 font-medium">Free Preview</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video bg-black flex items-center justify-center">
          {error ? (
            <p className="text-gray-400 text-sm">{error}</p>
          ) : !streamUrl ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          ) : (
            <video
              ref={videoRef}
              src={streamUrl}
              poster={thumbnailUrl ?? undefined}
              controls
              autoPlay
              onLoadedMetadata={handleLoaded}
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CTA Sidebar Card ──────────────────────────────────────

function EnrollCard({
  course,
  isAuthenticated,
  courseId,
  onEnroll,
  isEnrolling,
  enrollError,
  enrollSuccess,
}: {
  course: any;
  isAuthenticated: boolean;
  courseId: string;
  onEnroll: () => void;
  isEnrolling: boolean;
  enrollError: string | null;
  enrollSuccess: boolean;
}) {
  const isEnrolled = course.enrollment?.isEnrolled;

  return (
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Course thumbnail preview */}
      {course.thumbnailUrl ? (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
          <GraduationCap className="w-16 h-16 text-blue-300 opacity-40" />
        </div>
      )}

      {/* CTA body */}
      <div className="p-6 space-y-4">
        {enrollSuccess ? (
          <div className="text-center py-4 space-y-3">
            <Award className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-bold text-green-700 text-lg">Enrolled!</p>
            <p className="text-sm text-gray-500">Taking you to your course…</p>
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : isEnrolled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              You&apos;re enrolled in this course
            </div>
            <Link
              href={`/dashboard/learning/course/${course.id}`}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Go to Course
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatPrice(course.price)}
              </span>
              {course.price > 0 && (
                <span className="text-sm text-gray-400">one-time</span>
              )}
            </div>

            {/* Error banner */}
            {enrollError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 leading-relaxed">
                {enrollError}
              </div>
            )}

            {/* CTA button — always "Enroll Now" regardless of planId */}
            {!isAuthenticated ? (
              <Link
                href={`/login?redirect=/academy/${courseId}`}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Enroll Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : course.price === 0 ? (
              <button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {isEnrolling
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Enroll for Free</>
                }
              </button>
            ) : (
              <button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                {isEnrolling
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><ShoppingCart className="w-4 h-4" /> Enroll Now — {formatPrice(course.price)}</>
                }
              </button>
            )}

            {/* Trust signals */}
            <ul className="text-xs text-gray-500 space-y-1 pt-1">
              {course.totalVideos > 0 && (
                <li className="flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {course.totalVideos} on-demand lectures
                </li>
              )}
              {course.totalDuration > 0 && (
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {formatDuration(course.totalDuration)} of content
                </li>
              )}
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                Certificate on completion
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                Full lifetime access
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Course FAQ ────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'How do I access the course after enrolling?',
    a: 'Once enrolled, go to Dashboard → Learning. Your course will appear there with all lectures unlocked immediately.',
  },
  {
    q: 'Is there a certificate on completion?',
    a: 'Yes! You receive a CAFT Financial certificate of completion once you finish all lectures. The certificate is downloadable as a PDF and includes a unique verification ID.',
  },
  {
    q: 'How long do I have access to the course?',
    a: 'You get full lifetime access. Watch at your own pace — there are no expiry dates on enrolled courses.',
  },
  {
    q: 'Can I watch on my mobile device?',
    a: 'Absolutely. The platform is fully responsive and works on any device — phone, tablet, or desktop.',
  },
  {
    q: 'What is the refund policy?',
    a: 'We offer a 7-day no-questions-asked refund if you are not satisfied. Contact support@caftfin.com with your order details.',
  },
  {
    q: 'Do I need any prior experience?',
    a: 'Each course lists its difficulty level. Beginner courses assume no prior knowledge. Check the curriculum to see what\'s covered before enrolling.',
  },
];

function CourseFAQ({ price }: { price: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = price === 0
    ? FAQ_ITEMS.filter(f => !f.q.toLowerCase().includes('refund'))
    : FAQ_ITEMS;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-blue-200 shadow-sm' : 'border-gray-200'}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function AcademyCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useStore();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Enrollment state
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Preview modal
  const [previewVideo, setPreviewVideo] = useState<{
    id: string; title: string; thumbnailUrl?: string | null;
    previewStartSeconds?: number; previewEndSeconds?: number | null;
  } | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        const res = await api.dataPool.getCourse(courseId as string);
        const c = res.data?.course ?? null;
        setCourse(c);
        const firstId = c?.sections?.[0]?.id;
        if (firstId) setExpandedSections(new Set([firstId]));
      } catch {
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, isAuthenticated]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Enroll / purchase handler ──────────────────────────

  const handleEnroll = async () => {
    setEnrollError(null);

    if (!isAuthenticated) {
      router.push(`/login?redirect=/academy/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    try {
      const { data } = await api.dataPool.enrollCourse(course.id);

      // Free course — enrolled directly by the server
      if (data.enrolled) {
        setEnrollSuccess(true);
        setTimeout(() => router.push(`/dashboard/learning/course/${course.id}`), 1800);
        return;
      }

      // Paid course — open Razorpay checkout
      await openRazorpayPayment({
        orderId: data.orderId!,
        amount: data.amount!,
        currency: data.currency!,
        planName: course.title,
        userEmail: user!.email,
        userName: user!.name,
        onSuccess: async (razorpayPaymentId, razorpayOrderId, razorpaySignature) => {
          try {
            await api.dataPool.verifyCourseEnrollment(course.id, {
              paymentId: data.paymentId!,
              razorpayPaymentId,
              razorpayOrderId,
              razorpaySignature,
            });
            setEnrollSuccess(true);
            setTimeout(() => router.push(`/dashboard/learning/course/${course.id}`), 1800);
          } catch {
            setEnrollError('Payment received but enrollment failed. Please contact support@caftfin.com');
          }
        },
        onFailure: (error) => {
          if (error !== '__USER_CANCELLED__') setEnrollError(error);
        },
      });
    } catch (err: any) {
      setEnrollError(err?.message || 'Enrollment failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // ── Loading ────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
        <BookOpen className="w-12 h-12 opacity-30" />
        <p className="font-medium">Course not found</p>
        <Link href="/algo-indicators" className="text-blue-600 hover:underline text-sm">
          ← Back to Courses &amp; Tools
        </Link>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────

  const totalVideos = course.sections?.reduce(
    (acc: number, s: any) => acc + (s.videos?.length || 0),
    0,
  ) || 0;

  const previewCount = course.sections
    ?.flatMap((s: any) => s.videos || [])
    .filter((v: any) => v.isPreview).length || 0;

  const isEnrolled = course.enrollment?.isEnrolled;

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Preview video modal */}
      {previewVideo && (
        <PreviewVideoModal
          videoId={previewVideo.id}
          title={previewVideo.title}
          thumbnailUrl={previewVideo.thumbnailUrl}
          previewStartSeconds={previewVideo.previewStartSeconds}
          previewEndSeconds={previewVideo.previewEndSeconds}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — course info */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Link
                href="/algo-indicators"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 w-fit transition-colors"
              >
                ← Back to Courses &amp; Tools
              </Link>

              <DifficultyBadge difficulty={course.difficulty} />

              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                {course.title}
              </h1>

              {/* Short plain-text teaser — full description in About section below */}
              {course.description && (
                <p className="text-blue-200 text-base leading-relaxed max-w-2xl line-clamp-3">
                  {stripMarkdown(course.description)}
                </p>
              )}

              {/* Meta stats */}
              <div className="flex flex-wrap gap-5 text-sm text-blue-200 mt-1">
                {course.averageRating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <strong className="text-white">{course.averageRating.toFixed(1)}</strong>
                    <span className="text-blue-300">({course.totalReviews} reviews)</span>
                  </span>
                )}
                {course.totalEnrolled > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {course.totalEnrolled.toLocaleString('en-IN')} enrolled
                  </span>
                )}
                {course.totalDuration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(course.totalDuration)} total
                  </span>
                )}
                {totalVideos > 0 && (
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4" />
                    {totalVideos} lectures
                  </span>
                )}
              </div>
            </div>

            {/* Right — CTA card (sticky on desktop) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <EnrollCard
                  course={course}
                  isAuthenticated={isAuthenticated}
                  courseId={courseId as string}
                  onEnroll={handleEnroll}
                  isEnrolling={isEnrolling}
                  enrollError={enrollError}
                  enrollSuccess={enrollSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Course Curriculum</h2>
        <p className="text-gray-500 text-sm mb-6">
          {totalVideos} lectures
          {course.totalDuration > 0 ? ` · ${formatDuration(course.totalDuration)} total` : ''}
          {previewCount > 0 ? ` · ${previewCount} ${previewCount === 1 ? 'lecture' : 'lectures'} free to preview` : ''}
        </p>

        {(!course.sections || course.sections.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
            <PlayCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Curriculum coming soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.sections.map((section: any, sIdx: number) => {
              const isExpanded = expandedSections.has(section.id);
              const sectionSecs = section.videos?.reduce(
                (acc: number, v: any) => acc + (v.durationSeconds || 0),
                0,
              ) || 0;

              return (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      }
                      <span className="font-semibold text-gray-900 text-sm">
                        Section {sIdx + 1}: {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                      {section.videos?.length || 0} lectures
                      {sectionSecs > 0 ? ` · ${formatMins(sectionSecs)}` : ''}
                    </span>
                  </button>

                  {/* Video rows */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {section.videos?.map((video: any, vIdx: number) => {
                        const canPreview = video.isPreview && !isEnrolled;
                        const isLocked = !isEnrolled && !video.isPreview;
                        return (
                          <div
                            key={video.id}
                            className={`flex items-center px-5 py-3 gap-3 ${isLocked ? 'opacity-60' : ''} ${canPreview ? 'cursor-pointer hover:bg-blue-50/50 transition-colors' : ''}`}
                            onClick={canPreview ? () => setPreviewVideo({
                              id: video.id,
                              title: video.title,
                              thumbnailUrl: video.thumbnailUrl,
                              previewStartSeconds: video.previewStartSeconds,
                              previewEndSeconds: video.previewEndSeconds,
                            }) : undefined}
                          >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              {isLocked
                                ? <Lock className="w-4 h-4 text-gray-400" />
                                : canPreview
                                  ? <PlayCircle className="w-4 h-4 text-blue-500" />
                                  : <PlayCircle className="w-4 h-4 text-blue-500" />
                              }
                            </div>

                            {/* Title */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${canPreview ? 'text-blue-700' : 'text-gray-800'}`}>
                                {sIdx + 1}.{vIdx + 1} {video.title}
                              </p>
                              {video.description && (
                                <p className="mt-0.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                  {stripMarkdown(video.description)}
                                </p>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {video.isPreview && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                  Preview
                                </span>
                              )}
                              {video.durationSeconds > 0 && (
                                <span className="text-xs text-gray-400">
                                  {formatMins(video.durationSeconds)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── About this Course ───────────────────────────────── */}
      {course.description && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Course</h2>
            <MarkdownBody text={course.description} className="text-gray-600 text-sm leading-relaxed" />
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────── */}
      <CourseFAQ price={course.price} />

      {/* ── Mobile sticky CTA ────────────────────────────── */}
      {!isEnrolled && !enrollSuccess && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
          {!isAuthenticated ? (
            <Link
              href={`/login?redirect=/academy/${courseId}`}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Enroll Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {isEnrolling
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                : course.price === 0
                  ? <><CheckCircle2 className="w-4 h-4" /> Enroll for Free</>
                  : <><ShoppingCart className="w-4 h-4" /> Enroll Now — {formatPrice(course.price)}</>
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}

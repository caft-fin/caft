'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { PlayCircle, PauseCircle, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
}

export default function VideoPlayer({ videoId, courseId }: VideoPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [streamData, setStreamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Pre-generate confetti pieces for the celebration overlay safely via state
  interface ConfettiPiece {
    id: number;
    left: string;
    animationDelay: string;
    animationDuration: string;
    backgroundColor: string;
    width: string;
    height: string;
    borderRadius: string;
    transform: string;
  }
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    setConfettiPieces(Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      transform: `rotate(${Math.random() * 360}deg)`,
    })));
  }, []);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<number>(0); // For seek delta calculation
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();

  // ── Progress Sync ──────────────────────────────────────
  const syncProgress = useCallback(async (currentTime: number, forceComplete = false) => {
    if (!streamData) return;
    
    const duration = streamData.durationSeconds || videoRef.current?.duration || 1;
    let pct = (currentTime / duration) * 100;
    if (forceComplete) pct = 100;

    try {
      const result = await api.dataPool.updateProgress(videoId, {
        watchedSeconds: Math.floor(currentTime),
        resumePositionSeconds: Math.floor(currentTime),
        completionPercentage: Math.min(pct, 100),
      });
      
      // Check if course just completed
      if (result?.data?.courseCompleted) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Failed to sync progress', err);
    }
  }, [streamData, videoId]);

  // ── Event Tracking (fire-and-forget) ───────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trackEvent = useCallback((eventType: string, positionSeconds: number, metadata?: Record<string, any>) => {
    api.dataPool.trackEvent(videoId, { eventType, positionSeconds, metadata }).catch(() => {});
  }, [videoId]);

  // ── Navigation ─────────────────────────────────────────
  const playNextVideo = useCallback(() => {
    if (streamData?.nextVideo) {
      router.push(`/dashboard/learning/course/${courseId}/play/${streamData.nextVideo.id}`);
    }
  }, [streamData, courseId, router]);

  const startNextCountdown = useCallback(() => {
    setCountdown(5);
    setShowNextOverlay(true);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          playNextVideo();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  }, [playNextVideo]);

  // ── Fetch Stream URL ───────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const fetchStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.dataPool.getVideoStream(videoId);
        if (mounted) {
          setStreamData(res.data);
        }
      } catch (err: unknown) {
        if (mounted) {
          const errorResponse = err as { status?: number; data?: { cta?: unknown } };
          if (errorResponse.status === 403) {
            setError('SUBSCRIPTION_REQUIRED');
            setStreamData({ cta: errorResponse.data?.cta });
          } else {
            setError('Failed to load video stream');
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchStream();
    return () => { mounted = false; };
  }, [videoId]);

  // ── Set Up Video Events ────────────────────────────────
  useEffect(() => {
    if (streamData?.streamUrl && videoRef.current) {
      const vid = videoRef.current;
      
      // Seek to resume position
      if (streamData.resumePosition > 0) {
        vid.currentTime = streamData.resumePosition;
        lastPositionRef.current = streamData.resumePosition;
      }
      
      // Auto-play
      vid.play().catch(e => console.log('Autoplay blocked:', e));

      // ── Play Event ──────────────────────────────────
      const handlePlay = () => {
        const pos = Math.floor(vid.currentTime);
        trackEvent('PLAY', pos);
        lastPositionRef.current = vid.currentTime;
      };
      
      // ── Pause Event ─────────────────────────────────
      const handlePause = () => {
        const pos = Math.floor(vid.currentTime);
        trackEvent('PAUSE', pos);
        // Save progress on pause
        syncProgress(vid.currentTime);
      };

      // ── Seeking (capture "from" position) ───────────
      const handleSeeking = () => {
        // Store the position we're seeking FROM
        // lastPositionRef already holds this from timeupdate
      };

      // ── Seeked (classify the event type) ────────────
      const handleSeeked = () => {
        const fromPos = lastPositionRef.current;
        const toPos = vid.currentTime;
        const delta = toPos - fromPos;
        const duration = vid.duration || streamData.durationSeconds || 1;
        const pos = Math.floor(toPos);
        const metadata = {
          fromPosition: Math.floor(fromPos),
          toPosition: Math.floor(toPos),
          delta: Math.floor(delta),
        };

        // Classify the seek event
        if (Math.abs(delta) < 2) {
          // Minor seek (< 2 seconds), ignore
          lastPositionRef.current = toPos;
          return;
        }

        if (delta > 0 && Math.abs(delta) > duration * 0.3) {
          // Jumped forward > 30% of duration → SKIP_SECTION
          trackEvent('SKIP_SECTION', pos, metadata);
        } else if (delta > 10) {
          // Fast forward > 10 seconds
          trackEvent('FAST_FORWARD', pos, metadata);
        } else if (delta < 0) {
          // Rewind
          trackEvent('REWIND', pos, metadata);
        } else {
          // Generic seek
          trackEvent('SEEK', pos, metadata);
        }

        lastPositionRef.current = toPos;
      };

      // ── Time Update (track position for seek detection) ──
      const handleTimeUpdate = () => {
        // Only update position if NOT seeking (normal playback)
        if (!vid.seeking) {
          lastPositionRef.current = vid.currentTime;
        }

        // Enforce preview duration limits as client-side backup
        if (streamData?.accessType === 'PREVIEW' && streamData.maxAllowedSeconds) {
          if (vid.currentTime >= streamData.maxAllowedSeconds) {
            vid.pause();
            setError('SUBSCRIPTION_REQUIRED');
          }
        }
      };

      // ── Ended (completion + auto-play next) ─────────
      const handleEnded = () => {
        const pos = Math.floor(vid.currentTime);
        trackEvent('COMPLETE', pos);
        syncProgress(vid.currentTime, true);

        // Auto-play next video
        if (streamData.nextVideo) {
          startNextCountdown();
        }
      };

      // ── Replay Detection ────────────────────────────
      let hasCompleted = false;
      const handleCanPlay = () => {
        // Check if video was already completed and user is replaying
        if (hasCompleted && vid.currentTime < 1) {
          trackEvent('REPLAY', 0);
        }
      };
      const markCompleted = () => { hasCompleted = true; };

      // ── Exit Detection (page unload / navigation) ───
      const handleBeforeUnload = () => {
        const pos = Math.floor(vid.currentTime);
        // Use credentials: 'include' so the httpOnly caft_access cookie is sent automatically.
        // keepalive keeps the request alive after the page unloads.
        try {
          fetch(`/api/dp/video/${videoId}/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              eventType: 'EXIT',
              positionSeconds: pos,
              metadata: { source: 'page_unload' },
            }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          // Silently fail on page unload
        }
      };

      // Attach all event listeners
      vid.addEventListener('play', handlePlay);
      vid.addEventListener('pause', handlePause);
      vid.addEventListener('seeking', handleSeeking);
      vid.addEventListener('seeked', handleSeeked);
      vid.addEventListener('timeupdate', handleTimeUpdate);
      vid.addEventListener('ended', handleEnded);
      vid.addEventListener('ended', markCompleted);
      vid.addEventListener('play', handleCanPlay);
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Progress sync every 10 seconds
      progressInterval.current = setInterval(() => {
        if (!vid.paused && !vid.ended) {
          syncProgress(vid.currentTime, false);
        }
      }, 10000);

      return () => {
        vid.removeEventListener('play', handlePlay);
        vid.removeEventListener('pause', handlePause);
        vid.removeEventListener('seeking', handleSeeking);
        vid.removeEventListener('seeked', handleSeeked);
        vid.removeEventListener('timeupdate', handleTimeUpdate);
        vid.removeEventListener('ended', handleEnded);
        vid.removeEventListener('ended', markCompleted);
        vid.removeEventListener('play', handleCanPlay);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (progressInterval.current) clearInterval(progressInterval.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Send EXIT event on component unmount (route change)
        if (vid.currentTime > 0 && !vid.ended) {
          trackEvent('EXIT', Math.floor(vid.currentTime), { source: 'navigation' });
          syncProgress(vid.currentTime);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamData?.streamUrl, videoId]);

  // ── Loading State ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ── Subscription Required State ────────────────────────
  if (error === 'SUBSCRIPTION_REQUIRED') {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center p-8 text-center border border-gray-800">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
          <PauseCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Premium Content</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          {streamData?.cta?.message || "Subscribe to unlock this full video and get access to the entire course."}
        </p>
        <button 
          onClick={() => router.push('/dashboard/management')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          View Subscription Plans
        </button>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-400">
        {error}
      </div>
    );
  }

  // ── Main Player ────────────────────────────────────────
  return (
    <div className="relative group w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        src={streamData?.streamUrl}
        className="w-full h-full object-contain"
        controls
        controlsList="nodownload"
        playsInline
      />

      {/* Celebration Overlay (Course Completed!) */}
      {showCelebration && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          {/* Confetti-like particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute animate-confetti"
                style={{
                  left: piece.left,
                  top: '-10%',
                  animationDelay: piece.animationDelay,
                  animationDuration: piece.animationDuration,
                  backgroundColor: piece.backgroundColor,
                  width: piece.width,
                  height: piece.height,
                  borderRadius: piece.borderRadius,
                  transform: piece.transform,
                }}
              />
            ))}
          </div>

          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Congratulations!</h2>
          <p className="text-xl text-gray-300 mb-2">You&apos;ve completed the course!</p>
          <p className="text-gray-500 mb-8">A certificate has been generated and a badge has been awarded.</p>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCelebration(false)}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Dismiss
            </button>
            <button 
              onClick={() => router.push('/dashboard/learning')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Next Video Overlay */}
      {showNextOverlay && streamData?.nextVideo && !showCelebration && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <p className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-sm">Up Next</p>
          <h3 className="text-3xl font-bold text-white mb-8">{streamData.nextVideo.title}</h3>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => { 
                setShowNextOverlay(false); 
                setCountdown(null);
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              }}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={playNextVideo}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Play Now {countdown !== null && `(${countdown})`}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}

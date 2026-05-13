'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { api, ApiError } from '@/lib/apiClient';
import {
  Loader2, UploadCloud, CheckCircle, AlertTriangle, FileVideo,
  BookOpen, Play, Plus, X, Trash2, Eye, EyeOff, Star, Users,
  Layers, Edit3, GripVertical, Clock, ChevronDown, ChevronRight,
  Film, ImageIcon,
} from 'lucide-react';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format paise (Int) as a human-readable rupee string */
const formatPriceRupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Format seconds as m:ss or h:mm:ss */
const formatDuration = (sec: number) => {
  if (!sec) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
};

/** Read duration from a video File without uploading it */
const getVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => { resolve(Math.round(el.duration) || 0); URL.revokeObjectURL(el.src); };
    el.onerror = () => resolve(0);
    el.src = URL.createObjectURL(file);
  });

// ── Shared sub-components ─────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

function ToastBanner({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) return null;
  const isOk = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold border animate-in slide-in-from-top-2 duration-300 max-w-sm ${
      isOk ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {isOk
        ? <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
        : <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function VideoPreviewModal({
  data, onClose,
}: {
  data: { streamUrl: string; title: string; thumbnailUrl?: string | null; durationSeconds?: number };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{data.title}</h3>
            {data.durationSeconds !== undefined && (
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {formatDuration(data.durationSeconds)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Player */}
        <div className="aspect-video bg-black">
          <video
            src={data.streamUrl}
            poster={data.thumbnailUrl ?? undefined}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls =
    difficulty === 'BEGINNER' ? 'bg-green-50 text-green-700 border-green-200' :
    difficulty === 'INTERMEDIATE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
    'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${cls}`}>
      {difficulty}
    </span>
  );
}

/** Course thumbnail — falls back to branded placeholder */
function CourseThumbnail({
  url, title, size = 'sm',
}: { url?: string | null; title: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-16 h-16 rounded-xl' : 'w-12 h-12 rounded-lg';
  if (url) {
    return (
      // Using <img> instead of next/image for signed/external URLs that bypass optimization
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={title} className={`${dim} object-cover shrink-0 bg-gray-100`} />
    );
  }
  return (
    <div className={`${dim} bg-orange-50 flex items-center justify-center shrink-0`}>
      <BookOpen className={`${size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'} text-orange-400`} />
    </div>
  );
}

/** Sidebar course picker used in both Upload and Curriculum tabs */
function CoursePicker({
  courses, selectedId, onSelect,
}: {
  courses: any[];
  selectedId?: string;
  onSelect: (course: any) => void;
}) {
  return (
    <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col h-[72vh] overflow-hidden">
      <h3 className="font-bold text-base mb-4 text-gray-900">Select Course</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No courses found</p>
        ) : courses.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 items-center ${
              selectedId === c.id
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
            }`}
          >
            <CourseThumbnail url={c.thumbnailUrl} title={c.title} />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">{c.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {c.totalVideos} videos · {c.totalSections} sections
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Modal helpers ─────────────────────────────────────────────────────────────

const INPUT = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors';
const LABEL = 'text-sm font-semibold text-gray-600 block mb-1.5';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'courses' | 'upload' | 'curriculum'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Create / Edit course modals ────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Course thumbnail (standalone) ──────────────────────────────────────────
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState<string | null>(null);
  const [courseThumbnailUploading, setCourseThumbnailUploading] = useState(false);

  // ── Video upload ───────────────────────────────────────────────────────────
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<ToastState>(null);
  const [uploadStep, setUploadStep] = useState<'upload' | 'review'>('upload');
  const [reviewVideo, setReviewVideo] = useState<any | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // ── Curriculum editor ──────────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoForm, setEditVideoForm] = useState({ title: '', description: '', isPreview: false, previewStartSeconds: 0, previewEndSeconds: 0 });
  const [curriculumNewSection, setCurriculumNewSection] = useState('');

  // ── Section drag-and-drop ──────────────────────────────────────────────────
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  // ── Video preview modal ────────────────────────────────────────────────────
  const [previewModal, setPreviewModal] = useState<{
    streamUrl: string; title: string; thumbnailUrl?: string | null; durationSeconds?: number;
  } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.dataPool.admin.listAllCourses();
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load courses', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // Keep selectedCourse in sync when the courses list refreshes
  useEffect(() => {
    if (selectedCourse) {
      const updated = courses.find((c) => c.id === selectedCourse.id);
      if (updated) setSelectedCourse(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  // ── Reset upload form ──────────────────────────────────────────────────────

  const resetUploadForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoTitle('');
    setVideoDescription('');
    setIsPreview(false);
    setNewSectionTitle('');
    setUploadProgress(0);
    setUploadStatus(null);
    setReviewVideo(null);
    setUploadStep('upload');
  };

  // ── Course CRUD ────────────────────────────────────────────────────────────

  const handleCreateCourse = async () => {
    setCreateError('');
    if (!createForm.title.trim()) { setCreateError('Title is required'); return; }
    setCreateLoading(true);
    try {
      await api.dataPool.admin.createCourse({
        title: createForm.title,
        description: createForm.description,
        price: Math.round((parseFloat(createForm.price) || 0) * 100), // rupees → paise
        difficulty: createForm.difficulty,
      });
      setShowCreate(false);
      setCreateForm({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
      await loadCourses();
      showToast('success', 'Course created successfully!');
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditCourse = (course: any) => {
    setEditCourseId(course.id);
    setEditForm({
      title: course.title,
      description: course.description || '',
      price: course.price > 0 ? String(course.price / 100) : '',
      difficulty: course.difficulty || 'BEGINNER',
    });
    setEditError('');
    setShowEdit(true);
  };

  const handleEditCourse = async () => {
    if (!editCourseId) return;
    setEditError('');
    if (!editForm.title.trim()) { setEditError('Title is required'); return; }
    setEditLoading(true);
    try {
      await api.dataPool.admin.updateCourse(editCourseId, {
        title: editForm.title,
        description: editForm.description,
        price: Math.round((parseFloat(editForm.price) || 0) * 100), // rupees → paise
        difficulty: editForm.difficulty,
      });
      setShowEdit(false);
      setEditCourseId(null);
      await loadCourses();
      showToast('success', 'Course updated!');
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update course');
    } finally {
      setEditLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      await api.dataPool.admin.updateCourse(courseId, { isPublished: !isPublished });
      await loadCourses();
      showToast('success', isPublished ? 'Course unpublished' : 'Course published!');
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const handleToggleFeatured = async (courseId: string, isFeatured: boolean) => {
    try {
      await api.dataPool.admin.updateCourse(courseId, { isFeatured: !isFeatured });
      await loadCourses();
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Update failed');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? Courses with active enrollments will be unpublished instead.')) return;
    try {
      const res = await api.dataPool.admin.deleteCourse(courseId);
      await loadCourses();
      const wasUnpublished = (res.data as any)?.unpublished;
      showToast(
        wasUnpublished ? 'error' : 'success',
        wasUnpublished
          ? 'Course has enrollments — unpublished instead of deleted.'
          : 'Course deleted.'
      );
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Delete failed');
    }
  };

  // ── Course thumbnail (standalone upload) ───────────────────────────────────

  const handleCourseThumbnailSelect = (file: File) => {
    setCourseThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCourseThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCourseThumbnailUpload = async () => {
    if (!courseThumbnailFile || !selectedCourse) return;
    setCourseThumbnailUploading(true);
    try {
      const { data } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id, 'thumbnails', courseThumbnailFile.name, courseThumbnailFile.type
      );
      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': courseThumbnailFile.type },
        body: courseThumbnailFile,
      });
      await api.dataPool.admin.updateCourse(selectedCourse.id, { thumbnailUrl: data.publicUrl });
      await loadCourses();
      setCourseThumbnailFile(null);
      setCourseThumbnailPreview(null);
      showToast('success', 'Course thumbnail updated!');
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Thumbnail upload failed');
    } finally {
      setCourseThumbnailUploading(false);
    }
  };

  // ── Video upload ───────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedCourse || !videoFile || !thumbnailFile || !videoTitle.trim()) {
      setUploadStatus({ type: 'error', message: 'Please fill all fields and select both video and thumbnail.' });
      return;
    }
    if (selectedSectionId === 'new' && !newSectionTitle.trim()) {
      setUploadStatus({ type: 'error', message: 'Enter a title for the new section.' });
      return;
    }
    if (!selectedSectionId) {
      setUploadStatus({ type: 'error', message: 'Select a section for this video.' });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus(null);

      // 1. Get video presigned URL
      const vFolder = isPreview ? 'preview_videos' : 'full_videos';
      const { data: vData } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id, vFolder, videoFile.name, videoFile.type
      );

      // 2. Upload video via XHR for real-time progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', vData.uploadUrl, true);
        xhr.setRequestHeader('Content-Type', videoFile.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 82));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Video upload failed (HTTP ${xhr.status})`));
        xhr.onerror = () => reject(new Error('Network error during video upload'));
        xhr.send(videoFile);
      });

      setUploadProgress(88);

      // 3. Upload thumbnail
      const { data: tData } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id, 'thumbnails', thumbnailFile.name, thumbnailFile.type
      );
      await fetch(tData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': thumbnailFile.type },
        body: thumbnailFile,
      });

      setUploadProgress(93);

      // 4. Create section if requested
      let secId = selectedSectionId;
      if (secId === 'new') {
        const secRes = await api.dataPool.admin.createSection({
          courseId: selectedCourse.id,
          title: newSectionTitle,
        });
        secId = secRes.data.id;
      }

      // 5. Detect duration locally (no extra request)
      const durationSeconds = await getVideoDuration(videoFile);

      // 6. Create video record in DB
      const vidRes = await api.dataPool.admin.createVideo({
        courseId: selectedCourse.id,
        sectionId: secId,
        title: videoTitle,
        description: videoDescription || undefined,
        s3Key: vData.fileKey,
        thumbnailUrl: tData.publicUrl,
        isPreview,
        durationSeconds,
      });

      setUploadProgress(97);

      // 7. Auto-set course thumbnail if the course doesn't have one yet
      if (!selectedCourse.thumbnailUrl) {
        await api.dataPool.admin.updateCourse(selectedCourse.id, { thumbnailUrl: tData.publicUrl });
      }

      setUploadProgress(100);

      setReviewVideo({
        ...vidRes.data,
        publicUrl: vData.publicUrl,
        thumbnailUrl: tData.publicUrl,
        durationSeconds,
      });
      setUploadStep('review');
      setUploadStatus({ type: 'success', message: 'Upload complete! Review below, then publish.' });
      await loadCourses();
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: err?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublishReview = async () => {
    if (!reviewVideo) return;
    try {
      await api.dataPool.admin.updateVideo(reviewVideo.id, { isPublished: true });
      resetUploadForm();
      await loadCourses();
      showToast('success', 'Video published successfully!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to publish video');
    }
  };

  // ── Section CRUD ───────────────────────────────────────────────────────────

  const handleCreateSection = async () => {
    if (!curriculumNewSection.trim() || !selectedCourse) return;
    try {
      const res = await api.dataPool.admin.createSection({
        courseId: selectedCourse.id,
        title: curriculumNewSection,
      });
      setCurriculumNewSection('');
      setEditingSectionId(null);
      setExpandedSections((prev) => new Set([...prev, res.data.id]));
      await loadCourses();
    } catch (err: any) { showToast('error', err?.message || 'Failed to create section'); }
  };

  const handleUpdateSection = async (sectionId: string) => {
    try {
      await api.dataPool.admin.updateSection(sectionId, { title: editSectionTitle });
      setEditingSectionId(null);
      await loadCourses();
    } catch (err: any) { showToast('error', err?.message || 'Failed to update section'); }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its videos?')) return;
    try {
      await api.dataPool.admin.deleteSection(sectionId);
      setExpandedSections((prev) => { const n = new Set(prev); n.delete(sectionId); return n; });
      await loadCourses();
    } catch (err: any) { showToast('error', err?.message || 'Failed to delete section'); }
  };

  // ── Video CRUD ─────────────────────────────────────────────────────────────

  const handleUpdateVideo = async (videoId: string) => {
    try {
      await api.dataPool.admin.updateVideo(videoId, {
        title: editVideoForm.title,
        description: editVideoForm.description || undefined,
        isPreview: editVideoForm.isPreview,
        ...(editVideoForm.isPreview && {
          previewStartSeconds: editVideoForm.previewStartSeconds,
          previewEndSeconds: editVideoForm.previewEndSeconds > 0 ? editVideoForm.previewEndSeconds : undefined,
        }),
      });
      setEditingVideoId(null);
      await loadCourses();
      showToast('success', 'Video updated!');
    } catch (err: any) { showToast('error', err?.message || 'Failed to update video'); }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Delete this video permanently?')) return;
    try {
      await api.dataPool.admin.deleteVideo(videoId);
      await loadCourses();
      showToast('success', 'Video deleted.');
    } catch (err: any) { showToast('error', err?.message || 'Failed to delete video'); }
  };

  const handleToggleVideoPublish = async (videoId: string, isPublished: boolean) => {
    try {
      await api.dataPool.admin.updateVideo(videoId, { isPublished: !isPublished });
      await loadCourses();
    } catch (err: any) { showToast('error', err?.message || 'Failed to update video'); }
  };

  // ── Video preview ──────────────────────────────────────────────────────────

  const handlePreviewVideo = async (video: any) => {
    if (previewLoadingId) return;
    setPreviewLoadingId(video.id);
    try {
      const res = await api.dataPool.admin.getVideoStream(video.id);
      setPreviewModal({
        streamUrl: res.data.streamUrl,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        durationSeconds: video.durationSeconds,
      });
    } catch {
      showToast('error', 'Could not load video stream. Check S3/CloudFront configuration.');
    } finally {
      setPreviewLoadingId(null);
    }
  };

  // ── Section expand/collapse ────────────────────────────────────────────────

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // ── Section drag-and-drop handlers ────────────────────────────────────────

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDragSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSectionId !== sectionId) setDragOverSectionId(sectionId);
  };

  const handleSectionDrop = async (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!dragSectionId || dragSectionId === targetSectionId || !selectedCourse) {
      setDragSectionId(null);
      setDragOverSectionId(null);
      return;
    }
    const sections = [...selectedCourse.sections];
    const fromIdx = sections.findIndex((s: any) => s.id === dragSectionId);
    const toIdx = sections.findIndex((s: any) => s.id === targetSectionId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = sections.splice(fromIdx, 1);
    sections.splice(toIdx, 0, moved);
    setSelectedCourse({ ...selectedCourse, sections });
    setDragSectionId(null);
    setDragOverSectionId(null);
    try {
      await Promise.all(
        sections.map((s: any, idx: number) =>
          api.dataPool.admin.updateSection(s.id, { orderIndex: idx })
        )
      );
      await loadCourses();
    } catch {
      showToast('error', 'Failed to save section order. Please try again.');
      await loadCourses();
    }
  };

  const handleSectionDragEnd = () => {
    setDragSectionId(null);
    setDragOverSectionId(null);
  };

  // ── Course picker navigation ───────────────────────────────────────────────

  const selectForUpload = (course: any) => {
    setSelectedCourse(course);
    setActiveTab('upload');
    resetUploadForm();
    setCourseThumbnailFile(null);
    setCourseThumbnailPreview(null);
    if (course.sections?.length > 0) {
      setSelectedSectionId(course.sections[0].id);
    } else {
      setSelectedSectionId('new');
    }
  };

  const selectForCurriculum = (course: any) => {
    setSelectedCourse(course);
    setActiveTab('curriculum');
    setEditingSectionId(null);
    setEditingVideoId(null);
    // Auto-expand all sections
    if (course.sections) {
      setExpandedSections(new Set(course.sections.map((s: any) => s.id)));
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
      {previewModal && (
        <VideoPreviewModal data={previewModal} onClose={() => setPreviewModal(null)} />
      )}

      {/* Header */}
      <header className="mb-8">
        <h2 className="text-[40px] font-extrabold text-on-surface tracking-tight">Course Management</h2>
        <p className="text-lg text-gray-500 mt-2 font-medium">
          Manage courses, upload media, and structure curriculum.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-8 flex-wrap items-center">
        {([
          { id: 'courses', label: `All Courses (${courses.length})`, icon: BookOpen },
          { id: 'upload', label: 'Upload Media', icon: UploadCloud },
          { id: 'curriculum', label: 'Curriculum', icon: Layers },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === id
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); }}
          className="ml-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
        >
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          ALL COURSES TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <BookOpen className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-semibold text-lg">No courses yet</p>
              <p className="text-sm mt-1">Click &quot;New Course&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 text-[11px] text-gray-400 uppercase tracking-widest font-black">
                    <th className="px-7 py-5">Course</th>
                    <th className="px-5 py-5">Level</th>
                    <th className="px-5 py-5">Price</th>
                    <th className="px-5 py-5">Stats</th>
                    <th className="px-5 py-5">Status</th>
                    <th className="px-7 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* Thumbnail + title */}
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <CourseThumbnail url={course.thumbnailUrl} title={course.title} size="lg" />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {course.totalVideos} videos · {course.totalSections} sections
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Difficulty */}
                      <td className="px-5 py-5">
                        <DifficultyBadge difficulty={course.difficulty || 'BEGINNER'} />
                      </td>
                      {/* Price — stored as paise, display as rupees */}
                      <td className="px-5 py-5 font-bold text-sm text-gray-700">
                        {course.price > 0
                          ? formatPriceRupees(course.price)
                          : <span className="text-green-600 font-bold">Free</span>}
                      </td>
                      {/* Stats */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {course.totalEnrolled}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            {course.averageRating > 0 ? course.averageRating : '—'}
                          </span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-xs font-bold text-gray-600">
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {course.isFeatured && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-black">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-7 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditCourse(course)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit course details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(course.id, course.isPublished)}
                            className={`p-2 rounded-lg transition-all ${
                              course.isPublished
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={course.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(course.id, course.isFeatured)}
                            className={`p-2 rounded-lg transition-all ${
                              course.isFeatured
                                ? 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50'
                                : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'
                            }`}
                            title={course.isFeatured ? 'Unfeature' : 'Feature'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => selectForUpload(course)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Upload media"
                          >
                            <UploadCloud className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => selectForCurriculum(course)}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                            title="Manage curriculum"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          UPLOAD TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CoursePicker
            courses={courses}
            selectedId={selectedCourse?.id}
            onSelect={selectForUpload}
          />

          {/* Upload panel */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-16">
                <UploadCloud className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-semibold">Select a course to upload media</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Course header */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                  <CourseThumbnail url={selectedCourse.thumbnailUrl} title={selectedCourse.title} size="lg" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h3>
                    <p className="text-sm text-gray-400 mt-0.5 font-mono">{selectedCourse.id}</p>
                  </div>
                </div>

                {/* ── Section A: Course thumbnail ────────────────────────────── */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" /> Course Thumbnail
                  </h4>
                  <div className="flex items-start gap-5">
                    {/* Preview */}
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
                      {(courseThumbnailPreview || selectedCourse.thumbnailUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={courseThumbnailPreview ?? selectedCourse.thumbnailUrl}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCourseThumbnailSelect(f);
                        }}
                        className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:bg-orange-50 file:text-orange-700 file:font-semibold file:border-0 file:cursor-pointer hover:file:bg-orange-100 transition-all"
                      />
                      {courseThumbnailFile && (
                        <button
                          onClick={handleCourseThumbnailUpload}
                          disabled={courseThumbnailUploading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-60 transition-colors"
                        >
                          {courseThumbnailUploading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            : <><UploadCloud className="w-4 h-4" /> Upload Thumbnail</>}
                        </button>
                      )}
                      <p className="text-xs text-gray-400">
                        Recommended: 1280×720 px, JPG or PNG, under 2 MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Section B: Video upload ─────────────────────────────────── */}
                <div className="space-y-5">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Film className="w-4 h-4 text-gray-500" /> Upload Video
                  </h4>

                  {/* Upload / Review sub-tabs */}
                  <div className="flex gap-4 border-b border-gray-100 pb-1">
                    {(['upload', 'review'] as const).map((step) => (
                      <button
                        key={step}
                        onClick={() => setUploadStep(step)}
                        className={`pb-2 font-bold text-sm transition-all capitalize ${
                          uploadStep === step
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {step === 'upload' ? 'Upload Media' : 'Review & Publish'}
                      </button>
                    ))}
                  </div>

                  {uploadStep === 'upload' ? (
                    <div className="space-y-5">
                      {/* Video metadata */}
                      <div className="space-y-4 bg-gray-50/80 p-5 rounded-xl border border-gray-100">
                        <div>
                          <label className={LABEL}>Section</label>
                          <select
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                            className={INPUT}
                          >
                            <option value="" disabled>Select section</option>
                            {selectedCourse.sections?.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                            <option value="new">+ Create New Section</option>
                          </select>
                        </div>
                        {selectedSectionId === 'new' && (
                          <div>
                            <label className={LABEL}>New Section Title</label>
                            <input
                              type="text"
                              value={newSectionTitle}
                              onChange={(e) => setNewSectionTitle(e.target.value)}
                              placeholder="e.g. Module 1: Introduction"
                              className={INPUT}
                            />
                          </div>
                        )}
                        <div>
                          <label className={LABEL}>Video Title *</label>
                          <input
                            type="text"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            placeholder="e.g. 1.1 Welcome to the Course"
                            className={INPUT}
                          />
                        </div>
                        <div>
                          <label className={LABEL}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
                          <textarea
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                            placeholder="Brief overview of what this video covers..."
                            rows={3}
                            className={`${INPUT} resize-none`}
                          />
                        </div>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isPreview}
                            onChange={(e) => setIsPreview(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Free preview — viewable without enrollment
                          </span>
                        </label>
                      </div>

                      {/* File pickers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={LABEL}>Video File *</label>
                          <input
                            type="file"
                            accept="video/mp4,video/x-m4v,video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2.5 file:rounded-lg file:bg-gray-100 file:text-gray-700 file:font-semibold file:border-0 file:cursor-pointer hover:file:bg-gray-200 transition-all"
                          />
                          {videoFile && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FileVideo className="w-3 h-3" />
                              {videoFile.name} · {(videoFile.size / 1048576).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className={LABEL}>Thumbnail *</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2.5 file:rounded-lg file:bg-gray-100 file:text-gray-700 file:font-semibold file:border-0 file:cursor-pointer hover:file:bg-gray-200 transition-all"
                          />
                          {thumbnailFile && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {thumbnailFile.name} · {(thumbnailFile.size / 1048576).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="space-y-1.5">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
                        </div>
                      )}

                      {/* Status */}
                      {uploadStatus && (
                        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                          uploadStatus.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                          {uploadStatus.type === 'success'
                            ? <CheckCircle className="w-5 h-5 shrink-0" />
                            : <AlertTriangle className="w-5 h-5 shrink-0" />}
                          {uploadStatus.message}
                        </div>
                      )}

                      {/* Upload button */}
                      <button
                        onClick={handleUpload}
                        disabled={
                          !videoFile || !thumbnailFile || uploading ||
                          !videoTitle.trim() || !selectedSectionId ||
                          (selectedSectionId === 'new' && !newSectionTitle.trim())
                        }
                        className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
                      >
                        {uploading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Uploading ({uploadProgress}%)…</>
                        ) : (
                          <><UploadCloud className="w-5 h-5" /> Upload Video</>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Review & Publish sub-tab */
                    <div className="space-y-6">
                      {!reviewVideo ? (
                        <div className="flex flex-col items-center justify-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                          <EyeOff className="w-12 h-12 mb-3 opacity-40" />
                          <p className="font-semibold">No video to review</p>
                          <p className="text-sm">Upload a video first.</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg border border-gray-800">
                            <video
                              src={reviewVideo.publicUrl}
                              poster={reviewVideo.thumbnailUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                            <h4 className="text-lg font-black text-gray-900">{reviewVideo.title}</h4>
                            {reviewVideo.description && (
                              <p className="text-sm text-gray-600">{reviewVideo.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {reviewVideo.durationSeconds > 0 && (
                                <span className="text-xs font-bold px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatDuration(reviewVideo.durationSeconds)}
                                </span>
                              )}
                              {reviewVideo.isPreview && (
                                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg">
                                  FREE PREVIEW
                                </span>
                              )}
                              <span className="text-xs font-bold px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg">
                                UNPUBLISHED
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => resetUploadForm()}
                              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                              Upload Another
                            </button>
                            <button
                              onClick={handlePublishReview}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                            >
                              <CheckCircle className="w-5 h-5" /> Approve & Publish
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          CURRICULUM TAB
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CoursePicker
            courses={courses}
            selectedId={selectedCourse?.id}
            onSelect={selectForCurriculum}
          />

          {/* Curriculum editor */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm h-[72vh] overflow-y-auto">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12">
                <Layers className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-semibold">Select a course to manage its curriculum</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Curriculum header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedCourse.totalSections} sections · {selectedCourse.totalVideos} videos
                    </p>
                  </div>
                  <button
                    onClick={() => selectForUpload(selectedCourse)}
                    className="px-4 py-2 bg-orange-50 text-orange-700 font-bold text-sm rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Upload Video
                  </button>
                </div>

                {/* New section inline form */}
                {editingSectionId === 'new-empty' && (
                  <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                    <input
                      type="text"
                      autoFocus
                      value={curriculumNewSection}
                      onChange={(e) => setCurriculumNewSection(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSection(); if (e.key === 'Escape') setEditingSectionId(null); }}
                      placeholder="e.g. Module 1: Foundations"
                      className="flex-1 px-4 py-2 border border-orange-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500 bg-white"
                    />
                    <button onClick={handleCreateSection} disabled={!curriculumNewSection.trim()} className="px-5 py-2 bg-orange-600 text-white font-bold text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50">
                      Save
                    </button>
                    <button onClick={() => { setEditingSectionId(null); setCurriculumNewSection(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {(!selectedCourse.sections || selectedCourse.sections.length === 0) ? (
                    <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                      <p className="font-semibold mb-1">No sections yet</p>
                      <p className="text-sm mb-4">Add a section to start building your curriculum</p>
                      <button
                        onClick={() => { setEditingSectionId('new-empty'); setCurriculumNewSection(''); }}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        + Create First Section
                      </button>
                    </div>
                  ) : (
                    <>
                      {selectedCourse.sections.map((section: any, sIdx: number) => {
                        const isExpanded = expandedSections.has(section.id);
                        const totalSec = section.videos?.reduce((s: number, v: any) => s + (v.durationSeconds || 0), 0) || 0;
                        return (
                          <div
                            key={section.id}
                            className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                              dragOverSectionId === section.id && dragSectionId !== section.id
                                ? 'border-orange-400 shadow-lg shadow-orange-100'
                                : 'border-gray-200'
                            } ${dragSectionId === section.id ? 'opacity-40' : ''}`}
                            onDragOver={(e) => handleSectionDragOver(e, section.id)}
                            onDrop={(e) => handleSectionDrop(e, section.id)}
                            onDragEnd={handleSectionDragEnd}
                          >
                            {/* Section header */}
                            <div
                              className="flex items-center gap-3 px-4 py-3.5 bg-gray-50/80 border-b border-gray-100 cursor-pointer select-none group"
                              onClick={() => toggleSection(section.id)}
                            >
                              <div
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); handleSectionDragStart(e, section.id); }}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-200 transition-colors"
                                title="Drag to reorder"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingSectionId === section.id ? (
                                  <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editSectionTitle}
                                      onChange={(e) => setEditSectionTitle(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateSection(section.id); if (e.key === 'Escape') setEditingSectionId(null); }}
                                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-500 bg-white"
                                    />
                                    <button onClick={() => handleUpdateSection(section.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600">Save</button>
                                    <button onClick={() => setEditingSectionId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider shrink-0">
                                      S{sIdx + 1}
                                    </span>
                                    <h4 className="font-bold text-gray-800 truncate">{section.title}</h4>
                                  </div>
                                )}
                                {editingSectionId !== section.id && (
                                  <p className="text-xs text-gray-400 mt-0.5 ml-6">
                                    {section.videos?.length || 0} videos
                                    {totalSec > 0 && ` · ${formatDuration(totalSec)}`}
                                  </p>
                                )}
                              </div>
                              {editingSectionId !== section.id && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingSectionId(section.id); setEditSectionTitle(section.title); }}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                                    title="Rename section"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                                    title="Delete section"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              {isExpanded
                                ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                            </div>

                            {/* Videos list */}
                            {isExpanded && (
                              <div className="divide-y divide-gray-50">
                                {(!section.videos || section.videos.length === 0) ? (
                                  <p className="text-xs text-gray-400 italic text-center py-5">
                                    No videos in this section
                                  </p>
                                ) : section.videos.map((video: any, vIdx: number) => (
                                  <div key={video.id} className="group">
                                    {editingVideoId === video.id ? (
                                      /* Edit form */
                                      <div className="p-4 space-y-3 bg-blue-50/30">
                                        <input
                                          type="text"
                                          placeholder="Video title"
                                          value={editVideoForm.title}
                                          onChange={(e) => setEditVideoForm({ ...editVideoForm, title: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-500"
                                        />
                                        <textarea
                                          placeholder="Description (optional)"
                                          value={editVideoForm.description}
                                          onChange={(e) => setEditVideoForm({ ...editVideoForm, description: e.target.value })}
                                          rows={2}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-orange-500 resize-none"
                                        />
                                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={editVideoForm.isPreview}
                                            onChange={(e) => setEditVideoForm({ ...editVideoForm, isPreview: e.target.checked })}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                          />
                                          Free preview video
                                        </label>
                                        {editVideoForm.isPreview && (
                                          <div className="grid grid-cols-2 gap-3 ml-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <div>
                                              <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 block">From (seconds)</label>
                                              <input
                                                type="number"
                                                min={0}
                                                value={editVideoForm.previewStartSeconds}
                                                onChange={(e) => setEditVideoForm({ ...editVideoForm, previewStartSeconds: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1.5 border border-blue-200 rounded-lg text-xs focus:outline-none focus:border-orange-500 bg-white"
                                                placeholder="0"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 block">To (seconds, optional)</label>
                                              <input
                                                type="number"
                                                min={0}
                                                value={editVideoForm.previewEndSeconds || ''}
                                                onChange={(e) => setEditVideoForm({ ...editVideoForm, previewEndSeconds: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1.5 border border-blue-200 rounded-lg text-xs focus:outline-none focus:border-orange-500 bg-white"
                                                placeholder="end of video"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex gap-2">
                                          <button onClick={() => handleUpdateVideo(video.id)} className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600">Save</button>
                                          <button onClick={() => setEditingVideoId(null)} className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Video row */
                                      <div className="flex items-center gap-3 p-3 hover:bg-gray-50/80 transition-colors">
                                        {/* Thumbnail */}
                                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center relative">
                                          {video.thumbnailUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={video.thumbnailUrl}
                                              alt={video.title}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <FileVideo className="w-5 h-5 text-gray-400" />
                                          )}
                                          {/* Overlay play button */}
                                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                            <button
                                              onClick={() => handlePreviewVideo(video)}
                                              disabled={!!previewLoadingId}
                                              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                              title="Preview video"
                                            >
                                              {previewLoadingId === video.id
                                                ? <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                                                : <Play className="w-4 h-4 text-orange-600 ml-0.5" />}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                            <span className="text-gray-400 text-xs font-bold mr-1.5">
                                              {sIdx + 1}.{vIdx + 1}
                                            </span>
                                            {video.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            {video.durationSeconds > 0 && (
                                              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                                                <Clock className="w-3 h-3" /> {formatDuration(video.durationSeconds)}
                                              </span>
                                            )}
                                            {video.isPreview && (
                                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold border border-blue-100">
                                                PREVIEW
                                              </span>
                                            )}
                                            {!video.isPublished && (
                                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded font-bold border border-yellow-100">
                                                DRAFT
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                          <button
                                            onClick={() => handlePreviewVideo(video)}
                                            disabled={!!previewLoadingId}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100"
                                            title="Preview"
                                          >
                                            {previewLoadingId === video.id
                                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              : <Play className="w-3.5 h-3.5" />}
                                          </button>
                                          <button
                                            onClick={() => handleToggleVideoPublish(video.id, video.isPublished)}
                                            className={`p-1.5 rounded-lg transition-all border ${
                                              video.isPublished
                                                ? 'text-green-600 border-green-100 bg-green-50 hover:bg-green-100'
                                                : 'text-gray-400 border-gray-100 bg-white hover:bg-gray-50'
                                            }`}
                                            title={video.isPublished ? 'Unpublish' : 'Publish'}
                                          >
                                            {video.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingVideoId(video.id);
                                              setEditVideoForm({
                                                title: video.title,
                                                description: video.description || '',
                                                isPreview: video.isPreview,
                                                previewStartSeconds: video.previewStartSeconds || 0,
                                                previewEndSeconds: video.previewEndSeconds || 0,
                                              });
                                            }}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                            title="Edit"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteVideo(video.id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add section button */}
                      <button
                        onClick={() => { setEditingSectionId('new-empty'); setCurriculumNewSection(''); }}
                        className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold text-sm hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Section
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          CREATE COURSE MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">New Course</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Title *</label>
                <input
                  className={INPUT}
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Technical Analysis Masterclass"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                />
              </div>
              <div>
                <MarkdownEditor
                  label="Description"
                  value={createForm.description}
                  onChange={(v) => setCreateForm({ ...createForm, description: v })}
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className={INPUT}
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    placeholder="0 = free"
                  />
                </div>
                <div>
                  <label className={LABEL}>Difficulty</label>
                  <select
                    className={INPUT}
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value })}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateCourse}
                disabled={createLoading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mt-2"
              >
                {createLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating…</> : <><Plus className="w-5 h-5" /> Create Course</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          EDIT COURSE MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Edit Course</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Title *</label>
                <input
                  className={INPUT}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <MarkdownEditor
                  label="Description"
                  value={editForm.description}
                  onChange={(v) => setEditForm({ ...editForm, description: v })}
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className={INPUT}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="0 = free"
                  />
                </div>
                <div>
                  <label className={LABEL}>Difficulty</label>
                  <select
                    className={INPUT}
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleEditCourse}
                disabled={editLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors mt-2"
              >
                {editLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : <><CheckCircle className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

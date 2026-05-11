'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/apiClient';
import {
  Loader2, UploadCloud, CheckCircle, AlertTriangle, FileVideo,
  Image as ImageIcon, FileText, Copy, BookOpen, Play, Plus, X,
  Trash2, Eye, EyeOff, Star, Users, Layers, Edit3, GripVertical
} from 'lucide-react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'courses' or 'upload' or 'curriculum'
  const [activeTab, setActiveTab] = useState<'courses' | 'upload' | 'curriculum'>('courses');

  // Course creation modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Upload state
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadStep, setUploadStep] = useState<'upload' | 'review'>('upload');
  const [reviewVideo, setReviewVideo] = useState<any | null>(null);

  // Video metadata state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Curriculum Manager state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoForm, setEditVideoForm] = useState({ title: '', description: '', isPreview: false });

  const loadCourses = async () => {
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
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const updated = courses.find(c => c.id === selectedCourse.id);
      if (updated) setSelectedCourse(updated);
    }
  }, [courses]);

  const handleCreateCourse = async () => {
    setCreateError('');
    if (!createForm.title.trim()) { setCreateError('Title is required'); return; }
    setCreateLoading(true);
    try {
      await api.dataPool.admin.createCourse({
        title: createForm.title,
        description: createForm.description,
        price: parseFloat(createForm.price) || 0,
        difficulty: createForm.difficulty,
      });
      setShowCreate(false);
      setCreateForm({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
      loadCourses();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      await api.dataPool.admin.updateCourse(courseId, { isPublished: !isPublished });
      loadCourses();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update course');
    }
  };

  const handleToggleFeatured = async (courseId: string, isFeatured: boolean) => {
    try {
      await api.dataPool.admin.updateCourse(courseId, { isFeatured: !isFeatured });
      loadCourses();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this course? Courses with enrollments will be unpublished instead.')) return;
    try {
      await api.dataPool.admin.deleteCourse(courseId);
      loadCourses();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete course');
    }
  };

  // Curriculum Handlers
  const handleCreateEmptySection = async () => {
    if (!newSectionTitle.trim() || !selectedCourse) return;
    try {
      await api.dataPool.admin.createSection({ courseId: selectedCourse.id, title: newSectionTitle });
      setNewSectionTitle('');
      setEditingSectionId(null);
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateSection = async (sectionId: string) => {
    try {
      await api.dataPool.admin.updateSection(sectionId, { title: editSectionTitle });
      setEditingSectionId(null);
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete section and all its videos?')) return;
    try {
      await api.dataPool.admin.deleteSection(sectionId);
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateVideo = async (videoId: string) => {
    try {
      await api.dataPool.admin.updateVideo(videoId, { ...editVideoForm });
      setEditingVideoId(null);
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.dataPool.admin.deleteVideo(videoId);
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleVideoPublish = async (videoId: string, isPublished: boolean) => {
    try {
      await api.dataPool.admin.updateVideo(videoId, { isPublished: !isPublished });
      loadCourses();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpload = async () => {
    if (!selectedCourse || !videoFile || !thumbnailFile || !videoTitle.trim()) {
      setUploadError('Please fill out all fields and select both video and thumbnail files.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError('');
      setUploadSuccess('');

      // 1. Get Video Upload URL
      const vFolder = isPreview ? 'preview_videos' : 'full_videos';
      const { data: vData } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id,
        vFolder,
        videoFile.name,
        videoFile.type
      );
      const { uploadUrl: vUploadUrl, publicUrl: vPublicUrl, fileKey: vFileKey } = vData;

      // 2. XHR for Video with progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', vUploadUrl, true);
      xhr.setRequestHeader('Content-Type', videoFile.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 90)); // 90% for video
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            setUploadProgress(95);
            // 3. Upload Thumbnail
            const { data: tData } = await api.dataPool.admin.getUploadUrl(
              selectedCourse.id,
              'thumbnails',
              thumbnailFile.name,
              thumbnailFile.type
            );
            
            await fetch(tData.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': thumbnailFile.type },
              body: thumbnailFile
            });

            setUploadProgress(98);

            // 4. Create Section if needed
            let secId = selectedSectionId;
            if (secId === 'new') {
              const secRes = await api.dataPool.admin.createSection({ courseId: selectedCourse.id, title: newSectionTitle });
              secId = secRes.data.id;
            }

            // 5. Create Video in DB
            const vidRes = await api.dataPool.admin.createVideo({
              courseId: selectedCourse.id,
              sectionId: secId,
              title: videoTitle,
              description: videoDescription,
              s3Key: vFileKey,
              isPreview,
              thumbnailUrl: tData.publicUrl
            });

            setUploadProgress(100);
            setUploadSuccess('Upload successful!');
            setUploading(false);
            
            setReviewVideo({
              ...vidRes.data,
              publicUrl: vPublicUrl,
              thumbnailUrl: tData.publicUrl
            });
            setUploadStep('review');
            loadCourses();
          } catch (err: any) {
            setUploading(false);
            setUploadError(err.message || 'Failed to save video details');
          }
        } else {
          setUploading(false);
          setUploadError(`Upload failed with status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setUploadError('An error occurred during upload.');
        setUploading(false);
      };

      xhr.send(videoFile);

    } catch (err: any) {
      console.error('Upload flow error:', err);
      setUploadError(err?.message || 'Failed to initialize upload.');
      setUploading(false);
    }
  };

  const handlePublishReview = async () => {
    if (!reviewVideo) return;
    try {
      await api.dataPool.admin.updateVideo(reviewVideo.id, { isPublished: true });
      alert('Video published successfully!');
      setReviewVideo(null);
      setUploadStep('upload');
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoTitle('');
      setVideoDescription('');
      loadCourses();
    } catch (err: any) {
      alert(err.message);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-[40px] font-extrabold text-on-surface font-headline-md tracking-tight">Course Management</h2>
        <p className="text-lg text-gray-500 mt-2 font-medium">Manage courses, upload media, and control publishing status.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'courses' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'upload' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <UploadCloud className="w-4 h-4 inline mr-2" />
          Media Upload
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'curriculum' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Curriculum
        </button>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); }}
          className="ml-auto px-6 py-3 rounded-xl font-bold text-sm bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-lg">No courses yet</p>
              <p className="text-sm mt-1">Click &quot;Create Course&quot; to add your first course.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30 text-[11px] text-gray-400 uppercase tracking-[0.15em] font-black">
                    <th className="px-8 py-5">Course</th>
                    <th className="px-6 py-5">Difficulty</th>
                    <th className="px-6 py-5">Price</th>
                    <th className="px-6 py-5">Stats</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {course.thumbnailUrl ? (
                            <Image
                              src={course.thumbnailUrl}
                              alt={course.title}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover w-12 h-12"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-orange-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{course.totalVideos} videos · {course.totalSections} sections</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          course.difficulty === 'BEGINNER' ? 'bg-green-50 text-green-600' :
                          course.difficulty === 'INTERMEDIATE' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-700">
                        {course.price > 0 ? `₹${course.price}` : <span className="text-green-600">Free</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.totalEnrolled}</span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {course.averageRating || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-xs font-bold text-gray-600">{course.isPublished ? 'Published' : 'Draft'}</span>
                          {course.isFeatured && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">FEATURED</span>}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(course.id, course.isPublished)}
                            className={`p-2 rounded-lg transition-all ${course.isPublished ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'}`}
                            title={course.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(course.id, course.isFeatured)}
                            className={`p-2 rounded-lg transition-all ${course.isFeatured ? 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`}
                            title={course.isFeatured ? 'Remove Featured' : 'Set Featured'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedCourse(course); setActiveTab('upload'); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Upload media"
                          >
                            <UploadCloud className="w-4 h-4" />
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

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-gray-100 flex flex-col h-[70vh] overflow-hidden">
            <h3 className="font-bold text-lg mb-4">Select Course</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {courses.length > 0 ? courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setUploadSuccess('');
                    setUploadError('');
                    setUploadProgress(0);
                    if (course.sections && course.sections.length > 0) {
                      setSelectedSectionId(course.sections[0].id);
                    } else {
                      setSelectedSectionId('new');
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex gap-4 items-center ${
                    selectedCourse?.id === course.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                  }`}
                >
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover w-12 h-12"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-on-surface line-clamp-1">{course.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{course.totalVideos} Videos</p>
                  </div>
                </button>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">No courses found.</p>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <UploadCloud className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">Select a course to manage media</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-on-surface">{selectedCourse.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">ID: {selectedCourse.id}</p>
                </div>

                {/* Inner Tabs for Media Upload */}
                <div className="flex gap-4 mb-8 border-b border-gray-100 pb-2">
                  <button
                    onClick={() => setUploadStep('upload')}
                    className={`pb-2 font-bold transition-all ${uploadStep === 'upload' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Upload Media
                  </button>
                  <button
                    onClick={() => setUploadStep('review')}
                    className={`pb-2 font-bold transition-all ${uploadStep === 'review' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Review and Publish
                  </button>
                </div>

                {uploadStep === 'upload' ? (
                  <div className="space-y-6">
                    <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-700">Video Details</h4>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Section</label>
                        <select
                          value={selectedSectionId}
                          onChange={(e) => setSelectedSectionId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors cursor-pointer"
                        >
                          <option value="" disabled>Select a section</option>
                          {selectedCourse.sections?.map((sec: any) => (
                            <option key={sec.id} value={sec.id}>{sec.title}</option>
                          ))}
                          <option value="new">+ Create New Section</option>
                        </select>
                      </div>
                      {selectedSectionId === 'new' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">New Section Title</label>
                          <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="e.g. Module 1: Introduction"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Video Title</label>
                        <input
                          type="text"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          placeholder="e.g. 1. Welcome to the Course"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Description (Optional)</label>
                        <textarea
                          value={videoDescription}
                          onChange={(e) => setVideoDescription(e.target.value)}
                          placeholder="Short description of the video..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors resize-none h-20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPreview"
                          checked={isPreview}
                          onChange={(e) => setIsPreview(e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                        />
                        <label htmlFor="isPreview" className="text-xs font-bold text-gray-600 cursor-pointer">
                          Is this a Preview Video? (Can be watched before purchasing)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Video File</label>
                        <input
                          type="file"
                          accept="video/mp4,video/x-m4v,video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                        />
                        {videoFile && (
                          <p className="text-xs text-gray-500 mt-2">
                            {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Thumbnail</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                        />
                        {thumbnailFile && (
                          <p className="text-xs text-gray-500 mt-2">
                            {thumbnailFile.name} ({(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleUpload}
                        disabled={!videoFile || !thumbnailFile || uploading || !videoTitle || (selectedSectionId === 'new' && !newSectionTitle) || !selectedSectionId}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading ({uploadProgress.toFixed(0)}%)...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-5 h-5" />
                            Upload Media
                          </>
                        )}
                      </button>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        {uploadError}
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="p-6 bg-green-50 border border-green-200 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 text-green-700">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <p className="font-bold">{uploadSuccess}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {!reviewVideo ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <EyeOff className="w-16 h-16 mb-4 opacity-50" />
                        <p className="font-medium">No video to review.</p>
                        <p className="text-sm">Upload a video first to review and publish it.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg border border-gray-800">
                          <video 
                            src={reviewVideo.publicUrl} 
                            poster={reviewVideo.thumbnailUrl}
                            controls 
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xl font-black text-gray-900">{reviewVideo.title}</h4>
                              {reviewVideo.description && (
                                <p className="text-sm text-gray-600 mt-2">{reviewVideo.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-4">
                                <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-700 rounded uppercase">
                                  Section ID: {reviewVideo.sectionId}
                                </span>
                                {reviewVideo.isPreview && (
                                  <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase">
                                    Preview Video
                                  </span>
                                )}
                                <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded uppercase">
                                  Unpublished
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handlePublishReview}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Approve and Publish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curriculum Tab */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course List */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-gray-100 flex flex-col h-[70vh] overflow-hidden">
            <h3 className="font-bold text-lg mb-4">Select Course</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {courses.length > 0 ? courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setEditingSectionId(null);
                    setEditingVideoId(null);
                    if (course.sections && course.sections.length > 0) {
                      setSelectedSectionId(course.sections[0].id);
                    } else {
                      setSelectedSectionId('new');
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex gap-4 items-center ${
                    selectedCourse?.id === course.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                  }`}
                >
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover w-12 h-12"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-on-surface line-clamp-1">{course.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{course.totalSections} Sections</p>
                  </div>
                </button>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">No courses found.</p>
              )}
            </div>
          </div>

          {/* Curriculum Editor */}
          <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] shadow-sm border border-gray-100 h-[70vh] overflow-y-auto custom-scrollbar">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <Layers className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium">Select a course to manage its curriculum</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-on-surface">{selectedCourse.title} - Curriculum</h3>
                    <p className="text-gray-500 text-sm mt-1">{selectedCourse.sections?.length || 0} Sections</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-orange-100 text-orange-700 font-bold text-sm rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    + Upload New Video
                  </button>
                </div>

                {editingSectionId === 'new-empty' && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                    <input 
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-500"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="e.g. Module 1: Introduction"
                    />
                    <button onClick={handleCreateEmptySection} disabled={!newSectionTitle.trim()} className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50">Save</button>
                    <button onClick={() => { setEditingSectionId(null); setNewSectionTitle(''); }} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                  </div>
                )}

                <div className="space-y-6">
                  {!selectedCourse.sections || selectedCourse.sections.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                      <p className="font-medium">No sections yet</p>
                      <button onClick={() => { setEditingSectionId('new-empty'); setNewSectionTitle(''); }} className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        + Create First Section
                      </button>
                    </div>
                  ) : (
                    <>
                      {selectedCourse.sections.map((section: any) => (
                      <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Section Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between group">
                          {editingSectionId === section.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-4">
                              <input 
                                type="text"
                                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-bold focus:outline-none focus:border-orange-500"
                                value={editSectionTitle}
                                onChange={(e) => setEditSectionTitle(e.target.value)}
                              />
                              <button onClick={() => handleUpdateSection(section.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">Save</button>
                              <button onClick={() => setEditingSectionId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                              <h4 className="font-bold text-gray-800">{section.title}</h4>
                            </div>
                          )}
                          
                          {editingSectionId !== section.id && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingSectionId(section.id); setEditSectionTitle(section.title); }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded bg-white border border-gray-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSection(section.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-white border border-gray-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Videos List */}
                        <div className="p-2 space-y-2 bg-gray-50/30">
                          {!section.videos || section.videos.length === 0 ? (
                            <p className="text-xs text-gray-400 p-2 italic text-center">No videos in this section</p>
                          ) : (
                            section.videos.map((video: any) => (
                              <div key={video.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group">
                                {editingVideoId === video.id ? (
                                  <div className="flex-1 space-y-3 mr-4">
                                    <input 
                                      type="text"
                                      placeholder="Video Title"
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-bold focus:outline-none focus:border-orange-500"
                                      value={editVideoForm.title}
                                      onChange={(e) => setEditVideoForm({...editVideoForm, title: e.target.value})}
                                    />
                                    <textarea 
                                      placeholder="Description"
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-orange-500 resize-none h-16"
                                      value={editVideoForm.description}
                                      onChange={(e) => setEditVideoForm({...editVideoForm, description: e.target.value})}
                                    />
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                                      <input 
                                        type="checkbox"
                                        checked={editVideoForm.isPreview}
                                        onChange={(e) => setEditVideoForm({...editVideoForm, isPreview: e.target.checked})}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                      />
                                      Is Preview Video?
                                    </label>
                                    <div className="flex gap-2 pt-2">
                                      <button onClick={() => handleUpdateVideo(video.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">Save Video</button>
                                      <button onClick={() => setEditingVideoId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5">
                                        <FileVideo className="w-4 h-4 text-orange-400" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-700">{video.title}</p>
                                        <div className="flex gap-2 items-center mt-1">
                                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                            {Math.floor(video.durationSeconds / 60)}:{(video.durationSeconds % 60).toString().padStart(2, '0')}
                                          </span>
                                          {video.isPreview && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                                              PREVIEW
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleToggleVideoPublish(video.id, video.isPublished)}
                                        className={`p-1.5 rounded border transition-colors ${video.isPublished ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : 'text-gray-400 border-gray-200 bg-white hover:bg-gray-50'}`}
                                        title={video.isPublished ? 'Unpublish Video' : 'Publish Video'}
                                      >
                                        {video.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                      </button>
                                      <button 
                                        onClick={() => { setEditingVideoId(video.id); setEditVideoForm({ title: video.title, description: video.description || '', isPreview: video.isPreview }); }}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded bg-white border border-gray-200"
                                        title="Edit Video"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteVideo(video.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 rounded bg-white border border-gray-200"
                                        title="Delete Video"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      ))}
                      
                      <button 
                        onClick={() => { setEditingSectionId('new-empty'); setNewSectionTitle(''); }}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Add New Section
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-on-surface">Create New Course</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {createError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Title *</label>
                <input className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="e.g. Technical Analysis Masterclass" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">Description</label>
                <textarea className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30 resize-none h-24" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Course description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">Price (₹)</label>
                  <input type="number" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30" value={createForm.price} onChange={e => setCreateForm({ ...createForm, price: e.target.value })} placeholder="0 for free" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-1">Difficulty</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer" value={createForm.difficulty} onChange={e => setCreateForm({ ...createForm, difficulty: e.target.value })}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCreateCourse} disabled={createLoading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                {createLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><Plus className="w-5 h-5" /> Create Course</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

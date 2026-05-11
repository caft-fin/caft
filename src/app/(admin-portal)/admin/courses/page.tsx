'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/apiClient';
import {
  Loader2, UploadCloud, CheckCircle, AlertTriangle, FileVideo,
  Image as ImageIcon, FileText, Copy, BookOpen, Play, Plus, X,
  Trash2, Eye, EyeOff, Star, Users
} from 'lucide-react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state: 'courses' or 'upload'
  const [activeTab, setActiveTab] = useState<'courses' | 'upload'>('courses');

  // Course creation modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', price: '', difficulty: 'BEGINNER' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Upload state
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState<'thumbnails' | 'preview_videos' | 'full_videos' | 'certificates'>('full_videos');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

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

  const handleUpload = async () => {
    if (!selectedCourse || !file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError('');
      setUploadSuccess('');
      setUploadedUrl('');

      const { data } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id,
        folder,
        file.name,
        file.type
      );

      const { uploadUrl, publicUrl } = data;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadSuccess('File uploaded successfully!');
          setUploadedUrl(publicUrl);
          setFile(null);
        } else {
          setUploadError(`Upload failed with status: ${xhr.status}`);
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setUploadError('An error occurred during upload.');
        setUploading(false);
      };

      xhr.send(file);

    } catch (err: any) {
      console.error('Upload flow error:', err);
      setUploadError(err?.message || 'Failed to initialize upload.');
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    alert('URL copied to clipboard!');
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
                    setUploadedUrl('');
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

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload Destination</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'full_videos', label: 'Full Video', icon: FileVideo },
                        { id: 'preview_videos', label: 'Preview Video', icon: Play },
                        { id: 'thumbnails', label: 'Thumbnail', icon: ImageIcon },
                        { id: 'certificates', label: 'Certificate', icon: FileText },
                      ].map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setFolder(type.id as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                              folder === type.id
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6 mb-2" />
                            <span className="text-xs font-bold">{type.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select File</label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                    />
                    {file && (
                      <p className="text-xs text-gray-500 mt-2">
                        Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
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
                          Upload to S3
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
                      
                      {uploadedUrl && (
                        <div className="bg-white p-3 rounded-lg border border-green-100 flex items-center justify-between gap-4">
                          <input
                            type="text"
                            readOnly
                            value={uploadedUrl}
                            className="w-full text-xs text-gray-500 bg-transparent outline-none"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
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

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import { Loader2, UploadCloud, CheckCircle, AlertTriangle, FileVideo, Image as ImageIcon, FileText, Copy, BookOpen, Play } from 'lucide-react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const res = await api.dataPool.listCourses();
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

  const handleUpload = async () => {
    if (!selectedCourse || !file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError('');
      setUploadSuccess('');
      setUploadedUrl('');

      // 1. Get Presigned URL
      const { data } = await api.dataPool.admin.getUploadUrl(
        selectedCourse.id,
        folder,
        file.name,
        file.type
      );

      const { uploadUrl, publicUrl } = data;

      // 2. Upload to S3
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
      <header className="mb-10">
        <h2 className="text-[40px] font-extrabold text-on-surface font-headline-md tracking-tight">Course Media Management</h2>
        <p className="text-lg text-gray-500 mt-2 font-medium">Upload videos, thumbnails, and certificates to AWS S3 directly.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

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
              <p className="text-gray-500 text-sm text-center py-4">No published courses found.</p>
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
    </>
  );
}

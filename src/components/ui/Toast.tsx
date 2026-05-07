'use client';

import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────
// CAFT Financial — Toast Notification System
// Premium, animated toast notifications for payment status
// ─────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // 0 = persistent
  dismissible?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider — returns no-ops
    return {
      addToast: () => '',
      removeToast: () => {},
      updateToast: () => {},
      toast: {
        success: (title: string, message?: string) => { console.log('✅', title, message); },
        error: (title: string, message?: string) => { console.error('❌', title, message); },
        warning: (title: string, message?: string) => { console.warn('⚠️', title, message); },
        info: (title: string, message?: string) => { console.info('ℹ️', title, message); },
        loading: (title: string, message?: string) => { console.log('⏳', title, message); return ''; },
      },
    };
  }

  const toast = {
    success: (title: string, message?: string) =>
      context.addToast({ type: 'success', title, message, duration: 5000 }),
    error: (title: string, message?: string) =>
      context.addToast({ type: 'error', title, message, duration: 8000 }),
    warning: (title: string, message?: string) =>
      context.addToast({ type: 'warning', title, message, duration: 6000 }),
    info: (title: string, message?: string) =>
      context.addToast({ type: 'info', title, message, duration: 5000 }),
    loading: (title: string, message?: string) =>
      context.addToast({ type: 'loading', title, message, duration: 0, dismissible: false }),
  };

  return { ...context, toast };
}

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const STYLE_MAP = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-500',
    title: 'text-emerald-800',
    message: 'text-emerald-600',
    progress: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-600',
    progress: 'bg-red-400',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-600',
    progress: 'bg-amber-400',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-600',
    progress: 'bg-blue-400',
  },
  loading: {
    bg: 'bg-gradient-to-r from-violet-50 to-purple-50',
    border: 'border-violet-200',
    icon: 'text-violet-500',
    title: 'text-violet-800',
    message: 'text-violet-600',
    progress: 'bg-violet-400',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const style = STYLE_MAP[toast.type];
  const Icon = ICON_MAP[toast.type];
  const dismissible = toast.dismissible !== false;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  }, [onRemove]);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, handleDismiss]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm
        ${style.bg} ${style.border}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        max-w-sm w-full pointer-events-auto
      `}
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
          <Icon className={`w-5 h-5 ${toast.type === 'loading' ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.title}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-xs mt-0.5 ${style.message} leading-relaxed`}>{toast.message}</p>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-0.5 w-full bg-black/5">
          <div
            className={`h-full ${style.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Toast Animations */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
        .animate-slide-out-right {
          animation: slide-out-right 0.3s ease-in forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

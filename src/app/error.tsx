'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-on-surface-variant mb-8 max-w-md">
        We encountered an unexpected error while processing your request. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}

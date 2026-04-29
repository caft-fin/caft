export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      <p className="text-on-surface-variant font-medium animate-pulse">Loading data...</p>
    </div>
  );
}

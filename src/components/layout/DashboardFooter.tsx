import Link from 'next/link';

export function DashboardFooter() {
  return (
    <footer className="w-full py-8 px-8 border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-500">© 2026 CAFT Financial Services. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Terms of Service</Link>
          <Link href="/help-center" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Help Center</Link>
          <Link href="/about" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Contact Support</Link>
        </div>
      </div>
    </footer>
  );
}

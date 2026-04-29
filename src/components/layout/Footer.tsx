import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white">
      <div className="flex flex-col gap-8 max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <div className="text-xl font-bold text-orange-600 mb-4 font-headline-sm">CAFT Financial</div>
            <p className="text-gray-500 font-button text-xs leading-relaxed">
              Modern banking solutions tailored for the next generation of financial leaders. Member FDIC. Equal Housing Lender.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-on-surface font-bold text-sm mb-2">Platform</span>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Wealth Management</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Personal Banking</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Investment</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-on-surface font-bold text-sm mb-2">Company</span>
              <Link href="/about" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">About Us</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Careers</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Security</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-on-surface font-bold text-sm mb-2">Support</span>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Help Center</Link>
              <Link href="/about" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Contact Us</Link>
              <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Status</Link>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Terms of Service</Link>
            <Link href="#" className="text-gray-500 text-xs hover:text-orange-500 underline underline-offset-4 transition-all">Financial Disclosures</Link>
          </div>
          <p className="text-gray-500 font-button text-xs leading-relaxed">© 2024 CAFT Financial Services. Investment products are not insured by the FDIC.</p>
        </div>
      </div>
    </footer>
  );
}

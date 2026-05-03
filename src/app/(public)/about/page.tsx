import { GlassCard } from "@/components/ui/GlassCard";
import { Users, MapPin, Mail, Phone } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-container rounded-full blur-[100px]"></div>
        </div>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">About & Contact</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg">
          We are redefining wealth management with optimistic professionalism. Connect with our team to start your financial journey.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 pb-stack-lg grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* About Info */}
        <div className="space-y-stack-md">
          <GlassCard className="p-8 rounded-xl tonal-shadow">
            <h2 className="font-headline-md text-2xl mb-4">Our Mission</h2>
            <p className="text-on-surface-variant font-body-md mb-6 leading-relaxed">
              At CAFT Financial, we believe that accessible financial strategies and clear market insights shouldn&apos;t be limited to the ultra-wealthy. We are building intelligent tools to distill complex financial data into beautiful, actionable insights that help you stay ahead of the curve.
            </p>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center">
                <Users className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">50,000+ Active Users</p>
                <p className="text-sm text-gray-500">Trusting us with their financial future.</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="p-8 rounded-xl tonal-shadow">
            <h2 className="font-headline-md text-2xl mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <MapPin className="text-primary w-5 h-5" />
                <p className="text-on-surface-variant">123 Financial District, Tech Hub, NY 10001</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-primary w-5 h-5" />
                <p className="text-on-surface-variant">support@caftfinancial.com</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-primary w-5 h-5" />
                <p className="text-on-surface-variant">+1 (800) 123-4567</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Contact Form */}
        <GlassCard className="p-8 rounded-xl tonal-shadow h-full flex flex-col">
          <h2 className="font-headline-md text-2xl mb-6">Send us a message</h2>
          <form className="space-y-4 flex-grow flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label-md text-sm text-on-surface-variant">First Name</label>
                <input className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container outline-none" type="text" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-sm text-on-surface-variant">Last Name</label>
                <input className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container outline-none" type="text" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-sm text-on-surface-variant">Email</label>
              <input className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container outline-none" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2 flex-grow flex flex-col">
              <label className="font-label-md text-sm text-on-surface-variant">Message</label>
              <textarea className="w-full bg-[#F9F9F9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container outline-none flex-grow resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full sun-gradient text-white font-button py-4 rounded-xl shadow-lg hover:translate-y-[-2px] active:scale-[0.98] transition-all mt-4" type="button">
              Send Message
            </button>
          </form>
        </GlassCard>
      </section>
    </>
  );
}

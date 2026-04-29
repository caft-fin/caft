export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-48 -left-24 w-72 h-72 bg-tertiary-container/10 rounded-full blur-3xl"></div>
      </div>
      {children}
    </div>
  );
}

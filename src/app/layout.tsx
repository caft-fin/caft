import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAFT Financial",
  description: "Secure your future with Optimistic Professionalism.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} antialiased light`}
    >
      <head>
        {/* Material Symbols removed in favor of lucide-react */}
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-background font-body-md selection:bg-primary-container selection:text-on-primary-container">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UCLA Class Tracker - Get Notified When Classes Open",
  description: "Track UCLA class enrollment status and get instant email notifications when spots open up. Never miss a class again.",
  keywords: ["UCLA", "class tracker", "enrollment", "waitlist", "notifications"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <nav className="border-b border-[var(--border)] bg-[var(--background)]">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-2xl">🐻</span>
              <span className="text-[var(--ucla-blue)]">UCLA Class Tracker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/track" 
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Track a Class
              </Link>
              <Link 
                href="/manage" 
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Manage Trackers
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-[var(--border)] mt-auto py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-[var(--muted)] text-sm">
            <p>
              Not affiliated with UCLA.
            </p>
            <p className="mt-2">
              <a 
                href="https://github.com/shloakr/visualping-local" 
                className="hover:text-[var(--foreground)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

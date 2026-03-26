import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Kroolla Dashboard Client",
  description: "Video transcription client MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-sm font-semibold text-zinc-900">
              Kroolla Transcriber
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-zinc-700 hover:text-zinc-900">
                Home
              </Link>
              <Link href="/submit" className="text-zinc-700 hover:text-zinc-900">
                Submit
              </Link>
              <Link href="/jobs" className="text-zinc-700 hover:text-zinc-900">
                Jobs
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  title: {
    default: "metodic.education - Free Facilitation Resources",
    template: "%s | metodic.education",
  },
  description:
    "Free resources for session leaders. Learn facilitation methods, solve common workshop problems, and design better sessions.",
  keywords: [
    "facilitation",
    "workshop",
    "meeting",
    "session design",
    "team problems",
    "decision making",
    "collaboration",
    "methods",
  ],
  authors: [{ name: "Metodic" }],
  creator: "Metodic",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://metodic.education",
    siteName: "metodic.education",
    title: "metodic.education - Free Facilitation Resources",
    description:
      "Free resources for session leaders. Learn facilitation methods, solve common workshop problems, and design better sessions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "metodic.education - Free Facilitation Resources",
    description:
      "Free resources for session leaders. Learn facilitation methods, solve common workshop problems, and design better sessions.",
    creator: "@metodic_io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script'
import { Toaster } from 'sonner'
import { Providers } from './providers'
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
  title: "ZapForm Analytics - Privacy-First Web Analytics",
  description: "Track and analyze your website visitors with powerful, privacy-focused analytics. GDPR-compliant analytics platform for modern websites.",
  keywords: ["web analytics", "privacy-focused analytics", "GDPR compliant", "website tracking", "user analytics"],
  authors: [{ name: "ZapForm" }],
  creator: "ZapForm",
  publisher: "ZapForm",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://analytics.zapform.ai',
    title: 'ZapForm Analytics',
    description: 'Privacy-first web analytics platform',
    siteName: 'ZapForm Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZapForm Analytics',
    description: 'Privacy-first web analytics platform',
  },
  // verification: {
  //   google: 'google-site-verification-token', // You'll need to replace this after adding your site to Search Console
  // },
};

// TODO: Replace with your actual tracking ID from the dashboard
const TRACKING_ID = 'cmj9s8xue00062d20ihhnxtv6'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Zapform Analytics Tracking Script */}
        {TRACKING_ID  && (
          <Script
            src={`/api/tracking-script/${TRACKING_ID}`}
            strategy="afterInteractive"
          />
        )}

        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

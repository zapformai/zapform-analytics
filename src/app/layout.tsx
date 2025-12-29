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
  title: "ZapForm Analytics",
  description: "Track and analyze your website visitors with powerful, privacy-focused analytics",
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

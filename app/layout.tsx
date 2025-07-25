import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Assistance AI Agents - Enterprise Decision Intelligence",
  description: "AI-powered executive boardroom simulation for strategic decision-making with intelligent agents and real-time analytics",
  generator: 'Next.js',
  applicationName: 'Business AI Decision Platform',
  referrer: 'origin-when-cross-origin',
  keywords: ['AI', 'business intelligence', 'decision making', 'executive boardroom', 'strategic planning'],
  authors: [{ name: 'Business AI Team' }],
  creator: 'Business AI Platform',
  publisher: 'Business AI Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://business-ai-agents.com'),
  openGraph: {
    title: 'Business Assistance AI Agents',
    description: 'AI-powered executive boardroom simulation for strategic decision-making',
    url: 'https://business-ai-agents.com',
    siteName: 'Business AI Platform',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <meta name="theme-color" content="#45A29E" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

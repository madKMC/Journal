'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My Journal - Capture Your Thoughts',
  description: 'A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey with our secure, private journaling platform.',
  keywords: 'journal, diary, thoughts, memories, mood tracking, writing, reflection, personal growth, mindfulness, daily journal',
  authors: [{ name: 'My Journal App' }],
  robots: 'index, follow',
  themeColor: '#d4e2d4',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    type: 'website',
    url: 'https://myjournal.app/',
    title: 'My Journal - Capture Your Thoughts',
    description: 'A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'My Journal App'
      }
    ],
    siteName: 'My Journal',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Journal - Capture Your Thoughts',
    description: 'A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey.',
    images: ['/twitter-image.png'],
    creator: '@myjournal'
  },
  other: {
    'application-name': 'My Journal',
    'apple-mobile-web-app-title': 'My Journal',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#d4e2d4'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "My Journal",
              "description": "A beautiful journal app to capture and organize your daily thoughts and memories",
              "url": "https://myjournal.app",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "My Journal Team"
              }
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
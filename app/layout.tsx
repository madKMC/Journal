'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Basic Meta Tags */}
        <title>My Journal - Capture Your Thoughts</title>
        <meta name="description" content="A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey with our secure, private journaling platform." />
        <meta name="keywords" content="journal, diary, thoughts, memories, mood tracking, writing, reflection, personal growth, mindfulness, daily journal" />
        <meta name="author" content="My Journal App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#d4e2d4" />
        <meta name="msapplication-TileColor" content="#d4e2d4" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myjournal.app/" />
        <meta property="og:title" content="My Journal - Capture Your Thoughts" />
        <meta property="og:description" content="A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="My Journal" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://myjournal.app/" />
        <meta property="twitter:title" content="My Journal - Capture Your Thoughts" />
        <meta property="twitter:description" content="A beautiful journal app to capture and organize your daily thoughts and memories. Write freely, track your moods, and reflect on your journey." />
        <meta property="twitter:image" content="/twitter-image.png" />
        <meta property="twitter:creator" content="@myjournal" />
        
        {/* Additional SEO */}
        <meta name="application-name" content="My Journal" />
        <meta name="apple-mobile-web-app-title" content="My Journal" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://myjournal.app/" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Structured Data for Rich Snippets */}
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
      </head>
      <body className={inter.className}>
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
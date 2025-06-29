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
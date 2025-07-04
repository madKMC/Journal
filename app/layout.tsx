import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { BoltBadge } from '@/components/ui/bolt-badge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoulScriptJournal - Capture Your Thoughts',
  description: 'A beautiful journal app to capture and organize your daily thoughts and memories with SoulScriptJournal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <BoltBadge />
        </AuthProvider>
      </body>
    </html>
  )
}
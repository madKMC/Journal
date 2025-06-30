'use client'

import { ExternalLink } from 'lucide-react'

export function BoltBadge() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 bg-black/90 hover:bg-black text-white text-xs px-3 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-xl"
      >
        <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-[10px]">⚡</span>
        </div>
        <span className="font-medium">Built by Bolt.new</span>
        <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  )
}
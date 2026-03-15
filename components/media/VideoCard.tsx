'use client'

import Image from 'next/image'
import { useQuote } from '@/context/QuoteContext'
import type { Media } from '@/types'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface VideoCardProps {
  item: Media
  onClick: () => void
}

export default function VideoCard({ item, onClick }: VideoCardProps) {
  const { addItem, removeItem, isInQuote } = useQuote()
  const inQuote = isInQuote(item.id)

  function handleQuoteToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (inQuote) {
      removeItem(item.id)
    } else {
      addItem({
        mediaId: item.id,
        title: item.title,
        type: 'video',
        thumbnail: item.vimeo_thumbnail,
      })
    }
  }

  return (
    <div
      className="media-card group"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {item.vimeo_thumbnail ? (
          <Image
            src={item.vimeo_thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: '#1c2128' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(61,122,92,0.35)' }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(13,17,23,0.85)',
              border: '2px solid #5aab80',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5aab80" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        {item.duration !== null && item.duration !== undefined && (
          <div
            className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: 'rgba(0,0,0,0.75)',
              color: '#e6edf3',
            }}
          >
            {formatDuration(item.duration)}
          </div>
        )}

        {/* Quote button */}
        <button
          onClick={handleQuoteToggle}
          className="absolute bottom-2 right-2 flex items-center justify-center rounded-full w-7 h-7 transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: inQuote ? '#3d7a5c' : 'rgba(0,0,0,0.75)',
            border: `1px solid ${inQuote ? '#5aab80' : '#30363d'}`,
            color: inQuote ? '#ffffff' : '#8b949e',
          }}
          title={inQuote ? 'Remove from quote' : 'Add to quote'}
        >
          {inQuote ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          )}
        </button>

        {/* Title gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2"
          style={{
            background: 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, transparent 100%)',
          }}
        >
          <p
            className="text-xs font-medium truncate"
            style={{ color: '#e6edf3' }}
          >
            {item.title}
          </p>
        </div>
      </div>
    </div>
  )
}

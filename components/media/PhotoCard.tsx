'use client'

import Image from 'next/image'
import { useQuote } from '@/context/QuoteContext'
import { buildWatermarkedUrl } from '@/lib/cloudinary'
import type { Media } from '@/types'

interface PhotoCardProps {
  item: Media
  onClick: () => void
}

export default function PhotoCard({ item, onClick }: PhotoCardProps) {
  const { addItem, removeItem, isInQuote } = useQuote()
  const inQuote = isInQuote(item.id)

  const thumbnailUrl = item.cloudinary_id
    ? buildWatermarkedUrl(item.cloudinary_id, { thumbnail: true })
    : item.cloudinary_url

  function handleQuoteToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (inQuote) {
      removeItem(item.id)
    } else {
      addItem({
        mediaId: item.id,
        title: item.title,
        type: 'photo',
        thumbnail: thumbnailUrl || null,
      })
    }
  }

  return (
    <div
      className="media-card group"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: '#1c2128' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Hover overlay with magnify icon */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: 'rgba(13,17,23,0.85)',
              border: '2px solid #5aab80',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5aab80" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

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
          <p className="text-xs font-medium truncate" style={{ color: '#e6edf3' }}>
            {item.title}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useQuote } from '@/context/QuoteContext'
import { buildWatermarkedUrl } from '@/lib/cloudinary'
import type { Media, Category } from '@/types'

interface PhotoLightboxProps {
  item: Media
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export default function PhotoLightbox({ item, onClose, onPrev, onNext }: PhotoLightboxProps) {
  const { addItem, removeItem, isInQuote } = useQuote()
  const inQuote = isInQuote(item.id)
  const backdropRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const imageUrl = item.cloudinary_id
    ? buildWatermarkedUrl(item.cloudinary_id, { width: 1400 })
    : item.cloudinary_url

  useEffect(() => {
    document.body.classList.add('body-locked')
    return () => document.body.classList.remove('body-locked')
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  function handleQuoteToggle() {
    if (inQuote) {
      removeItem(item.id)
    } else {
      addItem({
        mediaId: item.id,
        title: item.title,
        type: 'photo',
        thumbnail: imageUrl || null,
      })
    }
  }

  const content = (
    <div
      ref={backdropRef}
      className="lightbox-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full rounded-xl overflow-hidden flex flex-col lg:flex-row"
        style={{
          maxWidth: '96vw',
          width: '96vw',
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          height: '92vh',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex items-center justify-center rounded-full w-8 h-8 transition-colors"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#8b949e', border: '1px solid #30363d' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 z-20 flex items-center justify-center rounded-full w-9 h-9 -translate-y-1/2 transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#e6edf3', border: '1px solid #30363d' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-12 top-1/2 z-20 flex items-center justify-center rounded-full w-9 h-9 -translate-y-1/2 transition-colors lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#e6edf3', border: '1px solid #30363d' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}

        {/* Photo (left / top) */}
        <div
          className="flex-1 lg:w-3/4 relative flex items-center justify-center"
          style={{ backgroundColor: '#0d1117', minHeight: '400px' }}
        >
          {imageUrl ? (
            <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
              <Image
                src={imageUrl}
                alt={item.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 75vw"
                priority
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div
          className="lg:w-1/4 overflow-y-auto flex flex-col p-6 gap-5"
          style={{ backgroundColor: '#161b22', maxHeight: '90vh' }}
        >
          <div>
            <h2 className="text-lg font-semibold leading-snug mb-2" style={{ color: '#e6edf3' }}>
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm leading-relaxed" style={{ color: '#8b949e' }}>
                {item.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {item.shot_on && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                </svg>
                <span style={{ color: '#8b949e' }}>{item.shot_on}</span>
              </div>
            )}
          </div>

          {item.categories && item.categories.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#6e7681' }}>
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {item.categories.map((cat: Category) => (
                  <span
                    key={cat.id}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(61,122,92,0.15)',
                      color: '#5aab80',
                      border: '1px solid rgba(61,122,92,0.3)',
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: '#6e7681' }}>
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: '#1c2128', color: '#8b949e', border: '1px solid #30363d' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleQuoteToggle}
            className={inQuote ? 'btn-outline' : 'btn-primary'}
            style={{ marginTop: 'auto' }}
          >
            {inQuote ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                In Quote List
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add to Quote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

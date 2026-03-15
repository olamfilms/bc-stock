'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useQuote } from '@/context/QuoteContext'

interface QuoteDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuoteDrawer({ isOpen, onClose }: QuoteDrawerProps) {
  const { items, removeItem, itemCount } = useQuote()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('body-locked')
    } else {
      document.body.classList.remove('body-locked')
    }
    return () => document.body.classList.remove('body-locked')
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: '360px',
          maxWidth: '100vw',
          backgroundColor: '#161b22',
          borderLeft: '1px solid #30363d',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: '#30363d' }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#e6edf3' }}>
              Quote List
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#8b949e' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3 px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-4xl mb-4">🎬</div>
              <p className="font-medium mb-1" style={{ color: '#e6edf3' }}>
                Nothing here yet
              </p>
              <p className="text-sm" style={{ color: '#8b949e' }}>
                Browse footage and photos and click{' '}
                <span style={{ color: '#5aab80' }}>+</span> to add items.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.mediaId}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: '#0d1117' }}
                >
                  {item.thumbnail ? (
                    <div
                      className="relative flex-shrink-0 rounded overflow-hidden"
                      style={{ width: 70, height: 40 }}
                    >
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="70px"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex-shrink-0 rounded flex items-center justify-center"
                      style={{ width: 70, height: 40, backgroundColor: '#1c2128' }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {item.type === 'video' ? '🎬' : '📷'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#e6edf3' }}>
                      {item.title}
                    </p>
                    <p className="text-xs capitalize" style={{ color: '#8b949e' }}>
                      {item.type}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.mediaId)}
                    className="flex-shrink-0 p-1 rounded transition-colors"
                    style={{ color: '#6e7681' }}
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: '#30363d' }}>
            <Link
              href="/quote"
              className="btn-primary w-full justify-center"
              onClick={onClose}
            >
              Build Quote Request
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}

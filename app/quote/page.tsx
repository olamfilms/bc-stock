'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuote } from '@/context/QuoteContext'
import QuoteForm from '@/components/quote/QuoteForm'

export default function QuotePage() {
  const { items, removeItem } = useQuote()

  return (
    <main
      className="min-h-screen pt-16"
      style={{ backgroundColor: '#0d1117' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: '#e6edf3' }}
          >
            License Request
          </h1>
          <p style={{ color: '#8b949e' }}>
            Submit your licensing inquiry and we&apos;ll get back to you within 1–2 business days.
          </p>
        </div>

        {items.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
          >
            <div className="text-5xl mb-4">🎬</div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: '#e6edf3' }}
            >
              Your quote list is empty
            </h2>
            <p className="mb-6" style={{ color: '#8b949e' }}>
              Browse our footage and photos and add items to your quote list.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/footage" className="btn-primary">
                Browse Footage
              </Link>
              <Link href="/photos" className="btn-outline">
                Browse Photos
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Selected items preview */}
            <div
              className="rounded-xl p-6 mb-8"
              style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
            >
              <h2
                className="text-base font-semibold mb-4"
                style={{ color: '#e6edf3' }}
              >
                Selected Items ({items.length})
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.mediaId}
                    className="flex items-center gap-4 rounded-lg p-3"
                    style={{ backgroundColor: '#0d1117' }}
                  >
                    {item.thumbnail ? (
                      <div
                        className="relative flex-shrink-0 rounded overflow-hidden"
                        style={{ width: 80, height: 45 }}
                      >
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex-shrink-0 rounded flex items-center justify-center"
                        style={{
                          width: 80,
                          height: 45,
                          backgroundColor: '#1c2128',
                        }}
                      >
                        <span style={{ color: '#8b949e', fontSize: 18 }}>
                          {item.type === 'video' ? '🎬' : '📷'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: '#e6edf3' }}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#8b949e' }}>
                        {item.type}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.mediaId)}
                      className="flex-shrink-0 p-1.5 rounded transition-colors"
                      style={{ color: '#8b949e' }}
                      title="Remove from quote"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4">
                <Link href="/footage" style={{ color: '#5aab80', fontSize: 14 }}>
                  + Add more footage
                </Link>
                <Link href="/photos" style={{ color: '#5aab80', fontSize: 14 }}>
                  + Add more photos
                </Link>
              </div>
            </div>

            <QuoteForm />
          </>
        )}
      </div>
    </main>
  )
}

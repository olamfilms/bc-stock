'use client'

import Link from 'next/link'

export default function MediaTypeSelector() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Footage Card */}
      <Link
        href="/footage"
        className="group relative overflow-hidden rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          textDecoration: 'none',
        }}
      >
        {/* Hover glow background */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(61,122,92,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(90,171,128,0.3)' }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-xl mb-5 transition-colors duration-300"
            style={{
              width: 56,
              height: 56,
              backgroundColor: 'rgba(61,122,92,0.12)',
              border: '1px solid rgba(61,122,92,0.2)',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5aab80"
              strokeWidth="1.5"
            >
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>

          {/* Title */}
          <h2
            className="text-2xl font-bold mb-1 transition-colors duration-200"
            style={{ color: '#e6edf3' }}
          >
            Footage
          </h2>

          {/* Subtitle */}
          <p className="text-sm mb-4" style={{ color: '#8b949e' }}>
            29 cinematic clips and growing
          </p>

          <p className="text-sm leading-relaxed" style={{ color: '#6e7681' }}>
            4K and HD video clips capturing BC&apos;s most stunning landscapes,
            wildlife, and communities.
          </p>

          {/* Arrow */}
          <div
            className="flex items-center gap-1.5 mt-5 text-sm font-medium transition-all duration-200 group-hover:gap-3"
            style={{ color: '#5aab80' }}
          >
            Browse Footage
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </Link>

      {/* Photos Card */}
      <Link
        href="/photos"
        className="group relative overflow-hidden rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          textDecoration: 'none',
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(61,122,92,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(90,171,128,0.3)' }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-xl mb-5"
            style={{
              width: 56,
              height: 56,
              backgroundColor: 'rgba(61,122,92,0.12)',
              border: '1px solid rgba(61,122,92,0.2)',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5aab80"
              strokeWidth="1.5"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>

          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: '#e6edf3' }}
          >
            Photos
          </h2>
          <p className="text-sm mb-4" style={{ color: '#8b949e' }}>
            High-resolution stills
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#6e7681' }}>
            Stunning photography from across British Columbia — wildlife,
            landscapes, culture, and more.
          </p>

          <div
            className="flex items-center gap-1.5 mt-5 text-sm font-medium transition-all duration-200 group-hover:gap-3"
            style={{ color: '#5aab80' }}
          >
            Browse Photos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}

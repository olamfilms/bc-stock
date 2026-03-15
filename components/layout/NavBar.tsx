'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useQuote } from '@/context/QuoteContext'
import QuoteDrawer from '@/components/quote/QuoteDrawer'
import VideoLightbox from '@/components/media/VideoLightbox'
import type { Media } from '@/types'

export default function NavBar() {
  const pathname = usePathname()
  const { itemCount } = useQuote()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [randomClip, setRandomClip] = useState<Media | null>(null)
  const [loadingRandom, setLoadingRandom] = useState(false)

  async function handleRandomClip() {
    if (loadingRandom) return
    setLoadingRandom(true)
    try {
      const res = await fetch('/api/media/random?type=video')
      if (res.ok) {
        const data = await res.json()
        setRandomClip(data)
      }
    } catch {
      // ignore
    } finally {
      setLoadingRandom(false)
    }
  }

  const navLinks = [
    { href: '/footage', label: 'Footage' },
    { href: '/photos', label: 'Photos' },
    { href: '/bc-stock-tv', label: 'BC Stock TV' },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          backgroundColor: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #21262d',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/bc-stock-logo.png"
            alt="BC Stock"
            width={120}
            height={24}
            priority
            style={{ height: '28px', width: 'auto' }}
          />
        </Link>

        {/* Desktop Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{
                color: pathname.startsWith(link.href) ? '#5aab80' : '#8b949e',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleRandomClip}
            className="btn-ghost text-sm"
            title="Play a random clip"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Random Clip
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
            style={{ color: '#8b949e' }}
            title="View quote list"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span>Quote</span>
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: '#3d7a5c',
                  fontSize: 10,
                }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: '#8b949e' }}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 md:hidden py-4 px-6 flex flex-col gap-4"
          style={{ backgroundColor: '#161b22', borderBottom: '1px solid #30363d' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium py-2"
              style={{
                color: pathname.startsWith(link.href) ? '#5aab80' : '#e6edf3',
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: '#30363d' }}>
            <button
              onClick={() => {
                setMobileOpen(false)
                handleRandomClip()
              }}
              className="text-sm"
              style={{ color: '#8b949e' }}
            >
              Random Clip
            </button>
            <button
              onClick={() => {
                setMobileOpen(false)
                setDrawerOpen(true)
              }}
              className="text-sm flex items-center gap-1"
              style={{ color: '#8b949e' }}
            >
              Quote
              {itemCount > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-white"
                  style={{ width: 18, height: 18, backgroundColor: '#3d7a5c', fontSize: 10 }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <QuoteDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {randomClip && (
        <VideoLightbox item={randomClip} onClose={() => setRandomClip(null)} />
      )}
    </>
  )
}

'use client'

import Image from 'next/image'

// TODO: Replace the CSS gradient background with a hero video once available.

export default function HeroBanner() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Hero background image */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dccmrwnhk/image/upload/Banner_BCstock"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.55) 0%, rgba(13,17,23,0.4) 50%, rgba(13,17,23,0.8) 100%)' }}
        />
      </div>

      {/* Subtle film grain overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Bottom gradient to blend with content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: 'linear-gradient(to top, #0d1117 0%, transparent 100%)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Location tags */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span
            className="w-8 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.6)' }}
          />
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: '#ffffff' }}
          >
            Wild. Cinematic. British Columbia.
          </p>
          <span
            className="w-8 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.6)' }}
          />
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/bc-stock-logo-white.png"
            alt="BC Stock"
            width={520}
            height={105}
            priority
            style={{ maxWidth: '80vw', height: 'auto' }}
          />
        </div>

        {/* Subtitle */}
        <p
          className="text-xl md:text-2xl font-light mb-4"
          style={{
            color: '#ffffff',
            letterSpacing: '0.01em',
          }}
        >
          British Columbia Stock Footage &amp; Photos
        </p>

        <p
          className="text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-12"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Premium cinematic content from the wild heart of British Columbia,
          ready to license for broadcast, documentary, and digital use.
        </p>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Explore
          </p>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </section>
  )
}

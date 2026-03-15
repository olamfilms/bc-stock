'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface VideoItem {
  id: string
  vimeo_id: string
  title: string
  vimeo_thumbnail: string | null
}

export default function BCStockTV() {
  const router = useRouter()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)
  const [playlist, setPlaylist] = useState<VideoItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const hideUITimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch playlist on mount
  useEffect(() => {
    fetch('/api/media/random-video?count=50')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlaylist(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch playlist:', err)
        setLoading(false)
      })
  }, [])

  // Initialize / update Vimeo player when index or playlist changes
  useEffect(() => {
    if (!playlist.length || !playerContainerRef.current) return

    const currentVideo = playlist[currentIndex]
    if (!currentVideo?.vimeo_id) return

    let cancelled = false

    async function initPlayer() {
      try {
        const VimeoPlayer = (await import('@vimeo/player')).default

        // Destroy existing player
        if (playerRef.current) {
          try {
            await playerRef.current.destroy()
          } catch {
            // ignore
          }
          playerRef.current = null
        }

        if (cancelled || !playerContainerRef.current) return

        // Create new player
        const player = new VimeoPlayer(playerContainerRef.current, {
          id: parseInt(currentVideo.vimeo_id, 10),
          autoplay: true,
          controls: false,
          loop: false,
          muted: false,
          background: false,
          width: window.innerWidth,
          height: window.innerHeight,
        })

        playerRef.current = player

        player.on('ended', () => {
          if (!cancelled) {
            setCurrentIndex((prev) =>
              prev < playlist.length - 1 ? prev + 1 : 0
            )
          }
        })

        player.on('play', () => setPaused(false))
        player.on('pause', () => setPaused(true))
      } catch (err) {
        console.error('Vimeo player error:', err)
      }
    }

    initPlayer()
    return () => {
      cancelled = true
    }
  }, [currentIndex, playlist])

  // UI auto-hide logic
  const resetHideTimer = useCallback(() => {
    setShowUI(true)
    if (hideUITimer.current) clearTimeout(hideUITimer.current)
    hideUITimer.current = setTimeout(() => setShowUI(false), 3000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    window.addEventListener('mousemove', resetHideTimer)
    window.addEventListener('touchstart', resetHideTimer)
    return () => {
      window.removeEventListener('mousemove', resetHideTimer)
      window.removeEventListener('touchstart', resetHideTimer)
      if (hideUITimer.current) clearTimeout(hideUITimer.current)
    }
  }, [resetHideTimer])

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault()
        if (playerRef.current) {
          playerRef.current.getPaused().then((isPaused: boolean) => {
            if (isPaused) {
              playerRef.current.play()
            } else {
              playerRef.current.pause()
            }
          })
        }
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        router.push('/')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, currentIndex])

  function handleNext() {
    setCurrentIndex((prev) => (prev < playlist.length - 1 ? prev + 1 : 0))
  }

  async function handlePlayPause() {
    if (!playerRef.current) return
    try {
      const isPaused = await playerRef.current.getPaused()
      if (isPaused) {
        await playerRef.current.play()
      } else {
        await playerRef.current.pause()
      }
    } catch {
      // ignore
    }
  }

  const currentVideo = playlist[currentIndex]

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#000', cursor: showUI ? 'default' : 'none' }}
    >
      {/* Video container */}
      <div
        ref={playerContainerRef}
        className="absolute inset-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-3xl font-bold tracking-widest mb-2"
              style={{ color: '#e6edf3' }}
            >
              BC STOCK TV
            </div>
            <p style={{ color: '#8b949e' }}>Loading playlist...</p>
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: showUI ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Top gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          }}
        />

        {/* Top right: Exit button */}
        <div
          className="absolute top-5 right-5 pointer-events-auto"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#e6edf3',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Exit
          </button>
        </div>

        {/* Top center: BC Stock TV logo */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2">
          <p
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            BC Stock TV
          </p>
        </div>

        {/* Bottom: current clip info + controls */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pointer-events-auto">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0 mr-4">
              {currentVideo && (
                <>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {currentIndex + 1} / {playlist.length}
                  </p>
                  <p
                    className="text-xl font-semibold truncate"
                    style={{ color: '#e6edf3' }}
                  >
                    {currentVideo.title}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center rounded-full w-10 h-10 transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#e6edf3',
                  backdropFilter: 'blur(8px)',
                }}
                title={paused ? 'Play' : 'Pause'}
              >
                {paused ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                )}
              </button>

              {/* Skip */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#e6edf3',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Skip
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import VideoLightbox from './VideoLightbox'
import type { Media } from '@/types'

export default function RandomClipButton() {
  const [loading, setLoading] = useState(false)
  const [clip, setClip] = useState<Media | null>(null)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/media/random?type=video')
      if (res.ok) {
        const data = await res.json()
        setClip(data)
      }
    } catch (err) {
      console.error('Failed to fetch random clip:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-outline flex items-center gap-2.5"
        style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className={loading ? 'animate-spin' : ''}
        >
          {loading ? (
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/>
          ) : (
            <>
              <polygon points="5 3 19 12 5 21 5 3"/>
            </>
          )}
        </svg>
        {loading ? 'Loading...' : 'Play a Random Clip'}
      </button>

      {clip && (
        <VideoLightbox
          item={clip}
          onClose={() => setClip(null)}
        />
      )}
    </>
  )
}

'use client'

import { useState, FormEvent } from 'react'
import { useQuote } from '@/context/QuoteContext'

const VIDEO_FORMATS = ['Pre-Color-Graded', 'LOG', 'RAW']
const PHOTO_FORMATS = ['JPEG', 'TIFF', 'RAW']
const USAGE_OPTIONS = [
  'Broadcast TV',
  'Documentary',
  'Commercial/Advertising',
  'Social Media',
  'Web/Streaming',
  'Educational',
  'Non-Profit',
  'Other',
]

export default function QuoteForm() {
  const { items, clearQuote } = useQuote()

  const hasVideos = items.some((i) => i.type === 'video')
  const hasPhotos = items.some((i) => i.type === 'photo')
  const formats = hasVideos ? VIDEO_FORMATS : PHOTO_FORMATS

  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [format, setFormat] = useState('')
  const [usage, setUsage] = useState<string[]>([])
  const [runtime, setRuntime] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function toggleUsage(option: string) {
    setUsage((prev) =>
      prev.includes(option) ? prev.filter((u) => u !== option) : [...prev, option]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !description) {
      setError('Email and project description are required.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          organization,
          format,
          usage,
          runtime,
          description,
          mediaIds: items.map((i) => i.mediaId),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        clearQuote()
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <div className="text-5xl mb-5">✅</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#e6edf3' }}>
          Request Sent!
        </h2>
        <p className="text-base mb-2" style={{ color: '#8b949e' }}>
          Thank you for your interest in BC Stock.
        </p>
        <p className="text-sm" style={{ color: '#6e7681' }}>
          We typically respond within 1–2 business days. Check your inbox for a confirmation email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: '#e6edf3' }}>
          Contact Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="email">
              Email <span style={{ color: '#f85149' }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label" htmlFor="organization">
              Organization / Company
            </label>
            <input
              id="organization"
              type="text"
              className="form-input"
              placeholder="Your company or project"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: '#e6edf3' }}>
          License Details
        </h2>

        {/* Format */}
        <div className="mb-5">
          <label className="form-label">
            Delivery Format {hasVideos && hasPhotos && '(Videos)'}
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {formats.map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: '#8b949e' }}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  style={{ accentColor: '#3d7a5c' }}
                />
                <span className="text-sm">{f}</span>
              </label>
            ))}
            {hasVideos && hasPhotos && PHOTO_FORMATS.map((f) => (
              <label
                key={`photo-${f}`}
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: '#8b949e' }}
              >
                <input
                  type="radio"
                  name="format"
                  value={f}
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  style={{ accentColor: '#3d7a5c' }}
                />
                <span className="text-sm">{f} (Photos)</span>
              </label>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div className="mb-5">
          <label className="form-label">Intended Usage</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {USAGE_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: '#8b949e' }}
              >
                <input
                  type="checkbox"
                  checked={usage.includes(option)}
                  onChange={() => toggleUsage(option)}
                  style={{ accentColor: '#3d7a5c' }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Runtime */}
        <div>
          <label className="form-label" htmlFor="runtime">
            Runtime / License Duration
          </label>
          <input
            id="runtime"
            type="text"
            className="form-input"
            placeholder="e.g. 30-second commercial, 1-year digital license"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
          />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: '#e6edf3' }}>
          Project Description
        </h2>
        <div>
          <label className="form-label" htmlFor="description">
            Describe your project and media needs{' '}
            <span style={{ color: '#f85149' }}>*</span>
          </label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="Tell us about your project, how you plan to use the footage/photos, your timeline, and any other relevant details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
          />
        </div>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.3)',
            color: '#f85149',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary text-base"
        disabled={submitting}
        style={{ padding: '0.875rem 2rem', alignSelf: 'flex-start' }}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting...
          </span>
        ) : (
          <>
            Submit License Request
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

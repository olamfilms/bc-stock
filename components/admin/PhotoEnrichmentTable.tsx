'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { EnrichedPhotoRow } from '@/types'

const ALL_CATEGORIES = [
  'Featured',
  'Wildlife',
  'Indigenous',
  'Aerial',
  'Coastal',
  'Interior',
  'Industry',
  'Salmon',
  'Urban',
  'Rivers & Streams',
  'Mountains',
]

interface PhotoEnrichmentTableProps {
  rows: EnrichedPhotoRow[]
  onRowsChange: (rows: EnrichedPhotoRow[]) => void
}

export default function PhotoEnrichmentTable({
  rows,
  onRowsChange,
}: PhotoEnrichmentTableProps) {
  const [publishing, setPublishing] = useState(false)
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null)
  const [publishResult, setPublishResult] = useState<{
    published: number
    errors: { row: string; error: string }[]
  } | null>(null)

  function updateRow(index: number, updates: Partial<EnrichedPhotoRow>) {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], ...updates }
    onRowsChange(newRows)
  }

  function toggleCategory(rowIndex: number, cat: string) {
    const row = rows[rowIndex]
    const cats = row.categories.includes(cat)
      ? row.categories.filter((c) => c !== cat)
      : [...row.categories, cat]
    updateRow(rowIndex, { categories: cats })
  }

  async function publishRow(index: number) {
    const row = rows[index]
    if (row.error || !row.cloudinaryId) return
    setPublishingIndex(index)
    try {
      const res = await fetch('/api/admin/publish-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: [row] }),
      })
      const data = await res.json()
      if (data.published > 0) {
        onRowsChange(rows.filter((_, i) => i !== index))
      } else {
        alert(`Failed to publish: ${data.errors?.[0]?.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setPublishingIndex(null)
    }
  }

  async function publishAll() {
    const validRows = rows.filter((r) => !r.error && r.cloudinaryId)
    if (validRows.length === 0) return
    setPublishing(true)
    setPublishResult(null)
    try {
      const res = await fetch('/api/admin/publish-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      })
      const data = await res.json()
      setPublishResult(data)
      if (data.published > 0) {
        const failedTitles = new Set(
          (data.errors || []).map((e: { row: string }) => e.row)
        )
        // Keep only error rows that failed to publish, plus rows that had no cloudinaryId
        onRowsChange(
          rows.filter(
            (r) => r.error || !r.cloudinaryId || failedTitles.has(r.title)
          )
        )
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const validRows = rows.filter((r) => !r.error && r.cloudinaryId)
  const errorRows = rows.filter((r) => r.error || !r.cloudinaryId)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary + Publish All */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm" style={{ color: '#8b949e' }}>
          <span style={{ color: '#e6edf3', fontWeight: 600 }}>
            {rows.length}
          </span>{' '}
          photos processed —{' '}
          <span style={{ color: '#5aab80' }}>{validRows.length} ready</span>
          {errorRows.length > 0 && (
            <>
              ,{' '}
              <span style={{ color: '#f85149' }}>
                {errorRows.length} errors
              </span>
            </>
          )}
        </p>

        {validRows.length > 0 && (
          <button
            onClick={publishAll}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: '#3d7a5c',
              color: '#ffffff',
              opacity: publishing ? 0.7 : 1,
              cursor: publishing ? 'not-allowed' : 'pointer',
            }}
          >
            {publishing ? (
              <>
                {/* Spinner */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="animate-spin"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Publishing...
              </>
            ) : (
              <>
                {/* Upload icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Publish All ({validRows.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Publish result banner */}
      {publishResult && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor:
              publishResult.published > 0
                ? 'rgba(61,122,92,0.1)'
                : 'rgba(248,81,73,0.1)',
            border: `1px solid ${
              publishResult.published > 0
                ? 'rgba(90,171,128,0.3)'
                : 'rgba(248,81,73,0.3)'
            }`,
            color:
              publishResult.published > 0 ? '#5aab80' : '#f85149',
          }}
        >
          {publishResult.published > 0 ? (
            <>
              {publishResult.published} photo
              {publishResult.published !== 1 ? 's' : ''} published successfully.
            </>
          ) : (
            'No photos were published.'
          )}
          {publishResult.errors.length > 0 && (
            <span>
              {' '}
              {publishResult.errors.length} error
              {publishResult.errors.length !== 1 ? 's' : ''}:{' '}
              {publishResult.errors.map((e) => e.row).join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Photo cards */}
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={`${row.filename}-${index}`}
            className="rounded-xl p-5"
            style={{
              backgroundColor: '#161b22',
              border: `1px solid ${
                row.error ? 'rgba(248,81,73,0.3)' : '#30363d'
              }`,
            }}
          >
            <div className="flex gap-4">
              {/* Preview image */}
              <div
                className="flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: 120,
                  height: 90,
                  backgroundColor: '#0d1117',
                  border: '1px solid #21262d',
                }}
              >
                {row.cloudinaryUrl ? (
                  <Image
                    src={row.cloudinaryUrl}
                    alt={row.title}
                    width={120}
                    height={90}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6e7681"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header row: filename + badges + publish button */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-xs font-mono truncate"
                        style={{ color: '#6e7681' }}
                      >
                        {row.filename}
                      </p>
                      {row.aiEnriched && !row.error && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                          style={{
                            backgroundColor: 'rgba(61,122,92,0.15)',
                            color: '#5aab80',
                          }}
                        >
                          AI enriched
                        </span>
                      )}
                      {row.error && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                          style={{
                            backgroundColor: 'rgba(248,81,73,0.12)',
                            color: '#f85149',
                          }}
                        >
                          Error
                        </span>
                      )}
                    </div>
                    {row.cloudinaryId && (
                      <p
                        className="text-xs mt-0.5 truncate font-mono"
                        style={{ color: '#484f58' }}
                      >
                        {row.cloudinaryId}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => publishRow(index)}
                    disabled={
                      publishingIndex === index ||
                      !!row.error ||
                      !row.cloudinaryId
                    }
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: '#3d7a5c',
                      color: '#ffffff',
                      opacity:
                        row.error || !row.cloudinaryId ? 0.35 : 1,
                      cursor:
                        row.error || !row.cloudinaryId
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {publishingIndex === index ? 'Publishing...' : 'Publish'}
                  </button>
                </div>

                {/* Error message */}
                {row.error && (
                  <div
                    className="text-xs px-3 py-2 rounded mb-3"
                    style={{
                      backgroundColor: 'rgba(248,81,73,0.1)',
                      color: '#f85149',
                      border: '1px solid rgba(248,81,73,0.2)',
                    }}
                  >
                    Error: {row.error}
                  </div>
                )}

                {/* Title (editable) */}
                <div className="mb-3">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#8b949e' }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) =>
                      updateRow(index, { title: e.target.value })
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: '#0d1117',
                      border: '1px solid #30363d',
                      color: '#e6edf3',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#5aab80'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#30363d'
                    }}
                  />
                </div>

                {/* Description (editable) */}
                <div className="mb-3">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#8b949e' }}
                  >
                    Description
                  </label>
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      updateRow(index, { description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none transition-colors"
                    style={{
                      backgroundColor: '#0d1117',
                      border: '1px solid #30363d',
                      color: '#e6edf3',
                      lineHeight: '1.5',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#5aab80'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#30363d'
                    }}
                  />
                </div>

                {/* Categories (checkboxes) */}
                <div className="mb-3">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#8b949e' }}
                  >
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => {
                      const selected = row.categories.includes(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(index, cat)}
                          className="text-xs px-2.5 py-1 rounded-full transition-all"
                          style={{
                            backgroundColor: selected
                              ? 'rgba(61,122,92,0.2)'
                              : '#1c2128',
                            color: selected ? '#5aab80' : '#8b949e',
                            border: `1px solid ${
                              selected
                                ? 'rgba(90,171,128,0.4)'
                                : '#30363d'
                            }`,
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tags (display as pills) */}
                {row.tags.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: '#8b949e' }}
                    >
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.tags.map((tag, ti) => (
                        <span
                          key={`${tag}-${ti}`}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: '#1c2128',
                            color: '#8b949e',
                            border: '1px solid #21262d',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

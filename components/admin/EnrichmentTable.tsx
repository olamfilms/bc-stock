'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { EnrichedCSVRow } from '@/types'

const ALL_CATEGORIES = [
  'Featured', 'Wildlife', 'Indigenous', 'Aerial', 'Coastal',
  'Interior', 'Industry', 'Salmon', 'Urban', 'Rivers & Streams', 'Mountains',
]

interface EnrichmentTableProps {
  rows: EnrichedCSVRow[]
  onRowsChange: (rows: EnrichedCSVRow[]) => void
}

export default function EnrichmentTable({ rows, onRowsChange }: EnrichmentTableProps) {
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ published: number; errors: { row: string; error: string }[] } | null>(null)
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null)

  function updateRow(index: number, updates: Partial<EnrichedCSVRow>) {
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
    setPublishingIndex(index)
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: [rows[index]] }),
      })
      const data = await res.json()
      if (data.published > 0) {
        // Mark as published by removing the row or marking it
        const newRows = rows.filter((_, i) => i !== index)
        onRowsChange(newRows)
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
    setPublishing(true)
    setPublishResult(null)
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      setPublishResult(data)
      if (data.published > 0) {
        // Remove published rows (keep only ones with errors)
        const failedTitles = new Set(data.errors.map((e: { row: string }) => e.row))
        onRowsChange(rows.filter((r) => failedTitles.has(r.title)))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const errorRows = rows.filter((r) => r.error)
  const validRows = rows.filter((r) => !r.error)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm" style={{ color: '#8b949e' }}>
            <span style={{ color: '#e6edf3', fontWeight: 600 }}>{rows.length}</span> rows enriched —{' '}
            <span style={{ color: '#5aab80' }}>{validRows.length} ready</span>
            {errorRows.length > 0 && (
              <>, <span style={{ color: '#f85149' }}>{errorRows.length} errors</span></>
            )}
          </p>
        </div>
        {validRows.length > 0 && (
          <button
            onClick={publishAll}
            disabled={publishing}
            className="btn-primary"
          >
            {publishing ? 'Publishing...' : `Publish All (${validRows.length})`}
          </button>
        )}
      </div>

      {/* Publish result */}
      {publishResult && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: publishResult.published > 0 ? 'rgba(61,122,92,0.1)' : 'rgba(248,81,73,0.1)',
            border: `1px solid ${publishResult.published > 0 ? 'rgba(90,171,128,0.3)' : 'rgba(248,81,73,0.3)'}`,
            color: publishResult.published > 0 ? '#5aab80' : '#f85149',
          }}
        >
          Published {publishResult.published} items.
          {publishResult.errors.length > 0 && (
            <span> {publishResult.errors.length} errors: {publishResult.errors.map((e) => e.row).join(', ')}</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-xl p-5"
            style={{
              backgroundColor: '#161b22',
              border: `1px solid ${row.error ? 'rgba(248,81,73,0.3)' : '#30363d'}`,
            }}
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div
                className="flex-shrink-0 rounded-lg overflow-hidden"
                style={{ width: 120, height: 68, backgroundColor: '#0d1117' }}
              >
                {row.thumbnail ? (
                  <Image
                    src={row.thumbnail}
                    alt={row.title}
                    width={120}
                    height={68}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1.5">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#e6edf3' }}>
                      {row.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: '#8b949e' }}>
                      {row.vimeoId && <span>Vimeo: {row.vimeoId}</span>}
                      {row.durationFormatted && <span>{row.durationFormatted}</span>}
                      {row.shotOn && <span>{row.shotOn}</span>}
                      {row.aiEnriched && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: 'rgba(61,122,92,0.15)', color: '#5aab80' }}
                        >
                          AI enriched
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => publishRow(index)}
                      disabled={publishingIndex === index || !!row.error}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: '#3d7a5c',
                        color: '#ffffff',
                        opacity: row.error ? 0.4 : 1,
                      }}
                    >
                      {publishingIndex === index ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </div>

                {/* Error */}
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

                {/* Description (editable) */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    value={row.description}
                    onChange={(e) => updateRow(index, { description: e.target.value })}
                    className="form-textarea"
                    style={{ minHeight: 72, fontSize: '0.8125rem' }}
                  />
                </div>

                {/* Categories */}
                <div className="mb-3">
                  <p className="form-label">Categories</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ALL_CATEGORIES.map((cat) => {
                      const selected = row.categories.includes(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(index, cat)}
                          className="text-xs px-2.5 py-1 rounded-full transition-all"
                          style={{
                            backgroundColor: selected ? 'rgba(61,122,92,0.2)' : '#1c2128',
                            color: selected ? '#5aab80' : '#8b949e',
                            border: `1px solid ${selected ? 'rgba(90,171,128,0.4)' : '#30363d'}`,
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tags */}
                {row.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {row.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#1c2128', color: '#8b949e', border: '1px solid #21262d' }}
                      >
                        {tag}
                      </span>
                    ))}
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

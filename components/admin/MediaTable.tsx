'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/types'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface MediaTableProps {
  initialMedia: Media[]
}

export default function MediaTable({ initialMedia }: MediaTableProps) {
  const [media, setMedia] = useState<Media[]>(initialMedia)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'photo'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = media.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  async function toggleField(id: string, field: 'is_published' | 'is_featured', current: boolean) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !current }),
      })
      if (res.ok) {
        setMedia((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, [field]: !current } : item
          )
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  async function deleteItem(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: 280 }}
        />
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #30363d' }}>
          {(['all', 'video', 'photo'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className="px-3 py-1.5 text-sm font-medium capitalize transition-colors"
              style={{
                backgroundColor: typeFilter === type ? '#3d7a5c' : 'transparent',
                color: typeFilter === type ? '#ffffff' : '#8b949e',
              }}
            >
              {type === 'all' ? 'All' : type === 'video' ? 'Video' : 'Photo'}
            </button>
          ))}
        </div>
        <p className="text-sm" style={{ color: '#8b949e' }}>
          {filtered.length} items
        </p>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid #30363d' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1c2128', borderBottom: '1px solid #30363d' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Media
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Categories
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Duration
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Featured
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Published
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b949e' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#161b22' : '#0d1117',
                    borderBottom: '1px solid #21262d',
                    opacity: updating === item.id || deleting === item.id ? 0.6 : 1,
                  }}
                >
                  {/* Thumbnail + Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-shrink-0 rounded overflow-hidden"
                        style={{ width: 64, height: 36, backgroundColor: '#1c2128' }}
                      >
                        {(item.vimeo_thumbnail || item.cloudinary_url) ? (
                          <Image
                            src={(item.vimeo_thumbnail || item.cloudinary_url) as string}
                            alt={item.title}
                            width={64}
                            height={36}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="1.5">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-xs" style={{ color: '#e6edf3' }}>
                          {item.title}
                        </p>
                        {item.vimeo_id && (
                          <p className="text-xs font-mono" style={{ color: '#6e7681' }}>
                            {item.vimeo_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded capitalize"
                      style={{
                        backgroundColor: item.type === 'video' ? 'rgba(61,122,92,0.15)' : 'rgba(56,139,253,0.15)',
                        color: item.type === 'video' ? '#5aab80' : '#79c0ff',
                        border: `1px solid ${item.type === 'video' ? 'rgba(90,171,128,0.2)' : 'rgba(56,139,253,0.2)'}`,
                      }}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Categories */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(item.categories || []).slice(0, 3).map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: '#1c2128', color: '#8b949e' }}
                        >
                          {cat.name}
                        </span>
                      ))}
                      {(item.categories || []).length > 3 && (
                        <span className="text-xs" style={{ color: '#6e7681' }}>
                          +{(item.categories || []).length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 text-sm" style={{ color: '#8b949e' }}>
                    {item.duration ? formatDuration(item.duration) : '—'}
                  </td>

                  {/* Featured toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleField(item.id, 'is_featured', item.is_featured)}
                      disabled={updating === item.id}
                      className="transition-colors"
                      title={item.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={item.is_featured ? '#f0c040' : 'none'}
                        stroke={item.is_featured ? '#f0c040' : '#6e7681'}
                        strokeWidth="1.75"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  </td>

                  {/* Published toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleField(item.id, 'is_published', item.is_published)}
                      disabled={updating === item.id}
                      className="relative inline-flex items-center cursor-pointer"
                      title={item.is_published ? 'Unpublish' : 'Publish'}
                    >
                      <div
                        className="rounded-full transition-colors duration-200"
                        style={{
                          width: 34,
                          height: 20,
                          backgroundColor: item.is_published ? '#3d7a5c' : '#30363d',
                        }}
                      >
                        <div
                          className="absolute rounded-full bg-white shadow transition-transform duration-200"
                          style={{
                            width: 14,
                            height: 14,
                            top: 3,
                            left: 3,
                            transform: item.is_published ? 'translateX(14px)' : 'translateX(0)',
                          }}
                        />
                      </div>
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteItem(item.id, item.title)}
                      disabled={deleting === item.id}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: '#6e7681' }}
                      title="Delete"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div
              className="text-center py-12"
              style={{ color: '#8b949e' }}
            >
              No media found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

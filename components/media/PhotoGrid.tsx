'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PhotoCard from './PhotoCard'
import PhotoLightbox from './PhotoLightbox'
import type { Media } from '@/types'

interface PhotoGridProps {
  initialCategory?: string
  searchQuery?: string
}

const PAGE_SIZE = 24

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton rounded-lg" style={{ aspectRatio: '16/9' }} />
      ))}
    </div>
  )
}

/** Returns true when the item matches the query against title, description, and tags. */
function matchesQuery(item: Media, query: string): boolean {
  const q = query.toLowerCase()
  if (item.title.toLowerCase().includes(q)) return true
  if (item.description && item.description.toLowerCase().includes(q)) return true
  if (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q))) return true
  return false
}

export default function PhotoGrid({ initialCategory, searchQuery = '' }: PhotoGridProps) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || initialCategory || 'all'

  const [items, setItems] = useState<Media[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Media | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  // Debounced query — 300 ms behind the live prop so filtering doesn't flicker
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  const fetchItems = useCallback(async (cat: string, off: number) => {
    const params = new URLSearchParams({
      type: 'photo',
      limit: String(PAGE_SIZE),
      offset: String(off),
    })
    if (cat && cat !== 'all') {
      params.set('category', cat)
    }
    const res = await fetch(`/api/media?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch photos')
    return res.json()
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setItems([])
    setOffset(0)

    fetchItems(category, 0)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items)
          setTotal(data.total)
          setOffset(PAGE_SIZE)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [category, fetchItems])

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const data = await fetchItems(category, offset)
      setItems((prev) => [...prev, ...data.items])
      setOffset((prev) => prev + PAGE_SIZE)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Client-side filtered list — only applied when a debounced query is present
  const displayedItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items
    return items.filter((item) => matchesQuery(item, debouncedQuery.trim()))
  }, [items, debouncedQuery])

  function handleCardClick(item: Media, index: number) {
    setSelectedItem(item)
    setSelectedIndex(index)
  }

  function handleNavigate(direction: 'prev' | 'next') {
    const newIndex = direction === 'prev' ? selectedIndex - 1 : selectedIndex + 1
    if (newIndex >= 0 && newIndex < displayedItems.length) {
      setSelectedItem(displayedItems[newIndex])
      setSelectedIndex(newIndex)
    }
  }

  if (loading) return <SkeletonGrid />

  // No results from the API at all
  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <p className="text-lg mb-2" style={{ color: '#8b949e' }}>No photos found</p>
        <p className="text-sm" style={{ color: '#6e7681' }}>Try a different category or check back later.</p>
      </div>
    )
  }

  // Search is active but no items match
  if (debouncedQuery.trim() && displayedItems.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
      >
        <p className="text-lg mb-2" style={{ color: '#8b949e' }}>
          No results for &lsquo;{debouncedQuery.trim()}&rsquo;
        </p>
        <p className="text-sm" style={{ color: '#6e7681' }}>
          Try a different search term or clear the search to browse by category.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedItems.map((item, index) => (
          <PhotoCard
            key={item.id}
            item={item}
            onClick={() => handleCardClick(item, index)}
          />
        ))}
      </div>

      {/* Only show Load More when not searching */}
      {!debouncedQuery.trim() && items.length < total && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-outline"
          >
            {loadingMore ? 'Loading...' : `Load More (${total - items.length} remaining)`}
          </button>
        </div>
      )}

      {selectedItem && (
        <PhotoLightbox
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPrev={selectedIndex > 0 ? () => handleNavigate('prev') : undefined}
          onNext={selectedIndex < displayedItems.length - 1 ? () => handleNavigate('next') : undefined}
        />
      )}
    </>
  )
}

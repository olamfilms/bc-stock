'use client'

import { useState, Suspense } from 'react'
import SearchBar from './SearchBar'
import CategoryTabs from './CategoryTabs'
import PhotoGrid from './PhotoGrid'
import type { Category } from '@/types'

interface PhotosClientShellProps {
  categories: Category[]
  initialCategory: string
}

export default function PhotosClientShell({
  categories,
  initialCategory,
}: PhotosClientShellProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      {/* Search bar — always visible above everything */}
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search photos by title, description, or tags…"
        />
      </div>

      {/* Category tabs — hidden while a search query is active */}
      {!searchQuery.trim() && (
        <Suspense fallback={null}>
          <CategoryTabs categories={categories} activeSlug={initialCategory} />
        </Suspense>
      )}

      {/* Search-active hint */}
      {searchQuery.trim() && (
        <p className="text-xs mb-2" style={{ color: '#6e7681' }}>
          Searching across all categories
        </p>
      )}

      <div className="mt-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ aspectRatio: '16/9', borderRadius: '8px' }}
                />
              ))}
            </div>
          }
        >
          <PhotoGrid
            initialCategory={initialCategory}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </>
  )
}

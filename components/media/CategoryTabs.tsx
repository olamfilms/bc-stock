'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

interface CategoryTabsProps {
  categories: Category[]
  activeSlug: string
}

export default function CategoryTabs({ categories, activeSlug }: CategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeRef = useRef<HTMLButtonElement>(null)

  const allTabs = [{ id: 'all', name: 'All', slug: 'all', sort_order: -1, created_at: '' }, ...categories]

  useEffect(() => {
    // Scroll the active tab into view
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeSlug])

  function handleTabClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div
      className="relative border-b scrollbar-hide overflow-x-auto"
      style={{ borderColor: '#21262d' }}
    >
      <div className="flex items-center gap-1 min-w-max">
        {allTabs.map((tab) => {
          const isActive = tab.slug === activeSlug || (tab.slug === 'all' && activeSlug === 'all')
          return (
            <button
              key={tab.slug}
              ref={isActive ? activeRef : undefined}
              onClick={() => handleTabClick(tab.slug)}
              className="category-tab"
              style={{
                color: isActive ? '#5aab80' : '#8b949e',
                borderBottomColor: isActive ? '#5aab80' : 'transparent',
              }}
            >
              {tab.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import type { QuoteItem } from '@/types'

const STORAGE_KEY = 'bc-stock-quote'

interface QuoteContextValue {
  items: QuoteItem[]
  addItem: (item: QuoteItem) => void
  removeItem: (mediaId: string) => void
  clearQuote: () => void
  isInQuote: (mediaId: string) => boolean
  itemCount: number
}

const QuoteContext = createContext<QuoteContextValue | undefined>(undefined)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch {
      // localStorage not available or corrupted — ignore
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage not available — ignore
    }
  }, [items, hydrated])

  const addItem = useCallback((item: QuoteItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.mediaId === item.mediaId)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((mediaId: string) => {
    setItems((prev) => prev.filter((i) => i.mediaId !== mediaId))
  }, [])

  const clearQuote = useCallback(() => {
    setItems([])
  }, [])

  const isInQuote = useCallback(
    (mediaId: string) => items.some((i) => i.mediaId === mediaId),
    [items]
  )

  return (
    <QuoteContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearQuote,
        isInQuote,
        itemCount: items.length,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext)
  if (!ctx) {
    throw new Error('useQuote must be used within a QuoteProvider')
  }
  return ctx
}

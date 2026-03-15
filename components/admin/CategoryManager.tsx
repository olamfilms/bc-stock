'use client'

import { useState, useEffect, FormEvent } from 'react'
import type { Category } from '@/types'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const slug = generateSlug(newName)
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), -1)
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), slug, sort_order: maxOrder + 1 }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories((prev) => [...prev, created])
        setNewName('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create category')
      }
    } catch {
      setError('Network error')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditValue(cat.name)
  }

  async function saveEdit(id: string) {
    if (!editValue.trim()) {
      setEditingId(null)
      return
    }
    try {
      const slug = generateSlug(editValue)
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editValue.trim(), slug }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEditingId(null)
    }
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This will remove it from all media items.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  async function move(id: string, direction: 'up' | 'down') {
    const index = categories.findIndex((c) => c.id === id)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) return

    const newCats = [...categories]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newCats[index]
    newCats[index] = newCats[swapIndex]
    newCats[swapIndex] = temp

    // Update sort_orders
    const updated = newCats.map((cat, i) => ({ ...cat, sort_order: i }))
    setCategories(updated)

    // Persist both changed categories
    try {
      await Promise.all([
        fetch(`/api/categories/${updated[index].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: updated[index].sort_order }),
        }),
        fetch(`/api/categories/${updated[swapIndex].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: updated[swapIndex].sort_order }),
        }),
      ])
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton rounded-lg h-12" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="flex gap-3"
      >
        <input
          type="text"
          className="form-input flex-1"
          placeholder="New category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="btn-primary flex-shrink-0"
        >
          {adding ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {error && (
        <p className="text-sm" style={{ color: '#f85149' }}>{error}</p>
      )}

      {/* Category list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid #30363d' }}
      >
        {categories.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#8b949e' }}>
            No categories yet
          </div>
        ) : (
          categories.map((cat, index) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                backgroundColor: index % 2 === 0 ? '#161b22' : '#0d1117',
                borderBottom: index < categories.length - 1 ? '1px solid #21262d' : 'none',
                opacity: deletingId === cat.id ? 0.4 : 1,
              }}
            >
              {/* Sort order number */}
              <span
                className="text-xs font-mono w-5 text-right flex-shrink-0"
                style={{ color: '#6e7681' }}
              >
                {cat.sort_order}
              </span>

              {/* Name (editable) */}
              <div className="flex-1 min-w-0">
                {editingId === cat.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(cat.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="form-input text-sm py-1"
                    autoFocus
                  />
                ) : (
                  <div>
                    <p
                      className="font-medium cursor-pointer"
                      style={{ color: '#e6edf3' }}
                      onClick={() => startEdit(cat)}
                      title="Click to edit"
                    >
                      {cat.name}
                    </p>
                    <p className="text-xs font-mono" style={{ color: '#6e7681' }}>
                      /{cat.slug}
                    </p>
                  </div>
                )}
              </div>

              {/* Up/Down arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(cat.id, 'up')}
                  disabled={index === 0}
                  className="p-0.5 rounded transition-colors"
                  style={{ color: index === 0 ? '#30363d' : '#6e7681' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </button>
                <button
                  onClick={() => move(cat.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-0.5 rounded transition-colors"
                  style={{ color: index === categories.length - 1 ? '#30363d' : '#6e7681' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>

              {/* Edit + Delete buttons */}
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#6e7681' }}
                title="Edit name"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={() => deleteCategory(cat.id, cat.name)}
                disabled={deletingId === cat.id}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#6e7681' }}
                title="Delete category"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

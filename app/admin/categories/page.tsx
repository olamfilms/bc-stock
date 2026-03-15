'use client'

import CategoryManager from '@/components/admin/CategoryManager'

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#e6edf3' }}
        >
          Categories
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
          Manage media categories
        </p>
      </div>
      <CategoryManager />
    </div>
  )
}

'use client'

import BCStockTV from '@/components/bcsttv/BCStockTV'

export default function BCStockTVPage() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <BCStockTV />
    </div>
  )
}

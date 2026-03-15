'use client'

import { useState } from 'react'
import CSVUploader from '@/components/admin/CSVUploader'
import EnrichmentTable from '@/components/admin/EnrichmentTable'
import PhotoUploader from '@/components/admin/PhotoUploader'
import PhotoEnrichmentTable from '@/components/admin/PhotoEnrichmentTable'
import type { EnrichedCSVRow, EnrichedPhotoRow } from '@/types'

type ActiveTab = 'videos' | 'photos'

export default function AdminUploadPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('videos')

  // Videos (CSV) state
  const [enrichedRows, setEnrichedRows] = useState<EnrichedCSVRow[]>([])
  const [showVideoTable, setShowVideoTable] = useState(false)

  // Photos state
  const [photoRows, setPhotoRows] = useState<EnrichedPhotoRow[]>([])
  const [showPhotoTable, setShowPhotoTable] = useState(false)

  function handleVideoComplete(rows: EnrichedCSVRow[]) {
    setEnrichedRows(rows)
    setShowVideoTable(true)
  }

  function handleVideoReset() {
    setEnrichedRows([])
    setShowVideoTable(false)
  }

  function handlePhotoComplete(rows: EnrichedPhotoRow[]) {
    setPhotoRows(rows)
    setShowPhotoTable(true)
  }

  function handlePhotoReset() {
    setPhotoRows([])
    setShowPhotoTable(false)
  }

  function switchTab(tab: ActiveTab) {
    setActiveTab(tab)
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: '#e6edf3' }}
        >
          Upload Media
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
          Import and enrich media for the BC Stock library
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center mb-6"
        style={{ borderBottom: '1px solid #30363d' }}
      >
        <TabButton
          label="Videos (CSV)"
          active={activeTab === 'videos'}
          onClick={() => switchTab('videos')}
        />
        <TabButton
          label="Photos"
          active={activeTab === 'photos'}
          onClick={() => switchTab('photos')}
        />
      </div>

      {/* Videos tab */}
      {activeTab === 'videos' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm" style={{ color: '#8b949e' }}>
              Import video metadata from a CSV file and enrich with AI
            </p>
            {showVideoTable && (
              <button onClick={handleVideoReset} className="btn-outline">
                Upload Another CSV
              </button>
            )}
          </div>

          {!showVideoTable ? (
            <CSVUploader onComplete={handleVideoComplete} />
          ) : (
            <EnrichmentTable
              rows={enrichedRows}
              onRowsChange={setEnrichedRows}
            />
          )}
        </div>
      )}

      {/* Photos tab */}
      {activeTab === 'photos' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm" style={{ color: '#8b949e' }}>
              Upload photos to Cloudinary and generate metadata with AI vision
            </p>
            {showPhotoTable && (
              <button onClick={handlePhotoReset} className="btn-outline">
                Upload More Photos
              </button>
            )}
          </div>

          {!showPhotoTable ? (
            <PhotoUploader onComplete={handlePhotoComplete} />
          ) : (
            <PhotoEnrichmentTable
              rows={photoRows}
              onRowsChange={setPhotoRows}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ---- Tab button sub-component ----
interface TabButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-sm font-medium transition-colors"
      style={{
        color: active ? '#5aab80' : '#8b949e',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #5aab80' : '2px solid transparent',
        marginBottom: '-1px',
        cursor: 'pointer',
        padding: '10px 16px',
      }}
    >
      {label}
    </button>
  )
}

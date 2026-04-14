'use client'

import { useState, useRef, useCallback } from 'react'
import type { EnrichedPhotoRow } from '@/types'

interface PhotoUploaderProps {
  onComplete: (rows: EnrichedPhotoRow[]) => void
}

export default function PhotoUploader({ onComplete }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, filename: '' })
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const imageFiles = Array.from(incoming).filter((f) =>
      f.type.startsWith('image/')
    )
    if (imageFiles.length === 0) {
      setError('Please select image files only (JPEG, PNG, HEIC, WebP, etc.)')
      return
    }
    setError('')
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      const newOnes = imageFiles.filter((f) => !existingNames.has(f.name))
      return [...prev, ...newOnes]
    })
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    // Only set dragging=false if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    // Reset input so the same files can be re-added after removal
    e.target.value = ''
  }

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setError('')
    setProgress({ current: 0, total: files.length, filename: '' })

    const results: EnrichedPhotoRow[] = []

    // Get a Cloudinary signature once for the whole batch
    let signData: { timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }
    try {
      const signRes = await fetch('/api/admin/cloudinary-sign', { method: 'POST' })
      if (!signRes.ok) throw new Error('Failed to get upload signature')
      signData = await signRes.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get upload signature')
      setProcessing(false)
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress({ current: i + 1, total: files.length, filename: file.name })

      try {
        // Step 1: Upload directly from browser to Cloudinary
        const cloudinaryForm = new FormData()
        cloudinaryForm.append('file', file)
        cloudinaryForm.append('api_key', signData.apiKey)
        cloudinaryForm.append('timestamp', String(signData.timestamp))
        cloudinaryForm.append('signature', signData.signature)
        cloudinaryForm.append('folder', signData.folder)

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          { method: 'POST', body: cloudinaryForm }
        )

        if (!cloudinaryRes.ok) {
          const errText = await cloudinaryRes.text()
          throw new Error(`Cloudinary upload failed: ${errText}`)
        }

        const cloudinaryData = await cloudinaryRes.json()
        const publicId: string = cloudinaryData.public_id
        const cloudinaryUrl: string = cloudinaryData.secure_url

        // Step 2: Send URL to server for Claude analysis
        const analyzeRes = await fetch('/api/admin/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloudinaryUrl, publicId, notes, filename: file.name }),
        })

        const data = await analyzeRes.json()

        if (!analyzeRes.ok || data.error) {
          results.push({
            filename: file.name,
            title: file.name.replace(/\.[^.]+$/, ''),
            description: '',
            cloudinaryId: publicId,
            cloudinaryUrl,
            categories: [],
            tags: [],
            aiEnriched: false,
            error: data.error || `HTTP ${analyzeRes.status}`,
          })
        } else {
          results.push({
            filename: file.name,
            title: data.title,
            description: data.description,
            cloudinaryId: data.publicId,
            cloudinaryUrl: data.cloudinaryUrl,
            categories: data.suggestedCategories || [],
            tags: data.tags || [],
            aiEnriched: true,
          })
        }
      } catch (err) {
        results.push({
          filename: file.name,
          title: file.name.replace(/\.[^.]+$/, ''),
          description: '',
          cloudinaryId: '',
          cloudinaryUrl: '',
          categories: [],
          tags: [],
          aiEnriched: false,
          error: err instanceof Error ? err.message : 'Upload failed',
        })
      }
    }

    setProcessing(false)
    onComplete(results)
  }, [files, notes, onComplete])

  const progressPct =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl flex flex-col items-center justify-center gap-4 p-12 cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${dragging ? '#5aab80' : '#30363d'}`,
          backgroundColor: dragging ? 'rgba(61,122,92,0.06)' : '#161b22',
          minHeight: '200px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Camera icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dragging ? '#5aab80' : '#6e7681'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>

        {files.length > 0 ? (
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-medium" style={{ color: '#5aab80' }}>
              {files.length} photo{files.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
              Click or drop more to add — or manage below
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium" style={{ color: '#e6edf3' }}>
              Drop photos here or click to browse
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
              Accepts JPEG, PNG, HEIC, WebP and other image formats
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.3)',
            color: '#f85149',
          }}
        >
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && !processing && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #30363d' }}
        >
          <div
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: '#1c2128',
              borderBottom: '1px solid #30363d',
              color: '#8b949e',
            }}
          >
            Selected files ({files.length})
          </div>
          <ul>
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  backgroundColor: i % 2 === 0 ? '#161b22' : '#0d1117',
                  borderBottom:
                    i < files.length - 1 ? '1px solid #21262d' : 'none',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Image icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6e7681"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span
                    className="text-sm truncate"
                    style={{ color: '#e6edf3' }}
                  >
                    {file.name}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: '#6e7681' }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="flex-shrink-0 ml-2 p-1 rounded transition-colors"
                  style={{ color: '#6e7681' }}
                  title="Remove"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes field */}
      {files.length > 0 && !processing && (
        <div>
          <label
            className="block text-sm font-semibold mb-1"
            style={{ color: '#e6edf3' }}
          >
            Location / Notes{' '}
            <span style={{ color: '#6e7681', fontWeight: 400 }}>(optional)</span>
          </label>
          <p className="text-xs mb-2" style={{ color: '#8b949e' }}>
            This context will be shared with Claude for all photos in this batch
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Tofino, BC — West Coast Trail"
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none transition-colors"
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              color: '#e6edf3',
              lineHeight: '1.5',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#5aab80'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#30363d'
            }}
          />
        </div>
      )}

      {/* Process button */}
      {files.length > 0 && !processing && (
        <div>
          <button
            onClick={handleProcess}
            disabled={files.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: '#3d7a5c',
              color: '#ffffff',
              opacity: files.length === 0 ? 0.5 : 1,
              cursor: files.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {/* Sparkle/AI icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            Process with AI ({files.length} photo{files.length !== 1 ? 's' : ''})
          </button>
        </div>
      )}

      {/* Progress */}
      {processing && (
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium" style={{ color: '#e6edf3' }}>
              Processing with AI...
            </p>
            <p className="text-sm font-mono" style={{ color: '#5aab80' }}>
              {progress.current} / {progress.total}
            </p>
          </div>

          {progress.filename && (
            <p className="text-xs mb-3 truncate" style={{ color: '#8b949e' }}>
              {progress.filename}
            </p>
          )}

          {/* Progress bar */}
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 6, backgroundColor: '#21262d' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: '#3d7a5c',
              }}
            />
          </div>

          <p className="text-xs mt-3" style={{ color: '#6e7681' }}>
            Uploading to Cloudinary and analyzing with AI — please wait
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import Papa from 'papaparse'
import type { EnrichedCSVRow } from '@/types'

interface CSVRow {
  title: string
  VimeoID: string
  Categories: string
  description: string
  duration: string
  shotOn: string
  [key: string]: string
}

interface CSVUploaderProps {
  onComplete: (rows: EnrichedCSVRow[]) => void
}

export default function CSVUploader({ onComplete }: CSVUploaderProps) {
  const [parsedRows, setParsedRows] = useState<CSVRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [progressLog, setProgressLog] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function parseCSV(file: File) {
    setError('')
    setFileName(file.name)
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parse error: ${results.errors[0].message}`)
          return
        }
        setParsedRows(results.data)
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`)
      },
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseCSV(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      parseCSV(file)
    } else {
      setError('Please drop a .csv file')
    }
  }

  const handleProcess = useCallback(async () => {
    if (!parsedRows.length) return
    setProcessing(true)
    setProgress({ current: 0, total: parsedRows.length })
    setProgressLog([])
    setError('')

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      })

      if (!response.ok) {
        const err = await response.json()
        setError(err.error || 'Upload failed')
        setProcessing(false)
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const allRows: EnrichedCSVRow[] = []

      if (!reader) {
        setError('No response stream')
        setProcessing(false)
        return
      }

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'progress') {
              setProgress({ current: event.index + 1, total: event.total })
              setProgressLog((prev) => [
                ...prev,
                `[${event.index + 1}/${event.total}] ${event.row.error ? '❌' : '✅'} ${event.row.title}`,
              ])
              allRows.push(event.row)
            } else if (event.type === 'complete') {
              onComplete(event.rows)
            }
          } catch {
            // malformed SSE line — ignore
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }, [parsedRows, onComplete])

  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Drop Zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
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
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dragging ? '#5aab80' : '#6e7681'}
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        {fileName ? (
          <div className="text-center">
            <p className="font-medium" style={{ color: '#5aab80' }}>{fileName}</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>
              {parsedRows.length} rows parsed — click to replace
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium" style={{ color: '#e6edf3' }}>
              Drop CSV file here or click to browse
            </p>
            <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
              Expected columns: title, VimeoID, Categories, description, duration, shotOn
            </p>
          </div>
        )}
      </div>

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

      {/* Preview table */}
      {parsedRows.length > 0 && !processing && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
              Preview ({parsedRows.length} rows)
            </h3>
            <button onClick={handleProcess} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              Process with AI
            </button>
          </div>
          <div
            className="overflow-x-auto rounded-lg"
            style={{ border: '1px solid #30363d' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1c2128', borderBottom: '1px solid #30363d' }}>
                  {['Title', 'Vimeo ID', 'Categories', 'Description', 'Duration', 'Shot On'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#8b949e' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#161b22' : '#0d1117',
                      borderBottom: '1px solid #21262d',
                    }}
                  >
                    <td className="px-4 py-2.5 max-w-xs truncate" style={{ color: '#e6edf3' }}>
                      {row.title}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#8b949e' }}>
                      {row.VimeoID}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#8b949e' }}>
                      {row.Categories}
                    </td>
                    <td className="px-4 py-2.5 max-w-xs truncate" style={{ color: '#8b949e' }}>
                      {row.description}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#8b949e' }}>
                      {row.duration}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#8b949e' }}>
                      {row.shotOn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 10 && (
              <div
                className="px-4 py-2 text-xs"
                style={{ color: '#8b949e', borderTop: '1px solid #30363d' }}
              >
                ... and {parsedRows.length - 10} more rows
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {processing && (
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium" style={{ color: '#e6edf3' }}>
              Processing with AI...
            </p>
            <p className="text-sm font-mono" style={{ color: '#5aab80' }}>
              {progress.current} / {progress.total}
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="rounded-full overflow-hidden mb-4"
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

          {/* Log */}
          <div
            className="rounded-lg p-3 font-mono text-xs overflow-y-auto"
            style={{
              backgroundColor: '#0d1117',
              maxHeight: '200px',
              color: '#8b949e',
              border: '1px solid #21262d',
            }}
          >
            {progressLog.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

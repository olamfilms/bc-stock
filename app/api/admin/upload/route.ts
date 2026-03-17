import { NextRequest, NextResponse } from 'next/server'
import { fetchVimeoMetadata } from '@/lib/vimeo'
import { enrichMediaItem } from '@/lib/claude'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth'
import type { EnrichedCSVRow } from '@/types'

interface CSVRow {
  title: string
  VimeoID: string
  Categories: string
  description: string
  duration: string
  shotOn: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function parseCategories(catString: string): string[] {
  if (!catString) return []
  return catString
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  // Check admin auth
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const rows: CSVRow[] = body.rows || []

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }

  // Set up SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }

      const allRows: EnrichedCSVRow[] = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]

        try {
          const vimeoId = (row.VimeoID || '').toString().trim()
          const csvCategories = parseCategories(row.Categories)
          let title = (row.title || '').trim()
          let description = (row.description || '').trim()
          let duration: number | null = null
          let thumbnail: string | null = null
          const shotOn = (row.shotOn || '').trim()

          // Parse duration from CSV if provided
          if (row.duration) {
            const parsed = parseInt(String(row.duration), 10)
            if (!isNaN(parsed)) duration = parsed
          }

          // Fetch Vimeo thumbnail (no API key required via vumbnail.com)
          if (vimeoId) {
            const vimeoData = await fetchVimeoMetadata(vimeoId)
            thumbnail = vimeoData.thumbnail
          }

          // Determine whether to run Claude enrichment
          // Skip description enrichment only if description is already very long (100+ chars)
          const shouldEnrichDescription = description.length < 100

          let aiEnriched = false
          let tags: string[] = []
          let finalCategories = csvCategories
          let finalDescription = description

          try {
            const enriched = await enrichMediaItem(
              title,
              description,
              csvCategories,
              shotOn,
              'video'
            )
            if (shouldEnrichDescription) {
              finalDescription = enriched.description
            }
            // Always use AI-suggested categories if we got them (merge with CSV)
            const merged = Array.from(
              new Set([...csvCategories, ...enriched.suggestedCategories])
            )
            finalCategories = merged
            tags = enriched.tags
            aiEnriched = true
          } catch (aiErr) {
            console.warn(`Claude enrichment failed for row ${i}:`, aiErr)
            // Continue with original data
          }

          const enrichedRow: EnrichedCSVRow = {
            originalTitle: row.title || '',
            title,
            vimeoId,
            description: finalDescription,
            duration,
            durationFormatted: duration ? formatDuration(duration) : '',
            shotOn,
            categories: finalCategories,
            thumbnail,
            tags,
            aiEnriched,
            error: undefined,
          }

          allRows.push(enrichedRow)
          send({ type: 'progress', row: enrichedRow, index: i, total: rows.length })
        } catch (err) {
          const errorRow: EnrichedCSVRow = {
            originalTitle: row.title || '',
            title: row.title || '',
            vimeoId: row.VimeoID || '',
            description: row.description || '',
            duration: null,
            durationFormatted: '',
            shotOn: row.shotOn || '',
            categories: parseCategories(row.Categories),
            thumbnail: null,
            tags: [],
            aiEnriched: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          }
          allRows.push(errorRow)
          send({ type: 'progress', row: errorRow, index: i, total: rows.length })
        }

        // Rate limiting delay between rows (except after the last one)
        if (i < rows.length - 1) {
          await sleep(150)
        }
      }

      send({ type: 'complete', rows: allRows })
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth'
import type { EnrichedCSVRow } from '@/types'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const rows: EnrichedCSVRow[] = body.rows || []

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    // Fetch all categories once
    const { data: allCategories, error: catError } = await supabaseServer
      .from('categories')
      .select('id, name')

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 })
    }

    const categoryMap = new Map<string, string>(
      (allCategories || []).map((c) => [c.name.toLowerCase(), c.id])
    )

    const publishedIds: string[] = []
    const errors: { row: string; error: string }[] = []

    for (const row of rows) {
      try {
        // Insert media record
        const { data: mediaData, error: mediaError } = await supabaseServer
          .from('media')
          .insert({
            type: 'video',
            title: row.title,
            description: row.description || null,
            shot_on: row.shotOn || null,
            vimeo_id: row.vimeoId || null,
            duration: row.duration || null,
            vimeo_thumbnail: row.thumbnail || null,
            tags: row.tags.length > 0 ? row.tags : null,
            is_featured: false,
            is_published: true,
            sort_order: 0,
            ai_enriched: row.aiEnriched,
            ai_enriched_at: row.aiEnriched ? new Date().toISOString() : null,
          })
          .select('id')
          .single()

        if (mediaError) {
          errors.push({ row: row.title, error: mediaError.message })
          continue
        }

        const mediaId = mediaData.id
        publishedIds.push(mediaId)

        // Resolve category names to IDs and insert media_categories
        if (row.categories.length > 0) {
          const catInserts = row.categories
            .map((catName) => {
              const catId = categoryMap.get(catName.toLowerCase())
              if (!catId) return null
              return { media_id: mediaId, category_id: catId }
            })
            .filter(Boolean) as { media_id: string; category_id: string }[]

          if (catInserts.length > 0) {
            const { error: catInsertError } = await supabaseServer
              .from('media_categories')
              .insert(catInserts)
            if (catInsertError) {
              console.warn(
                `Category insert failed for ${row.title}:`,
                catInsertError.message
              )
            }
          }
        }
      } catch (rowErr) {
        errors.push({
          row: row.title,
          error: rowErr instanceof Error ? rowErr.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      published: publishedIds.length,
      errors,
    })
  } catch (err) {
    console.error('Publish error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

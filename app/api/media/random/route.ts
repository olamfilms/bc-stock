import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'video'

  try {
    // Use RPC for random selection, or fall back to fetching IDs + random pick
    const { data, error } = await supabaseServer.rpc('get_random_media', {
      p_type: type,
    })

    if (error || !data || data.length === 0) {
      // Fallback: fetch all published IDs of this type and pick randomly
      const { data: allData, error: allError } = await supabaseServer
        .from('media')
        .select('id')
        .eq('is_published', true)
        .eq('type', type)

      if (allError || !allData || allData.length === 0) {
        return NextResponse.json({ error: 'No media found' }, { status: 404 })
      }

      const randomId = allData[Math.floor(Math.random() * allData.length)].id

      const { data: item, error: itemError } = await supabaseServer
        .from('media')
        .select(
          `
          *,
          categories:media_categories(
            category:categories(*)
          )
        `
        )
        .eq('id', randomId)
        .single()

      if (itemError || !item) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }

      const result = {
        ...item,
        categories: (item.categories || []).map(
          (mc: { category: unknown }) => mc.category
        ),
      }
      return NextResponse.json(result)
    }

    const item = data[0]
    const result = {
      ...item,
      categories: (item.categories || []).map(
        (mc: { category: unknown }) => mc.category
      ),
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Random media error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

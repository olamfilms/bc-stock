import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'video' | 'photo'
  const categorySlug = searchParams.get('category')
  const featured = searchParams.get('featured')
  const limit = parseInt(searchParams.get('limit') || '24', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    let query = supabaseServer
      .from('media')
      .select(
        `
        *,
        categories:media_categories(
          category:categories(*)
        )
      `,
        { count: 'exact' }
      )
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('type', type)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (categorySlug && categorySlug !== 'all') {
      // Filter by category slug via the junction table
      const { data: catData } = await supabaseServer
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (catData) {
        // Get media IDs that belong to this category
        const { data: mediaCatData } = await supabaseServer
          .from('media_categories')
          .select('media_id')
          .eq('category_id', catData.id)

        if (mediaCatData && mediaCatData.length > 0) {
          const mediaIds = mediaCatData.map((mc) => mc.media_id)
          query = query.in('id', mediaIds)
        } else {
          // No items in this category
          return NextResponse.json({ items: [], total: 0 })
        }
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten the nested categories join
    const items = (data || []).map((item) => ({
      ...item,
      categories: (item.categories || []).map(
        (mc: { category: unknown }) => mc.category
      ),
    }))

    return NextResponse.json({ items, total: count || 0 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

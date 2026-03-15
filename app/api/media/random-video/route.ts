import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '50', 10), 100)

  try {
    const { data, error } = await supabaseServer
      .from('media')
      .select('id, vimeo_id, title, vimeo_thumbnail')
      .eq('is_published', true)
      .eq('type', 'video')
      .not('vimeo_id', 'is', null)
      .limit(count * 3) // Fetch more so we can shuffle

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    // Shuffle the array
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    const result = shuffled.slice(0, count)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Random video error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

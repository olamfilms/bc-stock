import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth'

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabaseServer
      .from('media')
      .select(
        `
        *,
        categories:media_categories(
          category:categories(*)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const item = {
      ...data,
      categories: (data.categories || []).map(
        (mc: { category: unknown }) => mc.category
      ),
    }

    return NextResponse.json(item)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Handle category updates separately if provided
    const { categoryIds, ...mediaFields } = body

    if (Object.keys(mediaFields).length > 0) {
      const { error } = await supabaseServer
        .from('media')
        .update({ ...mediaFields, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    if (Array.isArray(categoryIds)) {
      // Replace all category associations
      await supabaseServer.from('media_categories').delete().eq('media_id', id)

      if (categoryIds.length > 0) {
        const insertData = categoryIds.map((catId: string) => ({
          media_id: id,
          category_id: catId,
        }))
        const { error: catError } = await supabaseServer
          .from('media_categories')
          .insert(insertData)
        if (catError) {
          return NextResponse.json({ error: catError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabaseServer.from('media').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

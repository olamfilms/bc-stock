import { supabaseServer } from '@/lib/supabase/server'
import MediaTable from '@/components/admin/MediaTable'

async function getAllMedia() {
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching media:', error)
    return []
  }

  return (data || []).map((item) => ({
    ...item,
    categories: (item.categories || []).map(
      (mc: { category: unknown }) => mc.category
    ),
  }))
}

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const media = await getAllMedia()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#e6edf3' }}
          >
            Media Library
          </h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>
            {media.length} total items
          </p>
        </div>
      </div>
      <MediaTable initialMedia={media} />
    </div>
  )
}

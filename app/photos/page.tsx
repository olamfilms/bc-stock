import PhotosClientShell from '@/components/media/PhotosClientShell'
import { supabaseServer } from '@/lib/supabase/server'

async function getCategories() {
  try {
    const { data } = await supabaseServer
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

interface PhotosPageProps {
  searchParams: Promise<{ category?: string }>
}

export const metadata = {
  title: 'Photos | BC Stock',
  description:
    'License stunning British Columbia stock photography. Wildlife, landscapes, aerial, coastal, and more from across BC.',
}

export default async function PhotosPage({ searchParams }: PhotosPageProps) {
  const { category } = await searchParams
  const categories = await getCategories()

  return (
    <main
      className="min-h-screen pt-16"
      style={{ backgroundColor: '#0d1117' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight mb-1"
            style={{ color: '#e6edf3' }}
          >
            Photos
          </h1>
          <p style={{ color: '#8b949e' }} className="text-sm">
            British Columbia stock photography
          </p>
        </div>

        <PhotosClientShell
          categories={categories}
          initialCategory={category || 'all'}
        />
      </div>
    </main>
  )
}

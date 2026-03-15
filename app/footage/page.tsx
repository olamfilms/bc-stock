import FootageClientShell from '@/components/media/FootageClientShell'

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface FootagePageProps {
  searchParams: Promise<{ category?: string }>
}

export const metadata = {
  title: 'Footage | BC Stock',
  description:
    'License premium British Columbia stock footage. Cinematic 4K clips from Vancouver Island, the BC Interior, coastal wilderness, and more.',
}

export default async function FootagePage({ searchParams }: FootagePageProps) {
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
            Footage
          </h1>
          <p style={{ color: '#8b949e' }} className="text-sm">
            British Columbia cinematic stock footage
          </p>
        </div>

        <FootageClientShell
          categories={categories}
          initialCategory={category || 'all'}
        />
      </div>
    </main>
  )
}

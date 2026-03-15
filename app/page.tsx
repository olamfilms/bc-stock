import HeroBanner from '@/components/landing/HeroBanner'
import MediaTypeSelector from '@/components/landing/MediaTypeSelector'
import RandomClipButton from '@/components/media/RandomClipButton'

export default function HomePage() {
  return (
    <main className="relative min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <HeroBanner />
      <section
        className="relative z-10 max-w-6xl mx-auto px-6 py-16"
        style={{ marginTop: '-80px' }}
      >
        <MediaTypeSelector />
        <div className="flex justify-center mt-10">
          <RandomClipButton />
        </div>
      </section>
    </main>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QuoteProvider } from '@/context/QuoteContext'
import NavBarWrapper from '@/components/layout/NavBarWrapper'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  title: 'BC Stock | British Columbia Stock Footage & Photos',
  description:
    'Premium British Columbia stock footage and photography. License cinematic 4K clips and stunning photos from Vancouver Island, the BC Interior, the Wild Coast, and beyond.',
  openGraph: {
    title: 'BC Stock | British Columbia Stock Footage & Photos',
    description:
      'Premium British Columbia stock footage and photography for broadcast, documentary, commercial, and digital use.',
    siteName: 'BC Stock',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <QuoteProvider>
          <NavBarWrapper />
          {children}
          <Footer />
        </QuoteProvider>
      </body>
    </html>
  )
}

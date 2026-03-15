'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

export default function NavBarWrapper() {
  const pathname = usePathname()

  // Hide nav on BC Stock TV (full-screen experience) and admin pages
  const hideNav =
    pathname === '/bc-stock-tv' ||
    pathname.startsWith('/admin')

  if (hideNav) return null
  return <NavBar />
}

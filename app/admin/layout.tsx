import AdminSidebar from '@/components/layout/AdminSidebar'

export const metadata = {
  title: 'Admin | BC Stock',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0d1117' }}>
      <AdminSidebar />
      <main
        className="flex-1 ml-60 p-8 min-h-screen"
        style={{ backgroundColor: '#0d1117' }}
      >
        {children}
      </main>
    </div>
  )
}

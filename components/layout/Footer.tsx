export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="w-full py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      style={{
        borderTop: '1px solid #21262d',
        backgroundColor: '#0d1117',
        color: '#6e7681',
      }}
    >
      <p>
        BC Stock is a project from{' '}
        <a
          href="https://www.olamfilms.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#5aab80' }}
          className="hover:underline"
        >
          Olam Films
        </a>
        .
      </p>
      <p>&copy; {year} BC Stock. All rights reserved.</p>
    </footer>
  )
}

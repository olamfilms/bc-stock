'use client'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by title, description, or tags…',
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      {/* Search icon */}
      <span
        className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="#6e7681" strokeWidth="1.5" />
          <line
            x1="10.0607"
            y1="10"
            x2="13.5"
            y2="13.4393"
            stroke="#6e7681"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg text-sm outline-none transition-colors"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          color: '#e6edf3',
          padding: '10px 36px 10px 36px',
          // focus styles applied via onFocus/onBlur since we can't use Tailwind focus: with inline styles
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#5aab80'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = value ? '#5aab80' : '#30363d'
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
          aria-label="Clear search"
          style={{ color: '#6e7681' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e6edf3'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6e7681'
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="1"
              y1="1"
              x2="13"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="13"
              y1="1"
              x2="1"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

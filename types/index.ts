export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface Media {
  id: string
  type: 'video' | 'photo'
  title: string
  description: string | null
  shot_on: string | null
  vimeo_id: string | null
  duration: number | null
  vimeo_thumbnail: string | null
  cloudinary_id: string | null
  cloudinary_url: string | null
  tags: string[] | null
  is_featured: boolean
  is_published: boolean
  sort_order: number
  ai_enriched: boolean
  created_at: string
  updated_at: string
  categories?: Category[]
}

export interface QuoteItem {
  mediaId: string
  title: string
  type: 'video' | 'photo'
  thumbnail: string | null
}

export interface QuoteFormData {
  email: string
  organization: string
  format: string
  usage: string[]
  runtime: string
  description: string
  mediaIds: string[]
}

export interface EnrichedCSVRow {
  originalTitle: string
  title: string
  vimeoId: string
  description: string
  duration: number | null
  durationFormatted: string
  shotOn: string
  categories: string[]
  thumbnail: string | null
  tags: string[]
  aiEnriched: boolean
  error?: string
}

export interface EnrichedPhotoRow {
  filename: string
  title: string
  description: string
  cloudinaryId: string
  cloudinaryUrl: string
  categories: string[]
  tags: string[]
  aiEnriched: boolean
  error?: string
}

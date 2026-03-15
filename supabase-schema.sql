-- BC Stock Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('video', 'photo')),
  title TEXT NOT NULL,
  description TEXT,
  shot_on TEXT,
  vimeo_id TEXT UNIQUE,
  duration INTEGER,
  vimeo_thumbnail TEXT,
  cloudinary_id TEXT UNIQUE,
  cloudinary_url TEXT,
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  ai_enriched BOOLEAN NOT NULL DEFAULT FALSE,
  ai_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA_CATEGORIES JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS media_categories (
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, category_id)
);

-- ============================================================
-- QUOTE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  organization TEXT,
  format TEXT,
  usage TEXT[],
  runtime TEXT,
  description TEXT,
  media_ids UUID[],
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_is_published ON media(is_published);
CREATE INDEX IF NOT EXISTS idx_media_is_featured ON media(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_categories_media_id ON media_categories(media_id);
CREATE INDEX IF NOT EXISTS idx_media_categories_category_id ON media_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_media_sort_order ON media(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Public can read published media
CREATE POLICY "Public can read published media"
  ON media FOR SELECT
  USING (is_published = TRUE);

-- Public can read all categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (TRUE);

-- Public can read media_categories for published media
CREATE POLICY "Public can read media_categories"
  ON media_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM media
      WHERE media.id = media_categories.media_id
        AND media.is_published = TRUE
    )
  );

-- Service role bypass (used by admin API routes with service role key)
-- The service role key bypasses RLS automatically in Supabase

-- Allow public to insert quote requests
CREATE POLICY "Anyone can submit quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Featured',         'featured',          0),
  ('Wildlife',         'wildlife',          1),
  ('Indigenous',       'indigenous',        2),
  ('Aerial',           'aerial',            3),
  ('Coastal',          'coastal',           4),
  ('Interior',         'interior',          5),
  ('Industry',         'industry',          6),
  ('Salmon',           'salmon',            7),
  ('Urban',            'urban',             8),
  ('Rivers & Streams', 'rivers-streams',    9),
  ('Mountains',        'mountains',        10)
ON CONFLICT (name) DO NOTHING;

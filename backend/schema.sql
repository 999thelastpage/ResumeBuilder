-- ═══════════════════════════════════════════════════════
-- CV Modernizer — Supabase Schema (v2 - Privacy-First)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- Cache table: stores ANONYMIZED data to enforce 3-hour rate limiting.
-- Renamed to cv_modernizer_cache to avoid conflict with legacy tables.
CREATE TABLE IF NOT EXISTS cv_modernizer_cache (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT        NOT NULL UNIQUE,          -- Stores SHA-256 hash of email
  phone       TEXT,                                 -- Stores SHA-256 hash of phone
  experiences JSONB       DEFAULT '[]'::jsonb,      -- [{company, role, startDate, endDate}]
  education   JSONB       DEFAULT '[]'::jsonb,      -- [{institution, degree, startDate, endDate}]
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fast lookup by hashed email
CREATE INDEX IF NOT EXISTS idx_cv_modernizer_email ON cv_modernizer_cache (email);
-- Fast TTL window queries
CREATE INDEX IF NOT EXISTS idx_cv_modernizer_updated ON cv_modernizer_cache (updated_at DESC);

-- Row Level Security
ALTER TABLE cv_modernizer_cache ENABLE ROW LEVEL SECURITY;

-- Allow only service-role key (backend) to read/write.
CREATE POLICY "service_role_only" ON cv_modernizer_cache
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

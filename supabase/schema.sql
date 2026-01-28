-- UCLA Class Tracker - Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main table for tracked URLs
CREATE TABLE tracked_urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  resend_api_key TEXT NOT NULL,
  ucla_url TEXT NOT NULL,
  class_name TEXT,
  term_code TEXT,
  subject_area TEXT,
  catalog_number TEXT,
  selector TEXT DEFAULT '#enrl_mtng_info',
  check_interval TEXT DEFAULT 'hourly' CHECK (check_interval IN ('hourly', '6hours', 'daily')),
  expires_at DATE NOT NULL,
  baseline_hash TEXT,
  baseline_content TEXT,
  last_checked_at TIMESTAMPTZ,
  last_change_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX idx_tracked_urls_email ON tracked_urls(email);
CREATE INDEX idx_tracked_urls_active ON tracked_urls(is_active) WHERE is_active = true;
CREATE INDEX idx_tracked_urls_interval ON tracked_urls(check_interval) WHERE is_active = true;

-- Email verification tokens table
CREATE TABLE email_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_tokens_token ON email_tokens(token);
CREATE INDEX idx_email_tokens_email ON email_tokens(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_tracked_urls_updated_at
  BEFORE UPDATE ON tracked_urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE tracked_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API routes and GitHub Actions)
CREATE POLICY "Service role has full access to tracked_urls"
  ON tracked_urls
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to email_tokens"
  ON email_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to authenticated and service roles
GRANT ALL ON tracked_urls TO service_role;
GRANT ALL ON email_tokens TO service_role;

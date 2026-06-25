-- ============================================================
-- LookaGenius - Supabase Migration Script
-- Run this in the Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- 1. app_data table: stores all collections as JSONB blobs
CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. users table: mirrors localStorage users for auth + sync
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    name TEXT,
    first_name TEXT DEFAULT '',
    father_name TEXT DEFAULT '',
    grandfather_name TEXT DEFAULT '',
    family_name TEXT DEFAULT '',
    email TEXT UNIQUE,
    type TEXT DEFAULT 'student',
    avatar TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    country TEXT DEFAULT '',
    address TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    country_code TEXT DEFAULT '+20',
    parent_phone TEXT DEFAULT '',
    education_stage TEXT DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional, recommended)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Allow all access for now (adjust for production)
CREATE POLICY "Allow all on app_data" ON app_data
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed default data (optional - run once)
-- This populates app_data with the initial collections
INSERT INTO app_data (key, value) VALUES
    ('courses', '[]'::jsonb),
    ('scholarships', '[]'::jsonb),
    ('articles', '[]'::jsonb),
    ('services', '[]'::jsonb),
    ('team', '[]'::jsonb),
    ('courseCategories', '[]'::jsonb),
    ('currencies', '[]'::jsonb),
    ('settings', '{}'::jsonb),
    ('notifications', '[]'::jsonb),
    ('financials', '[]'::jsonb),
    ('settlementRequests', '[]'::jsonb),
    ('collaborations', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users (type);
CREATE INDEX IF NOT EXISTS idx_app_data_updated ON app_data (updated_at);

-- PROJECT: AI ARMY SENTIMENT SURVEY
-- TARGET: Supabase PostgreSQL
-- DESCRIPTION: High-performance, secure schema with RLS and Indexes.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean up (Optional, uncomment if you want a fresh start)
-- DROP TABLE IF EXISTS public.submissions;
-- DROP TABLE IF EXISTS public.soldiers;
-- DROP TABLE IF EXISTS public.questions;

-- 3. Table: Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: Soldiers (Survey Participants)
CREATE TABLE IF NOT EXISTS public.soldiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: Submissions (Survey Results & AI Analysis)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soldier_id UUID NOT NULL REFERENCES public.soldiers(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- Array of { question: string, answer: string }
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_status TEXT CHECK (ai_status IN ('An tâm', 'Dao động', 'Nguy cơ')),
    ai_summary TEXT,
    ai_advice TEXT,
    ai_dialogue_script TEXT, -- Task 3: Dialogue script for 1-on-1 counseling
    admin_note TEXT, -- Manual notes from Command
    is_resolved BOOLEAN DEFAULT FALSE, -- Track if an at-risk soldier has been handled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force add columns if table already exists
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS ai_dialogue_script TEXT;

-- 5.5 Table: Admin Profiles (RBAC)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT, -- Display name for the admin officer
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'unit_admin')) DEFAULT 'super_admin',
    assigned_unit TEXT, -- e.g., 'Đại đội 1'. Null if super_admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was created before this migration
ALTER TABLE public.admin_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;


-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_soldiers_token ON public.soldiers(token);
CREATE INDEX IF NOT EXISTS idx_submissions_soldier_id ON public.submissions(soldier_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Security Policies

-- [Questions]
-- Anyone can read questions to take the survey
DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;
CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

-- Admins (Authenticated) can manage questions
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [Soldiers]
-- Anyone can read a soldier record (needed for token validation in the app)
DROP POLICY IF EXISTS "Allow public read soldiers" ON public.soldiers;
CREATE POLICY "Allow public read soldiers" ON public.soldiers
    FOR SELECT USING (true);

-- Soldiers can update their own status (is_completed)
DROP POLICY IF EXISTS "Allow survey submission update" ON public.soldiers;
CREATE POLICY "Allow survey submission update" ON public.soldiers
    FOR UPDATE USING (is_completed = false) WITH CHECK (is_completed = true);

-- Admins (Authenticated) can manage soldiers
DROP POLICY IF EXISTS "Admins can manage soldiers" ON public.soldiers;
CREATE POLICY "Admins can manage soldiers" ON public.soldiers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [Submissions]
-- Anyone (Soldiers) can submit their survey
DROP POLICY IF EXISTS "Allow survey submission" ON public.submissions;
CREATE POLICY "Allow survey submission" ON public.submissions
    FOR INSERT WITH CHECK (true);

-- Only Admins (Authenticated) can read/manage submissions
DROP POLICY IF EXISTS "Admins can view and manage results" ON public.submissions;
CREATE POLICY "Admins can view and manage results" ON public.submissions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [Admin Profiles]
-- Admins can read all profiles, but only manage profiles logic
DROP POLICY IF EXISTS "Admins can view profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view profiles" ON public.admin_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Commenting (Optional documentation for Supabase)
COMMENT ON TABLE public.submissions IS 'Stores original responses and AI-generated sentiment analysis results.';
COMMENT ON COLUMN public.submissions.admin_note IS 'Manual assessment or instruction added by the Commanding Officer.';
COMMENT ON COLUMN public.submissions.is_resolved IS 'Marks whether human intervention was performed for this assessment.';
COMMENT ON TABLE public.admin_profiles IS 'Maps auth.users UUID to specific App Roles like unit_admin to filter data view';

-- 10. Table: App Settings (Dynamic Configurations like Cache Name)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize GEMINI_CACHE_NAME if not exists
INSERT INTO public.app_settings (id, value) 
VALUES ('GEMINI_CACHE_NAME', '') 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read settings
DROP POLICY IF EXISTS "Allow public read settings" ON public.app_settings;
CREATE POLICY "Allow public read settings" ON public.app_settings
    FOR SELECT USING (true);

-- Admins can manage settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

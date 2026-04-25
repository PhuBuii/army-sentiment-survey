-- 🪖 AI ARMY SENTIMENT SURVEY - FULL SCHEMA REWRITE
-- Target: Supabase PostgreSQL
-- Description: Professional-grade schema with automatic profile syncing, granular RLS, and optimized performance.

-- 1. Enable Necessary Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: Questions (Survey Questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: Soldiers (Survey Participants)
CREATE TABLE IF NOT EXISTS public.soldiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: Admin Profiles (RBAC & User Metadata)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    rank TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'unit_admin')) DEFAULT 'super_admin',
    assigned_unit TEXT, -- e.g., 'Đại đội 1'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: Submissions (Results & AI Analysis)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soldier_id UUID NOT NULL REFERENCES public.soldiers(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_status TEXT CHECK (ai_status IN ('An tâm', 'Dao động', 'Nguy cơ')),
    ai_summary TEXT,
    ai_advice TEXT,
    ai_dialogue_script TEXT,
    admin_note TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table: App Settings (Dynamic Config)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_soldiers_token ON public.soldiers(token);
CREATE INDEX IF NOT EXISTS idx_submissions_soldier_id ON public.submissions(soldier_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. AUTOMATION: Sync Auth Users with Admin Profiles
-- ══════════════════════════════════════════════════════════════════════════════

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrator'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'super_admin')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. SECURITY: Row Level Security (RLS) Policies
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- [Admin Profiles Policies]
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.admin_profiles;
CREATE POLICY "Profiles are viewable by all authenticated users" ON public.admin_profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.admin_profiles;
CREATE POLICY "Users can update their own profile" ON public.admin_profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.admin_profiles;
CREATE POLICY "Users can insert their own profile" ON public.admin_profiles
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

-- [Questions Policies]
DROP POLICY IF EXISTS "Public read questions" ON public.questions;
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL TO authenticated USING (true);

-- [Soldiers Policies]
DROP POLICY IF EXISTS "Public read soldiers" ON public.soldiers;
CREATE POLICY "Public read soldiers" ON public.soldiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Survey completion update" ON public.soldiers;
CREATE POLICY "Survey completion update" ON public.soldiers FOR UPDATE USING (is_completed = false);

DROP POLICY IF EXISTS "Admins manage soldiers" ON public.soldiers;
CREATE POLICY "Admins manage soldiers" ON public.soldiers FOR ALL TO authenticated USING (true);

-- [Submissions Policies]
DROP POLICY IF EXISTS "Public insert submissions" ON public.submissions;
CREATE POLICY "Public insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins view and manage submissions" ON public.submissions;
CREATE POLICY "Admins view and manage submissions" ON public.submissions FOR ALL TO authenticated USING (true);

-- [App Settings Policies]
DROP POLICY IF EXISTS "Public read settings" ON public.app_settings;
CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated USING (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. STORAGE: Avatars Bucket Policies (Run in SQL Editor)
-- ══════════════════════════════════════════════════════════════════════════════
-- NOTE: Make sure to create a bucket named 'avatars' first.

-- Allow public read of avatars
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- DROP POLICY IF EXISTS "Avatar public access" ON storage.objects;
-- CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- DROP POLICY IF EXISTS "Admins can upload avatars" ON storage.objects;
-- CREATE POLICY "Admins can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

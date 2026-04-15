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
    admin_note TEXT, -- Manual notes from Command
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_soldiers_token ON public.soldiers(token);
CREATE INDEX IF NOT EXISTS idx_submissions_soldier_id ON public.submissions(soldier_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 8. Security Policies

-- [Questions]
-- Anyone can read questions to take the survey
CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

-- Admins (Authenticated) can manage questions
CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [Soldiers]
-- Anyone can read a soldier record (needed for token validation in the app)
CREATE POLICY "Allow public read soldiers" ON public.soldiers
    FOR SELECT USING (true);

-- Soldiers can update their own status (is_completed)
CREATE POLICY "Allow survey submission update" ON public.soldiers
    FOR UPDATE USING (is_completed = false) WITH CHECK (is_completed = true);

-- Admins (Authenticated) can manage soldiers
CREATE POLICY "Admins can manage soldiers" ON public.soldiers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [Submissions]
-- Anyone (Soldiers) can submit their survey
CREATE POLICY "Allow survey submission" ON public.submissions
    FOR INSERT WITH CHECK (true);

-- Only Admins (Authenticated) can read/manage submissions
CREATE POLICY "Admins can view and manage results" ON public.submissions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Commenting (Optional documentation for Supabase)
COMMENT ON TABLE public.submissions IS 'Stores original responses and AI-generated sentiment analysis results.';
COMMENT ON COLUMN public.submissions.admin_note IS 'Manual assessment or instruction added by the Commanding Officer.';

-- ==========================================
-- BuildWithIF CMS - Blog Module
-- Tables: blog_categories, blog_posts
-- Run this in the Supabase SQL Editor.
-- ==========================================

-- ------------------------------------------
-- blog_categories
-- ------------------------------------------

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage blog categories"
    ON public.blog_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anon users can read active blog categories"
    ON public.blog_categories FOR SELECT
    USING (auth.role() = 'anon' AND is_active = true);

-- ------------------------------------------
-- blog_posts
-- ------------------------------------------

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    author text,
    slug text UNIQUE NOT NULL,
    category_id uuid REFERENCES public.blog_categories(id),
    excerpt text,
    content text,
    cover_image text,
    meta_title text,
    meta_description text,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at timestamptz,
    author_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage blog posts"
    ON public.blog_posts FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anon users can read published blog posts"
    ON public.blog_posts FOR SELECT
    USING (auth.role() = 'anon' AND status = 'published');

-- ------------------------------------------
-- Helpful indexes
-- ------------------------------------------

CREATE INDEX blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

-- ------------------------------------------
-- Migration: columns missing from blog_posts tables created
-- from an older schema version. Safe to re-run (idempotent).
-- ------------------------------------------

ALTER TABLE public.blog_posts
    ADD COLUMN IF NOT EXISTS subtitle text,
    ADD COLUMN IF NOT EXISTS author text,
    ADD COLUMN IF NOT EXISTS meta_title text,
    ADD COLUMN IF NOT EXISTS meta_description text;

NOTIFY pgrst, 'reload schema';

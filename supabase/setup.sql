-- ==========================================
-- BuildWithIF CMS - Generatii Digitale
-- Full database setup (run once)
-- Paste into: Supabase Dashboard -> SQL Editor -> New query
-- Consolidates: docs/DATABASE-STANDARD.md + modules/blog/blog.sql
-- ==========================================

-- ------------------------------------------
-- users (extends auth.users with roles)
-- ------------------------------------------

CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    role text DEFAULT 'client' CHECK (role IN ('administrator', 'editor', 'client')),
    full_name text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Administrators can manage users"
    ON public.users FOR ALL
    USING (auth.jwt() ->> 'role' = 'administrator');

-- ------------------------------------------
-- leads (website contact/offer forms)
-- ------------------------------------------

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    source text,
    message text,
    status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leads"
    ON public.leads FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public website (anon) can submit leads, but never read them
CREATE POLICY "Anyone can submit a lead"
    ON public.leads FOR INSERT
    WITH CHECK (auth.role() = 'anon');

-- ------------------------------------------
-- gallery_categories
-- ------------------------------------------

CREATE TABLE public.gallery_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage gallery categories"
    ON public.gallery_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------
-- gallery_images
-- ------------------------------------------

CREATE TABLE public.gallery_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    path text NOT NULL,
    category_id uuid REFERENCES public.gallery_categories(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage gallery images"
    ON public.gallery_images FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public site can read gallery
CREATE POLICY "Anon users can read gallery images"
    ON public.gallery_images FOR SELECT
    USING (auth.role() = 'anon');

-- ------------------------------------------
-- workshop_categories
-- ------------------------------------------

CREATE TABLE public.workshop_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workshop_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage workshop categories"
    ON public.workshop_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------
-- workshops
-- ------------------------------------------

CREATE TABLE public.workshops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE,
    description text,
    age_group text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage workshops"
    ON public.workshops FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public site can read active workshops
CREATE POLICY "Anon users can read active workshops"
    ON public.workshops FOR SELECT
    USING (auth.role() = 'anon' AND is_active = true);

-- ------------------------------------------
-- blog_categories (from modules/blog/blog.sql)
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
-- blog_posts (from modules/blog/blog.sql)
-- ------------------------------------------

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    category_id uuid REFERENCES public.blog_categories(id),
    excerpt text,
    content text,
    cover_image text,
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

CREATE INDEX blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

-- ------------------------------------------
-- Storage: public bucket "images"
-- ------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

-- ------------------------------------------
-- Done. Next steps:
-- 1. Create your admin user: Authentication -> Users -> Add user -> create user
-- 2. Grant the role by running (replace with your user's id from the Users list):
--    INSERT INTO public.users (id, role, full_name)
--    VALUES ('<user-uuid-from-authentication>', 'administrator', 'Numele Tau')
--    ON CONFLICT (id) DO UPDATE SET role = 'administrator';
-- ==========================================

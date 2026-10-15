-- ==========================================
-- BuildWithIF CMS - Generatii Digitale
-- Full database setup (safe to re-run multiple times)
-- Paste into: Supabase Dashboard -> SQL Editor -> New query
-- Consolidates: docs/DATABASE-STANDARD.md + modules/blog/blog.sql
-- ==========================================

-- ------------------------------------------
-- users (extends auth.users with roles)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    role text DEFAULT 'client' CHECK (role IN ('administrator', 'editor', 'client')),
    full_name text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Administrators can manage users" ON public.users;
CREATE POLICY "Administrators can manage users"
    ON public.users FOR ALL
    USING (auth.jwt() ->> 'role' = 'administrator');

-- ------------------------------------------
-- leads (website contact/offer forms)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.leads (
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

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads"
    ON public.leads FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public website (anon) can submit leads, but never read them
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
    ON public.leads FOR INSERT
    WITH CHECK (auth.role() = 'anon');

-- ------------------------------------------
-- gallery_categories
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage gallery categories" ON public.gallery_categories;
CREATE POLICY "Authenticated users can manage gallery categories"
    ON public.gallery_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------
-- gallery_images
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    path text NOT NULL,
    category_id uuid REFERENCES public.gallery_categories(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage gallery images" ON public.gallery_images;
CREATE POLICY "Authenticated users can manage gallery images"
    ON public.gallery_images FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public site can read gallery
DROP POLICY IF EXISTS "Anon users can read gallery images" ON public.gallery_images;
CREATE POLICY "Anon users can read gallery images"
    ON public.gallery_images FOR SELECT
    USING (auth.role() = 'anon');

-- ------------------------------------------
-- workshop_categories
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.workshop_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workshop_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage workshop categories" ON public.workshop_categories;
CREATE POLICY "Authenticated users can manage workshop categories"
    ON public.workshop_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ------------------------------------------
-- workshops
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.workshops (
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

DROP POLICY IF EXISTS "Authenticated users can manage workshops" ON public.workshops;
CREATE POLICY "Authenticated users can manage workshops"
    ON public.workshops FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Public site can read active workshops
DROP POLICY IF EXISTS "Anon users can read active workshops" ON public.workshops;
CREATE POLICY "Anon users can read active workshops"
    ON public.workshops FOR SELECT
    USING (auth.role() = 'anon' AND is_active = true);

-- ------------------------------------------
-- blog_categories (from modules/blog/blog.sql)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.blog_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage blog categories" ON public.blog_categories;
CREATE POLICY "Authenticated users can manage blog categories"
    ON public.blog_categories FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anon users can read active blog categories" ON public.blog_categories;
CREATE POLICY "Anon users can read active blog categories"
    ON public.blog_categories FOR SELECT
    USING (auth.role() = 'anon' AND is_active = true);

-- ------------------------------------------
-- blog_posts (from modules/blog/blog.sql)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.blog_posts (
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

DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON public.blog_posts;
CREATE POLICY "Authenticated users can manage blog posts"
    ON public.blog_posts FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anon users can read published blog posts" ON public.blog_posts;
CREATE POLICY "Anon users can read published blog posts"
    ON public.blog_posts FOR SELECT
    USING (auth.role() = 'anon' AND status = 'published');

CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts (published_at DESC);

-- ------------------------------------------
-- Storage: public bucket "images"
-- ------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
CREATE POLICY "Images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

-- ------------------------------------------
-- Admin user: generatii.digitale@gmail.com
-- Creates the login user (if missing) and grants administrator role.
-- IMPORTANT: replace the password below BEFORE running, then log in
-- and change it again from the CMS (or ask for a password reset).
-- ==========================================

DO $$
DECLARE
    admin_email text := 'generatii.digitale@gmail.com';
    admin_pass  text := 'SchimbaParola123!';  -- <-- CHANGE THIS
    admin_name  text := 'Generații Digitale';
    admin_id    uuid;
BEGIN
    -- Reuse the user if it already exists (e.g. created via dashboard)
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;

    IF admin_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at,
            raw_app_meta_data, raw_user_meta_data,
            is_super_admin, confirmation_token,
            email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
            'authenticated', 'authenticated', admin_email,
            crypt(admin_pass, gen_salt('bf')), now(),
            now(), now(),
            '{"provider":"email","providers":["email"],"role":"administrator"}', '{}',
            false, '', '', '', ''
        )
        RETURNING id INTO admin_id;
    ELSE
        -- Existing user: make sure the JWT carries the administrator role
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || '{"role":"administrator"}'
        WHERE id = admin_id;
    END IF;

    INSERT INTO public.users (id, role, full_name)
    VALUES (admin_id, 'administrator', admin_name)
    ON CONFLICT (id) DO UPDATE SET role = 'administrator';
END $$;

-- ==========================================
-- Done. Login at /admin with:
--   email: generatii.digitale@gmail.com
--   password: the one you set above
-- ==========================================

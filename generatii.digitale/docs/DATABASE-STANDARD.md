# BuildWithIF CMS Database Standard
---
Version: 1.0

---
## Principles

- All data is stored in Supabase PostgreSQL.
- Every table has `id`, `created_at`, and `updated_at`.
- Soft deletes are preferred over hard deletes for production modules.
- Foreign keys use `uuid` and reference `auth.users(id)` where applicable.
- File paths are stored in tables; actual files live in Supabase Storage.
- Row Level Security (RLS) is enabled on all tables.

---

## Default Tables

### users

Extends `auth.users` with role information.

```sql
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    role text DEFAULT 'client' CHECK (role IN ('administrator', 'editor', 'client')),
    full_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Administrators can manage users"
    ON public.users FOR ALL
    USING (auth.jwt() ->> 'role' = 'administrator');
```

---

### gallery_images

```sql
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
```

---

### gallery_categories

```sql
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
```

---

### workshops

```sql
CREATE TABLE public.workshops (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
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
```

---

### workshop_categories

```sql
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
```

---

## Storage

Create a public bucket named `images`.

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
```

Enable RLS on the bucket and add a policy to allow authenticated uploads:

```sql
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');
```

---

## Naming Conventions

- Tables: lowercase, plural, snake_case
- Columns: lowercase, snake_case
- Storage paths: `folder/filename.ext`

---

## Implemented Tables

- `blog_posts` — implemented by the Blog module (`modules/blog/blog.sql`).
- `blog_categories` — implemented by the Blog module (`modules/blog/blog.sql`).

---

## Future Tables

- `pages`
- `faq`
- `faq_categories`
- `testimonials`
- `activity_logs`

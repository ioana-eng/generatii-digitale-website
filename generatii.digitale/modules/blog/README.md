# BuildWithIF CMS — Blog Module

## Purpose

Manage the website blog: articles (`blog_posts`) and article categories (`blog_categories`). Published articles are displayed on the public page `blog.html`.

## Access

Available to **editor** and **administrator** roles (the `blog` module id is part of the `editor` role in `config/permissions.js`).

## Features

- List articles with server-side search, sorting, pagination, and filtering (by status and category).
- Create / edit articles with title, auto-generated slug, category, excerpt, content, cover image, and status.
- Cover image upload to the `images` Storage bucket (paths stored as `blog/<filename>`).
- Publishing sets `published_at` automatically; bulk publish / move to drafts.
- Preview a published article directly on the public site (`blog.html?slug=...`).
- Manage categories (name, slug, active flag) in a dedicated tab.
- Bulk delete / activate / deactivate categories.

## Files

```
modules/blog/
├── blog.css        # Module styles
├── blog.js         # Module logic
├── blog.sql        # Table definitions + RLS policies
└── README.md       # This file
```

## Dependencies

- `core/database.js` — `BWDatabase` CRUD operations.
- `core/table/` — `BWTable`, `BWTableActions`, `BWColumnFormatters`.
- `core/form/` — `BWForm`.
- `core/storage.js` — `BWStorage` (cover image uploads).
- `core/auth.js` — `getCurrentUser` (article author).
- `ui/Modal/Modal.js` — `BWModal`.
- `ui/Toast/Toast.js` — `BWToast`.

## Configuration

Add the module to `config/modules.js`:

```js
{ id: "blog", title: "Articole", icon: "📝", enabled: true, permission: "editor", entry: "modules/blog/blog.js" }
```

Add the table names to `config/project.js`:

```js
tables: {
    // ...existing tables
    blogPosts: "blog_posts",
    blogCategories: "blog_categories"
}
```

## Database Tables

Run `modules/blog/blog.sql` in the Supabase SQL Editor to create the tables and RLS policies.

### blog_posts

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key. |
| `title` | text | Article title. |
| `slug` | text | Unique, URL-friendly identifier used by `blog.html?slug=...`. |
| `category_id` | uuid | Reference to `blog_categories(id)` (optional). |
| `excerpt` | text | Short summary shown in the article list (optional). |
| `content` | text | Full article content (plain text). |
| `cover_image` | text | Storage path in the `images` bucket, e.g. `blog/photo.jpg` (optional). |
| `status` | text | `draft` or `published`. |
| `published_at` | timestamptz | Set automatically on first publish. |
| `author_id` | uuid | Reference to `auth.users(id)`; set automatically to the current CMS user. |
| `created_at` | timestamptz | Creation timestamp. |
| `updated_at` | timestamptz | Last update timestamp. |

### blog_categories

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key. |
| `name` | text | Category name. |
| `slug` | text | Unique, URL-friendly identifier (optional). |
| `is_active` | boolean | Inactive categories are hidden from the public site. |
| `created_at` | timestamptz | Creation timestamp. |
| `updated_at` | timestamptz | Last update timestamp. |

RLS: `authenticated` users have full access to both tables. `anon` users can only `SELECT` published posts (`status = 'published'`) and active categories (`is_active = true`), which is what the public `blog.html` page uses.

## Public website integration

The CMS module manages content; the public site reads published rows with the anon key.

List published articles (newest first), with the category name:

```js
const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, blog_categories(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
```

Fetch a single article for the detail view:

```js
const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
```

Cover image public URL:

```js
const coverUrl = post.cover_image
    ? `${SUPABASE_URL}/storage/v1/object/public/images/${post.cover_image}`
    : null;
```

The public page `blog.html` (site root) implements this integration and reads its settings from `config/project.js` (`window.BW_PROJECT`).

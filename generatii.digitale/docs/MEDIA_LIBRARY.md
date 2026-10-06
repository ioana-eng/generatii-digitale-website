# BuildWithIF CMS — Media Library Design

Version: 1.0  
Status: Design  
Owner: BuildWithIF

---

## 1. Vision

The Media Library is a central, reusable media manager for BuildWithIF CMS. It behaves like the WordPress Media Library:

- Images are uploaded **once**.
- After upload they can be **reused everywhere**.
- It works in two modes:
  1. **Standalone** — full-page media manager.
  2. **Picker** — modal that returns the selected image URL/object.

All modules (Gallery, Workshops, Pages, Blog, etc.) should use the same Media Library instead of building their own upload logic.

---

## 2. Architecture & Data Flow

The Media Library follows the project rule: **UI → Module → Core → Supabase**.

```
┌─────────────────────────────────────────────┐
│  UI Components                               │
│  MediaLibrary / MediaGrid / MediaList ...   │
└──────────────┬──────────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────────┐
│  Core Services                               │
│  BWMediaService / BWMediaPicker              │
│  BWMediaUploader / BWImagePreview            │
└──────────────┬──────────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────────┐
│  Supabase                                    │
│  Storage (files) + Database (metadata)       │
└─────────────────────────────────────────────┘
```

No UI component talks directly to Supabase. All operations go through `core/media/` services.

---

## 3. Folder Structure

```
BuildWithIF-CMS/
├── core/
│   └── media/
│       ├── MediaService.js       # Supabase storage + DB CRUD
│       ├── MediaPicker.js        # Promise-based picker modal
│       ├── MediaUploader.js      # Multi-file upload queue + progress
│       └── README.md
├── ui/
│   └── MediaLibrary/
│       ├── MediaLibrary.js       # Main container component
│       ├── MediaLibrary.css
│       ├── MediaGrid.js          # Grid view
│       ├── MediaList.js          # List view
│       ├── MediaToolbar.js       # Search, view toggle, filters, upload
│       ├── MediaSidebar.js       # Details panel
│       ├── MediaPreview.js       # Lightbox / preview
│       ├── MediaUploaderUI.js    # Drag & drop zone + progress
│       └── README.md
├── modules/
│   └── media/
│       ├── media.html            # Standalone page
│       ├── media.js              # Standalone module entry
│       └── media.css
└── docs/
    └── MEDIA_LIBRARY.md          # This document
```

---

## 4. Component Hierarchy

```
BWMediaLibrary (container)
│
├── BWMediaToolbar
│   ├── Search input
│   ├── View toggle (grid / list)
│   ├── Category filter
│   ├── Tag filter
│   └── Upload button / drag zone
│
├── BWMediaUploaderUI (drag & drop, progress bars)
│
├── BWMediaContent
│   ├── BWMediaGrid (thumbnail cards)
│   └── BWMediaList (compact rows)
│
├── BWMediaSidebar (image details + edit form)
│
└── BWMediaPreview (lightbox)
```

**Picker mode** wraps `BWMediaLibrary` inside a `BWModal` and resolves a Promise when an image is selected.

---

## 5. Database Structure

### Table: `media`

| Column         | Type        | Description                           |
|----------------|-------------|---------------------------------------|
| `id`           | uuid        | Primary key                           |
| `filename`     | text        | Original / display file name          |
| `title`        | text        | Image title (defaults to filename)    |
| `alt`          | text        | Alt text for accessibility            |
| `description`  | text        | Long description                      |
| `width`        | int         | Image width in px                     |
| `height`       | int         | Image height in px                    |
| `filesize`     | int         | Size in bytes                         |
| `mime_type`    | text        | e.g. `image/webp`                     |
| `bucket`       | text        | Supabase bucket name                  |
| `path`         | text        | Storage path (e.g. `media/uuid_name`)|
| `public_url`   | text        | Cached public URL                     |
| `category_id`  | uuid?       | FK to `media_categories`              |
| `uploaded_by`  | uuid        | FK to `auth.users`                    |
| `created_at`   | timestamptz | Auto                                  |
| `updated_at`   | timestamptz | Auto                                  |

### Table: `media_categories`

| Column  | Type | Description          |
|---------|------|----------------------|
| `id`    | uuid | Primary key          |
| `name`  | text | Category name        |
| `slug`  | text | URL-friendly slug    |

### Table: `media_tags`

| Column | Type | Description   |
|--------|------|---------------|
| `id`   | uuid | Primary key   |
| `name` | text | Tag name      |
| `slug` | text | URL slug      |

### Table: `media_tag_mappings`

Many-to-many between `media` and `media_tags`.

| Column     | Type | Description       |
|------------|------|-------------------|
| `media_id` | uuid | FK to media       |
| `tag_id`   | uuid | FK to media_tags  |

### Indexes

- `media(filename)` — search
- `media(category_id)` — filtering
- `media(uploaded_by)` — RLS / ownership
- `media(created_at)` — sorting

---

## 6. Storage Structure

### Bucket

- **Name:** `media`
- **Public:** yes (or signed URLs if private)

### File Path Convention

```
media/{uuid}_{filename}
```

Example:

```
media/a1b2c3d4_workshop-hero.webp
```

### Rules

1. Every file path is stored in the `media.path` column.
2. The database row is the **source of truth**; Storage only holds the binary file.
3. Filenames are sanitized (spaces → `-`, lowercase, no special chars).
4. To avoid collisions, a short UUID prefix is added.
5. `public_url` is generated once after upload and cached in the row.

### Rename / Replace

- **Rename:** update `filename`, `title`, and optionally move the Storage object to a new path, then update `path` and `public_url`.
- **Replace:** upload a new file to the **same path** with `upsert: true`, then update `width`, `height`, `filesize`, `mime_type`, and `updated_at`.

---

## 7. Reusable API

All public APIs live under the `BWMedia` namespace.

### 7.1 MediaService

```js
// core/media/MediaService.js
const BWMediaService = {

  async upload(file, metadata = {}, onProgress = null) {
    // Returns media record
  },

  async uploadMany(files, metadata = {}, onProgress = null) {
    // Returns array of media records
  },

  async list(options = {}) {
    // options: page, pageSize, search, categoryId, tagIds, sort
    // Returns { data, count, page, pageSize, totalPages }
  },

  async getById(id) {
    // Returns single media record
  },

  async update(id, updates) {
    // Update title, alt, description, category_id, tags
  },

  async rename(id, newFilename, newTitle = null) {
    // Rename file in storage + update DB row
  },

  async replace(id, file, onProgress = null) {
    // Upload new file to same path with upsert
  },

  async delete(id) {
    // Delete storage object + DB row
  },

  getPublicUrl(path) {
    // Returns Supabase public URL
  },

  async extractImageInfo(file) {
    // Returns { width, height, filesize, mime_type }
  }

};
```

### 7.2 MediaPicker

Promise-based picker, usable from any form field.

```js
// Usage in a form field
const image = await BWMediaPicker.open({
  multiple: false,
  accept: 'image/*',
  categoryId: null,
  title: 'Selecteaza imaginea'
});

// Returns
{
  id: 'uuid',
  url: 'https://...',
  filename: 'workshop-hero.webp',
  width: 1200,
  height: 800,
  alt: '...',
  title: '...'
}
```

If `multiple: true`, returns an array.

### 7.3 MediaUploader

Internal upload queue used by `MediaUploaderUI`.

```js
const queue = new BWMediaUploader({
  files: FileList,
  metadata: { category_id: '...' },
  onProgress: (file, percent) => { ... },
  onComplete: (file, record) => { ... },
  onError: (file, error) => { ... }
});

queue.start();
```

---

## 8. Modes

### 8.1 Standalone Mode

```
admin/media.html  (or module route)
```

Full-page manager where users can:

- Browse all images
- Upload / delete / rename / replace
- Edit metadata
- Search and filter

### 8.2 Picker Mode

```js
const image = await BWMediaPicker.open({
  title: 'Alege imaginea',
  accept: 'image/*',
  multiple: false
});
```

Behavior:

1. Opens `BWMediaLibrary` inside a modal.
2. User selects an image.
3. Modal closes.
4. Promise resolves with the selected image object.

This is the mode used by the Gallery module, Workshop form, Page builder, etc.

---

## 9. Upload Flow

1. User drops files or clicks **Upload**.
2. `MediaUploaderUI` creates a `BWMediaUploader` queue.
3. For each file:
   - Extract `width`, `height`, `filesize`, `mime_type` (using `Image` + `file.size`).
   - Sanitize filename and generate a unique path.
   - Upload to Supabase Storage with progress callback.
   - Get public URL.
   - Insert row into `media` table.
   - Emit `onComplete`.
4. Library refreshes and shows the new image.

---

## 10. Implementation Plan

### Phase 1 — Core Service

- Create `core/media/MediaService.js`
- Implement: `upload`, `list`, `getById`, `update`, `delete`, `getPublicUrl`
- Add `extractImageInfo` helper
- Add Supabase bucket `media` migration notes

### Phase 2 — Database

- Create `media`, `media_categories`, `media_tags`, `media_tag_mappings` tables
- Add indexes and RLS policies
- Document migration SQL

### Phase 3 — Picker API

- Create `core/media/MediaPicker.js`
- Promise-based modal wrapper
- Return selected image object(s)

### Phase 4 — UI Components

- `ui/MediaLibrary/MediaLibrary.js` (container)
- `MediaGrid.js`, `MediaList.js`
- `MediaToolbar.js`
- `MediaSidebar.js`
- `MediaPreview.js`
- `MediaUploaderUI.js`
- `MediaLibrary.css`

### Phase 5 — Standalone Module

- `modules/media/media.html`
- `modules/media/media.js`
- Register route in router/config

### Phase 6 — Module Integration

- Replace direct image uploads in Gallery module with `BWMediaPicker.open(...)`
- Update `Gallery` form fields to store only `media_id` + `public_url`

### Phase 7 — Polish

- Search + filters (category, tag)
- Drag & drop improvements
- Empty states
- Loading skeletons
- Toasts / confirmations

### Phase 8 — Future

- Image compression before upload
- Folders in storage
- Bulk select / bulk delete
- Video / file support

---

## 11. Security & Rules

### Row Level Security

```sql
-- Users can only manage their own uploads
CREATE POLICY "Users can manage own media"
ON media
FOR ALL
TO authenticated
USING (uploaded_by = auth.uid());
```

For admin/editor roles, a more permissive policy can be added based on `user_roles`.

### Storage Policies

- Authenticated users can upload to `media/`.
- Users can delete only objects they uploaded (matched via DB record).
- Public read access for `media/` bucket.

---

## 12. Notes

- The Media Library stores the **public URL** in the DB for fast reads, but it can always be regenerated from `bucket` + `path`.
- Modules should store `media_id` as the reference, not the raw URL, so metadata changes are reflected everywhere.
- `public_url` is useful for public-facing websites where joining the media table is not needed.
- All filenames are sanitized server-side; the original name is kept in `filename` for display.

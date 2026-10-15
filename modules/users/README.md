# BuildWithIF CMS — Users Module

## Purpose

Management of CMS users and their roles.

## Access

Administrator only.

## Features

- List users with server-side search, sorting and pagination
- Create new users
- Edit name, role and active status
- Disable / activate users
- Delete users
- Reset password via email
- Last login tracking

## Files

```
modules/users/
├── index.html      # Redirects to admin/#/users
├── module.css      # Module styles
├── module.js       # Module logic
└── README.md       # This file
```

## Dependencies

- `core/database.js` — user metadata CRUD
- `core/auth.js` — login sync and password reset
- `core/table/` — `BWTable`, `BWTableActions`
- `core/form/` — `BWForm`
- `ui/Modal/Modal.js` — `BWModal`
- `ui/Toast/Toast.js` — `BWToast`

## Database Table

`users`

| Column      | Type        | Description                  |
|-------------|-------------|------------------------------|
| `id`        | uuid        | Same as `auth.users.id`      |
| `email`     | text        | User email                   |
| `full_name` | text        | Display name                 |
| `role`      | text        | administrator / editor / client |
| `is_active` | boolean     | Active / inactive            |
| `last_login`| timestamptz | Last login timestamp         |
| `created_at`| timestamptz | Creation timestamp           |

## Notes

- New users are created via `supabase.auth.signUp`. Depending on Supabase settings, email confirmation may be required.
- Deleting a user removes the row from the `users` table and attempts to remove the auth account.
- The current user's `last_login` is synced on every login in `core/auth.js`.

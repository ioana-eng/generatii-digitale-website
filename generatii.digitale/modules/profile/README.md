# BuildWithIF CMS — Profile Module

## Purpose

Allows the currently logged-in user to view their account information, change their password, and log out.

## Access

Available to **all authenticated users** (`permission: "all"`).

## Features

- View the logged-in email address (read-only).
- View the current user role.
- Change password using the current password + new password + confirmation.
- Logout button.

## Files

```
modules/profile/
├── module.css      # Module styles
├── module.js       # Module logic
└── README.md       # This file
```

## Dependencies

- `core/auth.js` — `logout()` function.
- `core/permissions.js` — `BWPermissions.getRole()`.
- `core/form/` — `BWForm`.
- `ui/Card/Card.js` — `BWCard`.
- `ui/Toast/Toast.js` — `BWToast`.

## Configuration

The module itself does not require any project-specific configuration. It is enabled by adding it to `config/modules.js`:

```js
{ id: "profile", title: "Contul meu", icon: "👤", enabled: true, permission: "all", entry: "modules/profile/module.js" }
```

## Notes

- The email address cannot be changed from this panel. Email changes should be handled by an administrator in the `users` module or via Supabase Auth directly.
- The password change flow re-authenticates the user with the current password before calling `supabase.auth.updateUser()`.
- The minimum password length is 6 characters.

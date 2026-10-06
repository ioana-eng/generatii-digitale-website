# BuildWithIF CMS — Leads Module

## Purpose

Collect and manage leads submitted through public website forms (contact, offer requests, bookings, etc.).

## Access

Available to **all authenticated CMS users**. Every user can view and manage all leads.

## Features

- List leads with server-side search, sorting, pagination, and filtering.
- View lead details in a modal.
- Update lead status and internal notes.
- Archive or delete individual leads.
- Bulk archive / bulk delete selected leads.
- In-app notification for new leads received in the last 24 hours.
- Configurable email notification structure for project-specific integration.

## Files

```
modules/leads/
├── module.css      # Module styles
├── module.js       # Module logic
└── README.md       # This file
```

## Dependencies

- `core/database.js` — `BWDatabase` CRUD operations.
- `core/table/` — `BWTable`, `BWTableActions`.
- `core/form/` — `BWForm`.
- `core/eventBus.js` — `BWEventBus` for `leads:new` event.
- `ui/Modal/Modal.js` — `BWModal`.
- `ui/Toast/Toast.js` — `BWToast`.

## Configuration

Add the module to `config/modules.js`:

```js
{ id: "leads", title: "Lead-uri", icon: "📥", enabled: true, permission: "all", entry: "modules/leads/module.js" }
```

Configure the module in `config/project.js`:

```js
leads: {
    table: "leads",
    fields: [
        { name: "name", label: "Nume", type: "text", required: true, showInTable: true },
        { name: "email", label: "Email", type: "email", required: true, showInTable: true },
        { name: "phone", label: "Telefon", type: "tel", showInTable: true },
        { name: "source", label: "Sursa", type: "text", showInTable: true },
        { name: "message", label: "Mesaj", type: "textarea", showInTable: false }
    ],
    statuses: [
        { value: "new", label: "Nou", color: "danger" },
        { value: "contacted", label: "Contactat", color: "warning" },
        { value: "qualified", label: "Calificat", color: "info" },
        { value: "converted", label: "Convertit", color: "success" },
        { value: "archived", label: "Arhivat", color: "neutral" }
    ],
    notifications: {
        inApp: true,
        email: {
            enabled: false,
            endpoint: "",
            template: {
                subject: "Lead nou pe site",
                body: "A fost primit un lead nou de la {{name}} ({{email}})."
            }
        }
    }
}
```

### Field options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Database column name. |
| `label` | string | Label shown in table and detail view. |
| `type` | string | Field type: `text`, `email`, `tel`, `textarea`. |
| `required` | boolean | Whether the field is required when submitting a lead. |
| `showInTable` | boolean | Whether the column appears in the CMS table. |
| `width` | string | Optional column width (e.g. `25%`). |

### Status options

| Option | Type | Description |
|--------|------|-------------|
| `value` | string | Value stored in the database. |
| `label` | string | Label shown in the interface. |
| `color` | string | Badge color: `primary`, `success`, `warning`, `danger`, `info`, `neutral`. |

## Database Table

`leads`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key. |
| `name` | text | Contact name. |
| `email` | text | Contact email. |
| `phone` | text | Contact phone (optional). |
| `source` | text | Page or source of the lead (optional). |
| `message` | text | Message from the contact (optional). |
| `status` | text | Current status, e.g. `new`, `contacted`, `converted`, `archived`. |
| `notes` | text | Internal notes (optional). |
| `created_at` | timestamptz | Submission timestamp. |

You can add or remove columns in Supabase as needed, then update the `fields` array in `config/project.js`.

## Public website integration

The CMS module only reads and manages leads. The public website is responsible for submitting leads into the `leads` table.

Example using Supabase from the public site:

```js
await supabase.from("leads").insert({
    name: "Ion Popescu",
    email: "ion@example.com",
    phone: "0712345678",
    source: window.location.pathname,
    message: "Buna, as dori o oferta.",
    status: "new",
    created_at: new Date().toISOString()
});
```

For email notifications, configure `notifications.email.endpoint` with a service such as Supabase Edge Function, EmailJS, Formspree, or Google Apps Script, and call it from the public site after inserting the lead.

## Events

- `leads:new` — emitted when new leads are detected on module load. Payload: `{ count }`.

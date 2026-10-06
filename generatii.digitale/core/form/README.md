# BuildWithIF CMS Form Engine

The Form Engine generates complete forms from a configuration object. No module should ever build HTML forms manually.

## Location

`BuildWithIF-CMS/core/form/`

## Files

- `BWForm.js` — Main orchestrator class.
- `Renderers.js` — Registry of field-type renderers.
- `Validator.js` — Validation engine.
- `Layout.js` — Layout helpers.
- `form.css` — Form-specific styles.
- `example.html` — Working demonstration.

## Basic Usage

```js
const form = new BWForm({
    table: "workshops",
    fields: [
        { name: "title", type: "text", label: "Title", required: true },
        { name: "slug", type: "slug", source: "title", label: "Slug" },
        { name: "description", type: "textarea", label: "Description" },
        { name: "price", type: "number", label: "Price", min: 0 },
        { name: "is_active", type: "toggle", label: "Active" }
    ],
    onSuccess(record) {
        BWToast.success("Saved!");
    },
    onError(error) {
        BWToast.error(error.message);
    }
});

document.getElementById("form-container").appendChild(form.render());
```

## Edit Mode

```js
const form = new BWForm({
    table: "workshops",
    recordId: "uuid-here",
    fields: [...]
});
```

## Supported Field Types

| Type | Description |
|------|-------------|
| text | Single-line text input |
| textarea | Multi-line text input |
| number | Numeric input |
| email | Email input |
| phone | Telephone input |
| password | Password input |
| date | Date picker |
| time | Time picker |
| datetime | Date and time picker |
| checkbox | Single checkbox |
| toggle | Toggle switch |
| radio | Radio button group |
| select | Dropdown |
| multiselect | Multi-select dropdown |
| image | Image upload with preview |
| file | File upload |
| color | Color picker |
| hidden | Hidden input |
| slug | Auto-generated slug |

## Field Configuration

```js
{
    name: "field_name",      // Database column name (required)
    type: "text",            // Field type (required)
    label: "Field Label",    // Display label
    placeholder: "...",      // Placeholder text
    helpText: "...",         // Help text below field
    required: true,          // Required field
    disabled: true,          // Disabled field
    readOnly: true,          // Read-only field
    value: "default",        // Default value
    section: "Details",      // Group into section
    width: 1,                // Grid width (1 or 2)
    showIf: {                // Conditional visibility
        field: "status",
        equals: "active"
    },
    validate: (value) => {   // Custom validator
        return value.length > 5 ? null : "Too short";
    }
}
```

## Layouts

- `default` — Single column
- `two-column` — Two column grid
- `sections` — Fieldset sections

## Lifecycle Events

- `onInit(form)`
- `onLoad(record, form)`
- `onValidate(values, form)`
- `onBeforeSubmit(values, form)`
- `onSuccess(record, form)`
- `onError(error, form)`
- `onCancel(form)`

## Extending

### Register a custom renderer

```js
BWForm.registerRenderer("custom", function(field) {
    const input = document.createElement("input");
    input.value = field.value || "";

    return {
        element: input,
        getValue: () => input.value,
        setValue: (v) => input.value = v,
        validate: () => [],
        showError: () => {},
        clearError: () => {},
        onChange: (cb) => input.addEventListener("input", cb)
    };
});
```

### Register a custom validator

```js
BWForm.registerValidator("unique", (value, field) => {
    return value === "taken" ? "Value already used" : null;
});
```

## Architecture

```
Module
  ↓
BWForm (configuration)
  ↓
Renderers + Validator + Layout
  ↓
BWDatabase / BWStorage
  ↓
Supabase
```

The engine is 100% generic. It knows nothing about modules. It only knows how to render fields, validate values, and submit to a table.

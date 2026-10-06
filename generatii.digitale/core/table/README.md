# BuildWithIF CMS - Table Engine

Motor de tabel configurabil, laturat pe server-side, pentru administrarea datelor din Supabase.

## Structura

```
core/table/
├── BWTable.js          # Orchestrator principal
├── DataAdapter.js      # Adapter pentru BWDatabase.query
├── ColumnFormatters.js # Registry de formatare coloane
├── TableActions.js     # Registry de actiuni rand/bulk
├── table.css           # Stiluri
├── README.md           # Documentatie
└── example.html        # Demo
```

## Dependente

- `core/database.js` (BWDatabase)
- `core/supabase.js`
- `ui/Modal/Modal.js` (BWModal)
- `ui/Toast/Toast.js` (BWToast)
- `ui/EmptyState/EmptyState.js` (BWEmptyState, optional)

## Utilizare rapida

```html
<div id="workshops-table"></div>
```

```js
const table = new BWTable({
    container: "#workshops-table",
    title: "Workshop-uri",
    table: "workshops",
    columns: [
        { field: "title", label: "Titlu", type: "text" },
        { field: "age_group", label: "Grupa varsta", type: "text" },
        { field: "is_active", label: "Activ", type: "boolean" },
        { field: "created_at", label: "Data crearii", type: "date" }
    ],
    onEdit: (row) => openWorkshopForm(row)
});
```

## Configuratie

| Proprietate        | Tip                | Default        | Descriere                                      |
|--------------------|--------------------|----------------|------------------------------------------------|
| `container`        | string/Element     | obligatoriu    | Selector sau element DOM                       |
| `title`            | string             | `""`           | Titlu tabel                                    |
| `table`            | string             | obligatoriu    | Numele tabelului Supabase                      |
| `columns`          | array              | `[]`           | Definire coloane                               |
| `rowActions`       | array              | edit/duplicate/delete | Actiuni pe rand                         |
| `bulkActions`      | array              | bulkDelete/activate/deactivate | Actiuni bulk                  |
| `filters`          | array              | `[]`           | Filtre disponibile in toolbar                  |
| `pageSize`         | number             | `10`           | Randuri pe pagina                              |
| `pageSizeOptions`  | array              | `[10,25,50,100]` | Optiuni page size                            |
| `searchable`       | boolean            | `true`         | Activeaza cautarea                             |
| `sortable`         | boolean            | `true`         | Activeaza sortarea                             |
| `selectable`       | boolean            | `true`         | Activeaza selectarea multipla                  |
| `emptyState`       | object             | default        | Configurare empty state                        |
| `onEdit`           | function           | `null`         | Handler pentru editare                         |
| `onRowClick`       | function           | `null`         | Click pe rand                                  |

## Coloane

```js
{ field: "title", label: "Titlu", type: "text", width: "40%", searchable: true }
{ field: "price", label: "Pret", type: "money", currency: "RON", decimals: 2 }
{ field: "is_active", label: "Activ", type: "boolean", trueLabel: "Da", falseLabel: "Nu" }
{ field: "status", label: "Status", type: "badge", colorMap: { active: "success", draft: "neutral" } }
{ field: "tags", label: "Taguri", type: "tags" }
{ field: "created_at", label: "Creat la", type: "date" }
{ field: "image", label: "Imagine", type: "image", altField: "title" }
{ field: "link", label: "Link", type: "link", hrefField: "url" }
```

Tipurile disponibile: `text`, `number`, `boolean`, `toggle`, `date`, `datetime`, `time`, `money`, `image`, `link`, `badge`, `tags`, `enum`.

## Filtre

```js
filters: [
    { field: "status", type: "select", label: "Status", options: [{ value: "active", label: "Activ" }, { value: "draft", label: "Draft" }] },
    { field: "created_at", type: "date-range", label: "Perioada" }
]
```

## Actiuni

### Actiuni implicite

- `edit`, `duplicate`, `delete` pentru randuri
- `bulkDelete`, `bulkActivate`, `bulkDeactivate` pentru selectii multiple

### Actiuni custom

```js
BWTableActions.register("publish", async ({ row, table }) => {
    await BWDatabase.update("workshops", row.id, { status: "published" });
    table.refresh();
});

// in config
rowActions: [
    { name: "publish", label: "Publica" }
]
```

## Formatare custom

```js
BWColumnFormatters.register("uppercase", (value) => String(value).toUpperCase());

// in config
{ field: "title", label: "Titlu", formatter: "uppercase" }
```

## Metode publice

| Metoda              | Descriere                          |
|---------------------|------------------------------------|
| `refresh()`         | Reincarca datele                   |
| `clearSelection()`  | Deselecteaza toate randurile       |
| `getSelectedRows()` | Returneaza randurile selectate     |
| `updateRows(rows, updates)` | Actualizeaza mai multe randuri |

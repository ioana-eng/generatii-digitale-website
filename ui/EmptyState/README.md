# BuildWithIF CMS - EmptyState Component

Componenta `EmptyState` afiseaza un mesaj prietenos atunci cand nu exista date disponibile.

## Utilizare

```js
BWEmptyState.render("#empty-container", {
    icon: "📋",
    title: "Nicio inregistrare",
    message: "Incepe prin a adauga o inregistrare noua.",
    action: {
        label: "Adauga",
        icon: "+",
        onClick: () => openAddForm()
    }
});
```

## Optiuni

| Proprietate | Tip      | Default                  | Descriere                          |
|-------------|----------|--------------------------|------------------------------------|
| `icon`      | string   | `"📦"`                   | Emoji sau icon afisat              |
| `title`     | string   | `"Nimic de afisat"`      | Titlul empty state                 |
| `message`   | string   | `"Nu exista date..."`    | Mesaj descriptiv                   |
| `action`    | object   | `null`                   | Buton de actiune optional          |

## Dependente

- `assets/css/tokens.css`
- `assets/css/base.css`
- `ui/Button/Button.css`
- `ui/EmptyState/EmptyState.css`

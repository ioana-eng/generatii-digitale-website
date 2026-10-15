/*
==========================================
BuildWithIF UI
Textarea Component
==========================================
*/

function BWTextarea(options = {}) {
    const textarea = document.createElement("textarea");
    textarea.className = `bw-textarea ${options.className || ""}`.trim();

    if (options.name) textarea.name = options.name;
    if (options.id) textarea.id = options.id;
    if (options.placeholder) textarea.placeholder = options.placeholder;
    if (options.value) textarea.value = options.value;
    if (options.rows) textarea.rows = options.rows;
    if (options.required) textarea.required = true;
    if (options.disabled) textarea.disabled = true;

    return textarea;
}

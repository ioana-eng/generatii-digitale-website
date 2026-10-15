/*
==========================================
BuildWithIF UI
Select Component
==========================================
*/

function BWSelect(options = {}) {
    const select = document.createElement("select");
    select.className = `bw-select ${options.className || ""}`.trim();

    if (options.name) select.name = options.name;
    if (options.id) select.id = options.id;
    if (options.required) select.required = true;
    if (options.disabled) select.disabled = true;

    if (options.placeholder) {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = options.placeholder;
        placeholder.disabled = true;
        placeholder.selected = !options.value;
        select.appendChild(placeholder);
    }

    (options.choices || []).forEach(choice => {
        const option = document.createElement("option");
        option.value = choice.value;
        option.textContent = choice.label;
        if (options.value && String(options.value) === String(choice.value)) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}

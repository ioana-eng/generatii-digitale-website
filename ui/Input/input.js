/*
==========================================
BuildWithIF UI
Input Component
==========================================
*/

function BWInput(options = {}) {
    const input = document.createElement("input");
    input.className = `bw-input ${options.className || ""}`.trim();

    if (options.type) input.type = options.type;
    if (options.name) input.name = options.name;
    if (options.id) input.id = options.id;
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.value) input.value = options.value;
    if (options.required) input.required = true;
    if (options.disabled) input.disabled = true;

    return input;
}

function BWField(labelText, inputElement, helpText = "") {
    const field = document.createElement("div");
    field.className = "bw-field";

    if (labelText) {
        const label = document.createElement("label");
        label.className = "bw-label";
        label.textContent = labelText;
        if (inputElement.id) label.htmlFor = inputElement.id;
        field.appendChild(label);
    }

    field.appendChild(inputElement);

    if (helpText) {
        const help = document.createElement("p");
        help.className = "bw-help-text";
        help.textContent = helpText;
        field.appendChild(help);
    }

    return field;
}

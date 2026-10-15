/*
==========================================
BuildWithIF CMS Form Engine
Renderers Registry
==========================================
*/

const BWFormRenderers = {

    registry: {},

    register(type, rendererFn) {
        this.registry[type] = rendererFn;
    },

    get(type) {
        const renderer = this.registry[type];
        if (!renderer) {
            console.warn(`[BWForm] No renderer registered for type: ${type}`);
            return this.registry.text;
        }
        return renderer;
    },

    createLabel(field) {
        const label = document.createElement("label");
        label.className = "bw-form__label";
        label.textContent = field.label || field.name;
        if (field.required) label.classList.add("bw-form__label--required");
        return label;
    },

    createHelpText(text) {
        const help = document.createElement("p");
        help.className = "bw-form__help-text";
        help.textContent = text;
        return help;
    },

    createErrorText() {
        const error = document.createElement("p");
        error.className = "bw-form__error-text";
        return error;
    },

    wrapField(field, control, options = {}) {
        const wrapper = document.createElement("div");
        wrapper.className = `bw-form__control bw-form__control--${field.type}`;

        if (field.label !== false && !options.hideLabel) {
            const label = this.createLabel(field);
            if (control.id) label.htmlFor = control.id;
            wrapper.appendChild(label);
        }

        wrapper.appendChild(control);

        if (field.helpText) {
            wrapper.appendChild(this.createHelpText(field.helpText));
        }

        const errorText = this.createErrorText();
        wrapper.appendChild(errorText);

        return { wrapper, errorText };
    },

    baseInput(field, type) {
        const input = BWInput({
            type: type,
            name: field.name,
            id: `field-${field.name}`,
            placeholder: field.placeholder || "",
            value: field.value || "",
            required: field.required,
            disabled: field.disabled
        });

        if (field.readOnly) input.readOnly = true;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.minLength !== undefined) input.minLength = field.minLength;
        if (field.maxLength !== undefined) input.maxLength = field.maxLength;
        if (field.pattern !== undefined) input.pattern = field.pattern;

        return input;
    }

};

// Simple input-based renderers
["text", "email", "phone", "password", "date", "time", "datetime", "color"].forEach(type => {
    BWFormRenderers.register(type, function(field) {
        const inputType = type === "phone" ? "tel" : type === "datetime" ? "datetime-local" : type;
        const input = BWFormRenderers.baseInput(field, inputType);

        if (type === "color") input.classList.add("bw-form__color-input");

        const { wrapper, errorText } = BWFormRenderers.wrapField(field, input);

        return {
            element: wrapper,
            getValue: () => input.value,
            setValue: (value) => { input.value = value || (type === "color" ? "#000000" : ""); },
            validate: (value) => BWFormValidator.validateField(value, field),
            showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
            clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
            onChange: (cb) => input.addEventListener("input", cb)
        };
    });
});

// Number
BWFormRenderers.register("number", function(field) {
    const input = BWFormRenderers.baseInput(field, "number");
    const { wrapper, errorText } = BWFormRenderers.wrapField(field, input);

    return {
        element: wrapper,
        getValue: () => input.value === "" ? null : Number(input.value),
        setValue: (value) => { input.value = value !== null && value !== undefined ? value : ""; },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("input", cb)
    };
});

// Textarea
BWFormRenderers.register("textarea", function(field) {
    const textarea = BWTextarea({
        name: field.name,
        id: `field-${field.name}`,
        placeholder: field.placeholder || "",
        value: field.value || "",
        rows: field.rows || 4,
        required: field.required,
        disabled: field.disabled
    });

    if (field.readOnly) textarea.readOnly = true;

    const { wrapper, errorText } = BWFormRenderers.wrapField(field, textarea);

    return {
        element: wrapper,
        getValue: () => textarea.value,
        setValue: (value) => { textarea.value = value || ""; },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => textarea.addEventListener("input", cb)
    };
});

// Hidden
BWFormRenderers.register("hidden", function(field) {
    const input = BWFormRenderers.baseInput(field, "hidden");

    return {
        element: input,
        getValue: () => input.value,
        setValue: (value) => { input.value = value || ""; },
        validate: () => [],
        showError: () => {},
        clearError: () => {},
        onChange: (cb) => input.addEventListener("input", cb)
    };
});

// Select
BWFormRenderers.register("select", function(field) {
    const choices = (field.options || []).map(opt =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    );

    const select = BWSelect({
        name: field.name,
        id: `field-${field.name}`,
        placeholder: field.placeholder,
        value: field.value,
        choices: choices,
        required: field.required,
        disabled: field.disabled
    });

    const { wrapper, errorText } = BWFormRenderers.wrapField(field, select);

    return {
        element: wrapper,
        getValue: () => select.value,
        setValue: (value) => { select.value = value !== undefined && value !== null ? value : ""; },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => select.addEventListener("change", cb)
    };
});

// Checkbox
BWFormRenderers.register("checkbox", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--checkbox";

    const label = document.createElement("label");
    label.className = "bw-form__checkbox-label";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = field.name;
    input.id = `field-${field.name}`;
    input.checked = !!field.value;
    input.disabled = !!field.disabled;

    const text = document.createElement("span");
    text.textContent = field.label || field.name;

    label.appendChild(input);
    label.appendChild(text);
    wrapper.appendChild(label);

    if (field.helpText) {
        wrapper.appendChild(BWFormRenderers.createHelpText(field.helpText));
    }

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => input.checked,
        setValue: (value) => { input.checked = !!value; },
        validate: (value) => BWFormValidator.validateField(value ? "checked" : "", field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("change", cb)
    };
});

// Toggle
BWFormRenderers.register("toggle", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--toggle";

    const label = document.createElement("label");
    label.className = "bw-form__toggle-label";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = field.name;
    input.id = `field-${field.name}`;
    input.checked = !!field.value;
    input.disabled = !!field.disabled;

    const slider = document.createElement("span");
    slider.className = "bw-form__toggle-slider";

    const text = document.createElement("span");
    text.className = "bw-form__toggle-text";
    text.textContent = field.label || field.name;

    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(text);
    wrapper.appendChild(label);

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => input.checked,
        setValue: (value) => { input.checked = !!value; },
        validate: () => [],
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("change", cb)
    };
});

// Radio
BWFormRenderers.register("radio", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--radio";

    if (field.label !== false) {
        const legend = document.createElement("div");
        legend.className = "bw-form__radio-legend";
        legend.textContent = field.label || field.name;
        wrapper.appendChild(legend);
    }

    const group = document.createElement("div");
    group.className = "bw-form__radio-group";

    (field.options || []).forEach(opt => {
        const value = typeof opt === "string" ? opt : opt.value;
        const labelText = typeof opt === "string" ? opt : opt.label;

        const label = document.createElement("label");
        label.className = "bw-form__radio-label";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = field.name;
        input.value = value;
        input.checked = String(field.value) === String(value);
        input.disabled = !!field.disabled;

        const text = document.createElement("span");
        text.textContent = labelText;

        label.appendChild(input);
        label.appendChild(text);
        group.appendChild(label);
    });

    wrapper.appendChild(group);

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => {
            const selected = group.querySelector(`input[name="${field.name}"]:checked`);
            return selected ? selected.value : "";
        },
        setValue: (value) => {
            const input = group.querySelector(`input[value="${value}"]`);
            if (input) input.checked = true;
        },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => group.addEventListener("change", cb)
    };
});

// Multiselect
BWFormRenderers.register("multiselect", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--multiselect";

    if (field.label !== false) {
        wrapper.appendChild(BWFormRenderers.createLabel(field));
    }

    const select = document.createElement("select");
    select.multiple = true;
    select.name = field.name;
    select.id = `field-${field.name}`;
    select.className = "bw-form__multiselect";
    select.disabled = !!field.disabled;

    const currentValues = Array.isArray(field.value) ? field.value.map(String) : [];

    (field.options || []).forEach(opt => {
        const value = typeof opt === "string" ? opt : opt.value;
        const labelText = typeof opt === "string" ? opt : opt.label;

        const option = document.createElement("option");
        option.value = value;
        option.textContent = labelText;
        option.selected = currentValues.includes(String(value));
        select.appendChild(option);
    });

    wrapper.appendChild(select);

    if (field.helpText) {
        wrapper.appendChild(BWFormRenderers.createHelpText(field.helpText));
    }

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => Array.from(select.selectedOptions).map(o => o.value),
        setValue: (value) => {
            const values = Array.isArray(value) ? value.map(String) : [];
            Array.from(select.options).forEach(opt => {
                opt.selected = values.includes(opt.value);
            });
        },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => select.addEventListener("change", cb)
    };
});

// Image Upload
BWFormRenderers.register("image", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--image";

    if (field.label !== false) {
        wrapper.appendChild(BWFormRenderers.createLabel(field));
    }

    const dropzone = document.createElement("div");
    dropzone.className = "bw-form__upload-zone";
    dropzone.innerHTML = "<span>Drag & drop sau click pentru a incarca</span>";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = field.accept || "image/*";
    input.style.display = "none";

    const preview = document.createElement("div");
    preview.className = "bw-form__image-preview";

    let currentFile = null;
    let currentPath = field.value || "";

    if (currentPath) {
        preview.innerHTML = `<img src="${BWStorage.getPublicUrl(currentPath)}" alt="Preview">`;
    }

    dropzone.addEventListener("click", () => input.click());

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("bw-form__upload-zone--active");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("bw-form__upload-zone--active");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("bw-form__upload-zone--active");
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener("change", () => {
        if (input.files.length) handleFile(input.files[0]);
    });

    function handleFile(file) {
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    wrapper.appendChild(dropzone);
    wrapper.appendChild(input);
    wrapper.appendChild(preview);

    if (field.helpText) {
        wrapper.appendChild(BWFormRenderers.createHelpText(field.helpText));
    }

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => currentPath,
        getFile: () => currentFile,
        setValue: (value) => {
            currentPath = value || "";
            currentFile = null;
            if (currentPath) {
                preview.innerHTML = `<img src="${BWStorage.getPublicUrl(currentPath)}" alt="Preview">`;
            } else {
                preview.innerHTML = "";
            }
        },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("change", cb),
        async upload() {
            if (!currentFile) return currentPath;
            const path = `${field.folder || "uploads"}/${Date.now()}_${currentFile.name}`;
            await BWStorage.upload(path, currentFile);
            currentPath = path;
            currentFile = null;
            return currentPath;
        }
    };
});

// File Upload
BWFormRenderers.register("file", function(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-form__control bw-form__control--file";

    if (field.label !== false) {
        wrapper.appendChild(BWFormRenderers.createLabel(field));
    }

    const dropzone = document.createElement("div");
    dropzone.className = "bw-form__upload-zone";
    dropzone.innerHTML = "<span>Drag & drop sau click pentru a incarca fisier</span>";

    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";

    const fileName = document.createElement("p");
    fileName.className = "bw-form__file-name";

    let currentFile = null;
    let currentPath = field.value || "";

    if (currentPath) {
        fileName.textContent = currentPath.split("/").pop();
    }

    dropzone.addEventListener("click", () => input.click());

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("bw-form__upload-zone--active");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("bw-form__upload-zone--active");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("bw-form__upload-zone--active");
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener("change", () => {
        if (input.files.length) handleFile(input.files[0]);
    });

    function handleFile(file) {
        currentFile = file;
        fileName.textContent = file.name;
    }

    wrapper.appendChild(dropzone);
    wrapper.appendChild(input);
    wrapper.appendChild(fileName);

    if (field.helpText) {
        wrapper.appendChild(BWFormRenderers.createHelpText(field.helpText));
    }

    const errorText = BWFormRenderers.createErrorText();
    wrapper.appendChild(errorText);

    return {
        element: wrapper,
        getValue: () => currentPath,
        getFile: () => currentFile,
        setValue: (value) => {
            currentPath = value || "";
            currentFile = null;
            fileName.textContent = currentPath ? currentPath.split("/").pop() : "";
        },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("change", cb),
        async upload() {
            if (!currentFile) return currentPath;
            const path = `${field.folder || "uploads"}/${Date.now()}_${currentFile.name}`;
            await BWStorage.upload(path, currentFile);
            currentPath = path;
            currentFile = null;
            return currentPath;
        }
    };
});

// Slug
BWFormRenderers.register("slug", function(field) {
    const input = BWFormRenderers.baseInput(field, "text");
    input.classList.add("bw-form__slug-input");

    const { wrapper, errorText } = BWFormRenderers.wrapField(field, input);

    return {
        element: wrapper,
        getValue: () => input.value,
        setValue: (value) => { input.value = value || ""; },
        validate: (value) => BWFormValidator.validateField(value, field),
        showError: (msg) => { errorText.textContent = msg; wrapper.classList.add("bw-form__field--error"); },
        clearError: () => { errorText.textContent = ""; wrapper.classList.remove("bw-form__field--error"); },
        onChange: (cb) => input.addEventListener("input", cb),
        generateFrom(sourceValue) {
            if (!input.value || input.dataset.manual !== "true") {
                input.value = slugify(sourceValue);
            }
        }
    };
});

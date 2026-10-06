/*
==========================================
BuildWithIF CMS Form Engine
BWForm Orchestrator
==========================================
*/

class BWForm {

    constructor(config = {}) {
        this.config = {
            table: null,
            recordId: null,
            layout: "default",
            submitLabel: "Salveaza",
            cancelLabel: "Anuleaza",
            showCancel: true,
            fields: [],
            onInit: null,
            onLoad: null,
            onValidate: null,
            onBeforeSubmit: null,
            onSuccess: null,
            onError: null,
            onCancel: null,
            ...config
        };

        this.fields = [];
        this.renderedFields = new Map();
        this.wrapper = null;
        this.record = null;
        this.isSubmitting = false;

        if (this.config.onInit) this.config.onInit(this);
    }

    async loadRecord() {
        if (!this.config.recordId || !this.config.table) return;

        try {
            this.record = await BWDatabase.getById(this.config.table, this.config.recordId);

            this.fields.forEach(field => {
                const renderer = this.renderedFields.get(field.name);
                if (renderer && renderer.setValue) {
                    renderer.setValue(this.record[field.name]);
                }
            });

            if (this.config.onLoad) this.config.onLoad(this.record, this);
        } catch (err) {
            this.handleError(err);
        }
    }

    render() {
        this.wrapper = BWFormLayout.createWrapper(this.config.layout);
        this.renderedFields.clear();

        const sections = new Map();

        this.config.fields.forEach(fieldConfig => {
            const field = {
                ...fieldConfig,
                value: fieldConfig.value !== undefined ? fieldConfig.value : (this.record ? this.record[fieldConfig.name] : "")
            };

            this.fields.push(field);

            const rendererFn = BWFormRenderers.get(field.type);
            const renderer = rendererFn(field);

            this.renderedFields.set(field.name, renderer);

            const fieldWrapper = BWFormLayout.createFieldWrapper(field, this.config.layout);
            fieldWrapper.appendChild(renderer.element);

            if (field.showIf) {
                this.watchConditional(field, renderer, fieldWrapper);
            }

            if (field.type === "slug" && field.source) {
                this.setupSlugGeneration(field, renderer);
            }

            if (field.section) {
                if (!sections.has(field.section)) {
                    sections.set(field.section, BWFormLayout.createSection(field.section));
                }
                sections.get(field.section).appendChild(fieldWrapper);
            } else {
                this.wrapper.appendChild(fieldWrapper);
            }
        });

        sections.forEach(section => this.wrapper.appendChild(section));

        const actions = BWFormLayout.createActions();

        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.className = "bw-btn bw-btn--primary";
        submitBtn.textContent = this.config.submitLabel;

        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.submit();
        });

        actions.appendChild(submitBtn);

        if (this.config.showCancel) {
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.className = "bw-btn bw-btn--secondary";
            cancelBtn.textContent = this.config.cancelLabel;
            cancelBtn.addEventListener("click", () => {
                if (this.config.onCancel) this.config.onCancel(this);
            });
            actions.appendChild(cancelBtn);
        }

        this.wrapper.appendChild(actions);

        if (this.config.recordId) {
            this.loadRecord();
        }

        return this.wrapper;
    }
    getValues() {
        const values = {};

        this.fields.forEach(field => {
            const renderer = this.renderedFields.get(field.name);
            if (renderer && renderer.getValue) {
                values[field.name] = renderer.getValue();
            }
        });

        return values;
    }

    validate() {
        let isValid = true;

        this.fields.forEach(field => {
            const renderer = this.renderedFields.get(field.name);
            if (!renderer || !renderer.validate || !renderer.showError || !renderer.clearError) return;

            const value = renderer.getValue();
            const errors = renderer.validate(value);

            if (errors.length > 0) {
                renderer.showError(errors[0]);
                isValid = false;
            } else {
                renderer.clearError();
            }
        });

        if (this.config.onValidate) {
            const formErrors = this.config.onValidate(this.getValues(), this);
            if (formErrors) isValid = false;
        }

        return isValid;
    }

    async submit() {
        if (this.isSubmitting) return;

        if (!this.validate()) {
            BWToast.error("Te rugam sa corectezi erorile din formular.");
            return;
        }

        this.isSubmitting = true;
        const submitBtn = this.wrapper.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add("bw-btn--loading");
        }

        try {
            let values = this.getValues();

            for (const field of this.fields) {
                if (field.type === "image" || field.type === "file") {
                    const renderer = this.renderedFields.get(field.name);
                    if (renderer && renderer.upload) {
                        values[field.name] = await renderer.upload();
                    }
                }
            }

            if (this.config.onBeforeSubmit) {
                values = this.config.onBeforeSubmit(values, this) || values;
            }

            let result;

            if (this.config.recordId && this.config.table) {
                result = await BWDatabase.update(this.config.table, this.config.recordId, values);
            } else if (this.config.table) {
                result = await BWDatabase.insert(this.config.table, values);
            } else {
                result = values;
            }

            if (this.config.onSuccess) this.config.onSuccess(result, this);

        } catch (err) {
            this.handleError(err);
        } finally {
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("bw-btn--loading");
            }
        }
    }

    handleError(error) {
        console.error("[BWForm] Error:", error);
        if (this.config.onError) {
            this.config.onError(error, this);
        } else {
            BWToast.error(error.message || "A aparut o eroare.");
        }
    }

    watchConditional(field, renderer, wrapper) {
        const check = () => {
            const values = this.getValues();
            const sourceValue = values[field.showIf.field];
            const shouldShow = sourceValue === field.showIf.equals ||
                (Array.isArray(field.showIf.equals) && field.showIf.equals.includes(sourceValue));

            wrapper.style.display = shouldShow ? "" : "none";
        };

        const sourceField = this.renderedFields.get(field.showIf.field);
        if (sourceField && sourceField.onChange) {
            sourceField.onChange(check);
        }

        check();
    }

    setupSlugGeneration(field, renderer) {
        const sourceField = this.renderedFields.get(field.source);
        if (!sourceField || !sourceField.onChange) return;

        sourceField.onChange(() => {
            const values = this.getValues();
            if (renderer.generateFrom) {
                renderer.generateFrom(values[field.source]);
            }
        });

        renderer.onChange(() => {
            renderer.element.querySelector("input").dataset.manual = "true";
        });
    }

    static registerRenderer(type, rendererFn) {
        BWFormRenderers.register(type, rendererFn);
    }

    static registerValidator(name, fn) {
        BWFormValidator.registerRule(name, fn);
    }

}

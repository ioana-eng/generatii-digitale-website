/*
==========================================
BuildWithIF CMS Form Engine
Validator
==========================================
*/

const BWFormValidator = {

    rules: {

        required(value, field) {
            if (!field.required) return null;

            const isEmpty = value === null || value === undefined || value === "" ||
                (Array.isArray(value) && value.length === 0);

            if (isEmpty) {
                return field.requiredMessage || `${field.label || field.name} este obligatoriu.`;
            }

            return null;
        },

        min(value, field) {
            if (value === "" || value === null || value === undefined) return null;

            if (field.min !== undefined && Number(value) < field.min) {
                return `Valoarea minimă este ${field.min}.`;
            }

            return null;
        },

        max(value, field) {
            if (value === "" || value === null || value === undefined) return null;

            if (field.max !== undefined && Number(value) > field.max) {
                return `Valoarea maximă este ${field.max}.`;
            }

            return null;
        },

        minLength(value, field) {
            if (!value || typeof value !== "string") return null;

            if (field.minLength !== undefined && value.length < field.minLength) {
                return `Minim ${field.minLength} caractere.`;
            }

            return null;
        },

        maxLength(value, field) {
            if (!value || typeof value !== "string") return null;

            if (field.maxLength !== undefined && value.length > field.maxLength) {
                return `Maxim ${field.maxLength} caractere.`;
            }

            return null;
        },

        email(value, field) {
            if (!value || field.type !== "email") return null;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Adresa de email nu este validă.";
            }

            return null;
        },

        pattern(value, field) {
            if (!value || !field.pattern) return null;

            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
                return field.patternMessage || "Format invalid.";
            }

            return null;
        }

    },

    validateField(value, field) {
        const errors = [];

        for (const ruleName of Object.keys(this.rules)) {
            const message = this.rules[ruleName](value, field);
            if (message) errors.push(message);
        }

        if (field.validate && typeof field.validate === "function") {
            const custom = field.validate(value, field);
            if (custom) errors.push(custom);
        }

        return errors;
    },

    registerRule(name, fn) {
        this.rules[name] = fn;
    }

};

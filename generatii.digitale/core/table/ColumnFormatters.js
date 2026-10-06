/*
==========================================
BuildWithIF CMS Table Engine
Column Formatters Registry
==========================================
*/

const BWColumnFormatters = {

    registry: new Map(),

    register(name, formatterFn) {
        if (typeof formatterFn !== "function") {
            throw new Error(`[BWColumnFormatters] Formatter '${name}' must be a function.`);
        }
        this.registry.set(name, formatterFn);
    },

    get(name) {
        if (!name) return this.defaultFormatter;
        if (this.registry.has(name)) return this.registry.get(name);

        const auto = this.autoFormatters[name];
        if (auto) return auto;

        return this.defaultFormatter;
    },

    format(value, column, row) {
        const formatter = this.get(column.formatter || column.type);
        return formatter(value, column, row);
    },

    defaultFormatter(value) {
        if (value === null || value === undefined) return "—";
        return BWColumnFormatters.escapeHtml(String(value));
    },

    escapeHtml(text) {
        if (text === null || text === undefined) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    autoFormatters: {
        text(value) {
            if (value === null || value === undefined) return "—";
            return BWColumnFormatters.escapeHtml(String(value));
        },

        number(value, column) {
            if (value === null || value === undefined || value === "") return "—";
            const num = Number(value);
            if (isNaN(num)) return BWColumnFormatters.escapeHtml(String(value));
            if (column.decimals !== undefined) {
                return BWColumnFormatters.escapeHtml(num.toFixed(column.decimals));
            }
            return BWColumnFormatters.escapeHtml(String(num));
        },

        boolean(value, column) {
            const truthy = value === true || value === "true" || value === 1 || value === "1";
            const label = truthy
                ? (column.trueLabel || "Yes")
                : (column.falseLabel || "No");
            const cssClass = truthy ? "bw-tag--success" : "bw-tag--neutral";
            return `<span class="bw-tag ${cssClass}">${BWColumnFormatters.escapeHtml(label)}</span>`;
        },

        toggle(value, column) {
            return BWColumnFormatters.autoFormatters.boolean(value, column);
        },

        date(value, column) {
            if (!value) return "—";
            const date = value instanceof Date ? value : new Date(value);
            if (isNaN(date.getTime())) return BWColumnFormatters.escapeHtml(String(value));
            return BWColumnFormatters.escapeHtml(date.toLocaleDateString("ro-RO", column.formatOptions || {}));
        },

        datetime(value, column) {
            if (!value) return "—";
            const date = value instanceof Date ? value : new Date(value);
            if (isNaN(date.getTime())) return BWColumnFormatters.escapeHtml(String(value));
            return BWColumnFormatters.escapeHtml(date.toLocaleString("ro-RO", column.formatOptions || {}));
        },

        time(value, column) {
            if (!value) return "—";
            const date = value instanceof Date ? value : new Date(`2000-01-01T${value}`);
            if (isNaN(date.getTime())) return BWColumnFormatters.escapeHtml(String(value));
            return BWColumnFormatters.escapeHtml(date.toLocaleTimeString("ro-RO", column.formatOptions || {}));
        },

        money(value, column) {
            if (value === null || value === undefined || value === "") return "—";
            const num = Number(value);
            if (isNaN(num)) return BWColumnFormatters.escapeHtml(String(value));
            const currency = column.currency || "RON";
            const decimals = column.decimals ?? 2;
            return `${BWColumnFormatters.escapeHtml(num.toFixed(decimals))} ${BWColumnFormatters.escapeHtml(currency)}`;
        },

        image(value, column, row) {
            if (!value) return "—";
            const url = BWColumnFormatters.escapeHtml(value);
            const alt = column.altField ? BWColumnFormatters.escapeHtml(row[column.altField]) : "";
            return `<img src="${url}" alt="${alt}" class="bw-table__thumb" loading="lazy" />`;
        },

        link(value, column, row) {
            if (!value) return "—";
            const href = BWColumnFormatters.escapeHtml(column.hrefField ? row[column.hrefField] : value);
            return `<a href="${href}" target="${BWColumnFormatters.escapeHtml(column.target || "_self")}" class="bw-link">${BWColumnFormatters.escapeHtml(value)}</a>`;
        },

        badge(value, column) {
            if (!value) return "—";
            const colorMap = column.colorMap || {};
            const color = BWColumnFormatters.escapeHtml(colorMap[value] || "neutral");
            return `<span class="bw-tag bw-tag--${color}">${BWColumnFormatters.escapeHtml(value)}</span>`;
        },

        tags(value) {
            if (!Array.isArray(value) || value.length === 0) return "—";
            return value
                .map(tag => `<span class="bw-tag bw-tag--neutral">${BWColumnFormatters.escapeHtml(tag)}</span>`)
                .join(" ");
        },

        enum(value, column) {
            if (value === null || value === undefined) return "—";
            const options = column.options || {};
            const display = options[value] !== undefined ? options[value] : value;
            return BWColumnFormatters.escapeHtml(String(display));
        }
    }

};

// Expose auto formatters so `register("text", BWColumnFormatters.autoFormatters.text)` works
Object.keys(BWColumnFormatters.autoFormatters).forEach(name => {
    BWColumnFormatters.register(name, BWColumnFormatters.autoFormatters[name]);
});

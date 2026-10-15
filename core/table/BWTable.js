/*
==========================================
BuildWithIF CMS Table Engine
BWTable Orchestrator
==========================================
*/

class BWTable {

    constructor(config = {}) {
        this.config = {
            title: "",
            table: null,
            columns: [],
            rowActions: [
                { name: "edit", label: "Editeaza", icon: "edit" },
                { name: "duplicate", label: "Duplica", icon: "copy" },
                { name: "delete", label: "Sterge", icon: "trash", danger: true }
            ],
            bulkActions: [
                { name: "bulkDelete", label: "Sterge selectate", danger: true },
                { name: "bulkActivate", label: "Activeaza" },
                { name: "bulkDeactivate", label: "Dezactiveaza" }
            ],
            filters: [],
            pageSize: 10,
            pageSizeOptions: [10, 25, 50, 100],
            searchable: true,
            sortable: true,
            selectable: true,
            emptyState: null,
            onEdit: null,
            onRowClick: null,
            ...config
        };

        this.container = typeof this.config.container === "string"
            ? document.querySelector(this.config.container)
            : this.config.container;

        if (!this.container) {
            throw new Error("[BWTable] Container not found.");
        }

        this.state = {
            page: 1,
            pageSize: this.config.pageSize,
            search: "",
            sort: null,
            filters: {},
            loading: false,
            selectedIds: new Set(),
            data: [],
            count: 0,
            totalPages: 0
        };

        this.listeners = [];

        this.init();
    }

    init() {
        this.renderShell();
        this.attachListeners();
        this.load();
    }

    renderShell() {
        this.container.innerHTML = `
            <div class="bw-table-wrapper">
                ${this.config.title ? `<h2 class="bw-table__title">${this.config.title}</h2>` : ""}
                <div class="bw-table__toolbar">
                    ${this.renderSearch()}
                    ${this.renderFilters()}
                </div>
                <div class="bw-table__bulk-bar" data-bulk-bar hidden>
                    <span class="bw-table__selection-count"></span>
                    ${this.renderBulkActions()}
                </div>
                <div class="bw-table__scroll">
                    <table class="bw-table">
                        ${this.renderHeader()}
                        <tbody data-table-body></tbody>
                    </table>
                    <div class="bw-table__empty" data-empty-state hidden></div>
                </div>
                ${this.renderPagination()}
            </div>
        `;

        this.bodyEl = this.container.querySelector("[data-table-body]");
        this.emptyEl = this.container.querySelector("[data-empty-state]");
        this.bulkBarEl = this.container.querySelector("[data-bulk-bar]");
        this.paginationEl = this.container.querySelector("[data-table-pagination]");
    }

    renderSearch() {
        if (!this.config.searchable) return "";
        return `
            <div class="bw-table__search">
                <input type="text" class="bw-input" data-table-search placeholder="Cauta..." value="${this.escapeHtml(this.state.search)}" />
            </div>
        `;
    }

    renderFilters() {
        if (!this.config.filters || this.config.filters.length === 0) return "";

        const inputs = this.config.filters.map(filter => {
            if (filter.type === "select") {
                const options = (filter.options || []).map(opt => {
                    const val = typeof opt === "object" ? opt.value : opt;
                    const label = typeof opt === "object" ? opt.label : opt;
                    return `<option value="${this.escapeHtml(val)}">${this.escapeHtml(label)}</option>`;
                }).join("");
                return `<select class="bw-select" data-table-filter="${filter.field}">
                    <option value="">${filter.placeholder || filter.label}</option>
                    ${options}
                </select>`;
            }

            if (filter.type === "date-range") {
                return `
                    <div class="bw-table__filter-range">
                        <input type="date" class="bw-input" data-table-filter-from="${filter.field}" placeholder="De la" />
                        <input type="date" class="bw-input" data-table-filter-to="${filter.field}" placeholder="Pana la" />
                    </div>
                `;
            }

            return `<input type="text" class="bw-input" data-table-filter="${filter.field}" placeholder="${filter.placeholder || filter.label}" />`;
        }).join("");

        return `<div class="bw-table__filters">${inputs}</div>`;
    }

    renderHeader() {
        return `<thead>${this.renderHeaderRow()}</thead>`;
    }

    renderHeaderRow() {
        const selectTh = this.config.selectable
            ? `<th class="bw-table__checkbox"><input type="checkbox" data-select-all /></th>`
            : "";

        const columns = this.config.columns.map(col => {
            const sortIcon = this.getSortIcon(col.field);
            const sortClass = this.state.sort && this.state.sort.field === col.field
                ? `bw-table__sort--${this.state.sort.direction}`
                : "";
            const widthStyle = col.width ? `style="width:${col.width}"` : "";
            return `<th class="bw-table__header ${sortClass}" data-sort="${col.field}" ${widthStyle}>
                ${this.escapeHtml(col.label || col.field)}
                ${this.config.sortable ? `<span class="bw-table__sort-icon">${sortIcon}</span>` : ""}
            </th>`;
        }).join("");

        const actionsTh = this.config.rowActions && this.config.rowActions.length > 0
            ? `<th class="bw-table__actions-header">Actiuni</th>`
            : "";

        return `<tr>${selectTh}${columns}${actionsTh}</tr>`;
    }

    updateHeader() {
        const thead = this.container.querySelector("thead");
        if (thead) {
            thead.innerHTML = this.renderHeaderRow();
        }
    }

    getSortIcon(field) {
        if (!this.state.sort || this.state.sort.field !== field) return "↕";
        return this.state.sort.direction === "asc" ? "↑" : "↓";
    }

    renderBody() {
        if (this.state.loading) {
            this.bodyEl.innerHTML = `<tr><td colspan="999" class="bw-table__loading">Se incarca...</td></tr>`;
            return;
        }

        if (this.state.data.length === 0) {
            this.bodyEl.innerHTML = "";
            this.renderEmptyState();
            return;
        }

        this.emptyEl.hidden = true;

        const rows = this.state.data.map(row => this.renderRow(row)).join("");
        this.bodyEl.innerHTML = rows;
    }

    renderRow(row) {
        const selectTd = this.config.selectable
            ? `<td class="bw-table__checkbox"><input type="checkbox" data-select-row="${row.id}" ${this.state.selectedIds.has(String(row.id)) ? "checked" : ""} /></td>`
            : "";

        const columns = this.config.columns.map(col => {
            const value = this.getNestedValue(row, col.field);
            const formatted = BWColumnFormatters.format(value, col, row);
            return `<td class="bw-table__cell" data-column="${col.field}">${formatted}</td>`;
        }).join("");

        const actionsTd = this.config.rowActions && this.config.rowActions.length > 0
            ? `<td class="bw-table__actions">${this.renderRowActions(row)}</td>`
            : "";

        const clickableClass = this.config.onRowClick ? "bw-table__row--clickable" : "";
        return `<tr class="bw-table__row ${clickableClass}" data-row-id="${row.id}">${selectTd}${columns}${actionsTd}</tr>`;
    }

    renderRowActions(row) {
        return this.config.rowActions.map(action => {
            const dangerClass = action.danger ? "bw-btn--danger" : "bw-btn--ghost";
            return `<button class="bw-btn bw-btn--sm ${dangerClass}" data-row-action="${action.name}" data-row-id="${row.id}">
                ${action.icon ? `<span class="bw-icon">${action.icon}</span>` : ""}
                ${action.label || ""}
            </button>`;
        }).join("");
    }

    renderBulkActions() {
        if (!this.config.bulkActions || this.config.bulkActions.length === 0) return "";
        return this.config.bulkActions.map(action => {
            const dangerClass = action.danger ? "bw-btn--danger" : "bw-btn--secondary";
            return `<button class="bw-btn bw-btn--sm ${dangerClass}" data-bulk-action="${action.name}">
                ${action.label}
            </button>`;
        }).join("");
    }

    renderPagination() {
        const totalPages = this.state.totalPages || 1;
        const start = this.state.count === 0 ? 0 : (this.state.page - 1) * this.state.pageSize + 1;
        const end = Math.min(this.state.page * this.state.pageSize, this.state.count);

        const pageOptions = this.config.pageSizeOptions
            .map(size => `<option value="${size}" ${size === this.state.pageSize ? "selected" : ""}>${size}</option>`)
            .join("");

        return `
            <div class="bw-table__pagination" data-table-pagination>
                <div class="bw-table__info">
                    ${start}-${end} din ${this.state.count}
                </div>
                <div class="bw-table__page-controls">
                    <button class="bw-btn bw-btn--sm bw-btn--ghost" data-page="first" ${this.state.page <= 1 ? "disabled" : ""}>|<</button>
                    <button class="bw-btn bw-btn--sm bw-btn--ghost" data-page="prev" ${this.state.page <= 1 ? "disabled" : ""}><</button>
                    <span class="bw-table__page-indicator">Pagina ${this.state.page} / ${totalPages}</span>
                    <button class="bw-btn bw-btn--sm bw-btn--ghost" data-page="next" ${this.state.page >= totalPages ? "disabled" : ""}>></button>
                    <button class="bw-btn bw-btn--sm bw-btn--ghost" data-page="last" ${this.state.page >= totalPages ? "disabled" : ""}>>|</button>
                </div>
                <div class="bw-table__page-size">
                    <select class="bw-select bw-select--sm" data-page-size>${pageOptions}</select>
                    <span>pe pagina</span>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        const config = this.config.emptyState || {
            icon: "📋",
            title: "Nicio inregistrare gasita",
            message: "Incepe prin a adauga o inregistrare noua."
        };

        if (this.emptyEl && typeof BWEmptyState !== "undefined") {
            this.emptyEl.innerHTML = "";
            BWEmptyState.render(this.emptyEl, config);
            this.emptyEl.hidden = false;
        } else {
            this.emptyEl.innerHTML = `
                <div class="bw-empty-state">
                    <div class="bw-empty-state__icon">${config.icon}</div>
                    <h3 class="bw-empty-state__title">${config.title}</h3>
                    <p class="bw-empty-state__message">${config.message}</p>
                </div>
            `;
            this.emptyEl.hidden = false;
        }
    }

    attachListeners() {
        this.listeners.forEach(({ el, event, fn }) => el.removeEventListener(event, fn));
        this.listeners = [];

        const add = (selector, event, handler) => {
            const el = this.container.querySelector(selector);
            if (el) {
                el.addEventListener(event, handler);
                this.listeners.push({ el, event, fn: handler });
            }
        };

        const addAll = (selector, event, handler) => {
            this.container.querySelectorAll(selector).forEach(el => {
                el.addEventListener(event, handler);
                this.listeners.push({ el, event, fn: handler });
            });
        };

        add("[data-table-search]", "input", this.debounce(e => {
            this.state.search = e.target.value.trim();
            this.state.page = 1;
            this.load();
        }, 300));

        addAll("[data-sort]", "click", e => {
            const field = e.currentTarget.dataset.sort;
            this.toggleSort(field);
        });

        add("[data-select-all]", "change", e => {
            if (e.target.checked) {
                this.state.data.forEach(row => this.state.selectedIds.add(String(row.id)));
            } else {
                this.state.data.forEach(row => this.state.selectedIds.delete(String(row.id)));
            }
            this.updateSelectionUI();
        });

        addAll("[data-select-row]", "change", e => {
            const id = e.target.dataset.selectRow;
            if (e.target.checked) {
                this.state.selectedIds.add(String(id));
            } else {
                this.state.selectedIds.delete(String(id));
            }
            this.updateSelectionUI();
        });

        addAll("[data-row-action]", "click", async e => {
            e.stopPropagation();
            const actionName = e.currentTarget.dataset.rowAction;
            const rowId = e.currentTarget.dataset.rowId;
            const row = this.state.data.find(r => String(r.id) === rowId);
            if (!row) return;

            await BWTableActions.execute(actionName, { row, table: this });
        });

        addAll("[data-bulk-action]", "click", async e => {
            const actionName = e.currentTarget.dataset.bulkAction;
            const rows = this.state.data.filter(row => this.state.selectedIds.has(String(row.id)));
            await BWTableActions.execute(actionName, { rows, table: this });
        });

        addAll("[data-page]", "click", e => {
            const action = e.currentTarget.dataset.page;
            this.handlePageAction(action);
        });

        add("[data-page-size]", "change", e => {
            this.state.pageSize = Number(e.target.value);
            this.state.page = 1;
            this.load();
        });

        addAll("[data-table-filter]", "input", this.debounce(e => {
            const field = e.target.dataset.tableFilter;
            this.state.filters[field] = e.target.value;
            this.state.page = 1;
            this.load();
        }, 300));

        addAll("[data-table-filter]", "change", e => {
            const field = e.target.dataset.tableFilter;
            this.state.filters[field] = e.target.value;
            this.state.page = 1;
            this.load();
        });

        addAll("[data-table-filter-from]", "change", e => {
            const field = e.target.dataset.tableFilterFrom;
            this.state.filters[field] = this.state.filters[field] || {};
            this.state.filters[field].from = e.target.value;
            this.state.page = 1;
            this.load();
        });

        addAll("[data-table-filter-to]", "change", e => {
            const field = e.target.dataset.tableFilterTo;
            this.state.filters[field] = this.state.filters[field] || {};
            this.state.filters[field].to = e.target.value;
            this.state.page = 1;
            this.load();
        });

        if (this.config.onRowClick) {
            addAll(".bw-table__row", "click", e => {
                const rowId = e.currentTarget.dataset.rowId;
                const row = this.state.data.find(r => String(r.id) === rowId);
                if (row) this.config.onRowClick(row);
            });
        }
    }

    toggleSort(field) {
        if (!this.config.sortable) return;

        if (this.state.sort && this.state.sort.field === field) {
            this.state.sort.direction = this.state.sort.direction === "asc" ? "desc" : "asc";
        } else {
            this.state.sort = { field, direction: "asc" };
        }

        this.load();
    }

    handlePageAction(action) {
        switch (action) {
            case "first": this.state.page = 1; break;
            case "prev": this.state.page = Math.max(1, this.state.page - 1); break;
            case "next": this.state.page = Math.min(this.state.totalPages, this.state.page + 1); break;
            case "last": this.state.page = this.state.totalPages; break;
        }
        this.load();
    }

    updateSelectionUI() {
        const selectedCount = this.state.selectedIds.size;
        if (selectedCount > 0) {
            this.bulkBarEl.hidden = false;
            this.bulkBarEl.querySelector(".bw-table__selection-count").textContent = `${selectedCount} selectate`;
        } else {
            this.bulkBarEl.hidden = true;
        }

        const selectAllCheckbox = this.container.querySelector("[data-select-all]");
        if (selectAllCheckbox) {
            const allSelected = this.state.data.length > 0 && this.state.data.every(row => this.state.selectedIds.has(String(row.id)));
            selectAllCheckbox.checked = allSelected;
            selectAllCheckbox.indeterminate = !allSelected && selectedCount > 0;
        }
    }

    async load() {
        this.state.loading = true;
        this.renderBody();

        try {
            const result = await BWTableDataAdapter.load(this.config, this.state);
            this.state.data = result.data || [];
            this.state.count = result.count || 0;
            this.state.totalPages = result.totalPages || 1;

            if (this.state.page > this.state.totalPages) {
                this.state.page = this.state.totalPages || 1;
                if (this.state.page !== result.page) {
                    return this.load();
                }
            }
        } catch (error) {
            console.error("[BWTable] Load failed:", error);
            this.state.data = [];
            this.state.count = 0;
            this.state.totalPages = 1;
            BWToast.error("Nu am putut incarca datele.");
        } finally {
            this.state.loading = false;
        }

        this.updateHeader();
        this.renderBody();
        this.updateSelectionUI();
        this.renderPagination();
        this.attachListeners();
    }

    refresh() {
        this.load();
    }

    clearSelection() {
        this.state.selectedIds.clear();
        this.updateSelectionUI();
    }

    async updateRows(rows, updates) {
        if (!rows || rows.length === 0) return;
        try {
            for (const row of rows) {
                await BWDatabase.update(this.config.table, row.id, updates);
            }
            this.clearSelection();
            BWToast.success(`${rows.length} inregistrari actualizate.`);
            this.refresh();
        } catch (error) {
            console.error("[BWTable] Bulk update failed:", error);
            BWToast.error("Nu am putut actualiza inregistrarile.");
        }
    }

    getSelectedRows() {
        return this.state.data.filter(row => this.state.selectedIds.has(String(row.id)));
    }

    getNestedValue(obj, path) {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    }

    escapeHtml(text) {
        if (text === null || text === undefined) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

}

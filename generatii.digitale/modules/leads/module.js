/*
==========================================
BuildWithIF CMS
Leads Module
Collect and manage website leads.
==========================================
*/

const BWLeads = {

    getConfig() {
        return window.BW_PROJECT?.leads || {};
    },

    getTable() {
        return this.getConfig().table || "leads";
    },

    getFields() {
        return this.getConfig().fields || [];
    },

    getStatuses() {
        return this.getConfig().statuses || [
            { value: "new", label: "Nou", color: "danger" },
            { value: "contacted", label: "Contactat", color: "warning" },
            { value: "qualified", label: "Calificat", color: "info" },
            { value: "converted", label: "Convertit", color: "success" },
            { value: "archived", label: "Arhivat", color: "neutral" }
        ];
    },

    getStatusOptions() {
        return this.getStatuses().map(s => ({ value: s.value, label: s.label }));
    },

    getStatusColorMap() {
        return this.getStatuses().reduce((map, s) => {
            map[s.value] = s.color || "neutral";
            return map;
        }, {});
    },

    getDefaultStatus() {
        const statuses = this.getStatuses();
        return statuses.length > 0 ? statuses[0].value : "new";
    },

    getTableFields() {
        return this.getFields().filter(f => f.showInTable !== false);
    },

    buildColumns() {
        const statusOptions = this.getStatusOptions();
        const statusColorMap = this.getStatusColorMap();
        const statusEnum = statusOptions.reduce((acc, opt) => {
            acc[opt.value] = opt.label;
            return acc;
        }, {});

        const fieldColumns = this.getTableFields().map(field => ({
            field: field.name,
            label: field.label || field.name,
            type: field.type === "email" ? "text" : (field.type || "text"),
            width: field.width
        }));

        return [
            ...fieldColumns,
            { field: "status", label: "Status", type: "enum", options: statusEnum },
            { field: "created_at", label: "Primit la", type: "datetime" }
        ];
    },

    buildFilters() {
        return [
            {
                field: "status",
                type: "select",
                label: "Status",
                placeholder: "Toate",
                options: this.getStatusOptions()
            }
        ];
    },

    formatValue(value, field) {
        if (value === null || value === undefined) return "—";
        return String(value);
    }

};

async function LeadsModule(container) {
    container.innerHTML = "";

    const config = BWLeads.getConfig();
    if (!config.table) {
        container.innerHTML = `<p class="leads-error">Modulul de lead-uri nu este configurat corect. Lipseste tabelul din <code>config/project.js</code>.</p>`;
        return;
    }

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Lead-uri";

    header.appendChild(title);
    container.appendChild(header);

    registerLeadActions();

    const tableContainer = document.createElement("div");
    tableContainer.id = "leads-table";
    container.appendChild(tableContainer);

    const table = new BWTable({
        container: tableContainer,
        table: BWLeads.getTable(),
        columns: BWLeads.buildColumns(),
        filters: BWLeads.buildFilters(),
        rowActions: [
            { name: "viewLead", label: "Vezi", icon: "👁️" },
            { name: "editLeadStatus", label: "Status", icon: "📝" },
            { name: "archiveLead", label: "Arhiveaza", icon: "📦" },
            { name: "deleteLead", label: "Sterge", icon: "🗑️", danger: true }
        ],
        bulkActions: [
            { name: "bulkArchiveLeads", label: "Arhiveaza selectate" },
            { name: "bulkDeleteLeads", label: "Sterge selectate", danger: true }
        ],
        emptyState: {
            icon: "📭",
            title: "Niciun lead",
            message: "Nu exista lead-uri de afisat momentan."
        }
    });

    checkNewLeads(table);
}

function registerLeadActions() {
    BWTableActions.register("viewLead", async ({ row }) => {
        const modal = BWModal({
            title: `Lead de la ${escapeHtml(row.name || "—")}`,
            body: renderLeadDetails(row)
        });
        modal.open();
    });

    BWTableActions.register("editLeadStatus", async ({ row, table }) => {
        openLeadStatusForm(row, table);
    });

    BWTableActions.register("archiveLead", async ({ row, table }) => {
        try {
            await BWDatabase.update(BWLeads.getTable(), row.id, { status: "archived" });
            BWToast.success("Lead-ul a fost arhivat.");
            table.refresh();
        } catch (error) {
            console.error("[Leads] Archive failed:", error);
            BWToast.error("Nu am putut arhiva lead-ul.");
        }
    });

    BWTableActions.register("deleteLead", async ({ row, table }) => {
        const confirmed = await BWModal.confirm({
            title: "Stergere lead",
            message: `Esti sigur ca vrei sa stergi lead-ul de la ${row.name || row.email || "acest contact"}?`,
            confirmText: "Sterge",
            cancelText: "Anuleaza",
            danger: true
        });

        if (!confirmed) return;

        try {
            await BWDatabase.delete(BWLeads.getTable(), row.id);
            BWToast.success("Lead-ul a fost sters.");
            table.refresh();
        } catch (error) {
            console.error("[Leads] Delete failed:", error);
            BWToast.error("Nu am putut sterge lead-ul.");
        }
    });

    BWTableActions.register("bulkArchiveLeads", async ({ rows, table }) => {
        if (!rows || rows.length === 0) return;

        try {
            for (const row of rows) {
                await BWDatabase.update(BWLeads.getTable(), row.id, { status: "archived" });
            }
            table.clearSelection();
            BWToast.success(`${rows.length} lead-uri arhivate.`);
            table.refresh();
        } catch (error) {
            console.error("[Leads] Bulk archive failed:", error);
            BWToast.error("Nu am putut arhiva lead-urile selectate.");
        }
    });

    BWTableActions.register("bulkDeleteLeads", async ({ rows, table }) => {
        if (!rows || rows.length === 0) return;

        const confirmed = await BWModal.confirm({
            title: "Stergere multipla",
            message: `Esti sigur ca vrei sa stergi ${rows.length} lead-uri?`,
            confirmText: "Sterge",
            cancelText: "Anuleaza",
            danger: true
        });

        if (!confirmed) return;

        try {
            const ids = rows.map(row => row.id);
            await BWDatabase.deleteMany(BWLeads.getTable(), ids);
            table.clearSelection();
            BWToast.success(`${rows.length} lead-uri sterse.`);
            table.refresh();
        } catch (error) {
            console.error("[Leads] Bulk delete failed:", error);
            BWToast.error("Nu am putut sterge lead-urile selectate.");
        }
    });
}

function renderLeadDetails(row) {
    const fields = BWLeads.getFields();
    const statuses = BWLeads.getStatuses();
    const statusLabel = statuses.find(s => s.value === row.status)?.label || row.status || "—";

    const fieldRows = fields.map(field => {
        const value = BWLeads.formatValue(row[field.name], field);
        return `
            <div class="leads-detail__row">
                <span class="leads-detail__label">${escapeHtml(field.label || field.name)}</span>
                <span class="leads-detail__value">${escapeHtml(value)}</span>
            </div>
        `;
    }).join("");

    const wrapper = document.createElement("div");
    wrapper.className = "leads-detail";
    wrapper.innerHTML = `
        ${fieldRows}
        <div class="leads-detail__row">
            <span class="leads-detail__label">Status</span>
            <span class="leads-detail__value">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="leads-detail__row">
            <span class="leads-detail__label">Primit la</span>
            <span class="leads-detail__value">${formatDateTime(row.created_at)}</span>
        </div>
        ${row.notes ? `
            <div class="leads-detail__row">
                <span class="leads-detail__label">Note</span>
                <span class="leads-detail__value leads-detail__value--notes">${escapeHtml(row.notes)}</span>
            </div>
        ` : ""}
    `;

    return wrapper;
}

function openLeadStatusForm(row, table) {
    let modal;

    const form = new BWForm({
        table: BWLeads.getTable(),
        recordId: row.id,
        layout: "default",
        submitLabel: "Salveaza",
        fields: [
            {
                name: "status",
                type: "select",
                label: "Status",
                required: true,
                options: BWLeads.getStatusOptions(),
                value: row.status || BWLeads.getDefaultStatus()
            },
            {
                name: "notes",
                type: "textarea",
                label: "Note interne",
                rows: 4,
                value: row.notes || ""
            }
        ],
        onSuccess: () => {
            modal.close();
            BWToast.success("Lead-ul a fost actualizat.");
            table.refresh();
        },
        onError: (err) => {
            BWToast.error(err.message || "Nu am putut actualiza lead-ul.");
        },
        onCancel: () => {
            modal.close();
        }
    });

    modal = BWModal({
        title: "Actualizeaza lead",
        body: form.render()
    });

    modal.open();
}

async function checkNewLeads(table) {
    const config = BWLeads.getConfig();
    if (!config.notifications?.inApp) return;

    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from(BWLeads.getTable())
            .select("id", { count: "exact", head: false })
            .eq("status", "new")
            .gte("created_at", since);

        if (error) throw error;

        const count = data?.length || 0;

        if (count > 0) {
            BWToast.info(`Ai ${count} lead-uri noi in ultimele 24 de ore.`);
            BWEventBus.emit("leads:new", { count });
        }
    } catch (error) {
        console.warn("[Leads] Could not check for new leads:", error.message);
    }
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("ro-RO");
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

BWRouter.register("leads", LeadsModule);

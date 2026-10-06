/*
==========================================
BuildWithIF CMS Table Engine
Row & Bulk Actions Registry
==========================================
*/

const BWTableActions = {

    registry: new Map(),

    register(name, actionFn) {
        if (typeof actionFn !== "function") {
            throw new Error(`[BWTableActions] Action '${name}' must be a function.`);
        }
        this.registry.set(name, actionFn);
    },

    get(name) {
        return this.registry.get(name) || this.autoActions[name];
    },

    async execute(name, context) {
        const action = this.get(name);
        if (!action) {
            console.warn(`[BWTableActions] Action '${name}' not found.`);
            return;
        }
        return await action(context);
    },

    autoActions: {

        async edit(context) {
            const { row, table } = context;
            if (table.config.onEdit && typeof table.config.onEdit === "function") {
                return table.config.onEdit(row);
            }
            BWToast.warning("No edit handler configured.");
        },

        async delete(context) {
            const { row, table } = context;
            const confirmed = await BWModal.confirm({
                title: "Stergere inregistrare",
                message: `Esti sigur ca vrei sa stergi aceasta inregistrare?`,
                confirmText: "Sterge",
                cancelText: "Anuleaza",
                danger: true
            });

            if (!confirmed) return;

            try {
                await BWTableDataAdapter.delete(table.config.table, row.id);
                BWToast.success("Inregistrarea a fost stearsa.");
                table.refresh();
            } catch (error) {
                console.error("[BWTableActions] Delete failed:", error);
                BWToast.error("Nu am putut sterge inregistrarea.");
            }
        },

        async duplicate(context) {
            const { row, table } = context;
            try {
                await BWTableDataAdapter.duplicate(table.config.table, row);
                BWToast.success("Inregistrarea a fost duplicata.");
                table.refresh();
            } catch (error) {
                console.error("[BWTableActions] Duplicate failed:", error);
                BWToast.error("Nu am putut duplica inregistrarea.");
            }
        },

        async bulkDelete(context) {
            const { rows, table } = context;
            if (!rows || rows.length === 0) return;

            const confirmed = await BWModal.confirm({
                title: "Stergere multipla",
                message: `Esti sigur ca vrei sa stergi ${rows.length} inregistrari?`,
                confirmText: "Sterge",
                cancelText: "Anuleaza",
                danger: true
            });

            if (!confirmed) return;

            try {
                const ids = rows.map(row => row.id);
                await BWTableDataAdapter.deleteMany(table.config.table, ids);
                table.clearSelection();
                BWToast.success(`${rows.length} inregistrari sterse.`);
                table.refresh();
            } catch (error) {
                console.error("[BWTableActions] Bulk delete failed:", error);
                BWToast.error("Nu am putut sterge inregistrarile selectate.");
            }
        },

        async bulkActivate(context) {
            const { rows, table } = context;
            await table.updateRows(rows, { is_active: true });
        },

        async bulkDeactivate(context) {
            const { rows, table } = context;
            await table.updateRows(rows, { is_active: false });
        }
    }

};

Object.keys(BWTableActions.autoActions).forEach(name => {
    BWTableActions.register(name, BWTableActions.autoActions[name]);
});

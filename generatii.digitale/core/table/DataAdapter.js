/*
==========================================
BuildWithIF CMS Table Engine
Data Adapter
==========================================
*/

const BWTableDataAdapter = {

    async load(config, state) {
        const table = config.table;
        if (!table) throw new Error("[BWTable] Config 'table' is required.");

        const searchColumns = (config.columns || [])
            .filter(col => col.searchable !== false && (col.type === "text" || col.type === undefined || col.searchable === true))
            .map(col => col.field);

        const filters = this.buildFilters(config.filters || [], state.filters);

        const sort = state.sort
            ? { column: state.sort.field, ascending: state.sort.direction === "asc" }
            : null;

        const options = {
            page: state.page,
            pageSize: state.pageSize,
            search: state.search || undefined,
            searchColumns: state.search ? searchColumns : undefined,
            filters: filters,
            sort: sort
        };

        return await BWDatabase.query(table, options);
    },

    buildFilters(filterConfigs, stateFilters) {
        const filters = {};

        filterConfigs.forEach(filterConfig => {
            const value = stateFilters[filterConfig.field];
            if (value === undefined || value === null || value === "") return;

            if (filterConfig.type === "date-range") {
                filters[filterConfig.field] = {};
                if (value.from) filters[filterConfig.field].from = value.from;
                if (value.to) filters[filterConfig.field].to = value.to;
            } else if (filterConfig.type === "multi-select" && Array.isArray(value) && value.length > 0) {
                filters[filterConfig.field] = { in: value };
            } else if (value === "true" || value === "false") {
                filters[filterConfig.field] = value === "true";
            } else {
                filters[filterConfig.field] = value;
            }
        });

        return filters;
    },

    async delete(table, id) {
        return await BWDatabase.delete(table, id);
    },

    async deleteMany(table, ids) {
        return await BWDatabase.deleteMany(table, ids);
    },

    async duplicate(table, row) {
        const copy = { ...row };
        delete copy.id;
        delete copy.created_at;
        delete copy.updated_at;

        if (copy.title) copy.title = `${copy.title} (Copy)`;
        if (copy.name) copy.name = `${copy.name} (Copy)`;

        return await BWDatabase.insert(table, copy);
    }

};

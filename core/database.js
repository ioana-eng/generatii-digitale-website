/*
==========================================
BuildWithIF CMS
Database Service
==========================================
*/

const BWDatabase = {

    async select(table, options = {}) {
        let query = supabase
            .from(table)
            .select(options.columns || "*");

        if (options.eq) {
            query = query.eq(options.eq.column, options.eq.value);
        }

        if (options.order) {
            query = query.order(options.order.column, {
                ascending: options.order.ascending !== false
            });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;
    },

    async query(table, options = {}) {
        const page = options.page || 1;
        const pageSize = options.pageSize || 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let countQuery = supabase
            .from(table)
            .select(options.columns || "*", { count: "exact", head: false });

        let dataQuery = supabase
            .from(table)
            .select(options.columns || "*");

        // Search
        if (options.search && options.searchColumns && options.searchColumns.length > 0) {
            const searchTerm = `%${options.search}%`;
            const orConditions = options.searchColumns
                .map(col => `${col}.ilike.${searchTerm}`)
                .join(",");
            countQuery = countQuery.or(orConditions);
            dataQuery = dataQuery.or(orConditions);
        }

        // Filters
        if (options.filters) {
            Object.entries(options.filters).forEach(([field, filter]) => {
                if (filter === undefined || filter === null || filter === "") return;

                if (typeof filter === "object") {
                    if (filter.from !== undefined) {
                        countQuery = countQuery.gte(field, filter.from);
                        dataQuery = dataQuery.gte(field, filter.from);
                    }
                    if (filter.to !== undefined) {
                        countQuery = countQuery.lte(field, filter.to);
                        dataQuery = dataQuery.lte(field, filter.to);
                    }
                    if (filter.in && Array.isArray(filter.in)) {
                        countQuery = countQuery.in(field, filter.in);
                        dataQuery = dataQuery.in(field, filter.in);
                    }
                } else {
                    countQuery = countQuery.eq(field, filter);
                    dataQuery = dataQuery.eq(field, filter);
                }
            });
        }

        // Sort
        if (options.sort && options.sort.column) {
            countQuery = countQuery.order(options.sort.column, {
                ascending: options.sort.ascending !== false
            });
            dataQuery = dataQuery.order(options.sort.column, {
                ascending: options.sort.ascending !== false
            });
        } else if (options.order) {
            countQuery = countQuery.order(options.order.column, {
                ascending: options.order.ascending !== false
            });
            dataQuery = dataQuery.order(options.order.column, {
                ascending: options.order.ascending !== false
            });
        }

        // Range
        dataQuery = dataQuery.range(from, to);

        const [{ count }, { data, error }] = await Promise.all([
            countQuery,
            dataQuery
        ]);

        if (error) throw error;

        const totalPages = Math.ceil((count || 0) / pageSize);

        return {
            data: data || [],
            count: count || 0,
            page,
            pageSize,
            totalPages
        };
    },

    async getById(table, id) {
        const { data, error } = await supabase
            .from(table)
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    },

    async insert(table, record) {
        const { data, error } = await supabase
            .from(table)
            .insert(record)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    async update(table, id, record) {
        const { data, error } = await supabase
            .from(table)
            .update(record)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return data;
    },

    async delete(table, id) {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", id);

        if (error) throw error;

        return true;
    },

    async deleteMany(table, ids) {
        const { error } = await supabase
            .from(table)
            .delete()
            .in("id", ids);

        if (error) throw error;

        return true;
    }

};

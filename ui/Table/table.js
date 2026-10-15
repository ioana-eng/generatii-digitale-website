/*
==========================================
BuildWithIF UI
Table Component
==========================================
*/

function BWDataTable(options = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "bw-table-wrapper";

    const table = document.createElement("table");
    table.className = "bw-table";

    const columns = options.columns || [];
    const rows = options.rows || [];

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label || col.key;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    rows.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");

            if (col.render) {
                const rendered = col.render(row[col.key], row);
                if (typeof rendered === "string") {
                    td.innerHTML = rendered;
                } else {
                    td.appendChild(rendered);
                }
            } else {
                td.textContent = row[col.key] || "";
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
}

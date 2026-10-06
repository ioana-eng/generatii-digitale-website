/*
==========================================
BuildWithIF CMS
Workshops Module
==========================================
*/

const WORKSHOP_FIELDS = [
    {
        name: "title",
        type: "text",
        label: "Titlu",
        required: true,
        placeholder: "Titlul atelierului",
        section: "Informatii generale"
    },
    {
        name: "slug",
        type: "slug",
        source: "title",
        label: "Slug",
        section: "Informatii generale"
    },
    {
        name: "description",
        type: "textarea",
        label: "Descriere",
        placeholder: "Descrierea atelierului",
        rows: 4,
        section: "Informatii generale",
        width: 2
    },
    {
        name: "age_group",
        type: "text",
        label: "Grupa varsta",
        placeholder: "Ex: 6-10 ani",
        section: "Detalii"
    },
    {
        name: "is_active",
        type: "toggle",
        label: "Activ",
        value: true,
        section: "Detalii"
    }
];

async function WorkshopsModule(container) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Ateliere";

    const addBtn = document.createElement("button");
    addBtn.className = "bw-btn bw-btn--primary";
    addBtn.textContent = "+ Adauga atelier";

    header.appendChild(title);
    header.appendChild(addBtn);
    container.appendChild(header);

    const tableContainer = document.createElement("div");
    tableContainer.id = "workshops-table";
    container.appendChild(tableContainer);

    const table = new BWTable({
        container: tableContainer,
        title: "",
        table: window.BW_PROJECT.tables.workshops,
        columns: [
            { field: "title", label: "Titlu", type: "text", width: "35%" },
            { field: "age_group", label: "Grupa varsta", type: "text" },
            { field: "is_active", label: "Activ", type: "boolean", trueLabel: "Da", falseLabel: "Nu" },
            { field: "created_at", label: "Data crearii", type: "date" }
        ],
        filters: [
            {
                field: "is_active",
                type: "select",
                label: "Status",
                placeholder: "Toate",
                options: [
                    { value: "true", label: "Activ" },
                    { value: "false", label: "Inactiv" }
                ]
            }
        ],
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
        onEdit: (row) => openWorkshopForm(row.id, table)
    });

    addBtn.addEventListener("click", () => openWorkshopForm(null, table));
}

function openWorkshopForm(id = null, table = null) {
    let modal;

    const form = new BWForm({
        table: window.BW_PROJECT.tables.workshops,
        recordId: id,
        layout: "two-column",
        fields: WORKSHOP_FIELDS,
        submitLabel: id ? "Actualizeaza" : "Salveaza",
        onSuccess: async () => {
            modal.close();
            BWToast.success(id ? "Atelierul a fost actualizat." : "Atelierul a fost adaugat.");
            if (table) table.refresh();
        },
        onError: (err) => {
            BWToast.error(err.message);
        },
        onCancel: () => {
            modal.close();
        }
    });

    modal = BWModal({
        title: id ? "Editeaza atelier" : "Adauga atelier",
        body: form.render()
    });

    modal.open();
}

BWRouter.register("workshops", WorkshopsModule);

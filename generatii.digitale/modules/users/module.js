/*
==========================================
BuildWithIF CMS
Users Module
Administrator only.
==========================================
*/

const ROLE_OPTIONS = [
    { value: "client", label: "Client" },
    { value: "editor", label: "Editor" },
    { value: "administrator", label: "Administrator" }
];

const USER_CREATE_FIELDS = [
    {
        name: "full_name",
        type: "text",
        label: "Nume complet",
        required: true,
        placeholder: "Ex: Ion Popescu",
        section: "Informatii generale"
    },
    {
        name: "email",
        type: "email",
        label: "Email",
        required: true,
        placeholder: "exemplu@domeniu.ro",
        section: "Informatii generale"
    },
    {
        name: "role",
        type: "select",
        label: "Rol",
        required: true,
        options: ROLE_OPTIONS,
        value: "client",
        section: "Permisiuni"
    },
    {
        name: "is_active",
        type: "toggle",
        label: "Activ",
        value: true,
        section: "Permisiuni"
    },
    {
        name: "password",
        type: "password",
        label: "Parola initiala",
        required: true,
        section: "Securitate"
    }
];

const USER_EDIT_FIELDS = [
    {
        name: "full_name",
        type: "text",
        label: "Nume complet",
        required: true,
        section: "Informatii generale"
    },
    {
        name: "email",
        type: "email",
        label: "Email",
        required: true,
        disabled: true,
        section: "Informatii generale"
    },
    {
        name: "role",
        type: "select",
        label: "Rol",
        required: true,
        options: ROLE_OPTIONS,
        section: "Permisiuni"
    },
    {
        name: "is_active",
        type: "toggle",
        label: "Activ",
        section: "Permisiuni"
    }
];

async function UsersModule(container) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Utilizatori";

    const addBtn = document.createElement("button");
    addBtn.className = "bw-btn bw-btn--primary";
    addBtn.textContent = "+ Adauga utilizator";

    header.appendChild(title);
    header.appendChild(addBtn);
    container.appendChild(header);

    const tableContainer = document.createElement("div");
    tableContainer.id = "users-table";
    container.appendChild(tableContainer);

    registerUserActions();

    const table = new BWTable({
        container: tableContainer,
        table: window.BW_PROJECT.tables.users,
        columns: [
            { field: "full_name", label: "Nume", type: "text", width: "25%" },
            { field: "email", label: "Email", type: "text", width: "25%" },
            { field: "role", label: "Rol", type: "badge", colorMap: { administrator: "primary", editor: "warning", client: "neutral" } },
            { field: "is_active", label: "Activ", type: "boolean", trueLabel: "Da", falseLabel: "Nu" },
            { field: "last_login", label: "Ultima logare", type: "datetime" },
            { field: "created_at", label: "Creat la", type: "date" }
        ],
        filters: [
            {
                field: "role",
                type: "select",
                label: "Rol",
                placeholder: "Toate",
                options: ROLE_OPTIONS
            },
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
            { name: "resetPassword", label: "Reseteaza parola", icon: "key" },
            { name: "deleteUser", label: "Sterge", icon: "trash", danger: true }
        ],
        bulkActions: [
            { name: "bulkDeleteUsers", label: "Sterge selectati", danger: true },
            { name: "bulkActivate", label: "Activeaza" },
            { name: "bulkDeactivate", label: "Dezactiveaza" }
        ],
        onEdit: (row) => openUserForm(row.id, table)
    });

    addBtn.addEventListener("click", () => openUserForm(null, table));
}

function registerUserActions() {
    BWTableActions.register("resetPassword", async ({ row }) => {
        const confirmed = await BWModal.confirm({
            title: "Resetare parola",
            message: `Doresti sa trimiti un email de resetare parolei pentru ${row.email}?`,
            confirmText: "Trimite",
            cancelText: "Anuleaza"
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(row.email);
            if (error) throw error;
            BWToast.success("Emailul de resetare a fost trimis.");
        } catch (error) {
            console.error("[Users] Reset password failed:", error);
            BWToast.error("Nu am putut trimite emailul de resetare.");
        }
    });

    BWTableActions.register("deleteUser", async ({ row, table }) => {
        const confirmed = await BWModal.confirm({
            title: "Stergere utilizator",
            message: `Esti sigur ca vrei sa stergi utilizatorul ${row.email}?`,
            confirmText: "Sterge",
            cancelText: "Anuleaza",
            danger: true
        });

        if (!confirmed) return;

        try {
            await BWDatabase.delete(table.config.table, row.id);

            try {
                await supabase.auth.admin.deleteUser(row.id);
            } catch (authError) {
                console.warn("[Users] Auth user could not be deleted:", authError.message);
            }

            BWToast.success("Utilizatorul a fost sters.");
            table.refresh();
        } catch (error) {
            console.error("[Users] Delete failed:", error);
            BWToast.error("Nu am putut sterge utilizatorul.");
        }
    });

    BWTableActions.register("bulkDeleteUsers", async ({ rows, table }) => {
        if (!rows || rows.length === 0) return;

        const confirmed = await BWModal.confirm({
            title: "Stergere multipla",
            message: `Esti sigur ca vrei sa stergi ${rows.length} utilizatori?`,
            confirmText: "Sterge",
            cancelText: "Anuleaza",
            danger: true
        });

        if (!confirmed) return;

        try {
            const ids = rows.map(row => row.id);
            await BWDatabase.deleteMany(table.config.table, ids);
            table.clearSelection();
            BWToast.success(`${rows.length} utilizatori sterse din baza de date.`);
            table.refresh();
        } catch (error) {
            console.error("[Users] Bulk delete failed:", error);
            BWToast.error("Nu am putut sterge utilizatorii selectati.");
        }
    });
}

function openUserForm(id = null, table = null) {
    let modal;

    const isCreate = !id;
    const fields = isCreate ? USER_CREATE_FIELDS : USER_EDIT_FIELDS;

    const form = new BWForm({
        table: isCreate ? null : window.BW_PROJECT.tables.users,
        recordId: id,
        layout: "two-column",
        fields: fields,
        submitLabel: isCreate ? "Creaza utilizator" : "Actualizeaza",
        onBeforeSubmit: async (values) => {
            if (isCreate) {
                await createUser(values, table);
                return null;
            }

            if (id === currentUser?.id) {
                try {
                    await supabase.auth.updateUser({
                        data: {
                            full_name: values.full_name,
                            role: values.role
                        }
                    });
                } catch (error) {
                    console.warn("[Users] Could not update own auth metadata:", error.message);
                }
            }

            return values;
        },
        onSuccess: async () => {
            modal.close();
            BWToast.success(isCreate ? "Utilizatorul a fost creat." : "Utilizatorul a fost actualizat.");
            if (table) table.refresh();
        },
        onError: (err) => {
            BWToast.error(err.message || "A aparut o eroare.");
        },
        onCancel: () => {
            modal.close();
        }
    });

    modal = BWModal({
        title: isCreate ? "Adauga utilizator" : "Editeaza utilizator",
        body: form.render()
    });

    modal.open();
}

async function createUser(values, table) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    full_name: values.full_name,
                    role: values.role
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Utilizatorul nu a putut fi creat.");

        await BWDatabase.insert(window.BW_PROJECT.tables.users, {
            id: data.user.id,
            full_name: values.full_name,
            email: values.email,
            role: values.role,
            is_active: values.is_active,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error("[Users] Create user failed:", error);
        throw error;
    }
}

BWRouter.register("users", UsersModule);

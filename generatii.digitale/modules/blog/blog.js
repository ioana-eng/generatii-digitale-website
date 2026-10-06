/*
==========================================
BuildWithIF CMS
Blog Module
Manage blog articles and categories.
==========================================
*/

const BWBlog = {

    postsTable() {
        return window.BW_PROJECT?.tables?.blogPosts || "blog_posts";
    },

    categoriesTable() {
        return window.BW_PROJECT?.tables?.blogCategories || "blog_categories";
    },

    categoriesCache: new Map(),

    async loadCategories() {
        const categories = await BWDatabase.select(
            this.categoriesTable(),
            { order: { column: "name", ascending: true } }
        );

        this.categoriesCache = new Map((categories || []).map(c => [c.id, c.name]));
        return categories || [];
    },

    getCategoryOptions(categories) {
        return (categories || []).map(c => ({ value: c.id, label: c.name }));
    },

    getCategoryName(id) {
        return this.categoriesCache.get(id) || null;
    },

    getStatusOptions() {
        return [
            { value: "draft", label: "Ciorna" },
            { value: "published", label: "Publicat" }
        ];
    },

    buildPostFields(categories) {
        return [
            {
                name: "title",
                type: "text",
                label: "Titlu",
                required: true,
                placeholder: "Titlul articolului",
                section: "Continut"
            },
            {
                name: "slug",
                type: "slug",
                source: "title",
                label: "Slug",
                section: "Continut"
            },
            {
                name: "category_id",
                type: "select",
                label: "Categorie",
                placeholder: "Alege categoria",
                options: this.getCategoryOptions(categories),
                section: "Continut"
            },
            {
                name: "excerpt",
                type: "textarea",
                label: "Rezumat",
                rows: 3,
                placeholder: "Scurt rezumat afisat in lista de articole",
                section: "Continut",
                width: 2
            },
            {
                name: "content",
                type: "textarea",
                label: "Continut",
                rows: 10,
                placeholder: "Continutul articolului",
                section: "Continut",
                width: 2
            },
            {
                name: "cover_image",
                type: "image",
                label: "Imagine coperta",
                folder: "blog",
                section: "Publicare"
            },
            {
                name: "status",
                type: "select",
                label: "Status",
                required: true,
                options: this.getStatusOptions(),
                value: "draft",
                section: "Publicare"
            }
        ];
    },

    buildCategoryFields() {
        return [
            {
                name: "name",
                type: "text",
                label: "Nume",
                required: true,
                placeholder: "Numele categoriei",
                section: "Informatii generale"
            },
            {
                name: "slug",
                type: "slug",
                source: "name",
                label: "Slug",
                section: "Informatii generale"
            },
            {
                name: "is_active",
                type: "toggle",
                label: "Activ",
                value: true,
                section: "Informatii generale"
            }
        ];
    }

};

function registerBlogFormatters() {
    BWColumnFormatters.register("blogCategory", (value) => {
        if (!value) return "—";
        const name = BWBlog.getCategoryName(value);
        return BWColumnFormatters.escapeHtml(name || "—");
    });
}

function registerBlogActions() {
    BWTableActions.register("blogPreview", ({ row }) => {
        if (!row.slug) {
            BWToast.warning("Acest articol nu are un slug setat.");
            return;
        }
        window.open(`../blog.html?slug=${encodeURIComponent(row.slug)}`, "_blank");
    });

    BWTableActions.register("blogPublish", async ({ rows, table }) => {
        if (!rows || rows.length === 0) return;

        try {
            for (const row of rows) {
                const publishedAt = row.published_at || new Date().toISOString();
                await BWDatabase.update(BWBlog.postsTable(), row.id, {
                    status: "published",
                    published_at: publishedAt
                });
            }
            table.clearSelection();
            BWToast.success(`${rows.length} articole publicate.`);
            table.refresh();
        } catch (error) {
            console.error("[Blog] Bulk publish failed:", error);
            BWToast.error("Nu am putut publica articolele selectate.");
        }
    });

    BWTableActions.register("blogUnpublish", async ({ rows, table }) => {
        if (!rows || rows.length === 0) return;

        try {
            for (const row of rows) {
                await BWDatabase.update(BWBlog.postsTable(), row.id, { status: "draft" });
            }
            table.clearSelection();
            BWToast.success(`${rows.length} articole mutate in ciorne.`);
            table.refresh();
        } catch (error) {
            console.error("[Blog] Bulk unpublish failed:", error);
            BWToast.error("Nu am putut muta articolele in ciorne.");
        }
    });
}

async function BlogModule(container) {
    container.innerHTML = "";

    registerBlogFormatters();
    registerBlogActions();

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Articole";

    header.appendChild(title);
    container.appendChild(header);

    const tabs = document.createElement("div");
    tabs.className = "blog-tabs";

    const postsTab = document.createElement("button");
    postsTab.type = "button";
    postsTab.className = "blog-tabs__btn blog-tabs__btn--active";
    postsTab.textContent = "Articole";

    const categoriesTab = document.createElement("button");
    categoriesTab.type = "button";
    categoriesTab.className = "blog-tabs__btn";
    categoriesTab.textContent = "Categorii";

    tabs.appendChild(postsTab);
    tabs.appendChild(categoriesTab);
    container.appendChild(tabs);

    const view = document.createElement("div");
    view.className = "blog-view";
    container.appendChild(view);

    const showTab = (tab) => {
        postsTab.classList.toggle("blog-tabs__btn--active", tab === "posts");
        categoriesTab.classList.toggle("blog-tabs__btn--active", tab === "categories");
    };

    postsTab.addEventListener("click", () => {
        showTab("posts");
        renderBlogPosts(view);
    });

    categoriesTab.addEventListener("click", () => {
        showTab("categories");
        renderBlogCategories(view);
    });

    renderBlogPosts(view);
}

async function renderBlogPosts(view) {
    view.innerHTML = "";

    let categories = [];
    try {
        categories = await BWBlog.loadCategories();
    } catch (error) {
        console.warn("[Blog] Could not load categories:", error.message);
    }

    const subheader = document.createElement("div");
    subheader.className = "module-header blog-subheader";

    const heading = document.createElement("h3");
    heading.textContent = "Articole";

    const addBtn = document.createElement("button");
    addBtn.className = "bw-btn bw-btn--primary";
    addBtn.textContent = "+ Adauga articol";

    subheader.appendChild(heading);
    subheader.appendChild(addBtn);
    view.appendChild(subheader);

    const tableContainer = document.createElement("div");
    view.appendChild(tableContainer);

    const table = new BWTable({
        container: tableContainer,
        title: "",
        table: BWBlog.postsTable(),
        columns: [
            { field: "title", label: "Titlu", type: "text", width: "35%" },
            { field: "category_id", label: "Categorie", type: "blogCategory" },
            { field: "status", label: "Status", type: "enum", options: { draft: "Ciorna", published: "Publicat" } },
            { field: "published_at", label: "Publicat la", type: "datetime" }
        ],
        filters: [
            {
                field: "status",
                type: "select",
                label: "Status",
                placeholder: "Toate",
                options: BWBlog.getStatusOptions()
            },
            {
                field: "category_id",
                type: "select",
                label: "Categorie",
                placeholder: "Toate categoriile",
                options: BWBlog.getCategoryOptions(categories)
            }
        ],
        rowActions: [
            { name: "edit", label: "Editeaza", icon: "edit" },
            { name: "blogPreview", label: "Vezi", icon: "eye" },
            { name: "delete", label: "Sterge", icon: "trash", danger: true }
        ],
        bulkActions: [
            { name: "bulkDelete", label: "Sterge selectate", danger: true },
            { name: "blogPublish", label: "Publica selectate" },
            { name: "blogUnpublish", label: "Mută în ciorne" }
        ],
        onEdit: (row) => openBlogPostForm(row.id, table),
        emptyState: {
            icon: "📝",
            title: "Niciun articol",
            message: "Nu exista articole de afisat momentan. Adauga primul articol."
        }
    });

    addBtn.addEventListener("click", () => openBlogPostForm(null, table));
}

async function renderBlogCategories(view) {
    view.innerHTML = "";

    const subheader = document.createElement("div");
    subheader.className = "module-header blog-subheader";

    const heading = document.createElement("h3");
    heading.textContent = "Categorii";

    const addBtn = document.createElement("button");
    addBtn.className = "bw-btn bw-btn--primary";
    addBtn.textContent = "+ Adauga categorie";

    subheader.appendChild(heading);
    subheader.appendChild(addBtn);
    view.appendChild(subheader);

    const tableContainer = document.createElement("div");
    view.appendChild(tableContainer);

    const table = new BWTable({
        container: tableContainer,
        title: "",
        table: BWBlog.categoriesTable(),
        columns: [
            { field: "name", label: "Nume", type: "text", width: "40%" },
            { field: "slug", label: "Slug", type: "text" },
            { field: "is_active", label: "Activ", type: "boolean", trueLabel: "Da", falseLabel: "Nu" },
            { field: "created_at", label: "Data crearii", type: "date" }
        ],
        rowActions: [
            { name: "edit", label: "Editeaza", icon: "edit" },
            { name: "delete", label: "Sterge", icon: "trash", danger: true }
        ],
        bulkActions: [
            { name: "bulkDelete", label: "Sterge selectate", danger: true },
            { name: "bulkActivate", label: "Activeaza" },
            { name: "bulkDeactivate", label: "Dezactiveaza" }
        ],
        onEdit: (row) => openBlogCategoryForm(row.id, table),
        emptyState: {
            icon: "🗂️",
            title: "Nicio categorie",
            message: "Nu exista categorii de afisat momentan. Adauga prima categorie."
        }
    });

    addBtn.addEventListener("click", () => openBlogCategoryForm(null, table));
}

async function openBlogPostForm(id = null, table = null) {
    let modal;

    let categories = [];
    try {
        categories = await BWBlog.loadCategories();
    } catch (error) {
        console.warn("[Blog] Could not load categories:", error.message);
    }

    let currentUser = null;
    try {
        currentUser = await getCurrentUser();
    } catch (error) {
        console.warn("[Blog] Could not load current user:", error.message);
    }

    const form = new BWForm({
        table: BWBlog.postsTable(),
        recordId: id,
        layout: "two-column",
        fields: BWBlog.buildPostFields(categories),
        submitLabel: id ? "Actualizeaza" : "Salveaza",
        onBeforeSubmit: (values, formInstance) => {
            if (values.status === "published") {
                const alreadyPublished = formInstance.record && formInstance.record.published_at;
                values.published_at = alreadyPublished || new Date().toISOString();
            }
            if (!formInstance.record && currentUser) {
                values.author_id = currentUser.id;
            }
            return values;
        },
        onSuccess: () => {
            modal.close();
            BWToast.success(id ? "Articolul a fost actualizat." : "Articolul a fost adaugat.");
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
        title: id ? "Editeaza articol" : "Adauga articol",
        body: form.render()
    });

    modal.open();
}

function openBlogCategoryForm(id = null, table = null) {
    let modal;

    const form = new BWForm({
        table: BWBlog.categoriesTable(),
        recordId: id,
        layout: "two-column",
        fields: BWBlog.buildCategoryFields(),
        submitLabel: id ? "Actualizeaza" : "Salveaza",
        onSuccess: async () => {
            modal.close();
            BWToast.success(id ? "Categoria a fost actualizata." : "Categoria a fost adaugata.");
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
        title: id ? "Editeaza categorie" : "Adauga categorie",
        body: form.render()
    });

    modal.open();
}

BWRouter.register("blog", BlogModule);

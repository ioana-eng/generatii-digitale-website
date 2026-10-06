/*
==========================================
BuildWithIF CMS
Dashboard Module
==========================================
*/

function DashboardModule(container) {
    container.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "dashboard-grid";

    const modules = BWPermissions.getAllowedModules(currentUser)
        .filter(m => m.id !== "dashboard");

    modules.forEach(module => {
        const card = BWCard(`
            <h3>${module.icon} ${module.title}</h3>
            <p>Accesează modulul ${module.title.toLowerCase()}.</p>
            <button class="bw-btn bw-btn--primary" data-module="${module.id}">
                Deschide
            </button>
        `, "dashboard-card");

        const btn = card.querySelector("button");
        btn.addEventListener("click", () => BWRouter.navigate(module.id));

        grid.appendChild(card);
    });

    if (modules.length === 0) {
        grid.innerHTML = `<p>Nu ai acces la niciun modul.</p>`;
    }

    container.appendChild(grid);
}

BWRouter.register("dashboard", DashboardModule);

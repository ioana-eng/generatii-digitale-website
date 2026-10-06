/*
==========================================
BuildWithIF UI
Sidebar Component
==========================================
*/

function BWSidebar(options = {}) {
    const sidebar = document.createElement("aside");
    sidebar.className = "bw-sidebar";

    const brand = document.createElement("div");
    brand.className = "bw-sidebar__brand";
    brand.textContent = options.title || "BuildWithIF";

    const nav = document.createElement("nav");
    nav.className = "bw-sidebar__nav";
    nav.id = "sidebar-menu";

    sidebar.appendChild(brand);
    sidebar.appendChild(nav);

    return sidebar;
}

function BWSidebarItem(module, isActive = false) {
    const button = document.createElement("button");
    button.className = `bw-sidebar__item ${isActive ? "bw-sidebar__item--active" : ""}`.trim();
    button.dataset.module = module.id;

    const icon = document.createElement("span");
    icon.textContent = module.icon || "";

    const label = document.createElement("span");
    label.textContent = module.title;

    button.appendChild(icon);
    button.appendChild(label);

    button.addEventListener("click", () => {
        BWRouter.navigate(module.id);
    });

    return button;
}

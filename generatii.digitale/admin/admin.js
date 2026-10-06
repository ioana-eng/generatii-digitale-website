/*
==========================================
BuildWithIF CMS
Admin Application
==========================================
*/

let currentUser = null;

async function initAdmin() {
    BWErrorHandler.setupGlobal();

    currentUser = await requireAuth();

    if (!currentUser) return;

    renderBrand();
    renderSidebar();
    setupLogout();
    setupRouter();
}

function renderBrand() {
    const brand = document.getElementById("sidebar-brand");
    if (brand && window.BW_PROJECT?.name) {
        brand.textContent = window.BW_PROJECT.name;
    }
}

function renderSidebar() {
    const menu = document.getElementById("sidebar-menu");
    if (!menu) return;

    const modules = BWPermissions.getAllowedModules(currentUser);

    menu.innerHTML = "";

    modules.forEach(module => {
        const isActive = BWRouter.getCurrentModule() === module.id;
        const item = BWSidebarItem(module, isActive);
        menu.appendChild(item);
    });
}

function setupLogout() {
    const btn = document.getElementById("logout-btn");
    if (btn) {
        btn.addEventListener("click", logout);
    }
}

function setupRouter() {
    const content = document.getElementById("content");

    // Replace BWRouter.render with dynamic module loading
    BWRouter.render = async function (container) {
        const moduleId = this.getCurrentModule();
        const cachedRenderFn = this.routes[moduleId];

        container.innerHTML = "";

        if (typeof cachedRenderFn === "function") {
            cachedRenderFn(container);
            updatePageTitle();
            BWEventBus.emit("module:changed", { moduleId });
            renderSidebar();
            return;
        }

        try {
            BWLoader.show(container, BWI18n.t("common.loading"));
            const renderFn = await BWModuleLoader.load(moduleId);
            container.innerHTML = "";
            renderFn(container);
        } catch (error) {
            container.innerHTML = `
                <div class="bw-empty-state">
                    <div class="bw-empty-state__icon">⚠️</div>
                    <h3 class="bw-empty-state__title">Modul indisponibil</h3>
                    <p class="bw-empty-state__message">${BWErrorHandler.extractMessage(error)}</p>
                </div>
            `;
            BWErrorHandler.handle(error, `Router / ${moduleId}`);
        } finally {
            BWLoader.hide(container);
        }

        updatePageTitle();
        BWEventBus.emit("module:changed", { moduleId });
        renderSidebar();
    };

    window.addEventListener("hashchange", () => {
        BWRouter.render(content);
    });

    BWRouter.render(content);
}

function updatePageTitle() {
    const moduleId = BWRouter.getCurrentModule();
    const module = window.BW_MODULES.find(m => m.id === moduleId);
    const titleEl = document.getElementById("page-title");

    if (titleEl && module) {
        titleEl.textContent = module.title;
    }
}

initAdmin();

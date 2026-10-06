/*
==========================================
BuildWithIF CMS
Router
==========================================
*/

const BWRouter = {

    routes: {},

    register(moduleId, renderFn) {
        this.routes[moduleId] = renderFn;
    },

    navigate(moduleId) {
        window.location.hash = `#/${moduleId}`;
    },

    getCurrentModule() {
        const hash = window.location.hash.replace("#/", "").trim();
        return hash || "dashboard";
    },

    render(container) {
        const moduleId = this.getCurrentModule();
        const renderFn = this.routes[moduleId];

        container.innerHTML = "";

        if (typeof renderFn === "function") {
            renderFn(container);
        } else {
            container.innerHTML = `<p>Modulul <strong>${moduleId}</strong> nu este disponibil.</p>`;
        }
    },

    init(container) {
        window.addEventListener("hashchange", () => this.render(container));
        this.render(container);
    }

};

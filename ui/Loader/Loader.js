/*
==========================================
BuildWithIF UI
Loader Component
==========================================
*/

const BWLoader = {

    activeLoaders: new Map(),

    show(container, text = "Se incarca...") {
        const target = typeof container === "string" ? document.querySelector(container) : container;

        if (!target) {
            console.warn("[BWLoader] Container not found.");
            return;
        }

        this.hide(target);

        const overlay = document.createElement("div");
        overlay.className = "bw-loader";
        overlay.innerHTML = `
            <div class="bw-loader__spinner"></div>
            ${text ? `<div class="bw-loader__text">${text}</div>` : ""}
        `;

        target.appendChild(overlay);
        this.activeLoaders.set(target, overlay);
    },

    hide(container) {
        const target = typeof container === "string" ? document.querySelector(container) : container;

        if (!target) return;

        const overlay = this.activeLoaders.get(target);
        if (overlay) {
            overlay.remove();
            this.activeLoaders.delete(target);
        }
    },

    hideAll() {
        this.activeLoaders.forEach((overlay) => overlay.remove());
        this.activeLoaders.clear();
    }

};

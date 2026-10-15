/*
==========================================
BuildWithIF CMS - EmptyState Component
==========================================
*/

const BWEmptyState = {

    defaults: {
        icon: "📦",
        title: "Nimic de afisat",
        message: "Nu exista date disponibile momentan.",
        action: null
    },

    render(container, config = {}) {
        const settings = { ...this.defaults, ...config };
        const target = typeof container === "string" ? document.querySelector(container) : container;

        if (!target) {
            console.warn("[BWEmptyState] Container not found.");
            return;
        }

        target.innerHTML = `
            <div class="bw-empty-state">
                <div class="bw-empty-state__icon">${settings.icon}</div>
                <h3 class="bw-empty-state__title">${settings.title}</h3>
                ${settings.message ? `<p class="bw-empty-state__message">${settings.message}</p>` : ""}
                ${settings.action ? `
                    <button class="bw-btn bw-btn--primary" data-empty-action>
                        ${settings.action.icon ? `<span class="bw-icon">${settings.action.icon}</span>` : ""}
                        ${settings.action.label}
                    </button>
                ` : ""}
            </div>
        `;

        if (settings.action && typeof settings.action.onClick === "function") {
            const btn = target.querySelector("[data-empty-action]");
            if (btn) {
                btn.addEventListener("click", settings.action.onClick);
            }
        }
    }

};

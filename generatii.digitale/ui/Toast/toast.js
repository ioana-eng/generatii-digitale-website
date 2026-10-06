/*
==========================================
BuildWithIF UI
Toast Component
==========================================
*/

const BWToast = {

    container: null,

    getContainer() {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.className = "bw-toast-container";
            document.body.appendChild(this.container);
        }
        return this.container;
    },

    show(message, type = "success", duration = 3000) {
        const toast = document.createElement("div");
        toast.className = `bw-toast bw-toast--${type}`;
        toast.textContent = message;

        this.getContainer().appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(100%)";
            setTimeout(() => toast.remove(), 250);
        }, duration);
    },

    success(message) {
        this.show(message, "success");
    },

    error(message) {
        this.show(message, "error");
    },

    warning(message) {
        this.show(message, "warning");
    },

    info(message) {
        this.show(message, "info");
    }

};

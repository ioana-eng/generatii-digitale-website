/*
==========================================
BuildWithIF CMS
Error Handler
==========================================
*/

const BWErrorHandler = {

    defaultMessage: "A aparut o eroare. Te rugam sa incerci din nou.",

    handle(error, context = "") {
        const message = this.extractMessage(error);

        if (context) {
            console.error(`[BWErrorHandler] ${context}:`, error);
        } else {
            console.error("[BWErrorHandler]", error);
        }

        if (typeof BWToast !== "undefined") {
            BWToast.error(message);
        }

        return message;
    },

    extractMessage(error) {
        if (!error) return this.defaultMessage;

        if (typeof error === "string") return error;

        if (error.message) return error.message;

        if (error.error_description) return error.error_description;

        if (error.error && error.error.message) return error.error.message;

        return this.defaultMessage;
    },

    wrap(fn, context = "") {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error;
            }
        };
    },

    setupGlobal() {
        window.addEventListener("error", (event) => {
            this.handle(event.error, "Unhandled error");
        });

        window.addEventListener("unhandledrejection", (event) => {
            this.handle(event.reason, "Unhandled promise rejection");
        });
    }

};

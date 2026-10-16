/*
==========================================
BuildWithIF UI
Modal Component
==========================================
*/

function BWModal(options = {}) {
    const overlay = document.createElement("div");
    overlay.className = "bw-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "bw-modal";
    if (options.size) {
        modal.classList.add(`bw-modal--${options.size}`);
    }

    const header = document.createElement("div");
    header.className = "bw-modal__header";

    const title = document.createElement("h3");
    title.className = "bw-modal__title";
    title.textContent = options.title || "";

    const closeBtn = document.createElement("button");
    closeBtn.className = "bw-modal__close";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => overlay.remove());

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "bw-modal__body";
    if (options.body) {
        if (typeof options.body === "string") {
            body.innerHTML = options.body;
        } else {
            body.appendChild(options.body);
        }
    }

    modal.appendChild(header);
    modal.appendChild(body);

    if (options.footer) {
        const footer = document.createElement("div");
        footer.className = "bw-modal__footer";
        if (typeof options.footer === "string") {
            footer.innerHTML = options.footer;
        } else {
            footer.appendChild(options.footer);
        }
        modal.appendChild(footer);
    }

    overlay.appendChild(modal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    return {
        element: overlay,
        open() {
            document.body.appendChild(overlay);
        },
        close() {
            overlay.remove();
        }
    };
}

BWModal.confirm = function(options = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "bw-modal-overlay";

        const modal = document.createElement("div");
        modal.className = "bw-modal";

        const header = document.createElement("div");
        header.className = "bw-modal__header";

        const title = document.createElement("h3");
        title.className = "bw-modal__title";
        title.textContent = options.title || "Confirmare";

        const closeBtn = document.createElement("button");
        closeBtn.className = "bw-modal__close";
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", () => {
            overlay.remove();
            resolve(false);
        });

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = document.createElement("div");
        body.className = "bw-modal__body";
        body.textContent = options.message || "";

        const footer = document.createElement("div");
        footer.className = "bw-modal__footer";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "bw-btn bw-btn--ghost";
        cancelBtn.textContent = options.cancelText || "Anuleaza";
        cancelBtn.addEventListener("click", () => {
            overlay.remove();
            resolve(false);
        });

        const confirmBtn = document.createElement("button");
        confirmBtn.className = `bw-btn ${options.danger ? "bw-btn--danger" : "bw-btn--primary"}`;
        confirmBtn.textContent = options.confirmText || "Confirma";
        confirmBtn.addEventListener("click", () => {
            overlay.remove();
            resolve(true);
        });

        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });

        document.body.appendChild(overlay);
    });
};

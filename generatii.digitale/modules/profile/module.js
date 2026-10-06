/*
==========================================
BuildWithIF CMS
Profile Module
Current user account management.
==========================================
*/

const PROFILE_ROLE_LABELS = {
    administrator: "Administrator",
    editor: "Editor",
    client: "Client"
};

const PASSWORD_FIELDS = [
    {
        name: "oldPassword",
        type: "password",
        label: "Parola curenta",
        required: true,
        placeholder: "Introdu parola curenta",
        section: "Schimbare parola"
    },
    {
        name: "newPassword",
        type: "password",
        label: "Parola noua",
        required: true,
        placeholder: "Introdu parola noua",
        minLength: 6,
        section: "Schimbare parola"
    },
    {
        name: "confirmPassword",
        type: "password",
        label: "Confirma parola noua",
        required: true,
        placeholder: "Reintrodu parola noua",
        section: "Schimbare parola"
    }
];

async function ProfileModule(container) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Contul meu";

    header.appendChild(title);
    container.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "profile-grid";

    grid.appendChild(renderInfoCard());
    grid.appendChild(renderPasswordCard());
    grid.appendChild(renderLogoutCard());

    container.appendChild(grid);
}

function renderInfoCard() {
    const role = BWPermissions.getRole(currentUser);
    const roleLabel = PROFILE_ROLE_LABELS[role] || role || "Necunoscut";

    const card = BWCard(`
        <h3 class="profile-card__title">Informatii cont</h3>
        <div class="profile-field">
            <span class="profile-field__label">Adresa de email</span>
            <span class="profile-field__value">${escapeHtml(currentUser?.email || "—")}</span>
            <p class="profile-field__hint">Emailul nu poate fi modificat din acest panou.</p>
        </div>
        <div class="profile-field">
            <span class="profile-field__label">Rol</span>
            <span class="profile-field__value">${escapeHtml(roleLabel)}</span>
        </div>
    `, "profile-card");

    return card;
}

function renderPasswordCard() {
    const card = document.createElement("div");
    card.className = "bw-card profile-card";

    const title = document.createElement("h3");
    title.className = "profile-card__title";
    title.textContent = "Schimbare parola";
    card.appendChild(title);

    const form = new BWForm({
        fields: PASSWORD_FIELDS,
        layout: "default",
        submitLabel: "Actualizeaza parola",
        showCancel: false,
        onBeforeSubmit: async (values) => {
            if (values.newPassword !== values.confirmPassword) {
                throw new Error("Parola noua si confirmarea nu coincid.");
            }

            if (values.newPassword.length < 6) {
                throw new Error("Parola noua trebuie sa contina cel putin 6 caractere.");
            }

            // Re-authenticate with the current password before allowing the change.
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: currentUser.email,
                password: values.oldPassword
            });

            if (authError) {
                throw new Error("Parola curenta este incorecta.");
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: values.newPassword
            });

            if (updateError) {
                throw new Error(updateError.message || "Nu am putut actualiza parola.");
            }

            return null;
        },
        onSuccess: (_, formInstance) => {
            BWToast.success("Parola a fost actualizata cu succes.");
            formInstance.wrapper.reset?.();
            // Clear rendered field values manually since reset() may not affect all renderers.
            PASSWORD_FIELDS.forEach(field => {
                const renderer = formInstance.renderedFields.get(field.name);
                if (renderer && renderer.setValue) {
                    renderer.setValue("");
                }
            });
        },
        onError: (err) => {
            BWToast.error(err.message || "A aparut o eroare la schimbarea parolei.");
        }
    });

    card.appendChild(form.render());
    return card;
}

function renderLogoutCard() {
    const card = BWCard(`
        <h3 class="profile-card__title">Sesiune</h3>
        <p class="profile-card__text">Doresti sa iesi din cont?</p>
        <button class="bw-btn bw-btn--danger" id="profile-logout-btn">Logout</button>
    `, "profile-card profile-card--danger");

    const btn = card.querySelector("#profile-logout-btn");
    btn.addEventListener("click", logout);

    return card;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

BWRouter.register("profile", ProfileModule);

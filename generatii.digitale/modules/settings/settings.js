/*
==========================================
BuildWithIF CMS
Settings Module
==========================================
*/

async function SettingsModule(container) {
    container.innerHTML = "";

    if (!BWPermissions.canManageSettings(currentUser)) {
        container.innerHTML = "<p>Nu ai permisiunea de a gestiona setările.</p>";
        return;
    }

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Setări";

    header.appendChild(title);
    container.appendChild(header);

    const card = BWCard(`
        <p><strong>Proiect:</strong> ${window.BW_PROJECT.name}</p>
        <p><strong>Bucket imagini:</strong> ${window.BW_PROJECT.storage.images}</p>
    `);

    container.appendChild(card);
}

BWRouter.register("settings", SettingsModule);

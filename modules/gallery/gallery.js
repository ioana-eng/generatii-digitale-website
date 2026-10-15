/*
==========================================
BuildWithIF CMS
Gallery Module
==========================================
*/

async function GalleryModule(container) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "module-header";

    const title = document.createElement("h2");
    title.textContent = "Galerie";

    const addBtn = document.createElement("button");
    addBtn.className = "bw-btn bw-btn--primary";
    addBtn.textContent = "+ Adaugă imagine";
    addBtn.addEventListener("click", () => openGalleryModal());

    header.appendChild(title);
    header.appendChild(addBtn);
    container.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "gallery-grid";
    grid.id = "gallery-grid";

    container.appendChild(grid);

    await loadGallery(grid);
}

async function loadGallery(container) {
    try {
        const images = await BWDatabase.select(
            window.BW_PROJECT.tables.galleryImages,
            { order: { column: "created_at", ascending: false } }
        );

        container.innerHTML = "";

        if (!images || images.length === 0) {
            container.innerHTML = "<p>Nu există imagini în galerie.</p>";
            return;
        }

        images.forEach(image => {
            const card = document.createElement("div");
            card.className = "gallery-item";

            const path = image.path || "";
            const url = path ? BWStorage.getPublicUrl(path) : "";

            card.innerHTML = `
                <img src="${url}" alt="${image.title || ""}" loading="lazy">
                <div class="gallery-item__info">
                    <strong>${image.title || "Fără titlu"}</strong>
                    <button class="bw-btn bw-btn--danger bw-btn--sm gallery-delete" data-id="${image.id}" data-path="${path}">
                        Șterge
                    </button>
                </div>
            `;

            const deleteBtn = card.querySelector(".gallery-delete");
            deleteBtn.addEventListener("click", () => deleteImage(image.id, path));

            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<p class="error">Eroare la încărcarea imaginilor: ${err.message}</p>`;
    }
}

function openGalleryModal() {
    const body = document.createElement("div");

    const titleInput = BWInput({ id: "gallery-title", placeholder: "Titlu imagine" });
    const fileInput = BWInput({ id: "gallery-file", type: "file", accept: "image/*" });

    body.appendChild(BWField("Titlu", titleInput));
    body.appendChild(BWField("Imagine", fileInput));

    const modal = BWModal({
        title: "Adaugă imagine",
        body: body,
        footer: `
            <button class="bw-btn bw-btn--secondary" id="gallery-cancel">Anulează</button>
            <button class="bw-btn bw-btn--primary" id="gallery-save">Salvează</button>
        `
    });

    modal.open();

    document.getElementById("gallery-cancel").addEventListener("click", () => modal.close());
    document.getElementById("gallery-save").addEventListener("click", async () => {
        const title = document.getElementById("gallery-title").value;
        const file = document.getElementById("gallery-file").files[0];

        if (!file) {
            BWToast.error("Selectează o imagine.");
            return;
        }

        try {
            const path = `gallery/${Date.now()}_${file.name}`;
            await BWStorage.upload(path, file);

            await BWDatabase.insert(
                window.BW_PROJECT.tables.galleryImages,
                { title, path }
            );

            modal.close();
            BWToast.success("Imaginea a fost adăugată.");
            await loadGallery(document.getElementById("gallery-grid"));
        } catch (err) {
            BWToast.error(err.message);
        }
    });
}

async function deleteImage(id, path) {
    if (!confirmAction("Sigur dorești să ștergi această imagine?")) return;

    try {
        await BWStorage.remove(path);
        await BWDatabase.delete(window.BW_PROJECT.tables.galleryImages, id);
        BWToast.success("Imaginea a fost ștearsă.");
        await loadGallery(document.getElementById("gallery-grid"));
    } catch (err) {
        BWToast.error(err.message);
    }
}

BWRouter.register("gallery", GalleryModule);

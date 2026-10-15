/*
==========================================
BuildWithIF CMS
Helpers
==========================================
*/

function confirmAction(message) {
    return confirm(message);
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ro-RO");
}

function slugify(text) {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");
}

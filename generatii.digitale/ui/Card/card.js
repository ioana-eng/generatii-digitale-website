/*
==========================================
BuildWithIF UI
Card Component
==========================================
*/

function BWCard(content = "", extraClasses = "") {
    const card = document.createElement("div");
    card.className = `bw-card ${extraClasses}`.trim();
    card.innerHTML = content;
    return card;
}

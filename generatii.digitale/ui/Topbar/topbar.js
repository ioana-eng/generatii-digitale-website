/*
==========================================
BuildWithIF UI
Topbar Component
==========================================
*/

function BWTopbar(options = {}) {
    const topbar = document.createElement("header");
    topbar.className = "bw-topbar";

    const title = document.createElement("h1");
    title.className = "bw-topbar__title";
    title.textContent = options.title || "";

    const actions = document.createElement("div");
    actions.className = "bw-topbar__actions";

    if (options.actions) {
        if (typeof options.actions === "string") {
            actions.innerHTML = options.actions;
        } else {
            actions.appendChild(options.actions);
        }
    }

    topbar.appendChild(title);
    topbar.appendChild(actions);

    return topbar;
}

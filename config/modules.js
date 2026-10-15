/*
==========================================
BuildWithIF CMS
Modules Configuration
==========================================
*/

window.BW_MODULES = [

    {
        id: "dashboard",
        title: "Dashboard",
        icon: "🏠",
        enabled: true,
        permission: "all",
        entry: "modules/dashboard/dashboard.js"
    },

    {
        id: "gallery",
        title: "Galerie",
        icon: "🖼️",
        enabled: true,
        permission: "client",
        entry: "modules/gallery/gallery.js"
    },

    {
        id: "workshops",
        title: "Ateliere",
        icon: "🎨",
        enabled: true,
        permission: "client",
        entry: "modules/workshops/workshops.js"
    },

    {
        id: "blog",
        title: "Articole",
        icon: "📝",
        enabled: true,
        permission: "editor",
        entry: "modules/blog/blog.js"
    },

    {
        id: "faq",
        title: "FAQ",
        icon: "❓",
        enabled: false,
        permission: "editor",
        entry: "modules/faq/faq.js"
    },

    {
        id: "pages",
        title: "Pagini",
        icon: "📄",
        enabled: false,
        permission: "editor",
        entry: "modules/pages/pages.js"
    },

    {
        id: "users",
        title: "Utilizatori",
        icon: "👥",
        enabled: true,
        permission: "administrator",
        entry: "modules/users/module.js"
    },

    {
        id: "profile",
        title: "Contul meu",
        icon: "👤",
        enabled: true,
        permission: "all",
        entry: "modules/profile/module.js"
    },

    {
        id: "leads",
        title: "Lead-uri",
        icon: "📥",
        enabled: true,
        permission: "all",
        entry: "modules/leads/module.js"
    },

    {
        id: "settings",
        title: "Setări",
        icon: "⚙️",
        enabled: true,
        permission: "administrator",
        entry: "modules/settings/settings.js"
    }

];

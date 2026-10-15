/*
==========================================
BuildWithIF CMS
Modules Configuration
Generatii Digitale: blog-only CMS
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
        id: "blog",
        title: "Articole",
        icon: "📝",
        enabled: true,
        permission: "all",
        entry: "modules/blog/blog.js"
    },

    {
        id: "profile",
        title: "Contul meu",
        icon: "👤",
        enabled: true,
        permission: "all",
        entry: "modules/profile/module.js"
    }

];

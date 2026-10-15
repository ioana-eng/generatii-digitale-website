/*
==========================================
BuildWithIF CMS
Permissions Configuration
==========================================
*/

window.BW_PERMISSIONS = {

    roles: {
        administrator: {
            label: "Administrator",
            level: 100,
            canAccess: ["*"],
            canManageUsers: true,
            canManageSettings: true
        },
        editor: {
            label: "Editor",
            level: 50,
            canAccess: ["dashboard", "gallery", "workshops", "faq", "pages", "blog", "testimonials"],
            canManageUsers: false,
            canManageSettings: false
        },
        client: {
            label: "Client",
            level: 10,
            canAccess: ["dashboard", "gallery", "workshops"],
            canManageUsers: false,
            canManageSettings: false
        }
    }

};

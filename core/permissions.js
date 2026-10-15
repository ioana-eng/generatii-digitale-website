/*
==========================================
BuildWithIF CMS
Permissions Service
==========================================
*/

const BWPermissions = {

    // Determine user role from app_metadata or default to client
    getRole(user) {
        if (!user) return null;
        return user.app_metadata?.role || user.user_metadata?.role || "client";
    },

    getRoleConfig(role) {
        return window.BW_PERMISSIONS.roles[role] || window.BW_PERMISSIONS.roles.client;
    },

    canAccessModule(user, moduleId) {
        const role = this.getRole(user);
        const config = this.getRoleConfig(role);

        if (config.canAccess.includes("*")) return true;

        return config.canAccess.includes(moduleId);
    },

    canManageUsers(user) {
        const role = this.getRole(user);
        return this.getRoleConfig(role).canManageUsers === true;
    },

    canManageSettings(user) {
        const role = this.getRole(user);
        return this.getRoleConfig(role).canManageSettings === true;
    },

    getAllowedModules(user) {
        return window.BW_MODULES
            .filter(module => module.enabled)
            .filter(module => {
                // Modules marked with permission "all" are visible to any authenticated user.
                if (module.permission === "all") return true;

                return this.canAccessModule(user, module.id);
            });
    }

};

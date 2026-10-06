/*
==========================================
BuildWithIF CMS
Dynamic Module Loader
==========================================
*/

const BWModuleLoader = {

    loaded: new Set(),
    loading: new Map(),

    getCssPath(jsPath) {
        return jsPath.replace(/\.js$/, ".css");
    },

    resolvePath(entry) {
        // Config entries are project-root relative.
        // The admin shell runs from admin/, so we step up one level.
        if (entry.startsWith("/") || entry.startsWith("http://") || entry.startsWith("https://")) {
            return entry;
        }
        return "../" + entry;
    },

    load(moduleId) {
        if (BWRouter.routes[moduleId]) {
            return Promise.resolve(BWRouter.routes[moduleId]);
        }

        if (this.loading.has(moduleId)) {
            return this.loading.get(moduleId);
        }

        const module = (window.BW_MODULES || []).find(m => m.id === moduleId && m.enabled);

        if (!module) {
            return Promise.reject(new Error(`Module "${moduleId}" not found or disabled.`));
        }

        const promise = this.loadModule(module).then((renderFn) => {
            this.loading.delete(moduleId);
            return renderFn;
        }).catch((error) => {
            this.loading.delete(moduleId);
            throw error;
        });

        this.loading.set(moduleId, promise);
        return promise;
    },

    async loadModule(module) {
        await this.loadStylesheet(module);
        await this.loadScript(module);

        const renderFn = BWRouter.routes[module.id];

        if (typeof renderFn !== "function") {
            throw new Error(`Module "${module.id}" did not register a render function.`);
        }

        return renderFn;
    },

    loadStylesheet(module) {
        const cssPath = this.resolvePath(this.getCssPath(module.entry));

        if (this.loaded.has(cssPath)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssPath;
            link.onload = () => {
                this.loaded.add(cssPath);
                resolve();
            };
            link.onerror = () => reject(new Error(`Failed to load CSS: ${cssPath}`));
            document.head.appendChild(link);
        });
    },

    loadScript(module) {
        const scriptPath = this.resolvePath(module.entry);

        if (this.loaded.has(scriptPath)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = scriptPath;
            script.async = true;

            script.onload = () => {
                this.loaded.add(scriptPath);
                resolve();
            };

            script.onerror = () => reject(new Error(`Failed to load module: ${scriptPath}`));

            document.body.appendChild(script);
        });
    },

    preload(moduleId) {
        this.load(moduleId).catch(error => {
            console.warn(`[BWModuleLoader] Preload failed for "${moduleId}":`, error);
        });
    }

};

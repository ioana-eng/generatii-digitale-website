/*
==========================================
BuildWithIF CMS
Internationalization Service
==========================================
*/

const BWI18n = {

    lang: window.BW_PROJECT?.language || "ro",

    t(key, fallback = "") {
        const keys = key.split(".");
        let value = window.BW_TRANSLATIONS?.[this.lang];

        for (const k of keys) {
            if (value && typeof value === "object" && k in value) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        if (typeof value === "string") return value;

        if (fallback) return fallback;

        return key;
    },

    setLang(lang) {
        if (!window.BW_TRANSLATIONS?.[lang]) {
            console.warn(`[BWI18n] Language "${lang}" not available.`);
            return;
        }

        this.lang = lang;
        BWEventBus.emit("i18n:changed", lang);
    },

    getAvailableLanguages() {
        return Object.keys(window.BW_TRANSLATIONS || {});
    }

};

/*
==========================================
BuildWithIF CMS
Event Bus
==========================================
*/

const BWEventBus = {

    events: {},

    on(event, listener) {
        if (typeof listener !== "function") {
            console.warn("[BWEventBus] Listener must be a function.");
            return () => {};
        }

        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(listener);

        return () => this.off(event, listener);
    },

    off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    },

    emit(event, payload) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => {
            try {
                listener(payload);
            } catch (error) {
                console.error(`[BWEventBus] Error in listener for "${event}":`, error);
            }
        });
    },

    once(event, listener) {
        const unsubscribe = this.on(event, (payload) => {
            unsubscribe();
            listener(payload);
        });

        return unsubscribe;
    }

};

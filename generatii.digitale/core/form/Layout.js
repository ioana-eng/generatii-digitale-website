/*
==========================================
BuildWithIF CMS Form Engine
Layout Helpers
==========================================
*/

const BWFormLayout = {

    createWrapper(layout = "default") {
        const wrapper = document.createElement("div");
        wrapper.className = `bw-form bw-form--layout-${layout}`;
        return wrapper;
    },

    createFieldWrapper(field, layout) {
        const wrapper = document.createElement("div");
        wrapper.className = `bw-form__field bw-form__field--${field.type}`;

        if (field.className) {
            wrapper.classList.add(field.className);
        }

        if (field.width) {
            wrapper.style.gridColumn = `span ${field.width}`;
        }

        if (field.section) {
            wrapper.dataset.section = field.section;
        }

        return wrapper;
    },

    createSection(title) {
        const section = document.createElement("fieldset");
        section.className = "bw-form__section";

        const legend = document.createElement("legend");
        legend.className = "bw-form__section-title";
        legend.textContent = title;

        section.appendChild(legend);
        return section;
    },

    createActions() {
        const actions = document.createElement("div");
        actions.className = "bw-form__actions";
        return actions;
    },

    applyLayout(wrapper, layout) {
        wrapper.classList.add(`bw-form--layout-${layout}`);
    }

};

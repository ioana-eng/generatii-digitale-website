/*
==========================================
BuildWithIF CMS
Project Configuration
==========================================
*/

window.BW_PROJECT = {

    // Project identity
    name: "Generații Digitale",
    shortName: "Gen.D CMS",
    language: "ro",
    logo: null,

    // Supabase connection
    // TODO(generatii.digitale): fill in the Supabase project URL, e.g. "https://xyzcompany.supabase.co"
    supabaseUrl: "",
    // TODO(generatii.digitale): fill in the Supabase anon (public) key from Project Settings -> API
    supabaseAnonKey: "",

    // Storage
    storage: {
        images: "images"
    },

    // Default tables
    tables: {
        users: "users",
        leads: "leads",
        galleryImages: "gallery_images",
        galleryCategories: "gallery_categories",
        workshops: "workshops",
        workshopCategories: "workshop_categories",
        blogPosts: "blog_posts",
        blogCategories: "blog_categories"
    },

    // Leads module configuration
    leads: {
        table: "leads",
        fields: [
            { name: "name", label: "Nume", type: "text", required: true, showInTable: true },
            { name: "email", label: "Email", type: "email", required: true, showInTable: true },
            { name: "phone", label: "Telefon", type: "tel", showInTable: true },
            { name: "source", label: "Sursa", type: "text", showInTable: true },
            { name: "message", label: "Mesaj", type: "textarea", showInTable: false }
        ],
        statuses: [
            { value: "new", label: "Nou", color: "danger" },
            { value: "contacted", label: "Contactat", color: "warning" },
            { value: "qualified", label: "Calificat", color: "info" },
            { value: "converted", label: "Convertit", color: "success" },
            { value: "archived", label: "Arhivat", color: "neutral" }
        ],
        notifications: {
            inApp: true,
            email: {
                enabled: false,
                endpoint: "",
                template: {
                    subject: "Lead nou pe site",
                    body: "A fost primit un lead nou de la {{name}} ({{email}})."
                }
            }
        }
    },

    // Branding
    branding: {
        primaryColor: "#2563EB",
        sidebarColor: "#0F172A"
    }

};

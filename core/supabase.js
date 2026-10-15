/*
==========================================
BuildWithIF CMS
Supabase Client
==========================================
*/

const supabase = (() => {
    if (!window.supabase || !window.supabase.createClient) {
        throw new Error("[core/supabase.js] Libraria supabase-js nu s-a incarcat. Includeti vendor/supabase.min.js inaintea core/supabase.js.");
    }
    if (!window.BW_PROJECT?.supabaseUrl || !window.BW_PROJECT?.supabaseAnonKey) {
        console.warn("[core/supabase.js] supabaseUrl / supabaseAnonKey lipsesc din config/project.js.");
    }
    return window.supabase.createClient(
        window.BW_PROJECT.supabaseUrl,
        window.BW_PROJECT.supabaseAnonKey
    );
})();

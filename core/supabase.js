/*
==========================================
BuildWithIF CMS
Supabase Client
==========================================
*/

// The supabase-js UMD bundle declares "var supabase" (the namespace).
// Reassign window.supabase to the created client so every other script
// can keep using the bare "supabase" global. Declaring "const supabase"
// here would collide with the bundle's var and throw a SyntaxError.
(function () {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.error("[core/supabase.js] Libraria supabase-js nu s-a incarcat. Includeti vendor/supabase.min.js inaintea core/supabase.js.");
        return;
    }
    if (!window.BW_PROJECT || !window.BW_PROJECT.supabaseUrl || !window.BW_PROJECT.supabaseAnonKey) {
        console.warn("[core/supabase.js] supabaseUrl / supabaseAnonKey lipsesc din config/project.js.");
    }
    window.supabase = window.supabase.createClient(
        window.BW_PROJECT.supabaseUrl,
        window.BW_PROJECT.supabaseAnonKey
    );
})();

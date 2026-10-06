/*
==========================================
BuildWithIF CMS
Supabase Client
==========================================
*/

const supabase = window.supabase.createClient(
    window.BW_PROJECT.supabaseUrl,
    window.BW_PROJECT.supabaseAnonKey
);

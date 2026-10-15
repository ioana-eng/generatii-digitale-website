/*
==========================================
BuildWithIF CMS
Authentication Service
==========================================
*/

async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    const syncedUser = await syncUserToDatabase(data.user);

    if (syncedUser && syncedUser.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Contul tau este dezactivat. Contacteaza administratorul.");
    }

    return data.user;
}

async function syncUserToDatabase(user) {
    if (!user) return;

    const defaultRole = user.user_metadata?.role || user.app_metadata?.role || "client";
    const defaultFullName = user.user_metadata?.full_name || "";

    try {
        const { data: existing } = await supabase
            .from("users")
            .select("role, full_name, is_active")
            .eq("id", user.id)
            .single();

        const payload = {
            id: user.id,
            email: user.email,
            last_login: new Date().toISOString()
        };

        if (existing) {
            payload.role = existing.role;
            payload.full_name = existing.full_name;
            payload.is_active = existing.is_active !== false;
        } else {
            payload.role = defaultRole;
            payload.full_name = defaultFullName;
            payload.is_active = true;
            payload.created_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from("users")
            .upsert(payload, { onConflict: "id" });

        if (error) {
            console.warn("[auth.js] Failed to sync user to database:", error.message);
        }

        return payload;
    } catch (error) {
        console.warn("[auth.js] Failed to sync user to database:", error.message);
        return null;
    }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return user;
}

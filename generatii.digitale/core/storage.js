/*
==========================================
BuildWithIF CMS
Storage Service
==========================================
*/

const BWStorage = {

    bucket: window.BW_PROJECT.storage.images,

    async upload(path, file) {
        const { data, error } = await supabase
            .storage
            .from(this.bucket)
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (error) throw error;

        return data.path;
    },

    async remove(path) {
        const { error } = await supabase
            .storage
            .from(this.bucket)
            .remove([path]);

        if (error) throw error;

        return true;
    },

    getPublicUrl(path) {
        const { data } = supabase
            .storage
            .from(this.bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

};

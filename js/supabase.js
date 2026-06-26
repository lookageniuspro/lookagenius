/**
 * supabase.js
 * Supabase client initialization + data sync layer.
 * Reads from Supabase on init, writes to Supabase on every mutation.
 * Keeps window.db (localStorage) as synchronous cache for instant reads.
 */
window.__supabase = (() => {
    const SUPABASE_URL = 'https://ofnzazrtgpmaekqtcejf.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_UDT1nwvbwivUijDYcGMImQ_WHn4L-Q_';
    const DB_KEY = 'lookagenius_db';
    const APP_DATA_KEYS = [
        'courses', 'scholarships', 'articles', 'services', 'team',
        'courseCategories', 'currencies', 'settings', 'notifications',
        'financials', 'settlementRequests', 'collaborations',
        'invoices', 'attendance'
    ];

    /* Users are synced separately via auth.js -> supabase user table */
    let supabaseClient = null;
    let ready = false;
    let pendingSync = false;

    function init() {
        try {
            const lib = window.supabase || window.supabasejs;
            if (!lib) {
                console.warn('[supabase] Library not loaded. Supabase sync disabled.');
                return;
            }
            supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
            ready = true;
            pullFromSupabase();
            return supabaseClient;
        } catch (e) {
            console.warn('[supabase] Init failed:', e);
        }
    }

    async function pullFromSupabase() {
        if (!supabaseClient) return;
        try {
            const { data: rows, error } = await supabaseClient
                .from('app_data')
                .select('key, value, updated_at');
            if (error) { console.warn('[supabase] pull error:', error); return; }
            if (!rows || rows.length === 0) return;

            const raw = localStorage.getItem(DB_KEY);
            const localData = raw ? JSON.parse(raw) : {};

            let changed = false;
            for (const row of rows) {
                if (APP_DATA_KEYS.includes(row.key)) {
                    const localVal = localData[row.key];
                    if (JSON.stringify(localVal) !== JSON.stringify(row.value)) {
                        localData[row.key] = row.value;
                        changed = true;
                    }
                }
            }

            if (changed) {
                localStorage.setItem(DB_KEY, JSON.stringify(localData));
                console.log('[supabase] Synced', Object.keys(rows).length, 'collections from Supabase');
            }
        } catch (e) {
            console.warn('[supabase] pull error:', e);
        }
    }

    async function pushCollection(key, value) {
        if (!supabaseClient || !ready) return false;
        try {
            const { error } = await supabaseClient
                .from('app_data')
                .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
            if (error) console.warn('[supabase] push error for', key, ':', error);
            return !error;
        } catch (e) {
            console.warn('[supabase] push error:', e);
            return false;
        }
    }

    async function pushAll(data) {
        if (!supabaseClient || !ready) return;
        if (pendingSync) return;
        pendingSync = true;
        try {
            const promises = APP_DATA_KEYS.map(key => {
                if (data[key] !== undefined) {
                    return pushCollection(key, data[key]);
                }
                return Promise.resolve(false);
            });
            await Promise.allSettled(promises);
        } finally {
            pendingSync = false;
        }
    }

    /* ---- User Sync ---- */
    async function pullUsers() {
        if (!supabaseClient) return
        try {
            const { data: rows, error } = await supabaseClient
                .from('app_users')
                .select('*')
            if (error) { console.warn('[supabase] pullUsers error:', error); return }
            if (!rows || rows.length === 0) return
            const data = JSON.parse(localStorage.getItem(DB_KEY)) || {}
            let changed = false
            for (const row of rows) {
                if (!row.email) continue
                const existing = (data.users || []).findIndex(u => u.email === row.email)
                const user = { ...row }
                delete user.id
                user.supabase_id = row.id
                if (existing === -1) {
                    if (!data.users) data.users = []
                    user.id = makeId()
                    data.users.push(user)
                    changed = true
                } else {
                    data.users[existing] = { ...data.users[existing], ...user, supabase_id: row.id }
                    changed = true
                }
            }
            if (changed) {
                localStorage.setItem(DB_KEY, JSON.stringify(data))
            }
        } catch (e) {
            console.warn('[supabase] pullUsers error:', e)
        }
    }

    async function pushUser(user) {
        if (!supabaseClient) return false
        try {
            const { data, error } = await supabaseClient
                .from('app_users')
                .upsert({ email: user.email, name: user.name, password: user.password, type: user.type, active: user.active, details: user.details || null }, { onConflict: 'email' })
                .select()
            if (error) { console.warn('[supabase] pushUser error:', error); return false }
            if (data && data[0]) {
                const local = JSON.parse(localStorage.getItem(DB_KEY))
                const idx = (local.users || []).findIndex(u => u.email === user.email)
                if (idx !== -1) {
                    local.users[idx].supabase_id = data[0].id
                    localStorage.setItem(DB_KEY, JSON.stringify(local))
                }
            }
            return true
        } catch (e) {
            console.warn('[supabase] pushUser error:', e)
            return false
        }
    }

    async function removeUser(email) {
        if (!supabaseClient) return false
        try {
            const { error } = await supabaseClient
                .from('app_users')
                .delete()
                .eq('email', email)
            return !error
        } catch (e) {
            console.warn('[supabase] removeUser error:', e)
            return false
        }
    }

    return {
        init,
        get client() { return supabaseClient; },
        get isReady() { return ready; },
        pullFromSupabase,
        pushCollection,
        pushAll,
        pullUsers,
        pushUser,
        removeUser,
        APP_DATA_KEYS,
        SUPABASE_URL,
        SUPABASE_KEY
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.__supabase.init(), 200);
});

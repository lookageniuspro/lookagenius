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
        'financials', 'settlementRequests', 'collaborations'
    ];

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

    return {
        init,
        get client() { return supabaseClient; },
        get isReady() { return ready; },
        pullFromSupabase,
        pushCollection,
        pushAll,
        APP_DATA_KEYS,
        SUPABASE_URL,
        SUPABASE_KEY
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.__supabase.init(), 200);
});

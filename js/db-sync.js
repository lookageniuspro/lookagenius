/**
 * db-sync.js
 * Cross-tab & cross-device sync engine for localStorage
 * Uses BroadcastChannel (same-browser tabs) + StorageEvent + Supabase
 */

window.dbSync = (() => {
    const CHANNEL = 'lookagenius_db_sync';
    let channel = null;
    let listeners = [];
    let lastVersion = 0;

    function getDbVersion() {
        const data = window.db.getData();
        return data._version || 0;
    }

    function bumpVersion() {
        const data = window.db.getData();
        data._version = (data._version || 0) + 1;
        lastVersion = data._version;
        origSaveData(data);
        broadcast({ type: 'db_updated', version: data._version });
        return data._version;
    }

    // Wrap db.saveData to auto-bump version
    const origSaveData = window.db.saveData;
    window.db.saveData = function(data) {
        data._version = (data._version || 0) + 1;
        lastVersion = data._version;
        origSaveData(data);
        broadcast({ type: 'db_updated', version: data._version });
    };

    // Broadcast a message to all tabs
    function broadcast(msg) {
        try {
            if (channel) channel.postMessage(msg);
        } catch(e) { /* channel may not be available */ }
    }

    // Listen for data changes from other tabs
    function onDataChange(callback) {
        listeners.push(callback);
    }

    // Initialize BroadcastChannel
    function initBroadcastChannel() {
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                channel = new BroadcastChannel(CHANNEL);
                channel.onmessage = (e) => {
                    const msg = e.data;
                    if (msg && msg.type === 'db_updated') {
                        lastVersion = msg.version || 0;
                        listeners.forEach(fn => fn(msg));
                    }
                };
            }
        } catch(e) { /* BroadcastChannel not supported */ }
    }

    // Initialize StorageEvent listener (fires in OTHER tabs when localStorage changes)
    function initStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'lookagenius_db' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    const ver = data._version || 0;
                    if (ver > lastVersion) {
                        lastVersion = ver;
                        listeners.forEach(fn => fn({ type: 'db_updated', version: ver, source: 'storage' }));
                    }
                } catch(e) {}
            }
        });
    }

    // Supabase sync engine
    let supabaseClient = null;

    function initSupabase() {
        try {
            const lib = window.supabase || window.supabasejs;
            if (lib && !supabaseClient) {
                supabaseClient = lib.createClient(
                    'https://ofnzazrtgpmaekqtcejf.supabase.co',
                    'sb_publishable_UDT1nwvbwivUijDYcGMImQ_WHn4L-Q_'
                );
            }
        } catch(e) {}
    }

    async function syncUsersToSupabase() {
        if (!supabaseClient) return false;
        try {
            const users = window.db.getUsers();
            const { data: existing, error: fetchError } = await supabaseClient
                .from('users')
                .select('id, email');
            if (fetchError) throw fetchError;

            const existingEmails = new Set((existing || []).map(u => u.email));
            const pending = users.filter(u => !existingEmails.has(u.email));

            for (const user of pending) {
                const { password, ...safeUser } = user;
                await supabaseClient.from('users').insert({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type,
                    avatar: user.avatar || '',
                    phone: user.phone || '',
                    registeredAt: user.registeredAt || new Date().toISOString()
                });
            }
            return pending.length > 0;
        } catch(e) {
            console.warn('Supabase sync error:', e);
            return false;
        }
    }

    async function fetchUsersFromSupabase() {
        if (!supabaseClient) return false;
        try {
            const { data: remoteUsers, error } = await supabaseClient
                .from('users')
                .select('*');
            if (error) throw error;
            if (!remoteUsers || remoteUsers.length === 0) return false;

            const data = window.db.getData();
            let changed = false;

            for (const ru of remoteUsers) {
                const existing = data.users.find(u => u.email === ru.email);
                if (!existing) {
                    data.users.push({
                        id: ru.id || Date.now(),
                        name: ru.name || '',
                        firstName: '',
                        fatherName: '',
                        grandfatherName: '',
                        familyName: '',
                        email: ru.email,
                        password: 'supabase_user',
                        type: ru.type || 'student',
                        avatar: ru.avatar || '',
                        phone: ru.phone || '',
                        country: '',
                        address: '',
                        whatsapp: '',
                        countryCode: '+20',
                        parentPhone: '',
                        educationStage: '',
                        active: true,
                        registeredAt: ru.registeredAt || new Date().toISOString()
                    });
                    changed = true;
                }
            }

            if (changed) {
                window.db.saveData(data);
                return true;
            }
            return false;
        } catch(e) {
            console.warn('Supabase fetch error:', e);
            return false;
        }
    }

    let initialized = false;

    // Initialize
    function init() {
        if (initialized) return;
        initialized = true;

        lastVersion = getDbVersion();
        initBroadcastChannel();
        initStorageListener();
        initSupabase();

        // Auto-fetch from Supabase every 30 seconds if available
        if (supabaseClient) {
            setInterval(() => fetchUsersFromSupabase(), 30000);
        }

        console.log('[db-sync] Initialized (version: ' + lastVersion + ')');
    }

    // Manual sync trigger
    async function syncNow() {
        bumpVersion();
        if (supabaseClient) {
            await syncUsersToSupabase();
            await fetchUsersFromSupabase();
        }
    }

    return {
        init,
        syncNow,
        broadcast,
        onDataChange,
        bumpVersion,
        getVersion: () => lastVersion,
        getSupabaseClient: () => supabaseClient,
        fetchUsersFromSupabase,
        syncUsersToSupabase
    };
})();

// Auto-init on DOMContentLoaded (after db.js)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.dbSync) window.dbSync.init();
    }, 100);
});

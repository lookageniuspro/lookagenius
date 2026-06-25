/**
 * auth.js (MPA Version)
 * Handles Authentication and Session tracking
 * Supports both Supabase Auth and localStorage fallback.
 */

window.auth = {
    currentUser: null,

    init: async () => {
        // Try Supabase session first
        const supabase = window.__supabase ? window.__supabase.client : null;
        if (supabase) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const meta = session.user.user_metadata || {};
                    const supabaseUser = {
                        id: session.user.id,
                        email: session.user.email,
                        name: meta.full_name || meta.name || session.user.email,
                        type: meta.role || 'student',
                        avatar: meta.avatar || ''
                    };
                    localStorage.setItem('lookagenius_session', JSON.stringify(supabaseUser));
                    window.auth.currentUser = supabaseUser;
                    window.auth.updateUI();
                    window.auth.protectRoutes();
                    return;
                }
            } catch (e) { /* fall through to localStorage */ }
        }
        // Fallback: localStorage session
        const session = localStorage.getItem('lookagenius_session');
        if (session) {
            window.auth.currentUser = JSON.parse(session);
        }
        window.auth.updateUI();
        window.auth.protectRoutes();
    },

    login: async (email, password) => {
        // Try Supabase Auth first
        const supabase = window.__supabase ? window.__supabase.client : null;
        if (supabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (!error && data.user) {
                    const meta = data.user.user_metadata || {};
                    const safeUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: meta.full_name || email,
                        type: meta.role || 'student',
                        avatar: data.user.identities?.[0]?.identity_data?.avatar_url || ''
                    };
                    window.auth.currentUser = safeUser;
                    localStorage.setItem('lookagenius_session', JSON.stringify(safeUser));
                    window.auth.updateUI();
                    return { success: true, user: safeUser };
                }
            } catch (e) { /* fall through to localStorage */ }
        }
        // Fallback: localStorage-based auth
        const users = window.db.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const { password: _, ...safeUser } = user;
            window.auth.currentUser = safeUser;
            localStorage.setItem('lookagenius_session', JSON.stringify(safeUser));
            window.auth.updateUI();
            return { success: true, user: safeUser };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    register: async (userData) => {
        // Try Supabase Auth first
        const supabase = window.__supabase ? window.__supabase.client : null;
        if (supabase) {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email: userData.email,
                    password: userData.password,
                    options: {
                        data: {
                            full_name: userData.name,
                            role: userData.type || 'student'
                        }
                    }
                });
                if (!error && data.user) {
                    // Also save to localStorage DB for sync
                    window.db.addUser(userData);
                    const safeUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: userData.name,
                        type: userData.type || 'student',
                        avatar: userData.avatar || ''
                    };
                    window.auth.currentUser = safeUser;
                    localStorage.setItem('lookagenius_session', JSON.stringify(safeUser));
                    window.auth.updateUI();
                    return { success: true, user: safeUser };
                }
                if (error) return { success: false, message: error.message };
            } catch (e) { /* fall through to localStorage */ }
        }
        // Fallback: localStorage-based registration
        const users = window.db.getUsers();
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        const newUser = window.db.addUser(userData);
        return window.auth.login(newUser.email, newUser.password);
    },

    logout: async () => {
        const supabase = window.__supabase ? window.__supabase.client : null;
        if (supabase) {
            try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
        }
        window.auth.currentUser = null;
        localStorage.removeItem('lookagenius_session');
        window.location.href = 'index.html';
    },

    updateUI: () => {
        const authContainer = document.getElementById('authButtonsContainer');
        const userMenu = document.getElementById('userMenuContainer');

        if (window.auth.currentUser) {
            if(authContainer) authContainer.classList.add('hidden');
            if(userMenu) {
                userMenu.classList.remove('hidden');
                const dashBtn = document.getElementById('dashboardBtn');
                if (dashBtn) {
                    dashBtn.href = `dashboard-${window.auth.currentUser.type}.html`;
                    dashBtn.innerHTML = `${window.auth.getRole(window.auth.currentUser.type)} Dashboard <i class="fa-solid fa-border-all"></i>`;
                }
            }
        } else {
            if(authContainer) authContainer.classList.remove('hidden');
            if(userMenu) userMenu.classList.add('hidden');
        }
    },

    protectRoutes: () => {
        const path = window.location.pathname;
        const protectedPages = ['dashboard', 'profile'];
        
        const isProtected = protectedPages.some(pp => path.includes(pp));
        
        if (isProtected && !window.auth.currentUser) {
            window.location.href = 'login.html';
        }
        
        const isAuthPage = ['login.html', 'register.html'].some(ap => path.includes(ap));
        if (isAuthPage && window.auth.currentUser) {
            window.location.href = `dashboard-${window.auth.currentUser.type}.html`;
        }
    },

    getRole: (role) => {
        const roles = {
            'student': 'Student',
            'parent': 'Parent',
            'teacher': 'Teacher',
            'engineer': 'Engineer',
            'accountant': 'Accountant',
            'admin': 'Admin'
        };
        return roles[role] || 'User';
    },

    getRoleAr: (role) => {
        const roles = {
            'student': 'طالب',
            'parent': 'ولي أمر',
            'teacher': 'مدرس',
            'engineer': 'مهندس',
            'accountant': 'محاسب',
            'admin': 'مدير'
        };
        return roles[role] || 'مستخدم';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.auth.init();
    
    // Using delegation as elements might be injected by JS
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) {
            window.auth.logout();
        }
    });
});

// Expose async auth functions for HTML inline usage
window.__authLogin = window.auth.login;
window.__authRegister = window.auth.register;

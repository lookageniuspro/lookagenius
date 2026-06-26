/**
 * auth.js (MPA Version)
 * Handles Authentication and Session tracking
 */

window.auth = {
    currentUser: null,

    init: () => {
        const session = localStorage.getItem('lookagenius_session');
        if (session) {
            window.auth.currentUser = JSON.parse(session);
        }
        window.auth.updateUI();
        window.auth.protectRoutes();
        /* Pull users from Supabase on init */
        if (window.__supabase && window.__supabase.isReady) {
            window.__supabase.pullUsers()
        }
    },

    login: (email, password) => {
        const users = window.db.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            if (user.active === false) {
                return { success: false, message: 'This account has been deactivated. Contact admin.' };
            }
            const { password: _, ...safeUser } = user;
            window.auth.currentUser = safeUser;
            localStorage.setItem('lookagenius_session', JSON.stringify(safeUser));
            window.auth.updateUI();
            return { success: true, user: safeUser };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    register: (userData) => {
        const users = window.db.getUsers();
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        const newUser = window.db.addUser(userData);
        /* Push to Supabase if available */
        if (window.__supabase && window.__supabase.isReady) {
            window.__supabase.pushUser(newUser)
        }
        return window.auth.login(newUser.email, newUser.password);
    },

    logout: () => {
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
            /* Update all smart-cta links to point to dashboard */
            document.querySelectorAll('.smart-cta').forEach(el => {
                el.href = `dashboard-${window.auth.currentUser.type}.html`;
            });
        } else {
            if(authContainer) authContainer.classList.remove('hidden');
            if(userMenu) userMenu.classList.add('hidden');
            /* Ensure smart-cta links go to login */
            document.querySelectorAll('.smart-cta').forEach(el => {
                el.href = 'login.html';
            });
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
            'teacher': 'معلم',
            'engineer': 'مهندس',
            'accountant': 'محاسب',
            'admin': 'مدير'
        };
        return roles[role] || 'مستخدم';
    },

    dashboardUrl: () => {
        if (!window.auth.currentUser) return 'login.html';
        return `dashboard-${window.auth.currentUser.type}.html`;
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

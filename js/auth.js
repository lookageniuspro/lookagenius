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
    },

    login: (email, password) => {
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

    register: (userData) => {
        const users = window.db.getUsers();
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        const newUser = window.db.addUser(userData);
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

/**
 * auth.js — Supabase Auth + localStorage fallback
 * Primary auth: Supabase Auth (signInWithPassword, signUp, JWT session)
 * Fallback: localStorage for backward compatibility during migration
 */

window.auth = {
    currentUser: null,
    supabaseUser: null,

    init: async () => {
        /* Try Supabase session first */
        const sb = window.supabaseApp
        if (sb && sb.isReady()) {
            const session = await sb.getSession()
            if (session?.user) {
                window.auth.supabaseUser = session.user
                const profile = await sb.getProfile(session.user.id)
                if (profile) {
                    window.auth.currentUser = {
                        id: profile.id,
                        name: profile.full_name,
                        email: profile.email,
                        type: profile.role,
                        avatar_url: profile.avatar_url,
                        bio: profile.bio,
                        phone: profile.phone,
                        country: profile.country,
                        is_active: profile.is_active,
                        supabase: true
                    }
                }
            }
        }

        /* Fallback: localStorage session */
        if (!window.auth.currentUser) {
            const session = localStorage.getItem('lookagenius_session')
            if (session) {
                window.auth.currentUser = JSON.parse(session)
            }
        }

        window.auth.updateUI()
        window.auth.protectRoutes()
    },

    login: async (email, password) => {
        /* Try Supabase first */
        const sb = window.supabaseApp
        if (sb && sb.isReady()) {
            const { data, error } = await sb.signIn(email, password)
            if (!error && data?.user) {
                const profile = await sb.getProfile(data.user.id)
                if (profile) {
                    const user = {
                        id: profile.id,
                        name: profile.full_name,
                        email: profile.email,
                        type: profile.role,
                        avatar_url: profile.avatar_url,
                        bio: profile.bio,
                        phone: profile.phone,
                        country: profile.country,
                        is_active: profile.is_active,
                        supabase: true
                    }
                    if (user.is_active === false) {
                        await sb.signOut()
                        return { success: false, message: 'This account has been deactivated.' }
                    }
                    window.auth.currentUser = user
                    window.auth.supabaseUser = data.user
                    localStorage.setItem('lookagenius_session', JSON.stringify(user))
                    window.auth.updateUI()
                    return { success: true, user }
                }
            }
        }

        /* Fallback: localStorage */
        const users = window.db ? window.db.getUsers() : []
        const user = users.find(u => u.email === email && u.password === password)
        if (user) {
            if (user.active === false) {
                return { success: false, message: 'This account has been deactivated. Contact admin.' }
            }
            const { password: _, ...safeUser } = user
            window.auth.currentUser = safeUser
            localStorage.setItem('lookagenius_session', JSON.stringify(safeUser))
            window.auth.updateUI()
            return { success: true, user: safeUser }
        }
        return { success: false, message: 'Invalid email or password' }
    },

    register: async (userData) => {
        const sb = window.supabaseApp
        /* Try Supabase first */
        if (sb && sb.isReady()) {
            const { data, error } = await sb.signUp(userData.email, userData.password, userData.name, userData.type)
            if (!error && data?.user) {
                const profile = await sb.getProfile(data.user.id)
                if (profile) {
                    const user = {
                        id: profile.id,
                        name: profile.full_name,
                        email: profile.email,
                        type: profile.role,
                        supabase: true
                    }
                    window.auth.currentUser = user
                    window.auth.supabaseUser = data.user
                    localStorage.setItem('lookagenius_session', JSON.stringify(user))
                    window.auth.updateUI()
                    return { success: true, user }
                }
            }
            if (error && !error.message?.includes('User already registered')) {
                console.warn('[auth] Supabase signup error:', error)
            }
        }

        /* Fallback: localStorage */
        const users = window.db ? window.db.getUsers() : []
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' }
        }
        const newUser = window.db ? window.db.addUser(userData) : null
        if (newUser) {
            return window.auth.login(newUser.email, newUser.password)
        }
        return { success: false, message: 'Registration unavailable' }
    },

    logout: async () => {
        const sb = window.supabaseApp
        if (sb && sb.isReady()) {
            await sb.signOut()
        }
        window.auth.currentUser = null
        window.auth.supabaseUser = null
        localStorage.removeItem('lookagenius_session')
        window.location.href = 'index.html'
    },

    updateUI: () => {
        const authContainer = document.getElementById('authButtonsContainer')
        const userMenu = document.getElementById('userMenuContainer')

        if (window.auth.currentUser) {
            if (authContainer) authContainer.classList.add('hidden')
            if (userMenu) {
                userMenu.classList.remove('hidden')
                const dashBtn = document.getElementById('dashboardBtn')
                if (dashBtn) {
                    dashBtn.href = `dashboard-${window.auth.currentUser.type}.html`
                    dashBtn.innerHTML = `${window.auth.getRoleAr(window.auth.currentUser.type)} <i class="fa-solid fa-border-all"></i>`
                }
            }
            document.querySelectorAll('.smart-cta').forEach(el => {
                el.href = `dashboard-${window.auth.currentUser.type}.html`
            })
        } else {
            if (authContainer) authContainer.classList.remove('hidden')
            if (userMenu) userMenu.classList.add('hidden')
            document.querySelectorAll('.smart-cta').forEach(el => {
                el.href = 'login.html'
            })
        }
    },

    protectRoutes: () => {
        const path = window.location.pathname
        const protectedPages = ['dashboard', 'profile']
        const isProtected = protectedPages.some(pp => path.includes(pp))
        if (isProtected && !window.auth.currentUser) {
            window.location.href = 'login.html'
        }
        const isAuthPage = ['login.html', 'register.html'].some(ap => path.includes(ap))
        if (isAuthPage && window.auth.currentUser) {
            window.location.href = `dashboard-${window.auth.currentUser.type}.html`
        }
    },

    getRole: (role) => {
        const roles = { student: 'Student', parent: 'Parent', teacher: 'Teacher', engineer: 'Engineer', accountant: 'Accountant', admin: 'Admin' }
        return roles[role] || 'User'
    },

    getRoleAr: (role) => {
        const roles = { student: 'طالب', parent: 'ولي أمر', teacher: 'معلم', engineer: 'مهندس', accountant: 'محاسب', admin: 'مدير' }
        return roles[role] || 'مستخدم'
    },

    dashboardUrl: () => {
        if (!window.auth.currentUser) return 'login.html'
        return `dashboard-${window.auth.currentUser.type}.html`
    }
}

/* Synchronous session restore — runs before DOMContentLoaded */
;(function() {
    try {
        const session = localStorage.getItem('lookagenius_session')
        if (session) {
            window.auth.currentUser = JSON.parse(session)
        }
    } catch(e) {}
})()

document.addEventListener('DOMContentLoaded', () => {
    window.auth.init()
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) {
            window.auth.logout()
        }
    })
})

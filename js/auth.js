/**
 * auth.js — Supabase Auth + localStorage fallback
 * Primary auth: Supabase Auth (signInWithPassword, signUp, JWT session)
 * Fallback: localStorage for backward compatibility during migration
 * Security: single-session prevention, login audit log, OPTIONAL 2FA (OTP)
 */

window.auth = {
    currentUser: (() => { try { const s = localStorage.getItem('lookagenius_session'); return s ? JSON.parse(s) : null } catch(e) { return null } })(),
    supabaseUser: null,

    /* ===== Session security internals ===== */
    _sessionKey: 'lookagenius_session',
    _sessionsKey: 'lookagenius_sessions',
    _otpKey: 'lookagenius_otp',

    _genToken: () => 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12),

    _getSessionsMap: () => { try { return JSON.parse(localStorage.getItem('lookagenius_sessions')) || {} } catch(e) { return {} } },
    _saveSessionsMap(map) { try { localStorage.setItem('lookagenius_sessions', JSON.stringify(map)) } catch(e) {} },

    /* Issue session with single-device token + login audit log */
    _issueSession(user) {
        const token = this._genToken()
        const map = this._getSessionsMap()
        map[user.id] = token /* new login revokes any older device session */
        this._saveSessionsMap(map)
        localStorage.setItem(this._sessionKey, JSON.stringify({ ...user, sessionToken: token }))
        this._logLogin(user)
    },

    _isSessionValid() {
        const session = this.currentUser
        if (!session) return true
        if (session.supabase) return true
        if (!session.sessionToken) return true /* legacy session — silently upgrade */
        const map = this._getSessionsMap()
        return map[session.id] === session.sessionToken
    },

    _refreshLegacySession() {
        const session = this.currentUser
        if (session && !session.supabase && !session.sessionToken) {
            this._issueSession(session)
            return true
        }
        return false
    },

    _logLogin(user) {
        let ip = 'unknown'
        if (window.db && window.db.addLoginLog) {
            window.db.addLoginLog({ userId: user.id, email: user.email, ip, ua: (navigator.userAgent || '').slice(0, 140), event: 'login', status: 'success' })
            try {
                fetch('https://api.ipify.org?format=json')
                    .then(r => r.json())
                    .then(d => { if (d && d.ip && window.db && window.db.addLoginLog) {
                        window.db.addLoginLog({ userId: user.id, email: user.email, ip: d.ip, ua: (navigator.userAgent || '').slice(0, 140), event: 'login', status: 'success', verifiedIp: true })
                    } })
                    .catch(() => {})
            } catch(e) {}
        }
    },

    _generateOTP(userId) {
        const code = String(Math.floor(100000 + Math.random() * 900000))
        try {
            localStorage.setItem(this._otpKey, JSON.stringify({ code, userId, expires: Date.now() + 5 * 60 * 1000 }))
        } catch(e) {}
        return code
    },

    getOTPSetting: (userId) => {
        try {
            const users = window.db ? window.db.getUsers() : []
            const u = users.find(x => x.id === parseInt(userId))
            return !!u && !!u.twoFA
        } catch(e) { return false }
    },

    setOTPSetting: (userId, enabled) => {
        if (window.db) {
            window.db.updateUser(userId, { twoFA: !!enabled })
            return true
        }
        return false
    },

    async verifyOTP(userId, code) {
        try {
            const stored = JSON.parse(localStorage.getItem(this._otpKey) || 'null')
            if (!stored || stored.userId !== userId) return { success: false, message: 'لا يوجد طلب تحقق — سجّل الدخول مجدداً' }
            if (Date.now() > stored.expires) {
                localStorage.removeItem(this._otpKey)
                return { success: false, message: 'انتهت صلاحية الكود — سجّل الدخول مرة أخرى' }
            }
            if (String(stored.code) !== String(code).replace(/\s/g, '')) return { success: false, message: 'الكود غير صحيح' }
            localStorage.removeItem(this._otpKey)
            const users = window.db ? window.db.getUsers() : []
            const user = users.find(u => u.id === parseInt(userId))
            if (!user) return { success: false, message: 'المستخدم غير موجود' }
            const { password: _, ...safeUser } = user
            this.currentUser = safeUser
            this._issueSession(safeUser)
            this.updateUI()
            return { success: true, user: safeUser }
        } catch(e) {
            return { success: false, message: 'حدث خطأ أثناء التحقق' }
        }
    },

    async init() {
        /* Session validity: revoke sessions replaced by another device */
        if (this.currentUser && !this._isSessionValid() && !this.currentUser.supabase) {
            localStorage.removeItem('lookagenius_session')
            window.auth.currentUser = null
        }
        this._refreshLegacySession()

        const sb = window.supabaseApp

        /* Handle OAuth callback hash (#access_token=... or code=...) */
        if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
            try {
                const hashString = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
                const hashParams = new URLSearchParams(hashString);
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken) {
                    let userObj = null;

                    // 1. Try setting session in Supabase client if ready
                    if (sb && sb.isReady && sb.isReady() && sb.client) {
                        try {
                            const { data } = await sb.client.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken || ''
                            });
                            if (data?.user) {
                                window.auth.supabaseUser = data.user;
                                let profile = await sb.getProfile(data.user.id);
                                if (!profile) {
                                    const meta = data.user.user_metadata || {};
                                    profile = {
                                        id: data.user.id,
                                        full_name: meta.full_name || meta.name || data.user.email.split('@')[0],
                                        email: data.user.email,
                                        role: 'student',
                                        avatar_url: meta.avatar_url || meta.picture || '',
                                        is_active: true
                                    };
                                    try { await sb.client.from('profiles').upsert(profile); } catch(e) {}
                                }
                                userObj = {
                                    id: profile.id,
                                    name: profile.full_name,
                                    email: profile.email,
                                    type: profile.role || 'student',
                                    avatar_url: profile.avatar_url,
                                    supabase: true
                                };
                            }
                        } catch(e) {
                            console.warn('[auth] Supabase setSession failed, decoding JWT:', e);
                        }
                    }

                    // 2. Fallback: decode JWT payload directly if Supabase call failed
                    if (!userObj) {
                        try {
                            const payloadBase64 = accessToken.split('.')[1];
                            if (payloadBase64) {
                                const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
                                const meta = decoded.user_metadata || {};
                                userObj = {
                                    id: decoded.sub || 'user_' + Date.now(),
                                    name: meta.full_name || meta.name || decoded.email.split('@')[0],
                                    email: decoded.email,
                                    type: 'student',
                                    avatar_url: meta.avatar_url || meta.picture || '',
                                    supabase: true
                                };
                            }
                        } catch(e) {
                            console.warn('[auth] JWT decode fallback error:', e);
                        }
                    }

                    if (userObj) {
                        window.auth.currentUser = userObj;
                        window.auth._issueSession(userObj);
                        window.auth.updateUI();

                        // Clean hash from address bar
                        try {
                            window.history.replaceState(null, '', window.location.pathname);
                        } catch(e) {}

                        // If currently on login or register, forward to appropriate role dashboard
                        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                        if (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === '') {
                            window.location.href = `dashboard-${userObj.type || 'student'}.html`;
                            return;
                        }
                    }
                }
            } catch (oauthErr) {
                console.warn('[auth] Error parsing OAuth hash:', oauthErr);
            }
        }

        /* Try Supabase session first */
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
        if (window.auth._readyResolve) window.auth._readyResolve()
    },

    async login(email, password) {
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
                    window.auth._issueSession(user)
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

            if (window.auth.getOTPSetting(user.id)) {
                const code = window.auth._generateOTP(user.id)
                try {
                    if (window.db && window.db.addNotification) {
                        window.db.addNotification({ user_id: user.id, title: 'كود التحقق بخطوتين (2FA)', message: 'كود التحقق: ' + code + ' — صالح لمدة 5 دقائق.' + ' (بيئة محاكاة: لا يوجد خادم بريد بعد)', type: 'system' })
                    }
                } catch(e) {}
                return { success: false, need2FA: true, userId: user.id, message: 'أدخل كود التحقق المرسل (ظهر في إشعاراتك)' }
            }

            window.auth.currentUser = safeUser
            window.auth._issueSession(safeUser)
            window.auth.updateUI()
            return { success: true, user: safeUser }
        }
        return { success: false, message: 'Invalid email or password' }
    },

    async register(userData) {
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
                    window.auth._issueSession(user)
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

    async logout() {
        const sb = window.supabaseApp
        if (sb && sb.isReady()) {
            await sb.signOut()
        }
        const session = window.auth.currentUser
        const map = window.auth._getSessionsMap()
        if (session && map[session.id]) delete map[session.id]
        window.auth._saveSessionsMap(map)
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
                el.textContent = el.dataset.i18nLogged || 'لوحة التحكم'
            })
        } else {
            if (authContainer) authContainer.classList.remove('hidden')
            if (userMenu) userMenu.classList.add('hidden')
            document.querySelectorAll('.smart-cta').forEach(el => {
                el.href = 'login.html'
                el.textContent = el.dataset.i18n || 'ابدأ الآن'
            })
        }
    },

    protectRoutes: () => {
        const path = window.location.pathname
        const protectedPages = ['dashboard', 'profile']
        const isProtected = protectedPages.some(pp => path.includes(pp))

        /* Re-validate local session (revoked by another device) */
        if (window.auth.currentUser && !window.auth.currentUser.supabase) {
            if (!window.auth._isSessionValid()) {
                localStorage.removeItem('lookagenius_session')
                window.auth.currentUser = null
                if (isProtected) {
                    window.location.href = 'login.html?expired=1'
                    return
                }
            }
        }

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

window.auth._readyResolve = null
window.auth.ready = new Promise(resolve => { window.auth._readyResolve = resolve })

document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.init()
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#logoutBtn')) {
            window.auth.logout()
        }
    })
    window.dispatchEvent(new CustomEvent('auth:ready'))
})
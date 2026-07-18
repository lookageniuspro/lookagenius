/**
 * nextgen-core.js — Next-Gen Platform Core Engine
 * World-class feature foundation: state management, DB extensions, UI system, i18n bridge
 */

window.NextGen = window.NextGen || {}

// ===== Enhanced UUID Generator =====
NextGen.uuid = () => 'ng_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)

// ===== Global Event Bus =====
NextGen.EventBus = {
    _listeners: {},
    on(event, fn) { (this._listeners[event] = this._listeners[event] || []).push(fn) },
    off(event, fn) { this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn) },
    emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)) }
}

// ===== Enhanced DB Layer =====
NextGen.DB = {
    getData() { return window.db ? window.db.getData() : {} },
    saveData(data) { if (window.db) window.db.saveData(data) },

    // --- Assignments ---
    getAssignments() { return this.getData().assignments || [] },
    addAssignment(a) {
        const d = this.getData()
        a.id = NextGen.uuid()
        a.createdAt = new Date().toISOString()
        a.status = a.status || 'open'
        if (!d.assignments) d.assignments = []
        d.assignments.push(a)
        this.saveData(d)
        return a
    },
    updateAssignment(id, u) {
        const d = this.getData()
        const idx = (d.assignments || []).findIndex(x => x.id === id)
        if (idx > -1) { d.assignments[idx] = { ...d.assignments[idx], ...u }; this.saveData(d); return true }
        return false
    },
    deleteAssignment(id) {
        const d = this.getData()
        d.assignments = (d.assignments || []).filter(x => x.id !== id)
        this.saveData(d)
    },

    // --- Submissions ---
    getSubmissions() { return this.getData().submissions || [] },
    addSubmission(s) {
        const d = this.getData()
        s.id = NextGen.uuid()
        s.submittedAt = new Date().toISOString()
        s.status = s.status || 'submitted'
        s.grade = s.grade || null
        if (!d.submissions) d.submissions = []
        d.submissions.push(s)
        this.saveData(d)
        return s
    },
    gradeSubmission(id, grade, feedback) {
        const d = this.getData()
        const s = (d.submissions || []).find(x => x.id === id)
        if (s) { s.grade = grade; s.feedback = feedback; s.status = 'graded'; s.gradedAt = new Date().toISOString(); this.saveData(d); return true }
        return false
    },

    // --- Chat Messages ---
    getMessages() { return this.getData().messages || [] },
    sendMessage(msg) {
        const d = this.getData()
        msg.id = NextGen.uuid()
        msg.createdAt = new Date().toISOString()
        msg.read = false
        if (!d.messages) d.messages = []
        d.messages.push(msg)
        this.saveData(d)
        NextGen.EventBus.emit('new_message', msg)
        return msg
    },
    getConversation(userA, userB) {
        return (this.getData().messages || []).filter(m =>
            (m.from === userA && m.to === userB) || (m.from === userB && m.to === userA)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    },
    getUnreadCount(userId) {
        return (this.getData().messages || []).filter(m => m.to === userId && !m.read).length
    },
    markConversationRead(userId, fromUserId) {
        const d = this.getData()
        ;(d.messages || []).forEach(m => { if (m.to === userId && m.from === fromUserId) m.read = true })
        this.saveData(d)
    },

    // --- Forum Discussions ---
    getThreads() { return this.getData().threads || [] },
    addThread(t) {
        const d = this.getData()
        t.id = NextGen.uuid()
        t.createdAt = new Date().toISOString()
        t.replies = t.replies || 0
        t.lastActivity = t.createdAt
        if (!d.threads) d.threads = []
        d.threads.push(t)
        this.saveData(d)
        return t
    },
    getThreadsByCourse(courseId) {
        return (this.getData().threads || []).filter(t => t.courseId === courseId).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    },
    addReply(threadId, reply) {
        const d = this.getData()
        const t = (d.threads || []).find(x => x.id === threadId)
        if (t) {
            reply.id = NextGen.uuid()
            reply.createdAt = new Date().toISOString()
            if (!t.repliesList) t.repliesList = []
            t.repliesList.push(reply)
            t.replies = t.repliesList.length
            t.lastActivity = reply.createdAt
            this.saveData(d)
            return reply
        }
        return null
    },

    // --- Gamification ---
    getGamification() { return this.getData().gamification || {} },
    getPlayer(userId) {
        const g = this.getData().gamification || {}
        if (!g[userId]) {
            g[userId] = { xp: 0, level: 1, badges: [], points: 0, streak: 0, lastActive: null }
            const d = this.getData()
            d.gamification = g
            this.saveData(d)
        }
        return g[userId]
    },
    addXP(userId, amount) {
        const player = this.getPlayer(userId)
        player.xp += amount
        player.lastActive = new Date().toISOString()
        const newLevel = Math.floor(player.xp / 100) + 1
        if (newLevel > player.level) { player.level = newLevel; NextGen.EventBus.emit('level_up', { userId, level: newLevel }) }
        this._saveGamification()
        return player
    },
    addPoints(userId, amount) {
        const player = this.getPlayer(userId)
        player.points += amount
        this._saveGamification()
        return player
    },
    addBadge(userId, badge) {
        const player = this.getPlayer(userId)
        if (!player.badges.find(b => b.id === badge.id)) { player.badges.push({ ...badge, earnedAt: new Date().toISOString() }); NextGen.EventBus.emit('badge_earned', { userId, badge }) }
        this._saveGamification()
        return player
    },
    updateStreak(userId) {
        const player = this.getPlayer(userId)
        const today = new Date().toDateString()
        if (player.lastActiveDate !== today) {
            const last = player.lastActiveDate ? new Date(player.lastActiveDate) : null
            const now = new Date()
            const diff = last ? Math.round((now - last) / (1000 * 60 * 60 * 24)) : 999
            player.streak = diff === 1 ? player.streak + 1 : diff === 0 ? player.streak : 0
            if (player.streak === 0) player.streak = 1
            player.lastActiveDate = today
            this._saveGamification()
        }
    },
    getLeaderboard(limit = 20) {
        const g = this.getData().gamification || {}
        return Object.entries(g).map(([userId, data]) => ({ userId, ...data })).sort((a, b) => b.xp - a.xp).slice(0, limit)
    },
    _saveGamification() {
        const d = this.getData()
        if (!d.gamification) d.gamification = {}
        this.saveData(d)
    },

    // --- Live Classes ---
    getLiveClasses() { return this.getData().liveClasses || [] },
    addLiveClass(lc) {
        const d = this.getData()
        lc.id = NextGen.uuid()
        lc.createdAt = new Date().toISOString()
        lc.status = lc.status || 'scheduled'
        if (!d.liveClasses) d.liveClasses = []
        d.liveClasses.push(lc)
        this.saveData(d)
        return lc
    },
    updateLiveClass(id, u) {
        const d = this.getData()
        const idx = (d.liveClasses || []).findIndex(x => x.id === id)
        if (idx > -1) { d.liveClasses[idx] = { ...d.liveClasses[idx], ...u }; this.saveData(d); return true }
        return false
    },

    // --- Calendar Events ---
    getEvents() { return this.getData().events || [] },
    addEvent(e) {
        const d = this.getData()
        e.id = NextGen.uuid()
        e.createdAt = new Date().toISOString()
        if (!d.events) d.events = []
        d.events.push(e)
        this.saveData(d)
        return e
    },
    getEventsByDateRange(start, end) {
        return (this.getData().events || []).filter(e => e.date >= start && e.date <= end).sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    getEventsForUser(userId) {
        return (this.getData().events || []).filter(e => e.userId === userId || e.participants?.includes(userId)).sort((a, b) => new Date(a.date) - new Date(b.date))
    },

    // --- Learning Paths ---
    getLearningPaths() { return this.getData().learningPaths || [] },
    addLearningPath(lp) {
        const d = this.getData()
        lp.id = NextGen.uuid()
        lp.createdAt = new Date().toISOString()
        if (!d.learningPaths) d.learningPaths = []
        d.learningPaths.push(lp)
        this.saveData(d)
        return lp
    },
    updateLearningPath(id, u) {
        const d = this.getData()
        const idx = (d.learningPaths || []).findIndex(x => x.id === id)
        if (idx > -1) { d.learningPaths[idx] = { ...d.learningPaths[idx], ...u }; this.saveData(d); return true }
        return false
    },

    // --- Payments (Paymob) ---
    getPayments() { return this.getData().payments || [] },
    addPayment(p) {
        const d = this.getData()
        p.id = NextGen.uuid()
        p.createdAt = new Date().toISOString()
        p.status = p.status || 'pending'
        if (!d.payments) d.payments = []
        d.payments.push(p)
        this.saveData(d)
        return p
    },
    updatePayment(id, u) {
        const d = this.getData()
        const idx = (d.payments || []).findIndex(x => x.id === id)
        if (idx > -1) { d.payments[idx] = { ...d.payments[idx], ...u }; this.saveData(d); return true }
        return false
    },
    getUserPayments(userId) {
        return (this.getData().payments || []).filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    // --- Subscriptions ---
    getSubscriptions() { return this.getData().subscriptions || [] },
    addSubscription(s) {
        const d = this.getData()
        s.id = NextGen.uuid()
        s.createdAt = new Date().toISOString()
        s.status = s.status || 'active'
        if (!d.subscriptions) d.subscriptions = []
        d.subscriptions.push(s)
        this.saveData(d)
        return s
    },
    updateSubscription(id, u) {
        const d = this.getData()
        const idx = (d.subscriptions || []).findIndex(x => x.id === id)
        if (idx > -1) { d.subscriptions[idx] = { ...d.subscriptions[idx], ...u }; this.saveData(d); return true }
        return false
    },

    // --- Wallets ---
    getWallets() { return this.getData().wallets || {} },
    getWallet(userId) {
        const w = this.getData().wallets || {}
        if (!w[userId]) { w[userId] = { balance: 0, currency: 'EGP', points: 0 }; const d = this.getData(); d.wallets = w; this.saveData(d) }
        return w[userId]
    },
    addToWallet(userId, amount) {
        const w = this.getWallet(userId)
        w.balance += amount
        const d = this.getData()
        d.wallets = { ...(d.wallets || {}), [userId]: w }
        this.saveData(d)
    },
    deductFromWallet(userId, amount) {
        const w = this.getWallet(userId)
        if (w.balance < amount) return false
        w.balance -= amount
        const d = this.getData()
        d.wallets = { ...(d.wallets || {}), [userId]: w }
        this.saveData(d)
        return true
    },

    // --- Coupons ---
    getCoupons() { return this.getData().coupons || [] },
    addCoupon(c) {
        const d = this.getData()
        c.id = NextGen.uuid()
        if (!d.coupons) d.coupons = []
        d.coupons.push(c)
        this.saveData(d)
        return c
    },
    validateCoupon(code) {
        const c = (this.getData().coupons || []).find(x => x.code === code && x.active !== false)
        if (!c) return null
        if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null
        if (c.maxUses && c.usedCount >= c.maxUses) return null
        return c
    },
    useCoupon(code) {
        const c = (this.getData().coupons || []).find(x => x.code === code)
        if (c) { c.usedCount = (c.usedCount || 0) + 1; this.saveData(this.getData()); return c }
        return null
    },

    // --- Reviews ---
    getReviews() { return this.getData().reviews || [] },
    addReview(r) {
        const d = this.getData()
        r.id = NextGen.uuid()
        r.createdAt = new Date().toISOString()
        if (!d.reviews) d.reviews = []
        d.reviews.push(r)
        this.saveData(d)
        return r
    },
    getCourseReviews(courseId) {
        return (this.getData().reviews || []).filter(r => r.courseId === courseId)
    },
    getAverageRating(courseId) {
        const reviews = this.getCourseReviews(courseId)
        if (!reviews.length) return 0
        return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    }
}

// ===== UI Component Library =====
NextGen.UI = {
    showToast(message, type = 'info', duration = 4000) {
        const colors = { info: '#00D4FF', success: '#22c55e', warning: '#eab308', error: '#ef4444' }
        const container = document.getElementById('toastContainer')
        if (!container) {
            const c = document.createElement('div')
            c.id = 'toastContainer'
            c.style.cssText = 'position:fixed;top:80px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:350px'
            document.body.appendChild(c)
        }
        const toast = document.createElement('div')
        toast.style.cssText = `background:rgba(5,5,20,0.95);border:1px solid ${colors[type]};border-radius:12px;padding:14px 20px;color:#fff;font-size:14px;backdrop-filter:blur(20px);box-shadow:0 0 20px ${colors[type]}33;transform:translateX(120%);transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);display:flex;align-items:center;gap:12px;direction:rtl`
        const iconMap = { info: 'fa-circle-info', success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark' }
        toast.innerHTML = `<i class="fa-solid ${iconMap[type]}" style="color:${colors[type]};font-size:18px"></i><span>${message}</span>`
        document.getElementById('toastContainer').appendChild(toast)
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)')
        setTimeout(() => { toast.style.transform = 'translateX(120%)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500) }, duration)
    },

    showModal({ title, content, buttons = [], size = 'medium', onClose }) {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeIn 0.3s'
        const sizes = { small: '400px', medium: '600px', large: '800px', xlarge: '1000px' }
        const modal = document.createElement('div')
        modal.style.cssText = `background:rgba(10,10,30,0.98);border:1px solid rgba(0,212,255,0.3);border-radius:20px;padding:30px;max-width:${sizes[size] || sizes.medium};width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 0 60px rgba(0,212,255,0.2);animation:slideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275);direction:rtl`
        const header = document.createElement('div')
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,0.1)'
        header.innerHTML = `<h3 style="color:#fff;margin:0;font-size:1.3rem">${title}</h3><button class="modal-close-btn" style="background:rgba(255,255,255,0.1);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:18px;transition:all 0.3s"><i class="fa-solid fa-xmark"></i></button>`
        modal.appendChild(header)
        const body = document.createElement('div')
        body.innerHTML = content
        modal.appendChild(body)
        if (buttons.length) {
            const footer = document.createElement('div')
            footer.style.cssText = 'display:flex;gap:12px;justify-content:flex-end;margin-top:25px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1)'
            buttons.forEach(b => {
                const btn = document.createElement('button')
                btn.innerHTML = b.label
                btn.style.cssText = `padding:10px 25px;border-radius:30px;border:none;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.3s;${b.primary ? 'background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff' : 'background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2)'}`
                btn.onclick = () => { if (b.action) b.action(); if (b.close !== false) overlay.remove() }
                footer.appendChild(btn)
            })
            modal.appendChild(footer)
        }
        overlay.appendChild(modal)
        overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); if (onClose) onClose() } }
        header.querySelector('.modal-close-btn').onclick = () => { overlay.remove(); if (onClose) onClose() }
        document.body.appendChild(overlay)
        return { overlay, modal, close: () => overlay.remove() }
    },

    showConfirm(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise(resolve => {
            NextGen.UI.showModal({
                title: 'Confirm Action',
                content: `<p style="color:#ccc;font-size:1.1rem;text-align:center;margin:20px 0">${message}</p>`,
                buttons: [
                    { label: cancelText, action: () => resolve(false), primary: false },
                    { label: confirmText, action: () => resolve(true), primary: true }
                ],
                size: 'small'
            })
        })
    },

    showLoading(show = true) {
        let loader = document.getElementById('ngLoader')
        if (show) {
            if (!loader) {
                loader = document.createElement('div')
                loader.id = 'ngLoader'
                loader.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(5,5,15,0.8);backdrop-filter:blur(4px)'
                loader.innerHTML = '<div style="width:60px;height:60px;border:3px solid rgba(0,212,255,0.2);border-top-color:#00D4FF;border-radius:50%;animation:spin 0.8s linear infinite"></div>'
                document.body.appendChild(loader)
            }
            loader.style.display = 'flex'
        } else {
            if (loader) loader.style.display = 'none'
        }
    },

    renderStatCard(icon, label, value, color = '#00D4FF') {
        return `<div class="ag-glass" style="padding:20px;border-radius:16px;text-align:center;border-left:3px solid ${color}">
            <i class="fa-solid ${icon}" style="font-size:2rem;color:${color};margin-bottom:10px"></i>
            <div style="font-size:1.8rem;font-weight:700;color:#fff;margin:5px 0">${value}</div>
            <div style="font-size:0.9rem;color:#888">${label}</div>
        </div>`
    },

    renderTable(headers, rows, emptyMsg = 'No data found') {
        if (!rows.length) return `<p style="text-align:center;color:#666;padding:40px">${emptyMsg}</p>`
        let html = `<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.02);border-radius:12px;overflow:hidden">
            <thead><tr style="background:rgba(0,212,255,0.1)">${headers.map(h => `<th style="padding:12px 15px;text-align:right;color:#00D4FF;font-size:0.9rem;border-bottom:1px solid rgba(255,255,255,0.1)">${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((r, i) => `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);transition:all 0.3s" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''">${r.map(c => `<td style="padding:12px 15px;color:#ccc;font-size:0.9rem">${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`
        return html
    },

    renderPagination(current, total, onChange) {
        if (total <= 1) return ''
        let html = '<div style="display:flex;gap:8px;justify-content:center;margin-top:20px">'
        for (let i = 1; i <= total; i++) {
            html += `<button class="page-btn" data-page="${i}" style="padding:8px 14px;border-radius:8px;border:1px solid ${i === current ? '#00D4FF' : 'rgba(255,255,255,0.2)'};background:${i === current ? 'rgba(0,212,255,0.2)' : 'transparent'};color:${i === current ? '#00D4FF' : '#fff'};cursor:pointer;font-size:14px">${i}</button>`
        }
        html += '</div>'
        return html
    },

    renderBadge(text, color = '#00D4FF') {
        return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${color}22;color:${color};border:1px solid ${color}44;font-size:12px;font-weight:600">${text}</span>`
    },

    renderProgressBar(percent, color = '#00D4FF') {
        return `<div style="width:100%;height:8px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden">
            <div style="width:${Math.min(100, percent)}%;height:100%;background:linear-gradient(90deg,${color},${color}88);border-radius:10px;transition:width 0.8s cubic-bezier(0.175,0.885,0.32,1.275)"></div>
        </div>`
    },

    renderStars(rating) {
        let html = '<div style="display:flex;gap:2px">'
        for (let i = 1; i <= 5; i++) {
            html += `<i class="fa-solid fa-star" style="color:${i <= rating ? '#FBBF24' : 'rgba(255,255,255,0.2)'};font-size:14px"></i>`
        }
        return html + '</div>'
    },

    formatDate(dateStr) {
        if (!dateStr) return '-'
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },

    formatCurrency(amount, currency = 'EGP') {
        return `${amount.toFixed(2)} ${currency}`
    },

    getStatusColor(status) {
        const colors = { active: '#22c55e', inactive: '#ef4444', pending: '#eab308', approved: '#22c55e', rejected: '#ef4444', paid: '#22c55e', unpaid: '#ef4444', submitted: '#00D4FF', graded: '#A855F7', scheduled: '#00D4FF', live: '#22c55e', completed: '#22c55e', cancelled: '#ef4444', open: '#00D4FF', closed: '#888' }
        return colors[status] || '#888'
    },

    escHtml(str) {
        if (!str) return ''
        const div = document.createElement('div')
        div.textContent = str
        return div.innerHTML
    }
}

// ===== i18n Extension =====
NextGen.I18n = {
    get(key, lang) {
        const currentLang = lang || localStorage.getItem('lookagenius_lang') || 'en'
        const strings = {
            en: {
                wallet: 'Wallet', balance: 'Balance', pay: 'Pay Now', chat: 'Chat', forum: 'Forum',
                assignments: 'Assignments', submit: 'Submit', grade: 'Grade', feedback: 'Feedback',
                badges: 'Badges', leaderboard: 'Leaderboard', xp: 'XP', level: 'Level', streak: 'Streak',
                live: 'Live Classes', calendar: 'Calendar', paths: 'Learning Paths',
                subscriptions: 'Subscriptions', monthly: 'Monthly', yearly: 'Yearly',
                reviews: 'Reviews', rating: 'Rating', coupons: 'Coupons', discount: 'Discount',
                analytics: 'Analytics', reports: 'Reports', export: 'Export',
                noData: 'No data available', loading: 'Loading...', search: 'Search',
                filter: 'Filter', sort: 'Sort', viewAll: 'View All', markRead: 'Mark as Read',
                reply: 'Reply', send: 'Send', attach: 'Attach File', upload: 'Upload',
                download: 'Download', share: 'Share', copy: 'Copy',
                revenue: 'Revenue', expenses: 'Expenses', profit: 'Profit',
                course: 'Course', student: 'Student', teacher: 'Teacher',
                admin: 'Admin', parent: 'Parent', engineer: 'Engineer', accountant: 'Accountant',
                superadmin: 'Super Admin',
                settings: 'Settings', profile: 'Profile', logout: 'Logout', dashboard: 'Dashboard',
                home: 'Home', notifications: 'Notifications', messages: 'Messages',
                enrolled: 'Enrolled', completed: 'Completed', inProgress: 'In Progress',
                price: 'Price', free: 'Free', certificate: 'Certificate',
                newMessage: 'New messages', newNotification: 'New notifications',
                paymentSuccess: 'Payment successful!', paymentFailed: 'Payment failed',
                welcome: 'Welcome', continueLearning: 'Continue Learning',
                recommended: 'Recommended for You', popular: 'Most Popular',
                new: 'New', upcoming: 'Upcoming', past: 'Past',
                details: 'Details', description: 'Description', requirements: 'Requirements',
                instructor: 'Instructor', duration: 'Duration', lessons: 'Lessons',
                students: 'Students', language: 'Language', levelLabel: 'Level',
                all: 'All', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
                create: 'Create', update: 'Update', confirm: 'Confirm',
                yes: 'Yes', no: 'No', close: 'Close',
                totalRevenue: 'Total Revenue', pendingPayments: 'Pending Payments',
                activeSubscriptions: 'Active Subscriptions', totalStudents: 'Total Students',
                totalTeachers: 'Total Teachers', totalCourses: 'Total Courses',
                completionRate: 'Completion Rate', averageRating: 'Average Rating',
                mostPopularCourse: 'Most Popular Course', topPerformer: 'Top Performer',
                systemHealth: 'System Health', platformStats: 'Platform Statistics',
                quickActions: 'Quick Actions', recentActivity: 'Recent Activity',
                AIassistant: 'AI Assistant', smartRecommend: 'Smart Recommendations',
                courseCatalog: 'Course Catalog', myLearning: 'My Learning',
                achievements: 'Achievements', progress: 'Progress',
                attendance: 'Attendance', invoices: 'Invoices', financials: 'Financials',
                withdraw: 'Withdraw', deposit: 'Deposit', transfer: 'Transfer',
                paymob: 'Paymob Payment', card: 'Credit Card', wallet: 'Mobile Wallet',
                recurring: 'Recurring Payment', installments: 'Installments',
                liveNow: 'Live Now', upcomingClass: 'Upcoming Class', joinClass: 'Join Class',
                recordClass: 'Recorded', scheduleClass: 'Schedule Class',
                mySchedule: 'My Schedule', addEvent: 'Add Event',
                thread: 'Discussion', postReply: 'Post Reply', startThread: 'New Thread',
                assignGrade: 'Assign Grade', submitWork: 'Submit Work',
                myBadges: 'My Badges', rank: 'Rank', points: 'Points',
                currentStreak: 'Current Streak', daysActive: 'Days Active',
                shareCert: 'Share Certificate', verifyCert: 'Verify Certificate',
                downloadCert: 'Download PDF'
            },
            ar: {
                wallet: 'المحفظة', balance: 'الرصيد', pay: 'ادفع الآن', chat: 'المحادثة', forum: 'المناقشات',
                assignments: 'الواجبات', submit: 'تسليم', grade: 'تصحيح', feedback: 'التعليقات',
                badges: 'الشارات', leaderboard: 'المتصدرون', xp: 'نقاط الخبرة', level: 'المستوى', streak: 'التتابع',
                live: 'الدروس المباشرة', calendar: 'التقويم', paths: 'مسارات التعلم',
                subscriptions: 'الاشتراكات', monthly: 'شهري', yearly: 'سنوي',
                reviews: 'التقييمات', rating: 'التقييم', coupons: 'كوبونات الخصم', discount: 'الخصم',
                analytics: 'التحليلات', reports: 'التقارير', export: 'تصدير',
                noData: 'لا توجد بيانات', loading: 'جاري التحميل...', search: 'بحث',
                filter: 'تصفية', sort: 'ترتيب', viewAll: 'عرض الكل', markRead: 'تحديد كمقروء',
                reply: 'رد', send: 'إرسال', attach: 'إرفاق ملف', upload: 'رفع',
                download: 'تحميل', share: 'مشاركة', copy: 'نسخ',
                revenue: 'الإيرادات', expenses: 'المصروفات', profit: 'الأرباح',
                course: 'الكورس', student: 'طالب', teacher: 'معلم',
                admin: 'مدير', parent: 'ولي أمر', engineer: 'مهندس', accountant: 'محاسب',
                superadmin: 'المدير العام',
                settings: 'الإعدادات', profile: 'الملف الشخصي', logout: 'تسجيل الخروج', dashboard: 'لوحة التحكم',
                home: 'الرئيسية', notifications: 'الإشعارات', messages: 'الرسائل',
                enrolled: 'مسجل', completed: 'مكتمل', inProgress: 'قيد التقدم',
                price: 'السعر', free: 'مجاني', certificate: 'الشهادة',
                newMessage: 'رسائل جديدة', newNotification: 'إشعارات جديدة',
                paymentSuccess: 'تم الدفع بنجاح!', paymentFailed: 'فشلت عملية الدفع',
                welcome: 'مرحباً', continueLearning: 'متابعة التعلم',
                recommended: 'موصى به لك', popular: 'الأكثر شيوعاً',
                new: 'جديد', upcoming: 'قادم', past: 'سابق',
                details: 'التفاصيل', description: 'الوصف', requirements: 'المتطلبات',
                instructor: 'المدرس', duration: 'المدة', lessons: 'الدروس',
                students: 'الطلاب', language: 'اللغة', levelLabel: 'المستوى',
                all: 'الكل', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
                create: 'إنشاء', update: 'تحديث', confirm: 'تأكيد',
                yes: 'نعم', no: 'لا', close: 'إغلاق',
                totalRevenue: 'إجمالي الإيرادات', pendingPayments: 'المدفوعات المعلقة',
                activeSubscriptions: 'الاشتراكات النشطة', totalStudents: 'إجمالي الطلاب',
                totalTeachers: 'إجمالي المعلمين', totalCourses: 'إجمالي الكورسات',
                completionRate: 'معدل الإكمال', averageRating: 'متوسط التقييم',
                mostPopularCourse: 'الكورس الأكثر شيوعاً', topPerformer: 'الأفضل أداءً',
                systemHealth: 'صحة النظام', platformStats: 'إحصائيات المنصة',
                quickActions: 'إجراءات سريعة', recentActivity: 'آخر النشاطات',
                AIassistant: 'المساعد الذكي', smartRecommend: 'توصيات ذكية',
                courseCatalog: 'كتالوج الكورسات', myLearning: 'رحلتي التعليمية',
                achievements: 'الإنجازات', progress: 'التقدم',
                attendance: 'الحضور', invoices: 'الفواتير', financials: 'المالية',
                withdraw: 'سحب', deposit: 'إيداع', transfer: 'تحويل',
                paymob: 'الدفع عبر Paymob', card: 'بطاقة ائتمان', wallet: 'محفظة إلكترونية',
                recurring: 'دفع متكرر', installments: 'تقسيط',
                liveNow: 'مباشر الآن', upcomingClass: 'حصّة قادمة', joinClass: 'انضم للحصة',
                recordClass: 'مسجلة', scheduleClass: 'جدولة حصة',
                mySchedule: 'جدولي', addEvent: 'إضافة حدث',
                thread: 'نقاش', postReply: 'نشر رد', startThread: 'نقاش جديد',
                assignGrade: 'تعيين درجة', submitWork: 'تسليم الواجب',
                myBadges: 'شاراتي', rank: 'الترتيب', points: 'النقاط',
                currentStreak: 'التتابع الحالي', daysActive: 'أيام النشاط',
                shareCert: 'مشاركة الشهادة', verifyCert: 'التحقق من الشهادة',
                downloadCert: 'تحميل PDF'
            }
        }
        return strings[currentLang]?.[key] || strings.en[key] || key
    },

    t(key) {
        const lang = localStorage.getItem('lookagenius_lang') || 'en'
        return this.get(key, lang)
    }
}

// ===== Initialize Core =====
NextGen.init = () => {
    console.log('[NextGen] Platform Core Engine initialized')

    // Add toast container styles if not exist
    if (!document.getElementById('ngStyle')) {
        const style = document.createElement('style')
        style.id = 'ngStyle'
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
            @keyframes spin { to { transform: rotate(360deg) } }
            @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
            .ng-pulse { animation: pulse 2s ease-in-out infinite }
            ::-webkit-scrollbar { width: 6px }
            ::-webkit-scrollbar-track { background: transparent }
            ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 10px }
            ::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.5) }
            .page-btn:hover { transform: translateY(-2px); box-shadow: 0 0 15px rgba(0,212,255,0.3) }
        `
        document.head.appendChild(style)
    }

    NextGen.EventBus.emit('core_ready', { timestamp: new Date().toISOString() })
}

document.addEventListener('DOMContentLoaded', NextGen.init)

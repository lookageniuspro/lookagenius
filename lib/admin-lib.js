/**
 * admin-lib.js — Complete Admin Library for LookaGenius
 * Wraps supabaseApp with admin-specific operations
 * Usage: window.adminLib.*
 */
window.adminLib = (() => {
    const sb = () => window.supabaseApp

    /* ============= USER MANAGEMENT ============= */
    async function getAllUsers() {
        const s = sb()
        if (s && s.isReady()) return s.getAllProfiles()
        return window.db.getUsers()
    }

    async function updateUserRole(userId, newRole) {
        const s = sb()
        if (s && s.isReady()) return s.updateProfile(userId, { role: newRole })
        return window.db.updateUser(userId, { type: newRole })
    }

    async function toggleUserActive(userId, isActive) {
        const s = sb()
        if (s && s.isReady()) return s.updateProfile(userId, { is_active: isActive })
        return window.db.updateUser(userId, { active: isActive })
    }

    async function sendNotificationToUser(userId, title, message, type) {
        const s = sb()
        const notif = { user_id: userId, title, message, type: type || 'admin', is_read: false }
        if (s && s.isReady()) return s.createNotification(notif)
        return window.db.addNotification(notif)
    }

    /* ============= COURSE MANAGEMENT ============= */
    async function getAllCourses() {
        const s = sb()
        if (s && s.isReady()) return s.getAllCourses()
        return window.db.getCourses()
    }

    async function approveCourse(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.updateCourse(courseId, { is_approved: true, is_published: true })
        return window.db.updateCourse(courseId, { is_published: true })
    }

    async function deleteCourseBypass(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteCourse(courseId)
        return window.db.deleteCourse(courseId)
    }

    /* ============= SCHOLARSHIP MANAGEMENT ============= */
    async function getScholarships() {
        return window.db.getScholarships()
    }

    async function addScholarship(data) {
        return window.db.addScholarship(data)
    }

    async function updateScholarship(id, data) {
        return window.db.updateScholarship(id, data)
    }

    async function deleteScholarship(id) {
        return window.db.deleteScholarship(id)
    }

    /* ============= COLLABORATION MANAGEMENT ============= */
    async function getCollaborationRequests() {
        return window.db.getCollaborations()
    }

    async function approveCollaboration(requestId) {
        return window.db.updateCollaboration(requestId, { status: 'approved' })
    }

    async function rejectCollaboration(requestId, reason) {
        return window.db.updateCollaboration(requestId, { status: 'rejected', admin_notes: reason || '' })
    }

    /* ============= REVENUE MANAGEMENT ============= */
    async function getAllRevenues() {
        const s = sb()
        if (s && s.isReady()) return s.getAllRevenues()
        return window.db.getFinancials()
    }

    async function getWithdrawalRequests() {
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('withdrawal_requests').select('*, teacher:teacher_id(full_name, email)').order('created_at', { ascending: false })
            return data || []
        }
        return window.db.getSettlementRequests()
    }

    async function approveWithdrawal(requestId) {
        const s = sb()
        if (s && s.isReady()) {
            await s.getClient().from('withdrawal_requests').update({ status: 'approved', processed_at: new Date().toISOString() }).eq('id', requestId)
        }
        return window.db.approveSettlementRequest(requestId)
    }

    async function rejectWithdrawal(requestId, notes) {
        const s = sb()
        if (s && s.isReady()) {
            await s.getClient().from('withdrawal_requests').update({ status: 'rejected', admin_notes: notes || '' }).eq('id', requestId)
        }
        return window.db.rejectSettlementRequest(requestId)
    }

    /* ============= SITE SETTINGS ============= */
    async function getSiteSettings() {
        const s = sb()
        if (s && s.isReady()) return s.getSettings()
        return window.db.getSettings()
    }

    async function updateSiteSetting(key, value) {
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('settings').update({ [key]: value }).eq('id', 1).select().single()
            return data
        }
        const updates = {}
        updates[key] = value
        return window.db.updateSettings(updates)
    }

    /* ============= STATISTICS ============= */
    async function getDashboardStats() {
        const s = sb()
        let stats = { users: 0, students: 0, teachers: 0, courses: 0, revenue: 0, certs: 0, pendingCourses: 0 }
        if (s && s.isReady()) {
            const profiles = await s.getAllProfiles()
            stats.users = profiles.length
            stats.students = profiles.filter(p => p.role === 'student').length
            stats.teachers = profiles.filter(p => p.role === 'teacher').length
            const courses = await s.getAllCourses()
            stats.courses = courses.length
            stats.pendingCourses = courses.filter(c => !c.is_approved).length
            const revs = await s.getAllRevenues()
            stats.revenue = revs.reduce((sum, r) => sum + (r.amount || 0), 0)
            const certs = await s.getAllCertificates()
            stats.certs = certs.length
        } else {
            const users = window.db.getUsers().filter(u => u.active !== false)
            stats.users = users.length
            stats.students = users.filter(u => u.type === 'student').length
            stats.teachers = users.filter(u => u.type === 'teacher').length
            stats.courses = window.db.getCourses().length
            stats.pendingCourses = 0
        }
        return stats
    }

    return {
        getAllUsers, updateUserRole, toggleUserActive, sendNotificationToUser,
        getAllCourses, approveCourse, deleteCourseBypass,
        getScholarships, addScholarship, updateScholarship, deleteScholarship,
        getCollaborationRequests, approveCollaboration, rejectCollaboration,
        getAllRevenues, getWithdrawalRequests, approveWithdrawal, rejectWithdrawal,
        getSiteSettings, updateSiteSetting,
        getDashboardStats
    }
})()

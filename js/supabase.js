/**
 * supabase.js — Core Supabase client + typed data access + Realtime
 * Used by: auth.js, all dashboards, admin
 * CDN: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
 */

window.supabaseApp = (() => {
    const SUPABASE_URL = 'https://hdpmybarejjbnryjxvkk.supabase.co'
    const SUPABASE_ANON_KEY = 'sb_publishable_R9YFp41ja36mdYjo1--xmg_dni85u8_'

    let client = null
    let ready = false
    let subscriptions = []

    function init() {
        try {
            const lib = window.supabase || window.supabasejs
            if (!lib) { console.warn('[supabase] Library not loaded'); return null }
            client = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
                realtime: { params: { eventsPerSecond: 10 } }
            })
            ready = true
            console.log('[supabase] Client initialized')
            return client
        } catch (e) { console.warn('[supabase] Init error:', e); return null }
    }

    function getClient() { return client }

    function isReady() { return ready && client !== null }

    /* ============ AUTH HELPERS ============ */
    async function signUp(email, password, fullName, role) {
        if (!client) return { error: 'Supabase not initialized' }
        const { data, error } = await client.auth.signUp({
            email, password,
            options: { data: { full_name: fullName, role: role || 'student' } }
        })
        return { data, error }
    }

    async function signIn(email, password) {
        if (!client) return { error: 'Supabase not initialized' }
        const { data, error } = await client.auth.signInWithPassword({ email, password })
        return { data, error }
    }

    async function signOut() {
        if (!client) return
        await client.auth.signOut()
    }

    async function getSession() {
        if (!client) return null
        const { data } = await client.auth.getSession()
        return data?.session || null
    }

    async function getCurrentUser() {
        if (!client) return null
        const { data } = await client.auth.getUser()
        return data?.user || null
    }

    async function onAuthStateChange(callback) {
        if (!client) return () => {}
        const { data } = client.auth.onAuthStateChange((event, session) => {
            callback(event, session)
        })
        return data?.subscription?.unsubscribe || (() => {})
    }

    /* ============ PROFILE HELPERS ============ */
    async function getProfile(userId) {
        if (!client) return null
        const { data } = await client.from('profiles').select('*').eq('id', userId).single()
        return data
    }

    async function updateProfile(userId, updates) {
        if (!client) return null
        const { data } = await client.from('profiles').update(updates).eq('id', userId).select().single()
        return data
    }

    async function getAllProfiles() {
        if (!client) return []
        const { data } = await client.from('profiles').select('*').order('created_at', { ascending: false })
        return data || []
    }

    /* ============ COURSE HELPERS ============ */
    async function getPublishedCourses() {
        if (!client) return []
        const { data } = await client.from('courses').select('*, instructor:instructor_id(full_name, avatar_url)').eq('is_published', true).eq('is_approved', true).order('created_at', { ascending: false })
        return data || []
    }

    async function getCourseById(courseId) {
        if (!client) return null
        const { data } = await client.from('courses').select('*, instructor:instructor_id(full_name, avatar_url)').eq('id', courseId).single()
        return data
    }

    async function getTeacherCourses(teacherId) {
        if (!client) return []
        const { data } = await client.from('courses').select('*').eq('instructor_id', teacherId).order('created_at', { ascending: false })
        return data || []
    }

    async function getAllCourses() {
        if (!client) return []
        const { data } = await client.from('courses').select('*, instructor:instructor_id(full_name, avatar_url)').order('created_at', { ascending: false })
        return data || []
    }

    async function createCourse(course) {
        if (!client) return null
        const { data } = await client.from('courses').insert(course).select().single()
        return data
    }

    async function updateCourse(courseId, updates) {
        if (!client) return null
        const { data } = await client.from('courses').update(updates).eq('id', courseId).select().single()
        return data
    }

    async function deleteCourse(courseId) {
        if (!client) return false
        const { error } = await client.from('courses').delete().eq('id', courseId)
        return !error
    }

    /* ============ MODULES HELPERS ============ */
    async function getCourseModules(courseId) {
        if (!client) return []
        const { data } = await client.from('modules').select('*').eq('course_id', courseId).order('order_index')
        return data || []
    }

    async function createModule(module) {
        if (!client) return null
        const { data } = await client.from('modules').insert(module).select().single()
        return data
    }

    async function updateModule(moduleId, updates) {
        if (!client) return null
        const { data } = await client.from('modules').update(updates).eq('id', moduleId).select().single()
        return data
    }

    async function deleteModule(moduleId) {
        if (!client) return false
        const { error } = await client.from('modules').delete().eq('id', moduleId)
        return !error
    }

    /* ============ LESSONS HELPERS ============ */
    async function getModuleLessons(moduleId) {
        if (!client) return []
        const { data } = await client.from('lessons').select('*').eq('module_id', moduleId).order('order_index')
        return data || []
    }

    async function getLessonById(lessonId) {
        if (!client) return null
        const { data } = await client.from('lessons').select('*').eq('id', lessonId).single()
        return data
    }

    async function createLesson(lesson) {
        if (!client) return null
        const { data } = await client.from('lessons').insert(lesson).select().single()
        return data
    }

    async function updateLesson(lessonId, updates) {
        if (!client) return null
        const { data } = await client.from('lessons').update(updates).eq('id', lessonId).select().single()
        return data
    }

    async function deleteLesson(lessonId) {
        if (!client) return false
        const { error } = await client.from('lessons').delete().eq('id', lessonId)
        return !error
    }

    /* ============ ENROLLMENTS HELPERS ============ */
    async function enrollStudent(studentId, courseId, amountPaid, paymentStatus) {
        if (!client) return null
        const { data } = await client.from('enrollments').insert({
            student_id: studentId,
            course_id: courseId,
            amount_paid: amountPaid || 0,
            payment_status: paymentStatus || 'paid'
        }).select().single()
        return data
    }

    async function getStudentEnrollments(studentId) {
        if (!client) return []
        const { data } = await client.from('enrollments').select('*, course:course_id(*)').eq('student_id', studentId).order('enrolled_at', { ascending: false })
        return data || []
    }

    async function getCourseEnrollments(courseId) {
        if (!client) return []
        const { data } = await client.from('enrollments').select('*, student:student_id(full_name, email, avatar_url)').eq('course_id', courseId)
        return data || []
    }

    async function getTeacherEnrollments(teacherId) {
        if (!client) return []
        const { data: courses } = await client.from('courses').select('id').eq('instructor_id', teacherId)
        if (!courses || courses.length === 0) return []
        const courseIds = courses.map(c => c.id)
        const { data } = await client.from('enrollments').select('*, student:student_id(full_name, email), course:courses_id(title)').in('course_id', courseIds)
        return data || []
    }

    async function updateEnrollment(enrollmentId, updates) {
        if (!client) return null
        const { data } = await client.from('enrollments').update(updates).eq('id', enrollmentId).select().single()
        return data
    }

    /* ============ LESSON PROGRESS HELPERS ============ */
    async function markLessonComplete(studentId, lessonId, courseId) {
        if (!client) return null
        const { data: existing } = await client.from('lesson_progress').select('id').eq('student_id', studentId).eq('lesson_id', lessonId).maybeSingle()
        if (existing) {
            await client.from('lesson_progress').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', existing.id)
        } else {
            await client.from('lesson_progress').insert({ student_id: studentId, lesson_id: lessonId, course_id: courseId, is_completed: true, completed_at: new Date().toISOString() })
        }
        // Recalculate course progress
        await client.rpc('recalc_course_progress', { p_student_id: studentId, p_course_id: courseId })
        return true
    }

    async function getLessonProgress(studentId, lessonId) {
        if (!client) return null
        const { data } = await client.from('lesson_progress').select('*').eq('student_id', studentId).eq('lesson_id', lessonId).maybeSingle()
        return data
    }

    async function getCourseProgress(studentId, courseId) {
        if (!client) return 0
        const { data } = await client.from('enrollments').select('progress_percentage').eq('student_id', studentId).eq('course_id', courseId).maybeSingle()
        return data?.progress_percentage || 0
    }

    /* ============ ASSESSMENT HELPERS ============ */
    async function getCourseAssessments(courseId) {
        if (!client) return []
        const { data } = await client.from('assessments').select('*').eq('course_id', courseId).order('created_at')
        return data || []
    }

    async function getAssessmentById(assessmentId) {
        if (!client) return null
        const { data } = await client.from('assessments').select('*').eq('id', assessmentId).single()
        return data
    }

    async function createAssessment(assessment) {
        if (!client) return null
        const { data } = await client.from('assessments').insert(assessment).select().single()
        return data
    }

    async function updateAssessment(assessmentId, updates) {
        if (!client) return null
        const { data } = await client.from('assessments').update(updates).eq('id', assessmentId).select().single()
        return data
    }

    async function deleteAssessment(assessmentId) {
        if (!client) return false
        const { error } = await client.from('assessments').delete().eq('id', assessmentId)
        return !error
    }

    /* ============ QUESTIONS HELPERS ============ */
    async function getAssessmentQuestions(assessmentId) {
        if (!client) return []
        const { data } = await client.from('questions').select('*').eq('assessment_id', assessmentId).order('order_index')
        return data || []
    }

    async function createQuestion(question) {
        if (!client) return null
        const { data } = await client.from('questions').insert(question).select().single()
        return data
    }

    async function updateQuestion(questionId, updates) {
        if (!client) return null
        const { data } = await client.from('questions').update(updates).eq('id', questionId).select().single()
        return data
    }

    async function deleteQuestion(questionId) {
        if (!client) return false
        const { error } = await client.from('questions').delete().eq('id', questionId)
        return !error
    }

    /* ============ ATTEMPTS HELPERS ============ */
    async function getStudentAttempts(studentId, assessmentId) {
        if (!client) return []
        const { data } = await client.from('attempts').select('*').eq('student_id', studentId).eq('assessment_id', assessmentId).order('attempt_number')
        return data || []
    }

    async function createAttempt(attempt) {
        if (!client) return null
        const { data } = await client.from('attempts').insert(attempt).select().single()
        return data
    }

    /* ============ CERTIFICATE HELPERS ============ */
    async function getStudentCertificates(studentId) {
        if (!client) return []
        const { data } = await client.from('certificates').select('*, course:course_id(title)').eq('student_id', studentId).order('issue_date', { ascending: false })
        return data || []
    }

    async function issueCertificate(studentId, courseId) {
        if (!client) return null
        const code = 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        const { data } = await client.from('certificates').insert({
            student_id: studentId, course_id: courseId, certificate_code: code
        }).select().single()
        return data
    }

    async function getAllCertificates() {
        if (!client) return []
        const { data } = await client.from('certificates').select('*, student:student_id(full_name, email), course:course_id(title)').order('issue_date', { ascending: false })
        return data || []
    }

    async function verifyCertificate(token) {
        if (!client) return null
        const { data } = await client.from('certificates').select('*, student:student_id(full_name), course:course_id(title)').eq('verification_token', token).maybeSingle()
        return data
    }

    /* ============ REVENUE HELPERS ============ */
    async function getTeacherRevenues(teacherId) {
        if (!client) return []
        const { data } = await client.from('revenues').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false })
        return data || []
    }

    async function getAllRevenues() {
        if (!client) return []
        const { data } = await client.from('revenues').select('*, teacher:teacher_id(full_name), course:course_id(title)').order('created_at', { ascending: false })
        return data || []
    }

    async function createRevenue(revenue) {
        if (!client) return null
        const { data } = await client.from('revenues').insert(revenue).select().single()
        return data
    }

    /* ============ NOTIFICATION HELPERS ============ */
    async function getNotifications(userId) {
        if (!client) return []
        const { data } = await client.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
        return data || []
    }

    async function markNotificationRead(notifId) {
        if (!client) return
        await client.from('notifications').update({ is_read: true }).eq('id', notifId)
    }

    async function markAllNotificationsRead(userId) {
        if (!client) return
        await client.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    }

    async function createNotification(notif) {
        if (!client) return null
        const { data } = await client.from('notifications').insert(notif).select().single()
        return data
    }

    async function getUnreadCount(userId) {
        if (!client) return 0
        const { count } = await client.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
        return count || 0
    }

    /* ============ SETTINGS HELPERS ============ */
    async function getSettings() {
        if (!client) return null
        const { data } = await client.from('settings').select('*').single()
        return data
    }

    async function updateSettings(updates) {
        if (!client) return null
        const { data } = await client.from('settings').update(updates).eq('id', 1).select().single()
        return data
    }

    /* ============ REALTIME SUBSCRIPTIONS ============ */
    function subscribeToTable(table, event, callback) {
        if (!client) return () => {}
        const channel = client.channel(`public:${table}`)
            .on('postgres_changes', { event, schema: 'public', table }, payload => callback(payload))
            .subscribe()
        const unsub = () => { client.removeChannel(channel) }
        subscriptions.push(unsub)
        return unsub
    }

    function subscribeToCourse(courseId, callback) {
        if (!client) return () => {}
        const channel = client.channel(`course:${courseId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments', filter: `course_id=eq.${courseId}` }, payload => callback(payload))
            .subscribe()
        const unsub = () => { client.removeChannel(channel) }
        subscriptions.push(unsub)
        return unsub
    }

    function unsubscribeAll() {
        subscriptions.forEach(fn => fn())
        subscriptions = []
    }

    /* ============ WITHDRAWAL REQUESTS HELPERS ============ */
    async function getWithdrawalRequests(filters) {
        if (!client) return []
        let query = client.from('withdrawal_requests').select('*, teacher:teacher_id(full_name, email)').order('created_at', { ascending: false })
        if (filters?.status) query = query.eq('status', filters.status)
        const { data } = await query
        return data || []
    }

    async function createWithdrawalRequest(req) {
        if (!client) return null
        const { data } = await client.from('withdrawal_requests').insert(req).select().single()
        return data
    }

    async function updateWithdrawalRequest(id, updates) {
        if (!client) return null
        const { data } = await client.from('withdrawal_requests').update(updates).eq('id', id).select().single()
        return data
    }

    /* ============ REVIEWS HELPERS ============ */
    async function getCourseReviews(courseId) {
        if (!client) return []
        const { data } = await client.from('reviews').select('*, student:student_id(full_name, avatar_url)').eq('course_id', courseId).order('created_at', { ascending: false })
        return data || []
    }

    async function createReview(review) {
        if (!client) return null
        const { data } = await client.from('reviews').insert(review).select().single()
        return data
    }

    /* ============ VIDEO ACCESS HELPERS ============ */
    async function requestVideoAccess(lessonId) {
        if (!client) return null
        const { data: { user } } = await client.auth.getUser()
        if (!user) return null
        const { data } = await client.from('video_access').insert({
            user_id: user.id, lesson_id: lessonId
        }).select().single()
        return data
    }

    /* ============ SCHOLARSHIPS (Supabase) ============ */
    async function getAllScholarships() {
        if (!client) return []
        const { data } = await client.from('scholarships').select('*').order('created_at', { ascending: false })
        return data || []
    }

    async function createScholarship(scholarship) {
        if (!client) return null
        const { data } = await client.from('scholarships').insert(scholarship).select().single()
        return data
    }

    async function updateScholarship(id, updates) {
        if (!client) return null
        const { data } = await client.from('scholarships').update(updates).eq('id', id).select().single()
        return data
    }

    async function deleteScholarship(id) {
        if (!client) return false
        const { error } = await client.from('scholarships').delete().eq('id', id)
        return !error
    }

    return {
        init, getClient, isReady,
        signUp, signIn, signOut, getSession, getCurrentUser, onAuthStateChange,
        getProfile, updateProfile, getAllProfiles,
        getPublishedCourses, getCourseById, getTeacherCourses, getAllCourses,
        createCourse, updateCourse, deleteCourse,
        getCourseModules, createModule, updateModule, deleteModule,
        getModuleLessons, getLessonById, createLesson, updateLesson, deleteLesson,
        enrollStudent, getStudentEnrollments, getCourseEnrollments, getTeacherEnrollments, updateEnrollment,
        markLessonComplete, getLessonProgress, getCourseProgress,
        getCourseAssessments, getAssessmentById, createAssessment, updateAssessment, deleteAssessment,
        getAssessmentQuestions, createQuestion, updateQuestion, deleteQuestion,
        getStudentAttempts, createAttempt,
        getStudentCertificates, getAllCertificates, issueCertificate, verifyCertificate,
        getTeacherRevenues, getAllRevenues, createRevenue,
        getNotifications, markNotificationRead, markAllNotificationsRead, createNotification, getUnreadCount,
        getSettings, updateSettings,
        getWithdrawalRequests, createWithdrawalRequest, updateWithdrawalRequest,
        getCourseReviews, createReview,
        requestVideoAccess,
        getAllScholarships, createScholarship, updateScholarship, deleteScholarship,
        subscribeToTable, subscribeToCourse, unsubscribeAll,
        URL: SUPABASE_URL, ANON_KEY: SUPABASE_ANON_KEY
    }
})()

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.supabaseApp.init(), 300)
})

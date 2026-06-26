/**
 * student-lib.js — Student Library for LookaGenius
 * Usage: window.studentLib.*
 */
window.studentLib = (() => {
    const sb = () => window.supabaseApp

    function uid() {
        const u = window.auth?.currentUser
        return u?.id || null
    }

    /* ============= ENROLLMENTS ============= */
    async function getMyEnrollments() {
        const id = uid()
        if (!id) return []
        const s = sb()
        if (s && s.isReady()) return s.getStudentEnrollments(id)
        const data = JSON.parse(localStorage.getItem('lookagenius_db')) || {}
        const courses = (data.courses || []).filter(c => (c.studentsEnrolled || []).includes(id))
        return courses.map(c => ({ course: c, progress_percentage: 0 }))
    }

    async function enrollInCourse(courseId) {
        const id = uid()
        if (!id) return null
        const s = sb()
        if (s && s.isReady()) return s.enrollStudent(id, courseId, 0, 'free')
        const data = JSON.parse(localStorage.getItem('lookagenius_db')) || {}
        const course = (data.courses || []).find(c => c.id === parseInt(courseId) || c.id === courseId)
        if (course) {
            if (!course.studentsEnrolled) course.studentsEnrolled = []
            if (!course.studentsEnrolled.includes(id)) course.studentsEnrolled.push(id)
            localStorage.setItem('lookagenius_db', JSON.stringify(data))
        }
        return course
    }

    /* ============= PROGRESS ============= */
    async function updateProgress(enrollmentId, progress) {
        const s = sb()
        if (s && s.isReady()) return s.updateEnrollment(enrollmentId, { progress_percentage: progress })
        return null
    }

    async function getCourseProgress(courseId) {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.getCourseProgress(id, courseId)
        return 0
    }

    async function markLessonComplete(lessonId, courseId) {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.markLessonComplete(id, lessonId, courseId)
        return null
    }

    /* ============= ASSESSMENTS ============= */
    async function submitAssessment(assessmentId, answers, attemptNumber) {
        const id = uid()
        const s = sb()
        if (!s || !s.isReady()) return null
        const { data: assessment } = await s.getClient().from('assessments').select('*').eq('id', assessmentId).single()
        const { data: questions } = await s.getClient().from('questions').select('*').eq('assessment_id', assessmentId)
        if (!assessment || !questions) return null

        let correctCount = 0
        questions.forEach(q => {
            const userAns = (answers[q.id] || '').toLowerCase().trim()
            if (userAns === (q.correct_answer || '').toLowerCase().trim()) correctCount++
        })
        const total = questions.length
        const percentage = total ? Math.round((correctCount / total) * 100) : 0
        const passed = percentage >= (assessment.passing_score || 70)

        const { data } = await s.getClient().from('attempts').insert({
            student_id: id, assessment_id: assessmentId, score: percentage,
            is_passed: passed, answers, attempt_number: attemptNumber || 1,
            completed_at: new Date().toISOString()
        }).select().single()

        return { data, percentage, passed, correctCount, total }
    }

    async function getMyAttempts(assessmentId) {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.getStudentAttempts(id, assessmentId)
        return []
    }

    /* ============= CERTIFICATES ============= */
    async function getMyCertificates() {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.getStudentCertificates(id)
        return []
    }

    async function getCertificateByCode(code) {
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('certificates').select('*, student:student_id(full_name), course:course_id(title)').eq('certificate_code', code).maybeSingle()
            return data
        }
        return null
    }

    /* ============= REVIEWS ============= */
    async function submitReview(courseId, rating, reviewText) {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('reviews').insert({
                student_id: id, course_id: courseId, rating, review_text: reviewText || ''
            }).select().single()
            return data
        }
        return null
    }

    async function getCourseReviews(courseId) {
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('reviews').select('*, student:student_id(full_name, avatar_url)').eq('course_id', courseId).order('created_at', { ascending: false })
            return data || []
        }
        return []
    }

    /* ============= AI RECOMMENDATIONS ============= */
    async function getRecommendedCourses(limit) {
        const id = uid()
        const s = sb()
        if (!s || !s.isReady()) return []
        const enrollments = await s.getStudentEnrollments(id)
        const enrolledIds = new Set(enrollments.map(e => e.course_id))
        const allCourses = await s.getPublishedCourses()
        const available = allCourses.filter(c => !enrolledIds.has(c.id))
        return available.slice(0, limit || 6)
    }

    return {
        getMyEnrollments, enrollInCourse,
        updateProgress, getCourseProgress, markLessonComplete,
        submitAssessment, getMyAttempts,
        getMyCertificates, getCertificateByCode,
        submitReview, getCourseReviews,
        getRecommendedCourses
    }
})()

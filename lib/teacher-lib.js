/**
 * teacher-lib.js — Teacher Library for LookaGenius
 * Usage: window.teacherLib.*
 */
window.teacherLib = (() => {
    const sb = () => window.supabaseApp

    function uid() {
        const u = window.auth?.currentUser
        return u?.id || null
    }

    /* ============= COURSES ============= */
    async function getMyCourses() {
        const id = uid()
        if (!id) return []
        const s = sb()
        if (s && s.isReady()) return s.getTeacherCourses(id)
        return window.db.getCourses().filter(c => c.teacherId === id || (c.teacherIds || []).includes(id))
    }

    async function addCourse(data) {
        const s = sb()
        if (s && s.isReady()) return s.createCourse({ ...data, instructor_id: uid() })
        return window.db.addCourse({ ...data, teacherIds: [uid()], teacherId: uid() })
    }

    async function updateCourse(courseId, data) {
        const s = sb()
        if (s && s.isReady()) return s.updateCourse(courseId, data)
        return window.db.updateCourse(courseId, data)
    }

    async function deleteCourse(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteCourse(courseId)
        return window.db.deleteCourse(courseId)
    }

    async function duplicateCourse(courseId) {
        const s = sb()
        if (s && s.isReady()) {
            const course = await s.getCourseById(courseId)
            if (!course) return null
            const { id, created_at, updated_at, students_count, rating, ...rest } = course
            return s.createCourse({ ...rest, title: rest.title + ' (نسخة)', is_published: false, is_approved: false })
        }
        const course = window.db.getCourseById(courseId)
        if (!course) return null
        return window.db.addCourse({ ...course, title: course.title + ' (نسخة)', id: undefined, studentsEnrolled: [] })
    }

    /* ============= MODULES ============= */
    async function getModules(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.getCourseModules(courseId)
        return []
    }

    async function addModule(data) {
        const s = sb()
        if (s && s.isReady()) return s.createModule(data)
        return null
    }

    async function updateModule(moduleId, data) {
        const s = sb()
        if (s && s.isReady()) return s.updateModule(moduleId, data)
        return null
    }

    async function deleteModule(moduleId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteModule(moduleId)
        return false
    }

    /* ============= LESSONS ============= */
    async function getLessons(moduleId) {
        const s = sb()
        if (s && s.isReady()) return s.getModuleLessons(moduleId)
        return []
    }

    async function addLesson(data) {
        const s = sb()
        if (s && s.isReady()) return s.createLesson(data)
        return null
    }

    async function updateLesson(lessonId, data) {
        const s = sb()
        if (s && s.isReady()) return s.updateLesson(lessonId, data)
        return null
    }

    async function deleteLesson(lessonId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteLesson(lessonId)
        return false
    }

    /* ============= STUDENTS ============= */
    async function getEnrolledStudents(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.getCourseEnrollments(courseId)
        return []
    }

    async function getAllMyStudents() {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.getTeacherEnrollments(id)
        const courses = window.db.getCourses().filter(c => c.teacherId === id || (c.teacherIds || []).includes(id))
        const allUsers = window.db.getUsers()
        const result = []
        courses.forEach(c => {
            (c.studentsEnrolled || []).forEach(sId => {
                const student = allUsers.find(u => u.id === sId)
                if (student) result.push({ student, course: c })
            })
        })
        return result
    }

    /* ============= ASSESSMENTS ============= */
    async function getAssessments(courseId) {
        const s = sb()
        if (s && s.isReady()) return s.getCourseAssessments(courseId)
        return window.db.getAssessments(courseId)
    }

    async function getAssessmentById(assessmentId) {
        const s = sb()
        if (s && s.isReady()) return s.getAssessmentById(assessmentId)
        return window.db.getAssessmentById(assessmentId)
    }

    async function addAssessment(data) {
        const s = sb()
        if (s && s.isReady()) return s.createAssessment(data)
        return window.db.addAssessment(data)
    }

    async function updateAssessment(assessmentId, data) {
        const s = sb()
        if (s && s.isReady()) return s.updateAssessment(assessmentId, data)
        return window.db.updateAssessment(assessmentId, data)
    }

    async function deleteAssessment(assessmentId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteAssessment(assessmentId)
        return window.db.deleteAssessment(assessmentId)
    }

    async function getQuestions(assessmentId) {
        const s = sb()
        if (s && s.isReady()) return s.getAssessmentQuestions(assessmentId)
        return window.db.getQuestions(assessmentId)
    }

    async function addQuestion(data) {
        const s = sb()
        if (s && s.isReady()) return s.createQuestion(data)
        return window.db.addQuestion(data)
    }

    async function updateQuestion(questionId, data) {
        const s = sb()
        if (s && s.isReady()) return s.updateQuestion(questionId, data)
        return window.db.updateQuestion(questionId, data)
    }

    async function deleteQuestion(questionId) {
        const s = sb()
        if (s && s.isReady()) return s.deleteQuestion(questionId)
        return window.db.deleteQuestion(questionId)
    }

    /* ============= REVENUE ============= */
    async function getMyRevenue() {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) return s.getTeacherRevenues(id)
        return window.db.getFinancials().filter(f => f.teacherId === id)
    }

    async function requestWithdrawal(amount, bankDetails) {
        const id = uid()
        const s = sb()
        if (s && s.isReady()) {
            const { data } = await s.getClient().from('withdrawal_requests').insert({
                teacher_id: id, amount, bank_details: bankDetails || {}
            }).select().single()
            return data
        }
        return window.db.addSettlementRequest({ teacherId: id, amount, status: 'pending' })
    }

    return {
        getMyCourses, addCourse, updateCourse, deleteCourse, duplicateCourse,
        getModules, addModule, updateModule, deleteModule,
        getLessons, addLesson, updateLesson, deleteLesson,
        getEnrolledStudents, getAllMyStudents,
        getAssessments, getAssessmentById, addAssessment, updateAssessment, deleteAssessment,
        getQuestions, addQuestion, updateQuestion, deleteQuestion,
        getMyRevenue, requestWithdrawal
    }
})()

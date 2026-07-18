/**
 * nextgen-analytics.js — Advanced Analytics, AI-Powered Reports, KPIs
 */

window.NextGen = window.NextGen || {}
if (!NextGen.DB) console.error('[Analytics] Core DB not loaded')

NextGen.Analytics = {
    init() {
        console.log('[Analytics] Module initialized')
    },

    // ===== PLATFORM OVERVIEW =====
    getPlatformStats() {
        const d = NextGen.DB.getData()
        const users = d.users || []
        const courses = d.courses || []
        const assignments = d.assignments || []
        const submissions = d.submissions || []
        const payments = d.payments || []
        const subscriptions = d.subscriptions || []
        const liveClasses = d.liveClasses || []
        const reviews = d.reviews || []

        const stats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.active !== false).length,
            students: users.filter(u => u.type === 'student').length,
            teachers: users.filter(u => u.type === 'teacher').length,
            parents: users.filter(u => u.type === 'parent').length,
            engineers: users.filter(u => u.type === 'engineer').length,
            accountants: users.filter(u => u.type === 'accountant').length,
            admins: users.filter(u => u.type === 'admin').length,
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.active !== false).length,
            totalAssignments: assignments.length,
            totalSubmissions: submissions.length,
            gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
            pendingSubmissions: submissions.filter(s => s.status === 'submitted').length,
            totalPayments: payments.length,
            successfulPayments: payments.filter(p => p.status === 'paid').length,
            totalRevenue: payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0),
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            totalLiveClasses: liveClasses.length,
            upcomingClasses: liveClasses.filter(lc => new Date(lc.startTime) > new Date() && lc.status !== 'cancelled').length,
            totalReviews: reviews.length,
            avgRating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
            totalRevenueEGP: payments.filter(p => p.status === 'paid' && (!p.currency || p.currency === 'EGP')).reduce((s, p) => s + (p.amount || 0), 0),
            totalRevenueUSD: payments.filter(p => p.status === 'paid' && p.currency === 'USD').reduce((s, p) => s + (p.amount || 0), 0),
        }
        return stats
    },

    // ===== COURSE ANALYTICS =====
    getCourseAnalytics(courseId) {
        const d = NextGen.DB.getData()
        const course = (d.courses || []).find(c => c.id == courseId)
        if (!course) return null
        const enrolledStudents = course.studentsEnrolled?.length || 0
        const assignments = (d.assignments || []).filter(a => a.courseId === courseId)
        const submissions = (d.submissions || []).filter(s => assignments.some(a => a.id === s.assignmentId))
        const graded = submissions.filter(s => s.status === 'graded')
        const avgGrade = graded.length ? graded.reduce((s, g) => s + (g.grade || 0), 0) / graded.length : 0
        const liveClasses = (d.liveClasses || []).filter(lc => lc.courseId === courseId)
        const reviews = NextGen.DB.getCourseReviews(courseId)
        const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
        const revenue = (d.payments || []).filter(p => p.status === 'paid' && p.description?.includes(courseId)).reduce((s, p) => s + (p.amount || 0), 0)

        return {
            course,
            enrolledStudents,
            totalAssignments: assignments.length,
            totalSubmissions: submissions.length,
            gradedSubmissions: graded.length,
            averageGrade: Math.round(avgGrade * 10) / 10,
            completionRate: submissions.length ? Math.round((graded.length / submissions.length) * 100) : 0,
            liveClassesCount: liveClasses.length,
            completionPercentage: course.completionPercentage || 0,
            averageRating: avgRating,
            totalReviews: reviews.length,
            revenue
        }
    },

    // ===== USER ANALYTICS =====
    getUserAnalytics(userId) {
        const d = NextGen.DB.getData()
        const user = (d.users || []).find(u => u.id == userId)
        if (!user) return null
        const gamification = NextGen.DB.getPlayer(userId)
        const submissions = (d.submissions || []).filter(s => s.studentId === userId)
        const graded = submissions.filter(s => s.status === 'graded')
        const avgGrade = graded.length ? Math.round(graded.reduce((s, g) => s + (g.grade || 0), 0) / graded.length) : 0
        const attendance = NextGen.DB.getStudentAttendanceStats(userId)
        const messages = (d.messages || []).filter(m => m.from === userId || m.to === userId)
        const threads = (d.threads || []).filter(t => t.authorId === userId)
        const enrolledCourses = (d.courses || []).filter(c => (c.studentsEnrolled || []).includes(parseInt(userId)) || (c.studentsEnrolled || []).includes(userId))
        const reviews = (d.reviews || []).filter(r => r.userId === userId)

        return {
            user,
            gamification: {
                xp: gamification.xp,
                level: gamification.level,
                points: gamification.points,
                streak: gamification.streak,
                badges: gamification.badges?.length || 0
            },
            submissions: { total: submissions.length, graded: graded.length, pending: submissions.length - graded.length },
            averageGrade: avgGrade,
            attendance: { present: attendance.present, absent: attendance.absent, rate: attendance.rate },
            messages: messages.length,
            threads: threads.length,
            enrolledCourses: enrolledCourses.length,
            reviews: reviews.length,
            engagement: Math.round((submissions.length + threads.length + messages.length + reviews.length) / Math.max(1, enrolledCourses.length) * 10) / 10
        }
    },

    // ===== RENDER PLATFORM DASHBOARD =====
    renderPlatformAnalytics(containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const stats = this.getPlatformStats()

        container.innerHTML = `
            <div style="margin-bottom:25px">
                <h3 style="color:#fff;margin:0 0 5px"><i class="fa-solid fa-chart-line" style="color:#00D4FF"></i> ${NextGen.I18n.t('platformStats')}</h3>
                <p style="color:#666;font-size:14px;margin:0">Real-time platform performance metrics</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;margin-bottom:25px">
                ${NextGen.UI.renderStatCard('fa-users', NextGen.I18n.t('totalStudents'), stats.students, '#00D4FF')}
                ${NextGen.UI.renderStatCard('fa-chalkboard-user', NextGen.I18n.t('totalTeachers'), stats.teachers, '#A855F7')}
                ${NextGen.UI.renderStatCard('fa-book', NextGen.I18n.t('totalCourses'), stats.totalCourses, '#22c55e')}
                ${NextGen.UI.renderStatCard('fa-dollar-sign', NextGen.I18n.t('totalRevenue'), NextGen.UI.formatCurrency(stats.totalRevenueEGP, 'EGP'), '#FBBF24')}
                ${NextGen.UI.renderStatCard('fa-check-circle', NextGen.I18n.t('completionRate'), stats.gradedSubmissions > 0 ? Math.round((stats.gradedSubmissions/stats.totalSubmissions)*100) + '%' : '0%', '#22c55e')}
                ${NextGen.UI.renderStatCard('fa-star', NextGen.I18n.t('averageRating'), stats.avgRating ? stats.avgRating.toFixed(1) : '0', '#FBBF24')}
                ${NextGen.UI.renderStatCard('fa-video', NextGen.I18n.t('live'), stats.upcomingClasses, '#22c55e')}
                ${NextGen.UI.renderStatCard('fa-gem', NextGen.I18n.t('activeSubscriptions'), stats.activeSubscriptions, '#00D4FF')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h4 style="color:#fff;margin:0 0 15px">📊 User Distribution</h4>
                    <div style="display:grid;gap:10px">
                        ${[
                            { label: NextGen.I18n.t('student'), count: stats.students, color: '#00D4FF', total: stats.totalUsers },
                            { label: NextGen.I18n.t('teacher'), count: stats.teachers, color: '#A855F7', total: stats.totalUsers },
                            { label: NextGen.I18n.t('parent'), count: stats.parents, color: '#22c55e', total: stats.totalUsers },
                            { label: 'Engineers', count: stats.engineers, color: '#FF6432', total: stats.totalUsers },
                            { label: 'Accountants', count: stats.accountants, color: '#FBBF24', total: stats.totalUsers },
                            { label: NextGen.I18n.t('admin'), count: stats.admins, color: '#ef4444', total: stats.totalUsers }
                        ].map(({ label, count, color, total }) => `
                            <div>
                                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                                    <span style="color:#aaa">${label}</span>
                                    <span style="color:#fff">${count}</span>
                                </div>
                                ${NextGen.UI.renderProgressBar(total ? (count/total)*100 : 0, color)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h4 style="color:#fff;margin:0 0 15px">💰 Revenue Overview</h4>
                    <div style="display:grid;gap:15px">
                        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px">
                            <span style="color:#aaa">Total Revenue (EGP)</span>
                            <span style="color:#FBBF24;font-weight:700">${NextGen.UI.formatCurrency(stats.totalRevenueEGP, 'EGP')}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px">
                            <span style="color:#aaa">Total Revenue (USD)</span>
                            <span style="color:#FBBF24;font-weight:700">${NextGen.UI.formatCurrency(stats.totalRevenueUSD, 'USD')}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px">
                            <span style="color:#aaa">Successful Payments</span>
                            <span style="color:#22c55e;font-weight:700">${stats.successfulPayments}/${stats.totalPayments}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px">
                            <span style="color:#aaa">Active Subscriptions</span>
                            <span style="color:#00D4FF;font-weight:700">${stats.activeSubscriptions}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    // ===== RENDER COURSE ANALYTICS =====
    renderCourseAnalytics(courseId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const analytics = this.getCourseAnalytics(courseId)
        if (!analytics) { container.innerHTML = '<p style="color:#666;padding:30px;text-align:center">Course not found</p>'; return }

        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px">📊 ${NextGen.I18n.t('analytics')}: ${NextGen.UI.escHtml(analytics.course.title)}</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">
                ${NextGen.UI.renderStatCard('fa-users', 'Students', analytics.enrolledStudents, '#00D4FF')}
                ${NextGen.UI.renderStatCard('fa-file-pen', 'Assignments', analytics.totalAssignments, '#A855F7')}
                ${NextGen.UI.renderStatCard('fa-check-circle', 'Avg Grade', analytics.averageGrade + '%', '#22c55e')}
                ${NextGen.UI.renderStatCard('fa-star', 'Rating', analytics.averageRating.toFixed(1), '#FBBF24')}
                ${NextGen.UI.renderStatCard('fa-dollar-sign', 'Revenue', NextGen.UI.formatCurrency(analytics.revenue, 'EGP'), '#FBBF24')}
                ${NextGen.UI.renderStatCard('fa-video', 'Live Classes', analytics.liveClassesCount, '#22c55e')}
            </div>
            <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                <div style="display:grid;gap:12px">
                    ${[
                        { label: 'Enrollment Rate', value: analytics.enrolledStudents, max: 100, color: '#00D4FF' },
                        { label: 'Submission Completion', value: analytics.completionRate, max: 100, color: '#22c55e' },
                        { label: 'Average Grade', value: analytics.averageGrade, max: 100, color: '#A855F7' },
                        { label: 'Course Progress', value: analytics.completionPercentage, max: 100, color: '#FBBF24' }
                    ].map(({ label, value, max, color }) => `
                        <div>
                            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                                <span style="color:#aaa">${label}</span>
                                <span style="color:#fff">${value}%</span>
                            </div>
                            ${NextGen.UI.renderProgressBar(value, color)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `
    },

    // ===== RENDER USER ANALYTICS =====
    renderUserAnalytics(userId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const analytics = this.getUserAnalytics(userId)
        if (!analytics) { container.innerHTML = '<p style="color:#666;padding:30px;text-align:center">User not found</p>'; return }

        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px">📊 ${NextGen.I18n.t('analytics')}: ${NextGen.UI.escHtml(analytics.user.name || analytics.user.email)}</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px">
                ${NextGen.UI.renderStatCard('fa-bolt', 'Level', analytics.gamification.level, '#A855F7')}
                ${NextGen.UI.renderStatCard('fa-trophy', 'XP', analytics.gamification.xp, '#FBBF24')}
                ${NextGen.UI.renderStatCard('fa-fire', 'Streak', analytics.gamification.streak + ' days', '#FF6432')}
                ${NextGen.UI.renderStatCard('fa-file-pen', 'Submissions', analytics.submissions.total, '#00D4FF')}
                ${NextGen.UI.renderStatCard('fa-star', 'Avg Grade', analytics.averageGrade + '%', '#22c55e')}
                ${NextGen.UI.renderStatCard('fa-calendar-check', 'Attendance', analytics.attendance.rate + '%', '#00D4FF')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px">
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h5 style="color:#fff;margin:0 0 12px">📋 Recent Activity</h5>
                    <div style="display:grid;gap:8px">
                        <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                            <span style="color:#aaa">Enrolled Courses</span><span style="color:#fff">${analytics.enrolledCourses}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                            <span style="color:#aaa">Forum Threads</span><span style="color:#fff">${analytics.threads}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                            <span style="color:#aaa">Messages</span><span style="color:#fff">${analytics.messages}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0">
                            <span style="color:#aaa">Reviews Written</span><span style="color:#fff">${analytics.reviews}</span>
                        </div>
                    </div>
                </div>
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h5 style="color:#fff;margin:0 0 12px">🏅 Engagement Score</h5>
                    <div style="text-align:center;padding:20px">
                        <div style="font-size:48px;font-weight:700;color:${analytics.engagement > 5 ? '#22c55e' : analytics.engagement > 2 ? '#eab308' : '#ef4444'}">${analytics.engagement.toFixed(1)}</div>
                        <div style="color:#888;font-size:14px">Engagement Index</div>
                        <div style="margin-top:15px">
                            ${NextGen.UI.renderProgressBar(Math.min(100, analytics.engagement * 10), analytics.engagement > 5 ? '#22c55e' : analytics.engagement > 2 ? '#eab308' : '#ef4444')}
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    // ===== EXPORT REPORT =====
    exportReport(type = 'platform') {
        let data
        let filename
        if (type === 'platform') {
            data = this.getPlatformStats()
            filename = 'platform-analytics.json'
        } else if (type === 'courses') {
            const d = NextGen.DB.getData()
            data = (d.courses || []).map(c => this.getCourseAnalytics(c.id))
            filename = 'courses-analytics.json'
        } else {
            const d = NextGen.DB.getData()
            data = (d.users || []).map(u => this.getUserAnalytics(u.id))
            filename = 'users-analytics.json'
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        NextGen.UI.showToast(`Report exported: ${filename}`, 'success')
    }
}

console.log('[NextGen] Analytics module loaded')

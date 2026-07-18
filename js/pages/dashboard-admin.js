/**
 * dashboard-admin.js — Full admin control panel
 * Sections: Overview | Users | Courses | Revenue | Certificates | Settings
 */
document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.ready
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'admin') { window.location.href = 'login.html'; return }

    const user = window.auth.currentUser
    const sb = window.supabaseApp

    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML }
    async function ensureSb() { return sb && sb.isReady() }

    async function renderUI(section) {
        try {
        const hasSb = await ensureSb()
        section = section || 'overview'

        const sidebar = `
            <li><a href="#" class="${section === 'overview' ? 'active' : ''}" data-section="overview"><i class="fa-solid fa-chart-line"></i> نظرة عامة</a></li>
            <li><a href="#" class="${section === 'users' ? 'active' : ''}" data-section="users"><i class="fa-solid fa-users-gear"></i> المستخدمين</a></li>
            <li><a href="#" class="${section === 'courses' ? 'active' : ''}" data-section="courses"><i class="fa-solid fa-book"></i> الكورسات</a></li>
            <li><a href="#" class="${section === 'scholarships' ? 'active' : ''}" data-section="scholarships"><i class="fa-solid fa-graduation-cap"></i> المنح</a></li>
            <li><a href="#" class="${section === 'collaborations' ? 'active' : ''}" data-section="collaborations"><i class="fa-solid fa-handshake"></i> طلبات التعاون</a></li>
            <li><a href="#" class="${section === 'revenue' ? 'active' : ''}" data-section="revenue"><i class="fa-solid fa-money-bill"></i> الأرباح</a></li>
            <li><a href="#" class="${section === 'withdrawals' ? 'active' : ''}" data-section="withdrawals"><i class="fa-solid fa-bank"></i> طلبات السحب</a></li>
            <li><a href="#" class="${section === 'certificates' ? 'active' : ''}" data-section="certificates"><i class="fa-solid fa-certificate"></i> الشهادات</a></li>
            <li><a href="#" class="${section === 'payments' ? 'active' : ''}" data-section="payments"><i class="fa-solid fa-credit-card"></i> المدفوعات</a></li>
            <li><a href="#" class="${section === 'analytics' ? 'active' : ''}" data-section="analytics"><i class="fa-solid fa-chart-pie"></i> التحليلات</a></li>
            <li><a href="#" class="${section === 'paths' ? 'active' : ''}" data-section="paths"><i class="fa-solid fa-map"></i> مسارات التعلم</a></li>
            <li><a href="#" class="${section === 'messages' ? 'active' : ''}" data-section="messages"><i class="fa-solid fa-comments"></i> الرسائل</a></li>
            <li><a href="#" class="${section === 'forums' ? 'active' : ''}" data-section="forums"><i class="fa-solid fa-comment-dots"></i> المناقشات</a></li>
            <li><a href="#" class="${section === 'live' ? 'active' : ''}" data-section="live"><i class="fa-solid fa-video"></i> الحصص المباشرة</a></li>
            <li><a href="#" class="${section === 'coupons' ? 'active' : ''}" data-section="coupons"><i class="fa-solid fa-tags"></i> كوبونات الخصم</a></li>
            <li><a href="#" class="${section === 'reviews' ? 'active' : ''}" data-section="reviews"><i class="fa-solid fa-star"></i> التقييمات</a></li>
            <li><a href="#" class="${section === 'notifications' ? 'active' : ''}" data-section="notifications"><i class="fa-solid fa-bell"></i> الإشعارات</a></li>
            <li><a href="#" class="${section === 'settings' ? 'active' : ''}" data-section="settings"><i class="fa-solid fa-gear"></i> الإعدادات</a></li>
        `

        let content = ''
        if (section === 'overview') { content = await renderOverview(hasSb); setTimeout(() => bindOverviewChart(hasSb), 300) }
        else if (section === 'users') content = await renderUsers(hasSb)
        else if (section === 'courses') content = await renderCourses(hasSb)
        else if (section === 'scholarships') content = await renderScholarships(hasSb)
        else if (section === 'collaborations') content = await renderCollaborations(hasSb)
        else if (section === 'revenue') content = await renderRevenue(hasSb)
        else if (section === 'withdrawals') content = await renderWithdrawals(hasSb)
        else if (section === 'certificates') content = await renderCertificates(hasSb)
        else if (section === 'analytics') content = renderPlatformAnalytics()
        else if (section === 'payments') content = renderPayments()
        else if (section === 'paths') content = renderPaths()
        else if (section === 'messages') content = renderMessages()
        else if (section === 'forums') content = renderForums()
        else if (section === 'live') content = renderLiveClasses()
        else if (section === 'coupons') content = renderCoupons()
        else if (section === 'reviews') content = renderReviews()
        else if (section === 'notifications') content = await renderNotifications(hasSb)
        else if (section === 'settings') content = await renderSettings(hasSb)

        const container = document.getElementById('dashboardContent')
        if (!container) return
        container.innerHTML = renderDashboardLayout('لوحة تحكم الأدمن', sidebar, content)
        bindLogout()
        bindNav()
        if (section === 'users') bindUserEvents(hasSb)
        if (section === 'courses') bindCourseEvents(hasSb)
        if (section === 'scholarships') bindScholarshipEvents(hasSb)
        if (section === 'collaborations') bindCollaborationEvents(hasSb)
        if (section === 'withdrawals') bindWithdrawalEvents(hasSb)
        if (section === 'coupons') bindCouponEvents()
        if (section === 'notifications') bindNotificationEvents(hasSb)
        if (section === 'settings') bindSettingsEvents(hasSb)
    } catch(err) {
        console.error('[admin] renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p></div>'
    }
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault()
                renderUI(link.dataset.section).catch(err => {
                    console.error('[admin] renderUI error:', err)
                    const c = document.getElementById('dashboardContent')
                    if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p><button class="ag-btn" onclick="location.reload()" style="margin-top:20px;">إعادة المحاولة</button></div>'
                })
            })
        })
    }

    /* ---- OVERVIEW ---- */
    async function renderOverview(hasSb) {
        let totalUsers = 0, totalCourses = 0, totalRevenue = 0, studentsCount = 0, teachersCount = 0, totalCerts = 0
        if (hasSb) {
            const profiles = await sb.getAllProfiles()
            totalUsers = profiles.length
            studentsCount = profiles.filter(p => p.role === 'student').length
            teachersCount = profiles.filter(p => p.role === 'teacher').length
            const courses = await sb.getAllCourses()
            totalCourses = courses.length
            const revs = await sb.getAllRevenues()
            totalRevenue = revs.reduce((s, r) => s + (r.amount || 0), 0)
            const allCerts = []
            /* We would need a specific API for all certs - approximate */
            totalCerts = 0
        } else {
            const users = window.db.getUsers().filter(u => u.active !== false)
            totalUsers = users.length
            studentsCount = users.filter(u => u.type === 'student').length
            teachersCount = users.filter(u => u.type === 'teacher').length
            totalCourses = window.db.getCourses().length
        }
        // Get NextGen stats if available
        let ngStats = {}
        if (NextGen.Analytics) ngStats = NextGen.Analytics.getPlatformStats()
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${ngStats.totalUsers || totalUsers}</div><p class="label">إجمالي المستخدمين</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${ngStats.students || studentsCount}</div><p class="label">الطلاب</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${ngStats.teachers || teachersCount}</div><p class="label">المعلمين</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${ngStats.totalCourses || totalCourses}</div><p class="label">الكورسات</p></div>
            </div>
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #FF3366;"><div class="num" style="color:#FF3366;">${ngStats.totalRevenueEGP ? 'EGP ' + ngStats.totalRevenueEGP : '$' + totalRevenue}</div><p class="label">إجمالي الإيرادات</p></div>
                <div class="stat-card" style="border-top:3px solid #00FFAA;"><div class="num" style="color:#00FFAA;">${ngStats.gradedSubmissions || totalCerts}</div><p class="label">التصحيحات</p></div>
                <div class="stat-card" style="border-top:3px solid #22c55e;"><div class="num" style="color:#22c55e;">${ngStats.activeSubscriptions || 0}</div><p class="label">الاشتراكات النشطة</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${ngStats.avgRating ? ngStats.avgRating.toFixed(1) : '0'}</div><p class="label">متوسط التقييم</p></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px">
                <div class="dash-card">
                    <h4><i class="fa-solid fa-chart-simple" style="color:#00D4FF;"></i> توزيع المستخدمين</h4>
                    <canvas id="adminUsersChart" style="height:250px;margin-top:15px;"></canvas>
                </div>
                <div class="dash-card">
                    <h4><i class="fa-solid fa-bolt" style="color:#A855F7;"></i> إجراءات سريعة</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px">
                        <a href="#" onclick="renderUI('users')" style="padding:15px;background:rgba(0,212,255,0.08);border-radius:12px;border:1px solid rgba(0,212,255,0.2);text-align:center;color:#00D4FF;text-decoration:none;font-size:13px"><i class="fa-solid fa-users" style="display:block;font-size:24px;margin-bottom:5px"></i> إدارة المستخدمين</a>
                        <a href="#" onclick="renderUI('courses')" style="padding:15px;background:rgba(168,85,247,0.08);border-radius:12px;border:1px solid rgba(168,85,247,0.2);text-align:center;color:#A855F7;text-decoration:none;font-size:13px"><i class="fa-solid fa-book" style="display:block;font-size:24px;margin-bottom:5px"></i> الكورسات</a>
                        <a href="#" onclick="renderUI('payments')" style="padding:15px;background:rgba(34,197,94,0.08);border-radius:12px;border:1px solid rgba(34,197,94,0.2);text-align:center;color:#22c55e;text-decoration:none;font-size:13px"><i class="fa-solid fa-credit-card" style="display:block;font-size:24px;margin-bottom:5px"></i> المدفوعات</a>
                        <a href="#" onclick="renderUI('analytics')" style="padding:15px;background:rgba(251,191,36,0.08);border-radius:12px;border:1px solid rgba(251,191,36,0.2);text-align:center;color:#FBBF24;text-decoration:none;font-size:13px"><i class="fa-solid fa-chart-pie" style="display:block;font-size:24px;margin-bottom:5px"></i> التحليلات</a>
                    </div>
                </div>
            </div>
        `
    }

    /* ---- USERS ---- */
    async function renderUsers(hasSb) {
        let users = []
        if (hasSb) {
            users = await sb.getAllProfiles()
        } else {
            users = window.db.getUsers()
        }
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>${users.map(u => `
                        <tr>
                            <td>${esc(u.full_name || u.name || '')}</td>
                            <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${esc(u.email)}</td>
                            <td><span style="color:${u.role === 'admin' ? '#FF3366' : u.role === 'teacher' ? '#A855F7' : '#00D4FF'};font-weight:700;">${esc(u.role)}</span></td>
                            <td>${u.is_active !== false ? '<span style="color:#10b981;">نشط</span>' : '<span style="color:#ff4d4d;">موقوف</span>'}</td>
                            <td>
                                <button class="ag-btn user-toggle-status" data-id="${u.id}" data-active="${u.is_active !== false}" style="padding:5px 12px;font-size:0.7rem;background:rgba(255,77,77,0.1);color:#ff4d4d;">${u.is_active !== false ? 'تعطيل' : 'تفعيل'}</button>
                            </td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>
        `
    }

    function bindUserEvents(hasSb) {
        document.querySelectorAll('.user-toggle-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                const active = btn.dataset.active === 'true'
                if (hasSb) await sb.updateProfile(id, { is_active: !active })
                renderUI('users')
            })
        })
    }

    /* ---- COURSES (approval) ---- */
    async function renderCourses(hasSb) {
        let courses = []
        if (hasSb) courses = await sb.getAllCourses()
        else courses = window.db.getCourses()

        const pending = courses.filter(c => !c.is_approved)
        const approved = courses.filter(c => c.is_approved)
        const drafts = courses.filter(c => !c.is_published)

        return `
            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${pending.length}</div><p class="label">قيد المراجعة</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${approved.length}</div><p class="label">معتمد</p></div>
                <div class="stat-card" style="border-top:3px solid #FF3366;"><div class="num" style="color:#FF3366;">${drafts.length}</div><p class="label">مسودات</p></div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>الكورس</th><th>المدرس</th><th>التصنيف</th><th>السعر</th><th>النشر</th><th>الاعتماد</th><th>الإجراءات</th></tr></thead>
                    <tbody>${courses.map(c => `
                        <tr>
                            <td>${esc(c.title)}</td>
                            <td style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${esc(c.instructor?.full_name || c.instructor_id || '')}</td>
                            <td>${esc(c.category)}</td>
                            <td>$${c.price || 0}</td>
                            <td>${c.is_published ? '<span style="color:#10b981;">منشور</span>' : '<span style="color:#FBBF24;">مسودة</span>'}</td>
                            <td>${c.is_approved ? '<span style="color:#10b981;">✓ معتمد</span>' : '<span style="color:#ff4d4d;">✗ غير معتمد</span>'}</td>
                            <td style="display:flex;gap:6px;">
                                ${!c.is_approved ? `<button class="ag-btn approve-course-btn" data-id="${c.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(16,185,129,0.15);color:#10b981;">اعتماد</button>` : ''}
                                <button class="ag-btn delete-course-btn" data-id="${c.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.15);color:#ff4d4d;">حذف</button>
                            </td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>
        `
    }

    function bindCourseEvents(hasSb) {
        document.querySelectorAll('.approve-course-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (hasSb) await sb.updateCourse(btn.dataset.id, { is_approved: true })
                renderUI('courses')
            })
        })
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف الكورس؟')) return
                if (hasSb) await sb.deleteCourse(btn.dataset.id)
                renderUI('courses')
            })
        })
    }

    /* ---- REVENUE ---- */
    async function renderRevenue(hasSb) {
        let revenues = [], total = 0, totalAcademy = 0, totalTeacher = 0
        if (hasSb) {
            revenues = await sb.getAllRevenues()
            total = revenues.reduce((s, r) => s + (r.amount || 0), 0)
            totalAcademy = revenues.reduce((s, r) => s + (r.academy_share || 0), 0)
            totalTeacher = revenues.reduce((s, r) => s + (r.teacher_share || 0), 0)
        }
        const unpaid = revenues.filter(r => r.status === 'pending').reduce((s, r) => s + (r.teacher_share || 0), 0)
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">$${total}</div><p class="label">إجمالي الإيرادات</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">$${totalAcademy}</div><p class="label">حصة الأكاديمية (30%)</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">$${totalTeacher}</div><p class="label">حصة المعلمين (70%)</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${unpaid}</div><p class="label">مستحق للمعلمين</p></div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>المعلم</th><th>الكورس</th><th>المبلغ</th><th>حصة الأكاديمية</th><th>حصة المعلم</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>${revenues.length ? revenues.map(r => `
                        <tr>
                            <td>${esc(r.teacher?.full_name || '')}</td>
                            <td style="font-size:0.85rem;">${esc(r.course?.title || '')}</td>
                            <td>$${r.amount || 0}</td>
                            <td style="color:#00D4FF;">$${r.academy_share || 0}</td>
                            <td style="color:#10b981;font-weight:700;">$${r.teacher_share || 0}</td>
                            <td>${r.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">معلق</span>'}</td>
                            <td>${r.status === 'pending' ? `<button class="ag-btn pay-revenue-btn" data-id="${r.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(16,185,129,0.15);color:#10b981;">تأكيد الدفع</button>` : '-'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد معاملات</td></tr>'}</tbody>
                </table>
            </div>
        `
    }

    /* ---- CERTIFICATES ---- */
    async function renderCertificates(hasSb) {
        let allCerts = []
        if (hasSb) allCerts = await sb.getAllCertificates()
        return `
            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${allCerts.length}</div><p class="label">إجمالي الشهادات المصدرة</p></div>
            </div>
            ${allCerts.length ? `<div class="table-wrap">
                <table>
                    <thead><tr><th>الطالب</th><th>البريد</th><th>الكورس</th><th>رمز الشهادة</th><th>تاريخ الإصدار</th><th>التحقق</th></tr></thead>
                    <tbody>${allCerts.map(c => `
                        <tr>
                            <td><strong>${esc(c.student?.full_name || '')}</strong></td>
                            <td style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${esc(c.student?.email || '')}</td>
                            <td style="font-size:0.85rem;">${esc(c.course?.title || '')}</td>
                            <td style="font-family:monospace;font-size:0.8rem;color:#FBBF24;">${esc(c.certificate_code || '')}</td>
                            <td style="font-size:0.8rem;">${c.issue_date ? new Date(c.issue_date).toLocaleDateString('ar') : '-'}</td>
                            <td><a href="/verify-certificate.html?code=${esc(c.certificate_code || '')}" target="_blank" class="ag-btn" style="padding:4px 10px;font-size:0.7rem;display:inline-flex;"><i class="fa-solid fa-external-link"></i> تحقق</a></td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>` : '<div class="empty-state"><i class="fa-solid fa-certificate"></i><p>لم يتم إصدار أي شهادات بعد</p></div>'}
        `
    }

    /* ---- SCHOLARSHIPS ---- */
    async function renderScholarships(hasSb) {
        const list = window.db.getScholarships()
        return `
            <div class="action-bar">
                <button class="ag-btn" id="openScholarshipModal"><i class="fa-solid fa-plus"></i> منحة جديدة</button>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>العنوان</th><th>الدولة</th><th>الجامعة</th><th>التمويل</th><th>الموعد</th><th>الإجراءات</th></tr></thead>
                    <tbody>${list.length ? list.map(s => `
                        <tr>
                            <td><strong>${esc(s.title)}</strong></td>
                            <td>${esc(s.country || '')}</td>
                            <td style="font-size:0.8rem;">${esc(s.university || '')}</td>
                            <td>${esc(s.funding || '')}</td>
                            <td>${esc(s.deadline || '')}</td>
                            <td style="display:flex;gap:6px;">
                                <button class="ag-btn edit-scholarship-btn" data-id="${s.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(168,85,247,0.12);color:#A855F7;">تعديل</button>
                                <button class="ag-btn delete-scholarship-btn" data-id="${s.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.12);color:#ff4d4d;">حذف</button>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد منح بعد</td></tr>'}</tbody>
                </table>
            </div>
            <!-- Scholarship Modal -->
            <div class="modal-overlay" id="scholarshipModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:520px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="scholarshipModalTitle">إضافة منحة</h3>
                        <button id="closeScholarshipModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="scholarshipForm">
                        <input type="hidden" id="editScholarshipId">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">عنوان المنحة</label><input type="text" id="schTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الدولة</label><input type="text" id="schCountry" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الجامعة</label><input type="text" id="schUniv" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        </div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">التمويل</label><input type="text" id="schFunding" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الموعد النهائي</label><input type="text" id="schDeadline" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" placeholder="January 2026"></div>
                        </div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">رابط الصورة</label><input type="url" id="schImage" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" value="https://picsum.photos/seed/scholarship/400/250"></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    function bindScholarshipEvents(hasSb) {
        const modal = document.getElementById('scholarshipModal')
        if (!modal) return
        document.getElementById('openScholarshipModal').onclick = () => {
            modal.style.display = 'flex'
            document.getElementById('scholarshipModalTitle').textContent = 'إضافة منحة'
            document.getElementById('editScholarshipId').value = ''
            document.getElementById('scholarshipForm').reset()
        }
        document.getElementById('closeScholarshipModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        document.querySelectorAll('.edit-scholarship-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = window.db.getScholarships().find(x => x.id == btn.dataset.id)
                if (!s) return
                document.getElementById('scholarshipModalTitle').textContent = 'تعديل المنحة'
                document.getElementById('editScholarshipId').value = s.id
                document.getElementById('schTitle').value = s.title || ''
                document.getElementById('schCountry').value = s.country || ''
                document.getElementById('schUniv').value = s.university || ''
                document.getElementById('schFunding').value = s.funding || ''
                document.getElementById('schDeadline').value = s.deadline || ''
                document.getElementById('schImage').value = s.image || ''
                modal.style.display = 'flex'
            })
        })

        document.querySelectorAll('.delete-scholarship-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('حذف المنحة؟')) return
                window.db.deleteScholarship(btn.dataset.id)
                renderUI('scholarships')
            })
        })

        document.getElementById('scholarshipForm').onsubmit = (e) => {
            e.preventDefault()
            const editId = document.getElementById('editScholarshipId').value
            const data = {
                title: document.getElementById('schTitle').value,
                country: document.getElementById('schCountry').value,
                university: document.getElementById('schUniv').value,
                funding: document.getElementById('schFunding').value,
                deadline: document.getElementById('schDeadline').value,
                image: document.getElementById('schImage').value
            }
            if (editId) window.db.updateScholarship(editId, data)
            else window.db.addScholarship(data)
            modal.style.display = 'none'
            renderUI('scholarships')
        }
    }

    /* ---- COLLABORATIONS ---- */
    async function renderCollaborations(hasSb) {
        const list = window.db.getCollaborations()
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>التخصص</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>${list.length ? list.map(c => `
                        <tr>
                            <td><strong>${esc(c.name || c.fullName || '')}</strong></td>
                            <td style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${esc(c.email || '')}</td>
                            <td>${esc(c.phone || '')}</td>
                            <td>${esc(c.specialty || c.specialization || '')}</td>
                            <td>${c.status === 'approved' ? '<span style="color:#10b981;">مقبول</span>' : c.status === 'rejected' ? '<span style="color:#ff4d4d;">مرفوض</span>' : '<span style="color:#FBBF24;">قيد المراجعة</span>'}</td>
                            <td style="display:flex;gap:6px;">
                                ${c.status !== 'approved' ? `<button class="ag-btn approve-collab-btn" data-id="${c.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(16,185,129,0.15);color:#10b981;">قبول</button>` : ''}
                                ${c.status !== 'rejected' ? `<button class="ag-btn reject-collab-btn" data-id="${c.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.15);color:#ff4d4d;">رفض</button>` : ''}
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد طلبات تعاون</td></tr>'}</tbody>
                </table>
            </div>
        `
    }

    function bindCollaborationEvents(hasSb) {
        document.querySelectorAll('.approve-collab-btn').forEach(btn => {
            btn.addEventListener('click', () => { window.db.updateCollaboration(btn.dataset.id, { status: 'approved' }); renderUI('collaborations') })
        })
        document.querySelectorAll('.reject-collab-btn').forEach(btn => {
            btn.addEventListener('click', () => { window.db.updateCollaboration(btn.dataset.id, { status: 'rejected' }); renderUI('collaborations') })
        })
    }

    /* ---- WITHDRAWALS ---- */
    async function renderWithdrawals(hasSb) {
        let requests = []
        if (hasSb) {
            const { data } = await sb.getClient().from('withdrawal_requests').select('*, teacher:teacher_id(full_name, email)').order('created_at', { ascending: false })
            requests = data || []
        } else {
            requests = window.db.getSettlementRequests()
        }
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>المعلم</th><th>البريد</th><th>المبلغ</th><th>تاريخ الطلب</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                    <tbody>${requests.length ? requests.map(r => `
                        <tr>
                            <td><strong>${esc(r.teacher?.full_name || r.teacherName || '')}</strong></td>
                            <td style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${esc(r.teacher?.email || r.teacherEmail || '')}</td>
                            <td style="font-weight:700;color:#10b981;">$${r.amount || 0}</td>
                            <td style="font-size:0.8rem;">${r.created_at ? new Date(r.created_at).toLocaleDateString('ar') : '-'}</td>
                            <td>${r.status === 'approved' ? '<span style="color:#10b981;">معتمد</span>' : r.status === 'rejected' ? '<span style="color:#ff4d4d;">مرفوض</span>' : '<span style="color:#FBBF24;">معلق</span>'}</td>
                            <td style="display:flex;gap:6px;">
                                ${r.status === 'pending' ? `<button class="ag-btn approve-withdrawal-btn" data-id="${r.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(16,185,129,0.15);color:#10b981;">موافقة</button>
                                <button class="ag-btn reject-withdrawal-btn" data-id="${r.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.15);color:#ff4d4d;">رفض</button>` : '-'}
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد طلبات سحب</td></tr>'}</tbody>
                </table>
            </div>
        `
    }

    function bindWithdrawalEvents(hasSb) {
        document.querySelectorAll('.approve-withdrawal-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (hasSb) await sb.getClient().from('withdrawal_requests').update({ status: 'approved', processed_at: new Date().toISOString() }).eq('id', btn.dataset.id)
                else window.db.approveSettlementRequest(btn.dataset.id)
                renderUI('withdrawals')
            })
        })
        document.querySelectorAll('.reject-withdrawal-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (hasSb) await sb.getClient().from('withdrawal_requests').update({ status: 'rejected' }).eq('id', btn.dataset.id)
                else window.db.rejectSettlementRequest(btn.dataset.id)
                renderUI('withdrawals')
            })
        })
    }

    /* ---- NOTIFICATIONS ---- */
    async function renderNotifications(hasSb) {
        let notifs = []
        if (hasSb) {
            const { data } = await sb.getClient().from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
            notifs = data || []
        } else {
            notifs = window.db.getNotifications()
        }
        return `
            <div class="action-bar">
                <button class="ag-btn" id="openNotifModal"><i class="fa-solid fa-plus"></i> إشعار جديد</button>
                <button class="ag-btn ag-btn-outline" id="clearAllNotifs" style="padding:10px 22px;font-size:0.85rem;background:rgba(255,77,77,0.1);color:#ff4d4d;border:none;"><i class="fa-solid fa-trash"></i> مسح الكل</button>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>العنوان</th><th>الرسالة</th><th>النوع</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                    <tbody>${notifs.length ? notifs.map(n => `
                        <tr>
                            <td><strong>${esc(n.title || '')}</strong></td>
                            <td style="font-size:0.8rem;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(n.message || '')}</td>
                            <td><span style="color:#A855F7;">${esc(n.type || 'system')}</span></td>
                            <td style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${n.created_at ? new Date(n.created_at).toLocaleDateString('ar') : '-'}</td>
                            <td>${n.is_read ? '<span style="color:rgba(255,255,255,0.3);">مقروء</span>' : '<span style="color:#00D4FF;">جديد</span>'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد إشعارات</td></tr>'}</tbody>
                </table>
            </div>
            <!-- Notification Modal -->
            <div class="modal-overlay" id="notifModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:480px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;">إرسال إشعار</h3>
                        <button id="closeNotifModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="notifForm">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">المستلم</label><select id="nRecipient" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="all">جميع المستخدمين</option><option value="students">جميع الطلاب</option><option value="teachers">جميع المعلمين</option></select></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">العنوان</label><input type="text" id="nTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الرسالة</label><textarea id="nMessage" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:100px;" required></textarea></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-paper-plane"></i> إرسال</button>
                    </form>
                </div>
            </div>
        `
    }

    function bindNotificationEvents(hasSb) {
        const modal = document.getElementById('notifModal')
        if (!modal) return
        document.getElementById('openNotifModal').onclick = () => modal.style.display = 'flex'
        document.getElementById('closeNotifModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        document.getElementById('clearAllNotifs')?.addEventListener('click', () => {
            if (!confirm('مسح جميع الإشعارات؟')) return
            window.db.clearAllNotifications()
            renderUI('notifications')
        })

        document.getElementById('notifForm').onsubmit = async (e) => {
            e.preventDefault()
            const title = document.getElementById('nTitle').value
            const message = document.getElementById('nMessage').value
            const recipient = document.getElementById('nRecipient').value

            if (hasSb) {
                let users = []
                if (recipient === 'all') users = await sb.getAllProfiles()
                else users = (await sb.getAllProfiles()).filter(p => p.role === (recipient === 'students' ? 'student' : 'teacher'))
                for (const u of users) {
                    await sb.createNotification({ user_id: u.id, title, message, type: 'admin' })
                }
                const count = users.length
                alert(`تم إرسال الإشعار إلى ${count} مستخدم ✓`)
            } else {
                if (recipient === 'all') window.db.addNotification({ title, message, type: 'admin', user_id: 'all' })
                else window.db.addNotification({ title, message, type: 'admin', user_id: recipient })
                alert('تم إرسال الإشعار ✓')
            }
            modal.style.display = 'none'
            renderUI('notifications')
        }
    }

    /* ---- SETTINGS ---- */
    async function renderSettings(hasSb) {
        let settings = {}
        if (hasSb) settings = await sb.getSettings()
        else settings = window.db.getSettings()
        return `
            <div class="dash-card" style="max-width:600px;">
                <h4>إعدادات المنصة</h4>
                <form id="settingsForm">
                    <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">اسم الموقع</label><input type="text" id="sSiteName" value="${esc(settings.site_name || settings.siteName || 'LookaGenius')}" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                    <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">وصف الموقع</label><input type="text" id="sSiteDesc" value="${esc(settings.site_description || settings.siteDescription || '')}" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                    <div style="display:flex;gap:12px;">
                        <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">واتساب</label><input type="text" id="sWhatsapp" value="${esc(settings.whatsapp || '')}" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">البريد</label><input type="email" id="sEmail" value="${esc(settings.email || '')}" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                    </div>
                    <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">نسبة الأكاديمية (%)</label><input type="number" id="sShare" value="${settings.academy_share_percent || 30}" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="0" max="100"></div>
                    <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ الإعدادات</button>
                </form>
            </div>
        `
    }

    function bindSettingsEvents(hasSb) {
        document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
            e.preventDefault()
            const data = {
                site_name: document.getElementById('sSiteName').value,
                site_description: document.getElementById('sSiteDesc').value,
                whatsapp: document.getElementById('sWhatsapp').value,
                email: document.getElementById('sEmail').value,
                academy_share_percent: parseFloat(document.getElementById('sShare').value) || 30
            }
            if (hasSb) await sb.updateSettings(data)
            else window.db.updateSettings({
                siteName: data.site_name,
                siteDescription: data.site_description,
                whatsapp: data.whatsapp,
                email: data.email
            })
            alert('تم حفظ الإعدادات ✓')
        })
    }

    /* ---- NEXTGEN: Platform Analytics ---- */
    function renderPlatformAnalytics() {
        const container = document.createElement('div')
        container.id = 'ngAnalyticsContainer'
        document.body.appendChild(container)
        setTimeout(() => {
            if (NextGen.Analytics) NextGen.Analytics.renderPlatformAnalytics('ngAnalyticsContainer')
            else container.innerHTML = '<p style="color:#666;padding:40px;text-align:center">Analytics module not loaded</p>'
        }, 100)
        return `<div id="ngAnalyticsContainer"></div>`
    }

    /* ---- NEXTGEN: Payments ---- */
    function renderPayments() {
        const payments = NextGen.DB ? NextGen.DB.getPayments().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
        const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
        const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0)
        return `
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${payments.filter(p=>p.status==='paid').length}</div><p class="label">مدفوع</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${payments.filter(p=>p.status==='pending').length}</div><p class="label">معلق</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${NextGen.UI ? NextGen.UI.formatCurrency(totalPaid, 'EGP') : totalPaid}</div><p class="label">إجمالي المدفوع</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${NextGen.UI ? NextGen.UI.formatCurrency(totalPending, 'EGP') : totalPending}</div><p class="label">إجمالي المعلق</p></div>
            </div>
            ${payments.length ? `<div class="table-wrap"><table>
                <thead><tr><th>المستخدم</th><th>الوصف</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                <tbody>${payments.map(p => `<tr>
                    <td>${esc(p.userId || '')}</td>
                    <td style="font-size:0.85rem;">${esc(p.description || '')}</td>
                    <td style="font-weight:700;color:${p.status === 'paid' ? '#10b981' : '#FBBF24'}">${p.amount || 0} ${p.currency || 'EGP'}</td>
                    <td>${esc(p.method || '-')}</td>
                    <td>${p.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">معلق</span>'}</td>
                    <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar') : '-'}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-credit-card"></i><p>لا توجد مدفوعات</p></div>'}
        `
    }

    /* ---- NEXTGEN: Learning Paths ---- */
    function renderPaths() {
        return `<div id="ngPathsContainer"></div>`
    }

    /* ---- NEXTGEN: Messages ---- */
    function renderMessages() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const messages = (d.messages || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const users = d.users || []
        const conversations = {}
        messages.forEach(m => {
            const key = [m.from, m.to].sort().join('|')
            if (!conversations[key]) conversations[key] = { users: [m.from, m.to], lastMsg: m, count: 0 }
            conversations[key].count++
            if (new Date(m.createdAt) > new Date(conversations[key].lastMsg.createdAt)) conversations[key].lastMsg = m
        })
        return `
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${messages.length}</div><p class="label">إجمالي الرسائل</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${Object.keys(conversations).length}</div><p class="label">المحادثات</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${messages.filter(m => !m.read).length}</div><p class="label">غير مقروء</p></div>
            </div>
            <div class="table-wrap"><table>
                <thead><tr><th>المحادثة</th><th>آخر رسالة</th><th>الرسائل</th><th>التاريخ</th></tr></thead>
                <tbody>${Object.values(conversations).length ? Object.values(conversations).map(c => {
                    const u1 = users.find(u => u.id == c.users[0] || u.email === c.users[0])
                    const u2 = users.find(u => u.id == c.users[1] || u.email === c.users[1])
                    return `<tr>
                        <td><strong>${esc(u1?.name || u1?.email || c.users[0])}</strong> ↔ <strong>${esc(u2?.name || u2?.email || c.users[1])}</strong></td>
                        <td style="font-size:0.8rem;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.5)">${esc(c.lastMsg.text || '')}</td>
                        <td>${c.count}</td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${c.lastMsg.createdAt ? new Date(c.lastMsg.createdAt).toLocaleDateString('ar') : '-'}</td>
                    </tr>`
                }).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">لا توجد رسائل</td></tr>'}</tbody>
            </table></div>
        `
    }

    /* ---- NEXTGEN: Forums ---- */
    function renderForums() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const threads = (d.threads || []).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        const courses = d.courses || []
        return `
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${threads.length}</div><p class="label">إجمالي النقاشات</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${threads.reduce((s, t) => s + (t.repliesList?.length || 0), 0)}</div><p class="label">الردود</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${new Set(threads.map(t => t.authorId)).size}</div><p class="label">المشاركون</p></div>
            </div>
            ${threads.length ? `<div class="table-wrap"><table>
                <thead><tr><th>العنوان</th><th>الكورس</th><th>الكاتب</th><th>الردود</th><th>آخر نشاط</th></tr></thead>
                <tbody>${threads.map(t => {
                    const course = courses.find(c => c.id == t.courseId)
                    return `<tr>
                        <td><strong>${esc(t.title)}</strong></td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${esc(course?.title || t.courseId || '')}</td>
                        <td>${esc(t.author || '')}</td>
                        <td>${t.replies || 0}</td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${t.lastActivity ? new Date(t.lastActivity).toLocaleDateString('ar') : '-'}</td>
                    </tr>`
                }).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-comments"></i><p>لا توجد مناقشات</p></div>'}
        `
    }

    /* ---- NEXTGEN: Live Classes ---- */
    function renderLiveClasses() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const classes = (d.liveClasses || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const courses = d.courses || []
        return `
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #22c55e;"><div class="num" style="color:#22c55e;">${classes.filter(lc => new Date(lc.startTime) > new Date()).length}</div><p class="label">القادمة</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${classes.length}</div><p class="label">الإجمالي</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${classes.filter(lc => new Date(lc.startTime) < new Date() && lc.status !== 'cancelled').length}</div><p class="label">المنتهية</p></div>
            </div>
            ${classes.length ? `<div class="table-wrap"><table>
                <thead><tr><th>العنوان</th><th>الكورس</th><th>التوقيت</th><th>المنصة</th><th>الحالة</th><th>المنشئ</th></tr></thead>
                <tbody>${classes.map(lc => {
                    const course = courses.find(c => c.id == lc.courseId)
                    const start = new Date(lc.startTime)
                    const isLive = start <= new Date() && new Date(lc.endTime) >= new Date()
                    return `<tr>
                        <td><strong>${esc(lc.title)}</strong></td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${esc(course?.title || '')}</td>
                        <td style="font-size:0.8rem">${start.toLocaleDateString('ar')} ${start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                        <td>${esc(lc.platform || '-')}</td>
                        <td>${isLive ? '<span style="color:#22c55e;">🔴 مباشر</span>' : start > new Date() ? '<span style="color:#00D4FF;">مجدول</span>' : '<span style="color:rgba(255,255,255,0.3);">منتهي</span>'}</td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${esc(lc.createdBy || '')}</td>
                    </tr>`
                }).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-video"></i><p>لا توجد حصص مباشرة</p></div>'}
        `
    }

    /* ---- NEXTGEN: Coupons ---- */
    function renderCoupons() {
        const coupons = NextGen.DB ? NextGen.DB.getCoupons() : []
        return `
            <div class="action-bar">
                <button class="ag-btn" id="openCouponModal"><i class="fa-solid fa-plus"></i> كوبون جديد</button>
            </div>
            ${coupons.length ? `<div class="table-wrap"><table>
                <thead><tr><th>الكود</th><th>الخصم</th><th>النوع</th><th>الاستخدامات</th><th>الصلاحية</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>${coupons.map(c => `<tr>
                    <td><strong style="color:#00D4FF;font-family:monospace">${esc(c.code)}</strong></td>
                    <td style="font-weight:700;color:#FBBF24">${c.discount}${c.type === 'percent' ? '%' : ' EGP'}</td>
                    <td>${c.type === 'percent' ? 'نسبة' : 'قيمة'}</td>
                    <td>${c.usedCount || 0}${c.maxUses ? `/${c.maxUses}` : ''}</td>
                    <td style="font-size:0.8rem">${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('ar') : 'غير محدد'}</td>
                    <td>${c.active !== false ? '<span style="color:#10b981;">نشط</span>' : '<span style="color:#ff4d4d;">معطل</span>'}</td>
                    <td><button class="ag-btn toggle-coupon-btn" data-id="${c.id}" data-active="${c.active !== false}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.12);color:#ff4d4d;">${c.active !== false ? 'تعطيل' : 'تفعيل'}</button></td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-tags"></i><p>لا توجد كوبونات</p></div>'}
            <!-- Coupon Modal -->
            <div class="modal-overlay" id="couponModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:480px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;">إضافة كوبون</h3>
                        <button id="closeCouponModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="couponForm">
                        <div style="display:flex;gap:12px;margin-bottom:15px">
                            <div style="flex:1"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الكود</label><input type="text" id="cCode" required style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                            <div style="flex:1"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">القيمة</label><input type="number" id="cDiscount" min="0" required style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        </div>
                        <div style="display:flex;gap:12px;margin-bottom:15px">
                            <div style="flex:1"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">النوع</label><select id="cType" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(20,20,40,0.95);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="percent">نسبة %</option><option value="fixed">قيمة ثابتة</option></select></div>
                            <div style="flex:1"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الحد الأقصى</label><input type="number" id="cMaxUses" min="0" placeholder="غير محدد" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        </div>
                        <div style="margin-bottom:15px"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">تاريخ الانتهاء</label><input type="date" id="cExpires" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    function bindOverviewChart(hasSb) {
        const canvas = document.getElementById('adminUsersChart')
        if (!canvas || !window.Chart) return
        try {
            const users = hasSb ? [] : window.db.getUsers()
            const roles = { student: 0, teacher: 0, parent: 0, engineer: 0, accountant: 0, admin: 0 }
            users.forEach(u => { if (roles[u.type] !== undefined) roles[u.type]++ })
            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['طلاب', 'معلمين', 'أولياء أمور', 'مهندسين', 'محاسبين', 'إداريين'],
                    datasets: [{
                        data: [roles.student, roles.teacher, roles.parent, roles.engineer, roles.accountant, roles.admin],
                        backgroundColor: ['#00D4FF', '#A855F7', '#22c55e', '#FF6432', '#FBBF24', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ccc', padding: 15, font: { size: 12 } } } } }
            })
        } catch(e) {}
    }

    function bindCouponEvents() {
        const modal = document.getElementById('couponModal')
        if (!modal) return
        document.getElementById('openCouponModal')?.addEventListener('click', () => { modal.style.display = 'flex'; document.getElementById('couponForm').reset() })
        document.getElementById('closeCouponModal')?.addEventListener('click', () => modal.style.display = 'none')
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })
        document.getElementById('couponForm')?.addEventListener('submit', (e) => {
            e.preventDefault()
            NextGen.DB.addCoupon({
                code: document.getElementById('cCode').value.toUpperCase(),
                discount: parseFloat(document.getElementById('cDiscount').value),
                type: document.getElementById('cType').value,
                maxUses: parseInt(document.getElementById('cMaxUses').value) || null,
                expiresAt: document.getElementById('cExpires').value || null,
                active: true,
                usedCount: 0
            })
            modal.style.display = 'none'
            renderUI('coupons')
        })
        document.querySelectorAll('.toggle-coupon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id
                const active = btn.dataset.active === 'true'
                NextGen.DB.updateCoupon(id, { active: !active })
                renderUI('coupons')
            })
        })
    }

    /* ---- NEXTGEN: Reviews ---- */
    function renderReviews() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const reviews = (d.reviews || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const courses = d.courses || []
        const users = d.users || []
        const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0
        return `
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${reviews.length}</div><p class="label">إجمالي التقييمات</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${avgRating.toFixed(1)}</div><p class="label">متوسط التقييم</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${new Set(reviews.map(r => r.courseId)).size}</div><p class="label">كورسات مقيمة</p></div>
            </div>
            ${reviews.length ? `<div class="table-wrap"><table>
                <thead><tr><th>الطالب</th><th>الكورس</th><th>التقييم</th><th>التعليق</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                <tbody>${reviews.map(r => {
                    const course = courses.find(c => c.id == r.courseId)
                    const student = users.find(u => u.id == r.userId)
                    let stars = ''
                    for (let i = 1; i <= 5; i++) stars += `<i class="fa-solid fa-star" style="color:${i <= r.rating ? '#FBBF24' : 'rgba(255,255,255,0.2)'};font-size:12px"></i>`
                    return `<tr>
                        <td>${esc(student?.name || r.userId || '')}</td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${esc(course?.title || '')}</td>
                        <td>${stars}</td>
                        <td style="font-size:0.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,255,255,0.5)">${esc(r.comment || '')}</td>
                        <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar') : '-'}</td>
                        <td><button class="ag-btn delete-review-btn" data-id="${r.id}" style="padding:4px 10px;font-size:0.7rem;background:rgba(255,77,77,0.12);color:#ff4d4d;">حذف</button></td>
                    </tr>`
                }).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-star"></i><p>لا توجد تقييمات</p></div>'}
        `
    }

    renderUI().catch(err => {
        console.error('[admin] initial renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل لوحة التحكم</p><button class="ag-btn" onclick="location.reload()" style="margin-top:20px;">إعادة المحاولة</button></div>'
    })
})

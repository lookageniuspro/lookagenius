/**
 * dashboard-admin.js — Full admin control panel
 * Sections: Overview | Users | Courses | Revenue | Certificates | Settings
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'admin') return

    const user = window.auth.currentUser
    const sb = window.supabaseApp

    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML }
    async function ensureSb() { return sb && sb.isReady() }

    async function renderUI(section) {
        const hasSb = await ensureSb()
        section = section || 'overview'

        const sidebar = `
            <li><a href="#" class="${section === 'overview' ? 'active' : ''}" data-section="overview"><i class="fa-solid fa-chart-line"></i> نظرة عامة</a></li>
            <li><a href="#" class="${section === 'users' ? 'active' : ''}" data-section="users"><i class="fa-solid fa-users-gear"></i> المستخدمين</a></li>
            <li><a href="#" class="${section === 'courses' ? 'active' : ''}" data-section="courses"><i class="fa-solid fa-book"></i> الكورسات</a></li>
            <li><a href="#" class="${section === 'revenue' ? 'active' : ''}" data-section="revenue"><i class="fa-solid fa-money-bill"></i> الأرباح</a></li>
            <li><a href="#" class="${section === 'certificates' ? 'active' : ''}" data-section="certificates"><i class="fa-solid fa-certificate"></i> الشهادات</a></li>
            <li><a href="#" class="${section === 'settings' ? 'active' : ''}" data-section="settings"><i class="fa-solid fa-gear"></i> الإعدادات</a></li>
        `

        let content = ''
        if (section === 'overview') content = await renderOverview(hasSb)
        else if (section === 'users') content = await renderUsers(hasSb)
        else if (section === 'courses') content = await renderCourses(hasSb)
        else if (section === 'revenue') content = await renderRevenue(hasSb)
        else if (section === 'certificates') content = await renderCertificates(hasSb)
        else if (section === 'settings') content = await renderSettings(hasSb)

        const container = document.getElementById('dashboardContent')
        if (!container) return
        container.innerHTML = renderDashboardLayout('لوحة تحكم الأدمن', sidebar, content)
        bindLogout()
        bindNav()
        if (section === 'users') bindUserEvents(hasSb)
        if (section === 'courses') bindCourseEvents(hasSb)
        if (section === 'settings') bindSettingsEvents(hasSb)
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => { e.preventDefault(); renderUI(link.dataset.section) })
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
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${totalUsers}</div><p class="label">إجمالي المستخدمين</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${studentsCount}</div><p class="label">الطلاب</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${teachersCount}</div><p class="label">المعلمين</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${totalCourses}</div><p class="label">الكورسات</p></div>
            </div>
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #FF3366;"><div class="num" style="color:#FF3366;">$${totalRevenue}</div><p class="label">إجمالي الإيرادات</p></div>
                <div class="stat-card" style="border-top:3px solid #00FFAA;"><div class="num" style="color:#00FFAA;">${totalCerts}</div><p class="label">الشهادات الصادرة</p></div>
            </div>
            <div class="dash-card">
                <h4><i class="fa-solid fa-chart-simple" style="color:#00D4FF;"></i> توزيع المستخدمين</h4>
                <canvas id="adminUsersChart" style="height:250px;margin-top:15px;"></canvas>
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

    renderUI()
})

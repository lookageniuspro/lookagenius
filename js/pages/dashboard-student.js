/**
 * dashboard-student.js — Supabase + localStorage dual source
 * Sections: Home | Catalog | My Courses | Lesson Player | Quizzes | Certificates
 */
document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.ready
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'student') { window.location.href = 'login.html'; return }

    const user = window.auth.currentUser
    const sb = window.supabaseApp
    const CART_KEY = 'lookagenius_cart'
    let currentCourseId = null, currentLessonId = null, currentAssessmentId = null, quizState = null

    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML }
    function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch(e) { return [] } }
    function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }
    function cartCount() { return getCart().length }

    async function ensureSb() {
        if (sb && sb.isReady() && window.auth.currentUser?.supabase) return true
        return false
    }

    async function renderUI(section) {
        try {
        const hasSb = await ensureSb()
        section = section || 'home'

        /* Get enrolled courses both from Supabase and localStorage */
        let enrolledSupabase = [], enrolledLocal = []
        if (hasSb) {
            const enrolls = await sb.getStudentEnrollments(user.id)
            enrolledSupabase = enrolls.map(e => e.course).filter(Boolean)
        }
        enrolledLocal = window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(user.id))

        const allCourses = hasSb ? await sb.getPublishedCourses() : window.db.getCourses()
        const enrolled = enrolledSupabase.length ? enrolledSupabase : enrolledLocal
        const invoices = window.db.getInvoicesForUser(user.id)
        const attStats = window.db.getStudentAttendanceStats(user.id)

        const sidebar = `
            <li><a href="#" class="${section === 'home' ? 'active' : ''}" data-section="home"><i class="fa-solid fa-house"></i> الرئيسية</a></li>
            <li><a href="#" class="${section === 'notifications' ? 'active' : ''}" data-section="notifications"><i class="fa-solid fa-bell"></i> الإشعارات ${window.db.getUnreadNotificationsCount ? (window.db.getUnreadNotificationsCount() > 0 ? `<span class="badge">${window.db.getUnreadNotificationsCount()}</span>` : '') : ''}</a></li>
            <li><a href="#" class="${section === 'catalog' ? 'active' : ''}" data-section="catalog"><i class="fa-solid fa-store"></i> المتجر</a></li>
            <li><a href="#" class="${section === 'mycourses' ? 'active' : ''}" data-section="mycourses"><i class="fa-solid fa-book"></i> كورساتي ${enrolled.length ? `<span class="badge">${enrolled.length}</span>` : ''}</a></li>
            <li><a href="#" class="${section === 'assignments' ? 'active' : ''}" data-section="assignments"><i class="fa-solid fa-file-pen"></i> الواجبات</a></li>
            <li><a href="#" class="${section === 'forum' ? 'active' : ''}" data-section="forum"><i class="fa-solid fa-comments"></i> المناقشات</a></li>
            <li><a href="#" class="${section === 'live' ? 'active' : ''}" data-section="live"><i class="fa-solid fa-video"></i> الحصص المباشرة</a></li>
            <li><a href="#" class="${section === 'leaderboard' ? 'active' : ''}" data-section="leaderboard"><i class="fa-solid fa-trophy"></i> المتصدرون</a></li>
            <li><a href="#" class="${section === 'wallet' ? 'active' : ''}" data-section="wallet"><i class="fa-solid fa-wallet"></i> المحفظة</a></li>
            <li><a href="#" class="${section === 'certificates' ? 'active' : ''}" data-section="certificates"><i class="fa-solid fa-certificate"></i> الشهادات</a></li>
            <li><a href="#" class="${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice"></i> الفواتير</a></li>
        `

        let content = ''
        if (section === 'home') content = renderHome(enrolled, invoices, attStats) + (hasSb ? await renderRecommendations(hasSb) : '')
        else if (section === 'notifications') content = renderStudentNotifications()
        else if (section === 'catalog') content = renderCatalog(allCourses, enrolled)
        else if (section === 'mycourses') content = await renderMyCourses(enrolled, hasSb)
        else if (section === 'courseview') content = await renderCourseView(hasSb)
        else if (section === 'lessonview') content = await renderLessonView(hasSb)
        else if (section === 'quizview') content = await renderQuizView(hasSb)
        else if (section === 'quizresult') content = renderQuizResult()
        else if (section === 'assignments') content = renderStudentAssignments(enrolled)
        else if (section === 'forum') content = renderStudentForum(enrolled)
        else if (section === 'live') content = renderStudentLive(enrolled)
        else if (section === 'leaderboard') content = renderStudentLeaderboard()
        else if (section === 'wallet') content = renderStudentWallet()
        else if (section === 'certificates') content = await renderCertificates(hasSb)
        else if (section === 'invoices') content = renderInvoices(invoices)

        const container = document.getElementById('dashboardContent')
        if (!container) return
        container.innerHTML = renderDashboardLayout('لوحة تحكم الطالب', sidebar, content)
        bindLogout()
        bindNav()

        if (section === 'home') setTimeout(() => {
            const ctx = document.getElementById('studentProgressChart')
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                        datasets: [{
                            label: 'التقدم',
                            data: [65, 75, 70, 85, 90, attStats.rate || 70],
                            borderColor: '#00D4FF',
                            backgroundColor: 'rgba(0,212,255,0.08)',
                            fill: true, tension: 0.4,
                            pointBackgroundColor: '#00D4FF', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)' } } }
                    }
                })
            }
        }, 100)
        if (section === 'catalog') bindCatalogEvents(enrolled)
        if (section === 'mycourses') bindMyCourseEvents(hasSb)
        if (section === 'courseview') bindCourseViewEvents(hasSb)
        if (section === 'lessonview') bindLessonViewEvents(hasSb)
        if (section === 'quizview') bindQuizEvents(hasSb)
        if (section === 'certificates') setTimeout(bindCertEvents, 300)
    } catch(err) {
        console.error('[student] renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p></div>'
    }
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault()
                renderUI(link.dataset.section).catch(err => {
                    console.error('[student] renderUI error:', err)
                    const c = document.getElementById('dashboardContent')
                    if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p></div>'
                })
            })
        })
    }

    /* ---- HOME ---- */
    function renderHome(enrolled, invoices, attStats) {
        const paid = invoices.filter(i => i.status === 'paid')
        const totalPaid = paid.reduce((s, i) => s + (i.amount || 0), 0)
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${enrolled.length}</div><p class="label">الكورسات المسجلة</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${attStats.rate}%</div><p class="label">نسبة الحضور</p></div>
                <div class="stat-card" style="border-top:3px solid #FF3366;"><div class="num" style="color:#FF3366;">${invoices.filter(i => i.status === 'pending').length}</div><p class="label">الفواتير غير المدفوعة</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${totalPaid}</div><p class="label">إجمالي المدفوعات</p></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px;">
                <div class="dash-card"><h4><i class="fa-solid fa-chart-line" style="color:#00D4FF;"></i> مخطط التقدم</h4><canvas id="studentProgressChart" style="width:100%;height:200px;"></canvas></div>
                <div class="dash-card">
                    <h4><i class="fa-solid fa-clock" style="color:#A855F7;"></i> آخر النشاطات</h4>
                    ${enrolled.slice(0, 5).map(c => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;"><span>${esc(c.title)}</span><span style="color:rgba(255,255,255,0.3);font-size:0.75rem;">جاري</span></div>`).join('') || '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">لا توجد نشاطات</p>'}
                </div>
            </div>
            <h4 style="font-size:1rem;font-weight:800;margin:0 0 15px;"><i class="fa-solid fa-book-open" style="color:#00D4FF;"></i> كورساتي</h4>
            <div class="course-grid">${enrolled.length ? enrolled.slice(0, 6).map(c => courseCard(c)).join('') : '<div class="empty-state"><i class="fa-solid fa-book"></i><p>لم تشترك في أي كورس بعد. <a href="#" onclick="document.querySelector(\'[data-section=catalog]\')?.click();return false;" style="color:#00D4FF;">تصفح المتجر</a></p></div>'}</div>
        `
    }

    /* Recommendations (AI-powered) */
    async function renderRecommendations(hasSb) {
        if (!hasSb) return ''
        let recs = []
        try {
            if (window.studentLib) recs = await window.studentLib.getRecommendedCourses(4)
        } catch(e) {}
        if (!recs.length) return ''
        return `
            <h4 style="font-size:1rem;font-weight:800;margin:25px 0 15px;"><i class="fa-solid fa-robot" style="color:#A855F7;"></i> موصى به لك 🤖</h4>
            <div class="course-grid">${recs.map(c => `
                <div class="course-card-dash" style="cursor:pointer;">
                    <div class="img-wrap"><img src="${esc(c.cover_image || 'https://picsum.photos/seed/' + (c.id || 'r') + '/400/250')}" alt="" loading="lazy"><span class="badge">${esc(c.badge || c.category)}</span></div>
                    <div class="body">
                        <h4>${esc(c.title)}</h4>
                        <p class="meta">${esc(c.category)} ${c.price ? '| $' + c.price : ''}</p>
                        <button class="ag-btn enroll-btn" data-id="${c.id}" style="width:100%;justify-content:center;margin-top:12px;"><i class="fa-solid fa-cart-plus"></i> اشتراك</button>
                    </div>
                </div>
            `).join('')}</div>
        `
    }

    function courseCard(c) {
        return `<div class="course-card-dash">
            <div class="img-wrap"><img src="${esc(c.cover_image || c.image || 'https://picsum.photos/seed/course/400/250')}" alt="" loading="lazy"><span class="badge">${esc(c.badge || c.category)}</span></div>
            <div class="body">
                <h4>${esc(c.title)}</h4>
                <p class="meta">${esc(c.category)}</p>
                <div class="price">${c.currency || '$'}${c.price || 0}</div>
                <div class="progress-bar"><div class="fill" style="width:${Math.floor(Math.random() * 50) + 30}%;"></div></div>
            </div>
        </div>`
    }

    /* ---- CATALOG ---- */
    function renderCatalog(allCourses, enrolled) {
        const enrolledIds = enrolled.map(c => c.id)
        return `
            <div class="search-bar">
                <input type="text" id="catSearch" placeholder="ابحث عن كورس..." oninput="window._catFilter()">
                <select id="catFilter" onchange="window._catFilter()">
                    <option value="all">جميع التصنيفات</option>
                    <option value="languages">لغات</option><option value="science">علوم</option><option value="math">رياضيات</option>
                    <option value="tech">تقنية</option><option value="physics">فيزياء</option><option value="chemistry">كيمياء</option>
                    <option value="engineering">هندسة</option>
                </select>
            </div>
            <div class="course-grid" id="catalogGrid">
                ${allCourses.map(c => {
                    const isEnrolled = enrolledIds.includes(c.id)
                    return `<div class="course-card-dash" data-category="${c.category || ''}" data-title="${esc(c.title).toLowerCase()}">
                        <div class="img-wrap"><img src="${esc(c.cover_image || c.image || 'https://picsum.photos/seed/' + (c.id || 'c') + '/400/250')}" alt="" loading="lazy"><span class="badge">${esc(c.badge || c.category)}</span></div>
                        <div class="body">
                            <h4>${esc(c.title)}</h4>
                            <p class="meta">${esc(c.category)} ${c.duration ? '| ' + esc(c.duration) : ''}</p>
                            <div class="price">${c.currency || '$'}${c.price || 0}</div>
                            <div class="actions" style="display:flex;gap:10px;margin-top:14px;">
                                ${isEnrolled ? '<span class="ag-btn" style="flex:1;justify-content:center;background:rgba(16,185,129,0.2);color:#10b981;border:1px solid rgba(16,185,129,0.3);pointer-events:none;"><i class="fa-solid fa-check"></i> مسجل</span>' :
                                `<button class="ag-btn enroll-btn" data-id="${c.id || c.title}" style="flex:1;justify-content:center;"><i class="fa-solid fa-cart-plus"></i> اشتراك</button>`}
                            </div>
                        </div>
                    </div>`
                }).join('')}
            </div>
        `
    }

    window._catFilter = function() {
        const search = (document.getElementById('catSearch')?.value || '').toLowerCase()
        const cat = document.getElementById('catFilter')?.value || 'all'
        document.querySelectorAll('#catalogGrid .course-card-dash').forEach(card => {
            const title = (card.dataset.title || '')
            const category = (card.dataset.category || '')
            const matchSearch = title.includes(search)
            const matchCat = cat === 'all' || category === cat
            card.style.display = matchSearch && matchCat ? '' : 'none'
        })
    }

    function bindCatalogEvents(enrolled) {
        document.querySelectorAll('.enroll-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('تأكيد الاشتراك في هذا الكورس؟')) {
                    const hasSb = await ensureSb()
                    const courseId = btn.dataset.id
                    if (hasSb) {
                        /* Try Supabase enrollment */
                        const result = await sb.enrollStudent(user.id, courseId, 0, 'free')
                        if (result) alert('تم الاشتراك بنجاح ✓')
                    } else {
                        /* localStorage fallback */
                        const data = JSON.parse(localStorage.getItem('lookagenius_db')) || {}
                        const course = (data.courses || []).find(c => c.id === parseInt(courseId) || c.id === courseId)
                        if (course) {
                            if (!course.studentsEnrolled) course.studentsEnrolled = []
                            if (!course.studentsEnrolled.includes(user.id)) course.studentsEnrolled.push(user.id)
                            localStorage.setItem('lookagenius_db', JSON.stringify(data))
                            alert('تم الاشتراك بنجاح ✓')
                        }
                    }
                    renderUI('mycourses')
                }
            })
        })
    }

    /* ---- MY COURSES ---- */
    async function renderMyCourses(enrolled, hasSb) {
        return `
            <div class="course-grid">
                ${enrolled.length ? enrolled.map(c => `
                    <div class="course-card-dash" style="cursor:pointer;">
                        <div class="img-wrap" style="height:140px;">
                            <img src="${esc(c.cover_image || c.image || 'https://picsum.photos/seed/course/400/250')}" alt="" loading="lazy">
                            <span class="badge">${esc(c.badge || c.category)}</span>
                        </div>
                        <div class="body">
                            <h4>${esc(c.title)}</h4>
                            <p class="meta"><i class="fa-solid fa-tag"></i> ${esc(c.category)}</p>
                            <div class="progress-bar"><div class="fill" style="width:${Math.floor(Math.random() * 50) + 20}%;"></div></div>
                            <button class="ag-btn view-course-btn" data-id="${c.id}" style="width:100%;justify-content:center;margin-top:12px;padding:10px;"><i class="fa-solid fa-play"></i> بدء التعلم</button>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-book"></i><p>لم تشترك في أي كورس بعد</p></div>'}
            </div>
        `
    }

    function bindMyCourseEvents(hasSb) {
        document.querySelectorAll('.view-course-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCourseId = btn.dataset.id
                renderUI('courseview')
            })
        })
    }

    /* ---- COURSE VIEW (Modules + Lessons) ---- */
    async function renderCourseView(hasSb) {
        if (!currentCourseId) return '<div class="empty-state"><p>اختر كورساً</p></div>'
        let course, modules = [], assessments = []
        if (hasSb) {
            course = await sb.getCourseById(currentCourseId)
            modules = await sb.getCourseModules(currentCourseId)
            for (const m of modules) {
                m.lessons = await sb.getModuleLessons(m.id)
            }
            assessments = await sb.getCourseAssessments(currentCourseId)
        } else {
            course = window.db.getCourseById(parseInt(currentCourseId))
            const localMods = window.db.getCourseModules(currentCourseId)
            modules = localMods.map(m => ({ ...m, lessons: m.lessons }))
            assessments = window.db.getAssessments(currentCourseId).map(a => ({
                ...a,
                questions_count: window.db.getQuestions(a.id).length,
                time_limit: a.time_limit,
                passing_score: a.passing_score
            }))
        }
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=mycourses]').click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.2rem;">${esc(course?.title || '')}</h4>
            </div>
            ${course?.description ? '<p style="color:rgba(255,255,255,0.5);margin-bottom:25px;font-size:0.9rem;">' + esc(course.description) + '</p>' : ''}
            <div id="courseContent">
                ${modules.length ? modules.map((m, mi) => `
                    <div class="dash-card" style="margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                            <h4 style="margin:0;font-size:1rem;"><i class="fa-solid fa-folder-open" style="color:#00D4FF;"></i> ${mi + 1}. ${esc(m.title)}</h4>
                            <span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">${(m.lessons || []).length} دروس</span>
                        </div>
                        <div style="margin-top:15px;">
                            ${(m.lessons || []).length ? (m.lessons || []).map((l, li) => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.03);margin-bottom:6px;cursor:pointer;transition:0.2s;" class="lesson-item" data-lesson-id="${l.id}" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                    <div><i class="fa-solid fa-play-circle" style="color:${l.is_free ? '#10b981' : '#00D4FF'};margin-left:10px;"></i> ${esc(l.title)}</div>
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        ${l.duration ? '<span style="font-size:0.75rem;color:rgba(255,255,255,0.3);"><i class="fa-regular fa-clock"></i> ' + l.duration + ' د</span>' : ''}
                                        <span style="font-size:1rem;color:#00D4FF;"><i class="fa-solid fa-chevron-left"></i></span>
                                    </div>
                                </div>
                            `).join('') : '<p style="color:rgba(255,255,255,0.2);font-size:0.8rem;padding:10px;">لا توجد دروس في هذه الوحدة</p>'}
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-layer-group"></i><p>لم يتم إضافة محتوى لهذا الكورس بعد</p></div>'}
                ${assessments.length ? `
                    <h4 style="font-size:1rem;font-weight:800;margin:25px 0 15px;"><i class="fa-solid fa-file-pen" style="color:#A855F7;"></i> التقييمات</h4>
                    ${assessments.map(a => `
                        <div class="dash-card" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;">
                            <div>
                                <strong>${esc(a.title)}</strong>
                                <br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${a.questions_count || 0} أسئلة — ${a.time_limit || 0} دقيقة — حد النجاح ${a.passing_score || 0}%</span>
                            </div>
                            <button class="ag-btn start-quiz-btn" data-id="${a.id}" style="padding:8px 20px;font-size:0.85rem;"><i class="fa-solid fa-play"></i> بدء الاختبار</button>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `
    }

    function bindCourseViewEvents(hasSb) {
        document.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                currentLessonId = item.dataset.lessonId
                renderUI('lessonview')
            })
        })
        document.querySelectorAll('.start-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentAssessmentId = btn.dataset.id
                renderUI('quizview')
            })
        })
    }

    /* ---- LESSON VIEW ---- */
    async function renderLessonView(hasSb) {
        if (!currentLessonId) return '<div class="empty-state"><p>اختر درساً</p></div>'
        let lesson
        if (hasSb) {
            lesson = await sb.getLessonById(currentLessonId)
        } else if (window.db.getLessons) {
            lesson = window.db.getLessons().find(l => l.id === parseInt(currentLessonId))
        }
        if (!lesson) return '<div class="empty-state"><p>الدرس غير متاح</p></div>'

        const videoUrl = lesson.video_url || lesson.videoURL || lesson.videoEmbed || ''
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="ag-btn ag-btn-outline" onclick="renderUI('courseview')" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.1rem;">${esc(lesson.title)}</h4>
            </div>
            ${videoUrl ? `
            <div class="dash-card" style="margin-bottom:20px;padding:0;overflow:hidden;">
                <div style="position:relative;width:100%;padding-top:56.25%;background:#000;">
                    ${/\.(mp4|webm|ogv)(\?.*)?$/i.test(videoUrl)
                        ? `<video src="${esc(videoUrl)}" controls playsinline controlsList="nodownload" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;background:#000;"></video>`
                        : `<iframe src="${esc(videoUrl)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>`}
                </div>
            </div>` : ''}
            <div class="dash-card" style="margin-bottom:20px;">
                <h4 style="margin:0 0 10px;">${esc(lesson.title)}</h4>
                ${lesson.description ? '<p style="color:rgba(255,255,255,0.5);font-size:0.9rem;">' + esc(lesson.description) + '</p>' : ''}
                ${lesson.content ? '<div style="line-height:1.8;font-size:0.9rem;white-space:pre-wrap;">' + esc(lesson.content) + '</div>' : ''}
            </div>
            <div class="action-bar">
                <button class="ag-btn" id="completeLessonBtn" data-id="${lesson.id}"><i class="fa-solid fa-check-circle"></i> إتمام الدرس</button>
            </div>
        `
    }

    function bindLessonViewEvents(hasSb) {
        document.getElementById('completeLessonBtn')?.addEventListener('click', async () => {
            if (hasSb && currentLessonId && currentCourseId) {
                await sb.markLessonComplete(user.id, currentLessonId, currentCourseId)
                alert('تم إتمام الدرس ✓ تم تحديث نسبة التقدم')
            } else {
                alert('تم إتمام الدرس ✓')
            }
        })
    }

    /* ---- QUIZ VIEW ---- */
    async function renderQuizView(hasSb) {
        if (!currentAssessmentId) return '<div class="empty-state"><p>اختر تقييماً أولاً</p></div>'
        let assessment, questions = []
        if (hasSb) {
            assessment = await sb.getAssessmentById(currentAssessmentId)
            questions = await sb.getAssessmentQuestions(currentAssessmentId)
        } else {
            assessment = window.db.getAssessmentById(currentAssessmentId)
            questions = window.db.getQuestions(currentAssessmentId)
        }
        if (!assessment || !questions.length) return '<div class="empty-state"><p>هذا التقييم لا يحتوي على أسئلة بعد</p></div>'

        /* Initialize quiz state */
        quizState = {
            assessmentId: currentAssessmentId,
            assessmentTitle: assessment.title || '',
            questions: questions,
            currentIndex: 0,
            answers: {},
            score: 0,
            timeLimit: assessment.time_limit || 0,
            passingScore: assessment.passing_score || 60,
            startTime: Date.now(),
            submitted: false
        }

        return renderQuizQuestion()
    }

    window._saveCurrentAnswer = function() {
        if (!quizState) return
        const q = quizState.questions[quizState.currentIndex]
        if (!q) return
        if (q.question_type === 'fillblank') {
            const inp = document.querySelector('.fillblank-input')
            if (inp) quizState.answers[q.id] = inp.value
        } else {
            const sel = document.querySelector('input[name="q_' + q.id + '"]:checked')
            if (sel) quizState.answers[q.id] = sel.value
        }
    }

    window._goToQuestion = function(idx) {
        window._saveCurrentAnswer()
        quizState.currentIndex = idx
        renderUI('quizview')
    }

    window._prevQuestion = function() {
        window._saveCurrentAnswer()
        if (quizState.currentIndex > 0) { quizState.currentIndex--; renderUI('quizview') }
    }

    window._nextQuestion = function() {
        window._saveCurrentAnswer()
        if (quizState.currentIndex < quizState.questions.length - 1) { quizState.currentIndex++; renderUI('quizview') }
    }

    window._showResult = function() {
        window._saveCurrentAnswer()
        quizState.currentIndex = quizState.questions.length
        renderUI('quizview')
    }

    function renderQuizQuestion() {
        if (!quizState || quizState.submitted) return ''
        const q = quizState.questions[quizState.currentIndex]
        if (!q) return renderQuizSubmitConfirm()

        const total = quizState.questions.length
        const current = quizState.currentIndex + 1
        const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000)
        const remaining = quizState.timeLimit * 60 - elapsed
        const mins = Math.max(0, Math.floor(remaining / 60))
        const secs = Math.max(0, remaining % 60)
        const timeDisplay = quizState.timeLimit ? `${mins}:${secs.toString().padStart(2, '0')}` : ''

        let inputHtml = ''
        if (q.question_type === 'mcq') {
            inputHtml = (q.options || []).map((opt, oi) => `
                <label style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.03);margin-bottom:8px;cursor:pointer;transition:0.2s;border:1px solid rgba(255,255,255,0.06);"
                    onmouseover="this.style.borderColor='rgba(0,212,255,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                    <input type="radio" name="q_${q.id}" value="${esc(opt)}" style="accent-color:#00D4FF;width:18px;height:18px;" ${quizState.answers[q.id] === opt ? 'checked' : ''}>
                    <span>${esc(opt)}</span>
                </label>
            `).join('')
        } else if (q.question_type === 'truefalse') {
            inputHtml = `
                <label style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.03);margin-bottom:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);">
                    <input type="radio" name="q_${q.id}" value="true" style="accent-color:#00D4FF;width:18px;height:18px;" ${quizState.answers[q.id] === 'true' ? 'checked' : ''}> <span>صح</span>
                </label>
                <label style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.03);margin-bottom:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);">
                    <input type="radio" name="q_${q.id}" value="false" style="accent-color:#00D4FF;width:18px;height:18px;" ${quizState.answers[q.id] === 'false' ? 'checked' : ''}> <span>خطأ</span>
                </label>
            `
        } else if (q.question_type === 'fillblank') {
            inputHtml = `
                <input type="text" class="fillblank-input" data-qid="${q.id}" value="${esc(quizState.answers[q.id] || '')}"
                    style="width:100%;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;font-size:1rem;"
                    placeholder="اكتب إجابتك هنا...">
            `
        }

        return `
            <div class="dash-card" style="margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
                    <div style="display:flex;align-items:center;gap:15px;">
                        <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=courseview]')?.click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> خروج</button>
                        <span style="font-size:0.9rem;color:rgba(255,255,255,0.5);">السؤال ${current} من ${total}</span>
                    </div>
                    ${timeDisplay ? `<span style="font-size:1.1rem;font-weight:700;color:${remaining < 60 ? '#ff4d4d' : '#00D4FF'};">${timeDisplay}</span>` : ''}
                </div>
                <div style="margin-bottom:20px;">
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${quizState.questions.map((_, qi) => `
                            <span class="q-dot ${qi === quizState.currentIndex ? 'active' : ''} ${quizState.answers[_.id] ? 'answered' : ''}"
                                style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;cursor:pointer;
                                background:${qi === quizState.currentIndex ? '#00D4FF' : quizState.answers[_.id] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'};
                                color:${qi === quizState.currentIndex ? '#000' : '#fff'};"
                                onclick="window._goToQuestion(${qi})">${qi + 1}</span>
                        `).join('')}
                    </div>
                </div>
                <h4 style="font-size:1.1rem;margin-bottom:20px;line-height:1.6;">${esc(q.question_text)}</h4>
                <div style="margin-bottom:30px;">
                    ${inputHtml}
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;">
                    <button class="ag-btn" id="prevQuestionBtn" style="padding:12px 24px;${quizState.currentIndex === 0 ? 'opacity:0.3;pointer-events:none;' : ''}" ${quizState.currentIndex > 0 ? 'onclick="window._prevQuestion()"' : ''}><i class="fa-solid fa-chevron-right"></i> السابق</button>
                    ${quizState.currentIndex < total - 1
                        ? `<button class="ag-btn" id="nextQuestionBtn" style="padding:12px 24px;" onclick="window._nextQuestion()">التالي <i class="fa-solid fa-chevron-left"></i></button>`
                        : `<button class="ag-btn" style="padding:12px 24px;background:#10b981;" onclick="window._showResult()"><i class="fa-solid fa-check"></i> عرض النتيجة</button>`
                    }
                </div>
            </div>
        `
    }

    function renderQuizSubmitConfirm() {
        const total = quizState.questions.length
        const answered = Object.keys(quizState.answers).length
        return `
            <div class="dash-card" style="text-align:center;padding:40px;max-width:500px;margin:40px auto;">
                <div style="font-size:3rem;margin-bottom:20px;color:#FBBF24;"><i class="fa-solid fa-file-pen"></i></div>
                <h3>تأكيد تسليم الاختبار</h3>
                <p style="color:rgba(255,255,255,0.5);margin:15px 0;">لقد أجبت على ${answered} من ${total} أسئلة. هل أنت متأكد من تسليم الاختبار؟</p>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:25px;">
                    <button class="ag-btn ag-btn-outline" onclick="quizState.currentIndex=0;renderUI('quizview')" style="padding:12px 30px;">مراجعة الإجابات</button>
                    <button class="ag-btn" id="submitQuizBtn" style="padding:12px 30px;background:#10b981;"><i class="fa-solid fa-check"></i> تسليم</button>
                </div>
            </div>
        `
    }

    function renderQuizResult() {
        if (!quizState || !quizState.submitted) return '<div class="empty-state"><p>لا توجد نتيجة</p></div>'
        const correctCount = quizState.questions.filter(q => {
            const userAns = quizState.answers[q.id] || ''
            return userAns.toLowerCase().trim() === (q.correct_answer || '').toLowerCase().trim()
        }).length
        const total = quizState.questions.length
        const percentage = total ? Math.round((correctCount / total) * 100) : 0
        const passed = percentage >= (quizState.passingScore || 60)
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;">
                <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=courseview]')?.click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.1rem;">نتيجة الاختبار</h4>
            </div>
            <div class="dash-card" style="text-align:center;padding:40px;max-width:500px;margin:0 auto 30px;">
                <div style="font-size:4rem;margin-bottom:15px;color:${passed ? '#10b981' : '#ff4d4d'};">
                    <i class="fa-solid fa-${passed ? 'check-circle' : 'times-circle'}"></i>
                </div>
                <h3 style="font-size:1.8rem;font-weight:900;color:${passed ? '#10b981' : '#ff4d4d'};">${percentage}%</h3>
                <p style="color:rgba(255,255,255,0.5);margin:10px 0;">${passed ? 'مبروك! لقد نجحت في الاختبار 🎉' : 'لم تنجح هذه المرة. حاول مرة أخرى!'}</p>
                <div style="display:flex;justify-content:center;gap:30px;margin:20px 0;">
                    <div><strong style="font-size:1.2rem;color:#00D4FF;">${correctCount}</strong><br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">إجابات صحيحة</span></div>
                    <div><strong style="font-size:1.2rem;color:#ff4d4d;">${total - correctCount}</strong><br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">إجابات خاطئة</span></div>
                </div>
                <div style="margin-top:20px;">
                    <button class="ag-btn" onclick="document.querySelector('[data-section=courseview]')?.click()" style="padding:12px 30px;"><i class="fa-solid fa-arrow-right"></i> العودة للكورس</button>
                </div>
            </div>
            <h4 style="font-size:1rem;font-weight:800;margin:0 0 15px;">مراجعة الإجابات</h4>
            ${quizState.questions.map((q, i) => {
                const userAns = quizState.answers[q.id] || ''
                const isCorrect = userAns.toLowerCase().trim() === (q.correct_answer || '').toLowerCase().trim()
                const typeLabels = { mcq: 'اختيار متعدد', truefalse: 'صح/خطأ', fillblank: 'أكمل الفراغ' }
                return `
                <div class="dash-card" style="margin-bottom:10px;padding:16px 20px;border-right:3px solid ${isCorrect ? '#10b981' : '#ff4d4d'};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <strong>${i + 1}. ${esc(q.question_text)}</strong>
                            <br><span style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${typeLabels[q.question_type] || q.question_type}</span>
                            <br><span style="font-size:0.85rem;">إجابتك: <span style="color:${isCorrect ? '#10b981' : '#ff4d4d'};">${userAns || '—'}</span></span>
                            ${!isCorrect ? `<br><span style="font-size:0.85rem;color:#10b981;">الإجابة الصحيحة: ${esc(q.correct_answer || '')}</span>` : ''}
                        </div>
                        <div style="font-size:1.5rem;color:${isCorrect ? '#10b981' : '#ff4d4d'};">
                            <i class="fa-solid fa-${isCorrect ? 'check' : 'x'}"></i>
                        </div>
                    </div>
                </div>`
            }).join('')}
        `
    }

    async function bindQuizEvents(hasSb) {
        const submitBtn = document.getElementById('submitQuizBtn')
        if (!submitBtn) return
        submitBtn.addEventListener('click', async () => {
            quizState.submitted = true

            /* Calculate score */
            let correctCount = 0
            quizState.questions.forEach(q => {
                const userAns = quizState.answers[q.id] || ''
                if (userAns.toLowerCase().trim() === (q.correct_answer || '').toLowerCase().trim()) {
                    correctCount++
                }
            })
            const total = quizState.questions.length
            const percentage = total ? Math.round((correctCount / total) * 100) : 0
            quizState.score = percentage
            if (hasSb) {
                quizState.passingScore = (await sb.getAssessmentById(currentAssessmentId))?.passing_score || 60
            }

            /* Save attempt (Supabase or local fallback) */
            const passed = percentage >= (quizState.passingScore || 60)
            if (hasSb) {
                const existing = await sb.getStudentAttempts(user.id, currentAssessmentId)
                await sb.createAttempt({
                    student_id: user.id,
                    assessment_id: currentAssessmentId,
                    attempt_number: (existing.length || 0) + 1,
                    score: percentage,
                    passed: passed,
                    answers: quizState.answers,
                    started_at: new Date(quizState.startTime).toISOString(),
                    completed_at: new Date().toISOString()
                })
            } else if (window.db.addAttempt) {
                window.db.addAttempt({
                    assessmentId: currentAssessmentId,
                    studentId: user.id,
                    score: percentage,
                    passed: passed,
                    answers: quizState.answers,
                    startedAt: new Date(quizState.startTime).toISOString()
                })
            }
            if (window.db.addNotification) {
                window.db.addNotification({
                    user_id: user.id,
                    title: 'نتيجة الاختبار',
                    message: `حصلت على ${percentage}% في اختبار «${quizState.assessmentTitle || ''}» — ${passed ? 'نجحت 🎉' : 'لم تنجح، حاول مرة أخرى'}`,
                    type: 'exam'
                })
            }

            /* Auto-issue certificate if passed and course completed */
            if (passed && hasSb) {
                const courseId = currentCourseId
                const existingCerts = await sb.getStudentCertificates(user.id)
                const alreadyIssued = existingCerts.some(c => c.course_id === courseId)
                if (!alreadyIssued) {
                    /* Check course progress */
                    const enrolls = await sb.getStudentEnrollments(user.id)
                    const enrollment = enrolls.find(e => e.course_id === courseId)
                    if (enrollment && enrollment.progress_percentage >= 100) {
                        const code = 'CERT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
                        await sb.createCertificate({
                            student_id: user.id,
                            course_id: courseId,
                            certificate_code: code,
                            issue_date: new Date().toISOString()
                        })
                    }
                }
            }

            renderUI('quizresult')
        })
    }

    /* ---- CERTIFICATES ---- */
    async function renderCertificates(hasSb) {
        let certs = []
        if (hasSb) certs = await sb.getStudentCertificates(user.id)
        return `
            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${certs.length}</div><p class="label">الشهادات المحصل عليها</p></div>
            </div>
            ${certs.length ? `<div class="course-grid">${certs.map(c => `
                <div class="course-card-dash" style="text-align:center;padding:30px 20px;">
                    <div style="font-size:3rem;color:#FBBF24;margin-bottom:15px;"><i class="fa-solid fa-certificate"></i></div>
                    <h4>${esc(c.course?.title || '')}</h4>
                    <p style="font-size:0.8rem;color:rgba(255,255,255,0.4);margin:8px 0;">رمز الشهادة: ${esc(c.certificate_code || '')}</p>
                    <p style="font-size:0.75rem;color:rgba(255,255,255,0.3);">تاريخ الإصدار: ${c.issue_date ? new Date(c.issue_date).toLocaleDateString('ar') : '-'}</p>
                    <div id="qrcode_${c.id.replace(/-/g, '_')}" style="display:flex;justify-content:center;margin:15px 0;"></div>
                    <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-bottom:10px;">امسح QR للتحقق من الشهادة</div>
                    <button class="ag-btn download-cert-btn" data-id="${c.id}" data-code="${esc(c.certificate_code || '')}" data-course="${esc(c.course?.title || '')}" data-date="${c.issue_date || ''}" data-student="${esc(user.name || '')}" style="justify-content:center;width:100%;"><i class="fa-solid fa-download"></i> تحميل PDF</button>
                </div>
            `).join('')}</div>` : '<div class="empty-state"><i class="fa-solid fa-certificate"></i><p>لم تحصل على أي شهادة بعد. أكمل الكورسات للحصول على شهاداتك!</p></div>'}
        `
    }

    /* ---- CERTIFICATE EVENTS ---- */
    function bindCertEvents() {
        /* Generate QR codes */
        document.querySelectorAll('[id^="qrcode_"]').forEach(el => {
            const id = el.id.replace('qrcode_', '').replace(/_/g, '-')
            const codeEl = el.closest('.course-card-dash')?.querySelector('p')
            const code = codeEl?.textContent?.replace('رمز الشهادة: ', '')?.trim() || id
            try {
                if (typeof QRCode !== 'undefined') {
                    new QRCode(el, { text: window.location.origin + '/verify-certificate.html?code=' + code, width: 100, height: 100, colorDark: '#FBBF24', colorLight: '#1a1a2e' })
                }
            } catch(e) {}
        })

        /* PDF download */
        document.querySelectorAll('.download-cert-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const { jsPDF } = window.jspdf
                const doc = new jsPDF('landscape', 'mm', 'a4')
                const course = btn.dataset.course
                const student = btn.dataset.student
                const code = btn.dataset.code
                const date = btn.dataset.date ? new Date(btn.dataset.date).toLocaleDateString('ar') : '-'

                /* Certificate border */
                doc.setDrawColor(251, 191, 36)
                doc.setLineWidth(3)
                doc.rect(10, 10, 277, 190)

                doc.setDrawColor(0, 212, 255)
                doc.setLineWidth(1)
                doc.rect(13, 13, 271, 184)

                /* Title */
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(32)
                doc.setTextColor(251, 191, 36)
                doc.text('شهادة إتمام', 148, 50, { align: 'center' })

                doc.setFontSize(14)
                doc.setTextColor(255, 255, 255)
                doc.text('نشهد بأن', 148, 75, { align: 'center' })

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(24)
                doc.setTextColor(0, 212, 255)
                doc.text(student || 'الطالب', 148, 95, { align: 'center' })

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(14)
                doc.setTextColor(255, 255, 255)
                doc.text('قد أتم بنجاح كورس', 148, 115, { align: 'center' })

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(20)
                doc.setTextColor(168, 85, 247)
                doc.text(course || '', 148, 135, { align: 'center' })

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(11)
                doc.setTextColor(200, 200, 200)
                doc.text('تاريخ الإصدار: ' + date, 148, 160, { align: 'center' })
                doc.text('رمز الشهادة: ' + code, 148, 175, { align: 'center' })

                /* Add QR to PDF */
                const qrEl = btn.closest('.course-card-dash')?.querySelector('[id^="qrcode_"] canvas')
                if (qrEl) {
                    const qrData = qrEl.toDataURL('image/png')
                    doc.addImage(qrData, 'PNG', 220, 145, 30, 30)
                }

                doc.save('certificate_' + code + '.pdf')
            })
        })
    }

    /* ---- INVOICES ---- */
    function renderInvoices(invoices) {
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>الوصف</th><th>المبلغ</th><th>تاريخ الإصدار</th><th>تاريخ الاستحقاق</th><th>الحالة</th></tr></thead>
                    <tbody>${invoices.length ? invoices.map((inv, i) => `
                        <tr><td>${i + 1}</td><td>${esc(inv.description || '')}</td><td style="font-weight:700;">${inv.currency || '$'}${inv.amount || 0}</td>
                        <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.issuedAt || '-'}</td>
                        <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.dueAt || '-'}</td>
                        <td>${inv.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">غير مدفوع</span>'}</td></tr>
                    `).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد فواتير</td></tr>'}</tbody>
                </table>
            </div>
        `
    }

    /* ---- NEXTGEN: Student Assignments ---- */
    function renderStudentAssignments(enrolled) {
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-file-pen" style="color:#A855F7"></i> الواجبات</h3>
            <div style="display:grid;gap:20px">
                ${enrolled.map(c => `
                    <div>
                        <h4 style="color:#00D4FF;margin:0 0 10px">${esc(c.title)}</h4>
                        <div id="studentAssign_${c.id}"></div>
                    </div>
                `).join('') || '<p style="color:#666;padding:30px;text-align:center">سجل في كورسات لعرض الواجبات</p>'}
            </div>
            <script>
                setTimeout(() => {
                    ${enrolled.map(c => `if(NextGen.Assignments) NextGen.Assignments.renderAssignmentsForStudent('${c.id}', 'studentAssign_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Student Forum ---- */
    function renderStudentForum(enrolled) {
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-comments" style="color:#00D4FF"></i> المناقشات</h3>
            <p style="color:#888;margin-bottom:20px">شارك في النقاشات الخاصة بكورساتك</p>
            <div style="display:grid;gap:20px">
                ${enrolled.map(c => `
                    <div>
                        <h4 style="color:#00D4FF;margin:0 0 10px">${esc(c.title)}</h4>
                        <div id="studentForum_${c.id}"></div>
                    </div>
                `).join('') || '<p style="color:#666;padding:30px;text-align:center">سجل في كورسات للمشاركة في النقاشات</p>'}
            </div>
            <script>
                setTimeout(() => {
                    ${enrolled.map(c => `if(NextGen.Communication) NextGen.Communication.renderForum('${c.id}', 'studentForum_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Student Live Classes ---- */
    function renderStudentLive(enrolled) {
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-video" style="color:#22c55e"></i> الحصص المباشرة</h3>
            <p style="color:#888;margin-bottom:20px">تابع الحصص المباشرة والمسجلة لكورساتك</p>
            <div style="display:grid;gap:20px">
                ${enrolled.map(c => `
                    <div>
                        <h4 style="color:#00D4FF;margin:0 0 10px">${esc(c.title)}</h4>
                        <div id="studentLive_${c.id}"></div>
                    </div>
                `).join('') || '<p style="color:#666;padding:30px;text-align:center">سجل في كورسات لعرض الحصص المباشرة</p>'}
            </div>
            <script>
                setTimeout(() => {
                    ${enrolled.map(c => `if(NextGen.Live) NextGen.Live.renderSchedule('${c.id}', 'studentLive_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Student Leaderboard ---- */
    function renderStudentLeaderboard() {
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-trophy" style="color:#FBBF24"></i> ${NextGen.I18n ? NextGen.I18n.t('leaderboard') : 'المتصدرون'}</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
                <div id="studentProfileCard"></div>
                <div>
                    <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                        <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-medal" style="color:#FBBF24"></i> ${NextGen.I18n ? NextGen.I18n.t('myBadges') : 'الشارات'}</h4>
                        <div id="studentBadges"></div>
                    </div>
                </div>
            </div>
            <div id="leaderboardContainer"></div>
            <script>
                setTimeout(() => {
                    const uid = window.auth?.currentUser?.id?.toString() || 'guest'
                    if(NextGen.Gamification) {
                        NextGen.Gamification.renderPlayerProfile(uid, 'studentProfileCard')
                        NextGen.Gamification.renderBadges(uid, 'studentBadges')
                        NextGen.Gamification.renderLeaderboard('leaderboardContainer')
                    }
                }, 200)
            </script>
        `
    }

    /* ---- STUDENT NOTIFICATIONS ---- */
    function renderStudentNotifications() {
        const notifs = window.db.getNotifications().filter(n => n.user_id === user.id || n.user_id === 'all')
        const typeIcons = { course: 'fa-book-open', exam: 'fa-file-pen', financial: 'fa-wallet', support: 'fa-headset', system: 'fa-bell', promo: 'fa-tags' }
        const unread = notifs.filter(n => !n.read).length
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
                <h4 style="margin:0;font-size:1.1rem;"><i class="fa-solid fa-bell" style="color:#FBBF24;"></i> مركز الإشعارات</h4>
                <div style="display:flex;gap:8px;">
                    <button class="ag-btn ag-btn-outline" id="notifMarkAll" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-check-double"></i> تحديد الكل كمقروء</button>
                    <button class="ag-btn ag-btn-outline" id="notifClear" style="padding:8px 18px;font-size:0.8rem;color:#ff4d4d;border-color:rgba(255,77,77,0.3);"><i class="fa-solid fa-trash"></i> مسح الكل</button>
                </div>
            </div>
            ${unread > 0 ? `<div style="padding:10px 16px;border-radius:12px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);margin-bottom:15px;font-size:0.85rem;color:#FBBF24;"><i class="fa-solid fa-circle-info"></i> لديك ${unread} إشعار غير مقروء</div>` : ''}
            <div class="table-wrap">
                ${notifs.length ? notifs.slice(0, 50).map(n => `
                    <div style="display:flex;gap:14px;align-items:center;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);background:${n.read ? 'transparent' : 'rgba(0,212,255,0.04)'};cursor:pointer;" class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
                        <div style="width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(0,212,255,0.1);color:#00D4FF;font-size:16px;"><i class="fa-solid ${typeIcons[n.type] || 'fa-bell'}"></i></div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:${n.read ? '400' : '700'};color:#fff;font-size:0.9rem;">${esc(n.title || 'إشعار')}</div>
                            <div style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-top:3px;">${esc(n.message || '')}</div>
                        </div>
                        <div style="color:rgba(255,255,255,0.25);font-size:0.7rem;white-space:nowrap;">${n.createdAt ? new Date(n.createdAt).toLocaleDateString('ar-EG') : ''} ${n.read ? '' : '<span style="width:8px;height:8px;border-radius:50%;background:#00D4FF;display:inline-block;margin-right:6px;"></span>'}</div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-bell-slash"></i><p>لا توجد إشعارات بعد</p></div>'}
            </div>
            <script>
                setTimeout(() => {
                    document.getElementById('notifMarkAll')?.addEventListener('click', () => {
                        window.db.markAllNotificationsRead()
                        NextGen.UI.showToast('تم تحديد جميع الإشعارات كمقروءة', 'success')
                        renderUI('notifications')
                        mountNotificationBell()
                    })
                    document.getElementById('notifClear')?.addEventListener('click', () => {
                        if (!confirm('مسح جميع الإشعارات؟')) return
                        const mine = window.db.getNotifications().filter(n => n.user_id === user.id || n.user_id === 'all')
                        mine.forEach(n => window.db.deleteNotification(n.id))
                        NextGen.UI.showToast('تم مسح الإشعارات', 'info')
                        renderUI('notifications')
                    })
                    document.querySelectorAll('.notif-item').forEach(el => {
                        el.addEventListener('click', () => {
                            if (!el.classList.contains('unread')) return
                            window.db.markNotificationRead(el.dataset.notifId)
                            el.classList.remove('unread')
                            el.style.background = 'transparent'
                            renderUI('notifications')
                        })
                    })
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Student Wallet ---- */
    function renderStudentWallet() {
        const wallet = NextGen.DB ? NextGen.DB.getWallet(user.id) : { balance: 0, points: 0 }
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-wallet" style="color:#00D4FF"></i> المحفظة</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
                <div style="padding:30px;background:rgba(255,255,255,0.02);border-radius:20px;border:1px solid rgba(0,212,255,0.3);text-align:center">
                    <div style="font-size:48px;font-weight:700;color:#00D4FF">${wallet.balance.toFixed(2)} EGP</div>
                    <div style="color:#888;margin:10px 0">${NextGen.I18n ? NextGen.I18n.t('balance') : 'الرصيد'}</div>
                    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;">
                        <input type="number" id="depositAmount" min="1" step="1" value="100" style="width:120px;padding:10px 14px;border-radius:30px;border:1px solid rgba(0,212,255,0.3);background:rgba(255,255,255,0.05);color:#fff;outline:none;text-align:center;" onkeydown="if(event.key==='Enter')document.getElementById('depositBtn').click()">
                        <span style="align-self:center;color:#888;font-size:14px">EGP</span>
                    </div>
                    <button id="depositBtn" style="padding:12px 30px;border-radius:30px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-solid fa-plus"></i> شحن المحفظة</button>
                </div>
                <div style="padding:30px;background:rgba(255,255,255,0.02);border-radius:20px;border:1px solid rgba(251,191,36,0.3);text-align:center">
                    <div style="font-size:48px;font-weight:700;color:#FBBF24">${wallet.points || 0}</div>
                    <div style="color:#888;margin:10px 0">⭐ نقاط المكافآت</div>
                    <button style="padding:12px 30px;border-radius:30px;border:1px solid rgba(251,191,36,0.3);background:transparent;color:#FBBF24;cursor:pointer;font-size:14px;transition:all 0.3s" onmouseover="this.style.background='rgba(251,191,36,0.1)'" onmouseout="this.style.background='transparent'">استبدال النقاط</button>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(0,255,170,0.15)">
                    <h4 style="color:#fff;margin:0 0 15px">🎟️ كود الشحن (Voucher)</h4>
                    <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">اشترِ كود شحن وأدخله هنا ليضاف رصيده لمحفظتك مباشرة.</p>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="voucherInput" placeholder="أدخل الكود مثل: LG-XXXX" style="flex:1;padding:10px 14px;border-radius:30px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);color:#fff;outline:none;" onkeydown="if(event.key==='Enter')document.getElementById('redeemVoucherBtn').click()">
                        <button id="redeemVoucherBtn" style="padding:10px 20px;border-radius:30px;border:none;background:linear-gradient(135deg,#22c55e,#10b981);color:#fff;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;"><i class="fa-solid fa-ticket"></i> استخدم</button>
                    </div>
                </div>
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h4 style="color:#fff;margin:0 0 15px">🛒 شراء الكورسات</h4>
                    <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">ادفع من رصيد المحفظة مباشرة من صفحة الكورس، مع إمكانية إضافة كود خصم عند الدفع.</p>
                    <a href="course-view.html?id=101" style="display:inline-block;padding:10px 24px;border-radius:30px;border:1px solid rgba(0,212,255,0.4);background:rgba(0,212,255,0.1);color:#00D4FF;cursor:pointer;font-size:13px;font-weight:700;text-decoration:none;">تصفح كورس تجريبي <i class="fa-solid fa-arrow-left"></i></a>
                </div>
            </div>
            <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                <h4 style="color:#fff;margin:0 0 15px">📜 سجل المعاملات</h4>
                <div id="walletTransactions"></div>
            </div>
            <script>
                setTimeout(() => {
                    const pubs = NextGen.DB ? NextGen.DB.getWalletTransactions('${user.id}') : []
                    const container = document.getElementById('walletTransactions')
                    if (container) {
                        if (pubs.length) {
                            container.innerHTML = pubs.map(p => \`
                                <div style="display:flex;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <div>
                                        <div style="color:#ccc;font-size:0.9rem">\${p.description || 'معاملة'}</div>
                                        <div style="color:#666;font-size:0.72rem;margin-top:2px">\${new Date(p.createdAt).toLocaleDateString('ar-EG')} \${new Date(p.createdAt).toLocaleTimeString('ar-EG', {hour:'2-digit',minute:'2-digit'})}</div>
                                    </div>
                                    <span style="color:\${p.amount >= 0 ? '#22c55e' : '#ff4d4d'};font-weight:700;white-space:nowrap">\${p.amount >= 0 ? '+' : ''}\${p.amount} EGP</span>
                                </div>
                            \`).join('')
                        } else {
                            container.innerHTML = '<p style="color:#666;text-align:center;padding:20px">لا توجد معاملات بعد</p>'
                        }
                    }
                    document.getElementById('redeemVoucherBtn')?.addEventListener('click', () => {
                        const code = (document.getElementById('voucherInput').value || '').trim()
                        if (!code) { NextGen.UI.showToast('أدخل كود الشحن أولاً', 'warning'); return }
                        const res = NextGen.DB ? NextGen.DB.redeemVoucher('${user.id}', code) : null
                        if (res && res.success) {
                            NextGen.UI.showToast('تم شحن محفظتك بنجاح +' + res.amount + ' EGP 🎉', 'success')
                            renderUI('wallet')
                        } else {
                            NextGen.UI.showToast((res && res.message) || 'الكود غير صالح أو مستخدم مسبقاً', 'error')
                        }
                    })
                    document.getElementById('depositBtn')?.addEventListener('click', () => {
                        const amount = parseFloat(document.getElementById('depositAmount').value)
                        if (!amount || amount <= 0) { NextGen.UI.showToast('أدخل مبلغاً صحيحاً', 'warning'); return }
                        if (NextGen.Paymob) {
                            NextGen.Paymob.depositToWallet({
                                userId: '${user.id}',
                                amount,
                                userEmail: '${esc(user.email)}',
                                userName: '${esc(user.name)}',
                                onSuccess: () => renderUI('wallet')
                            })
                        } else {
                            NextGen.UI.showToast('Paymob module not loaded. Use simulation.', 'info')
                        }
                    })
                }, 200)
            </script>
        `
    }

    renderUI().catch(err => {
        console.error('[student] initial renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل لوحة التحكم</p><button class="ag-btn" onclick="location.reload()" style="margin-top:20px;">إعادة المحاولة</button></div>'
    })
})

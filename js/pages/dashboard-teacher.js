/**
 * dashboard-teacher.js — Supabase + localStorage dual source
 * Sections: Dashboard | Courses | Modules/Lessons | Assessments | Students | Revenue
 */
document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.ready
    if (!window.auth.currentUser) { window.location.href = 'login.html'; return }
    if (window.auth.currentUser.type !== 'teacher' && window.auth.currentUser.type !== 'admin') { window.location.href = 'login.html'; return }

    const user = window.auth.currentUser
    const sb = window.supabaseApp
    let currentCourseId = null
    let currentModuleId = null
    let currentAssessmentId = null

    /* ---- HELPERS ---- */
    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML }
    function uid() { return user.id }

    async function ensureSupabase() {
        if (sb && sb.isReady() && window.auth.currentUser?.supabase) return true
        /* Fallback: use localStorage data */
        return false
    }

    /* ---- RENDER ENGINE ---- */
    async function renderUI(section) {
        try {
        const hasSupabase = await ensureSupabase()
        section = section || 'overview'

        const sidebar = `
            <li><a href="#" class="${section === 'overview' ? 'active' : ''}" data-section="overview"><i class="fa-solid fa-chart-simple"></i> لوحة المعلومات</a></li>
            <li><a href="#" class="${section === 'courses' ? 'active' : ''}" data-section="courses"><i class="fa-solid fa-book"></i> الكورسات</a></li>
            <li><a href="#" class="${section === 'assignments' ? 'active' : ''}" data-section="assignments"><i class="fa-solid fa-file-pen"></i> الواجبات</a></li>
            <li><a href="#" class="${section === 'live' ? 'active' : ''}" data-section="live"><i class="fa-solid fa-video"></i> الحصص المباشرة</a></li>
            <li><a href="#" class="${section === 'forum' ? 'active' : ''}" data-section="forum"><i class="fa-solid fa-comments"></i> المناقشات</a></li>
            <li><a href="#" class="${section === 'students' ? 'active' : ''}" data-section="students"><i class="fa-solid fa-users"></i> الطلاب</a></li>
            <li><a href="#" class="${section === 'assessments' ? 'active' : ''}" data-section="assessments"><i class="fa-solid fa-file-pen"></i> التقييمات</a></li>
            <li><a href="#" class="${section === 'revenue' ? 'active' : ''}" data-section="revenue"><i class="fa-solid fa-money-bill-trend-up"></i> الأرباح</a></li>
            <li><a href="#" class="${section === 'analytics' ? 'active' : ''}" data-section="analytics"><i class="fa-solid fa-chart-line"></i> التحليلات</a></li>
        `

        let content = ''
        if (section === 'overview') content = await renderOverview(hasSupabase)
        else if (section === 'courses') content = await renderCourses(hasSupabase)
        else if (section === 'students') content = await renderStudents(hasSupabase)
        else if (section === 'assessments') content = await renderAssessments(hasSupabase)
        else if (section === 'questions') content = await renderQuestions(hasSupabase)
        else if (section === 'revenue') content = await renderRevenue(hasSupabase)
        else if (section === 'modules') content = await renderModules(hasSupabase)
        else if (section === 'lessons') content = await renderLessons(hasSupabase)
        else if (section === 'assignments') content = renderAssignments()
        else if (section === 'live') content = renderLive()
        else if (section === 'forum') content = renderForum()
        else if (section === 'analytics') content = renderAnalytics()

        const container = document.getElementById('dashboardContent')
        if (!container) return
        container.innerHTML = renderDashboardLayout('لوحة تحكم المعلم', sidebar, content)
        bindLogout()
        bindNav()
        if (section === 'courses') await bindCourseEvents(hasSupabase)
        if (section === 'modules') await bindModuleEvents(hasSupabase)
        if (section === 'lessons') await bindLessonEvents(hasSupabase)
        if (section === 'assessments') await bindAssessmentEvents(hasSupabase)
        if (section === 'questions') await bindQuestionEvents(hasSupabase)
        if (section === 'revenue') bindSettlementEvents()
    } catch(err) {
        console.error('[teacher] renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p></div>'
    }
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault()
                renderUI(link.dataset.section).catch(err => {
                    console.error('[teacher] renderUI error:', err)
                    const c = document.getElementById('dashboardContent')
                    if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل الصفحة</p></div>'
                })
            })
        })
    }

    /* ---- OVERVIEW ---- */
    async function renderOverview(hasSupabase) {
        let courses = [], students = [], totalRevenue = 0
        if (hasSupabase) {
            courses = await sb.getTeacherCourses(uid())
            const enrolls = await sb.getTeacherEnrollments(uid())
            students = [...new Set(enrolls.map(e => e.student_id))]
            const revs = await sb.getTeacherRevenues(uid())
            totalRevenue = revs.reduce((s, r) => s + (r.teacher_share || 0), 0)
        } else {
            courses = window.db.getCourses().filter(c => c.teacherId === user.id || (c.teacherIds || []).includes(user.id))
            totalRevenue = 0
        }
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${courses.length}</div><p class="label">الكورسات</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${students.length}</div><p class="label">الطلاب المسجلين</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${courses.filter(c => c.is_published !== false).length}</div><p class="label">الكورسات المنشورة</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${totalRevenue}</div><p class="label">الأرباح</p></div>
            </div>
            <div class="dash-card">
                <h4><i class="fa-solid fa-clock-rotate-left"></i> آخر الكورسات</h4>
                ${courses.slice(0, 5).map(c => `
                    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;">
                        <span>${esc(c.title)}</span>
                        <span style="color:${c.is_published ? '#10b981' : '#FBBF24'};font-size:0.75rem;">${c.is_published ? 'منشور' : 'مسودة'}</span>
                    </div>
                `).join('') || '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">لا توجد كورسات بعد</p>'}
            </div>
        `
    }

    /* ---- COURSES ---- */
    async function renderCourses(hasSupabase) {
        let courses = []
        if (hasSupabase) {
            courses = await sb.getTeacherCourses(uid())
        } else {
            courses = window.db.getCourses().filter(c => c.teacherId === user.id || (c.teacherIds || []).includes(user.id))
        }
        return `
            <div class="action-bar">
                <button class="ag-btn" id="openCourseModal"><i class="fa-solid fa-plus"></i> كورس جديد</button>
            </div>
            <div class="course-grid">
                ${courses.length ? courses.map(c => `
                    <div class="course-card-dash">
                        <div class="img-wrap">
                            <img src="${esc(c.cover_image || c.image || 'https://picsum.photos/seed/course/400/250')}" alt="" loading="lazy">
                            <span class="badge">${c.is_published ? (c.is_approved ? 'منشور' : 'قيد المراجعة') : 'مسودة'}</span>
                        </div>
                        <div class="body">
                            <h4>${esc(c.title)}</h4>
                            <p class="meta">${esc(c.category)} ${c.price ? '| $' + c.price : ''} ${c.students_count ? '| ' + c.students_count + ' طالب' : ''}</p>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                                <button class="ag-btn modules-btn" data-id="${c.id}" style="flex:1;padding:8px;font-size:0.75rem;justify-content:center;background:rgba(0,212,255,0.12);color:#00D4FF;"><i class="fa-solid fa-list"></i> المحتوى</button>
                                <button class="ag-btn edit-course-btn" data-id="${c.id}" style="flex:1;padding:8px;font-size:0.75rem;justify-content:center;background:rgba(168,85,247,0.12);color:#A855F7;"><i class="fa-solid fa-pen"></i> تعديل</button>
                            </div>
                            <div style="display:flex;gap:8px;margin-top:8px;">
                                <button class="ag-btn toggle-publish-btn" data-id="${c.id}" data-published="${c.is_published}" style="flex:1;padding:6px;font-size:0.7rem;justify-content:center;background:rgba(16,185,129,0.1);color:#10b981;">${c.is_published ? 'إلغاء النشر' : 'نشر'}</button>
                                <button class="ag-btn delete-course-btn" data-id="${c.id}" style="flex:1;padding:6px;font-size:0.7rem;justify-content:center;background:rgba(255,77,77,0.1);color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-book"></i><p>لم تقم بإضافة كورسات بعد</p></div>'}
            </div>
            <!-- Course Modal -->
            <div class="modal-overlay" id="courseModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:550px;width:90%;max-height:90vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="courseModalTitle">إضافة كورس جديد</h3>
                        <button id="closeCourseModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="courseForm">
                        <input type="hidden" id="editCourseId">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">اسم الكورس</label><input type="text" id="cTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الوصف</label><textarea id="cDesc" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:80px;"></textarea></div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">القسم</label><select id="cCategory" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="languages">لغات</option><option value="science">علوم</option><option value="math">رياضيات</option><option value="tech">تقنية</option><option value="physics">فيزياء</option><option value="chemistry">كيمياء</option><option value="engineering">هندسة</option></select></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">المستوى</label><select id="cLevel" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="beginner">مبتدئ</option><option value="intermediate">متوسط</option><option value="advanced">متقدم</option></select></div>
                        </div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">السعر ($)</label><input type="number" id="cPrice" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="0" step="0.01"></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">صورة الغلاف</label><input type="url" id="cImage" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" value="https://picsum.photos/seed/course/400/250"></div>
                        </div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    async function bindCourseEvents(hasSupabase) {
        const modal = document.getElementById('courseModal')
        if (!modal) return
        document.getElementById('openCourseModal').onclick = () => {
            modal.style.display = 'flex'
            document.getElementById('courseModalTitle').textContent = 'إضافة كورس جديد'
            document.getElementById('editCourseId').value = ''
            document.getElementById('courseForm').reset()
            document.getElementById('cImage').value = 'https://picsum.photos/seed/course/400/250'
        }
        document.getElementById('closeCourseModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        /* Edit buttons */
        document.querySelectorAll('.edit-course-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                let c
                if (hasSupabase) c = await sb.getCourseById(id)
                else c = window.db.getCourseById(parseInt(id))
                if (!c) return
                document.getElementById('courseModalTitle').textContent = 'تعديل الكورس'
                document.getElementById('editCourseId').value = id
                document.getElementById('cTitle').value = c.title || ''
                document.getElementById('cDesc').value = c.description || c.long_description || ''
                document.getElementById('cCategory').value = c.category || 'tech'
                document.getElementById('cLevel').value = c.level || 'beginner'
                document.getElementById('cPrice').value = c.price || 0
                document.getElementById('cImage').value = c.cover_image || c.image || 'https://picsum.photos/seed/course/400/250'
                modal.style.display = 'flex'
            })
        })

        /* Delete buttons */
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف هذا الكورس وجميع محتوياته؟')) return
                const id = btn.dataset.id
                if (hasSupabase) await sb.deleteCourse(id)
                else window.db.deleteCourse(parseInt(id))
                renderUI('courses')
            })
        })

        /* Toggle publish */
        document.querySelectorAll('.toggle-publish-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                const pub = btn.dataset.published === 'true'
                if (hasSupabase) await sb.updateCourse(id, { is_published: !pub })
                else {
                    const c = window.db.getCourseById(parseInt(id))
                    if (c) window.db.updateCourse(parseInt(id), { ...c, is_published: !pub })
                }
                renderUI('courses')
            })
        })

        /* Modules button */
        document.querySelectorAll('.modules-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentCourseId = btn.dataset.id
                renderUI('modules')
            })
        })

        /* Form submit */
        document.getElementById('courseForm').onsubmit = async (e) => {
            e.preventDefault()
            const editId = document.getElementById('editCourseId').value
            const data = {
                title: document.getElementById('cTitle').value,
                description: document.getElementById('cDesc').value,
                category: document.getElementById('cCategory').value,
                level: document.getElementById('cLevel').value,
                price: parseFloat(document.getElementById('cPrice').value) || 0,
                cover_image: document.getElementById('cImage').value,
                language: 'ar'
            }
            if (hasSupabase) {
                if (editId) {
                    await sb.updateCourse(editId, data)
                } else {
                    await sb.createCourse({ ...data, instructor_id: uid() })
                }
            } else {
                if (editId) window.db.updateCourse(parseInt(editId), data)
                else window.db.addCourse({ ...data, teacherIds: [user.id], teacherId: user.id })
            }
            modal.style.display = 'none'
            renderUI('courses')
        }
    }

    /* ---- MODULES ---- */
    async function renderModules(hasSupabase) {
        if (!currentCourseId) return '<div class="empty-state"><p>اختر كورساً أولاً</p></div>'
        let course, modules = []
        if (hasSupabase) {
            course = await sb.getCourseById(currentCourseId)
            modules = await sb.getCourseModules(currentCourseId)
        } else {
            course = window.db.getCourseById(parseInt(currentCourseId))
        }
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=courses]').click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.1rem;">${esc(course?.title || '')} — الوحدات</h4>
            </div>
            <div class="action-bar">
                <button class="ag-btn" id="openModuleModal"><i class="fa-solid fa-plus"></i> وحدة جديدة</button>
            </div>
            <div id="moduleList">
                ${modules.length ? modules.map((m, i) => `
                    <div class="dash-card" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;">
                        <div><strong>${i + 1}. ${esc(m.title)}</strong>${m.description ? '<br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">' + esc(m.description) + '</span>' : ''}</div>
                        <div style="display:flex;gap:8px;">
                            <button class="ag-btn lessons-btn" data-id="${m.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(0,212,255,0.1);color:#00D4FF;"><i class="fa-solid fa-video"></i> دروس</button>
                            <button class="ag-btn edit-module-btn" data-id="${m.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(168,85,247,0.1);color:#A855F7;"><i class="fa-solid fa-pen"></i></button>
                            <button class="ag-btn delete-module-btn" data-id="${m.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(255,77,77,0.1);color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-layer-group"></i><p>لا توجد وحدات بعد. أضف أول وحدة!</p></div>'}
            </div>
            <!-- Module Modal -->
            <div class="modal-overlay" id="moduleModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:480px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="moduleModalTitle">وحدة جديدة</h3>
                        <button id="closeModuleModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="moduleForm">
                        <input type="hidden" id="editModuleId">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">عنوان الوحدة</label><input type="text" id="mTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">وصف الوحدة</label><textarea id="mDesc" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:60px;"></textarea></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    async function bindModuleEvents(hasSupabase) {
        const modal = document.getElementById('moduleModal')
        if (!modal) return
        document.getElementById('openModuleModal').onclick = () => {
            modal.style.display = 'flex'
            document.getElementById('moduleModalTitle').textContent = 'وحدة جديدة'
            document.getElementById('editModuleId').value = ''
            document.getElementById('moduleForm').reset()
        }
        document.getElementById('closeModuleModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        /* Edit module */
        document.querySelectorAll('.edit-module-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                let modules = hasSupabase ? await sb.getCourseModules(currentCourseId) : []
                const m = modules.find(x => x.id === id)
                if (!m) return
                document.getElementById('moduleModalTitle').textContent = 'تعديل الوحدة'
                document.getElementById('editModuleId').value = id
                document.getElementById('mTitle').value = m.title || ''
                document.getElementById('mDesc').value = m.description || ''
                modal.style.display = 'flex'
            })
        })

        /* Delete module */
        document.querySelectorAll('.delete-module-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف هذه الوحدة وجميع دروسها؟')) return
                if (hasSupabase) await sb.deleteModule(btn.dataset.id)
                renderUI('modules')
            })
        })

        /* Lessons button */
        document.querySelectorAll('.lessons-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentModuleId = btn.dataset.id
                renderUI('lessons')
            })
        })

        /* Form */
        document.getElementById('moduleForm').onsubmit = async (e) => {
            e.preventDefault()
            const editId = document.getElementById('editModuleId').value
            const data = {
                course_id: currentCourseId,
                title: document.getElementById('mTitle').value,
                description: document.getElementById('mDesc').value,
                order_index: Date.now()
            }
            if (editId) {
                if (hasSupabase) await sb.updateModule(editId, { title: data.title, description: data.description })
            } else {
                if (hasSupabase) await sb.createModule(data)
            }
            modal.style.display = 'none'
            renderUI('modules')
        }
    }

    /* ---- LESSONS ---- */
    async function renderLessons(hasSupabase) {
        if (!currentModuleId) return '<div class="empty-state"><p>اختر وحدة أولاً</p></div>'
        let course, modules, lessons = []
        if (hasSupabase) {
            course = await sb.getCourseById(currentCourseId)
            const mods = await sb.getCourseModules(currentCourseId)
            modules = mods
            const m = mods.find(x => x.id === currentModuleId)
            if (m) lessons = await sb.getModuleLessons(currentModuleId)
        }
        const currentModule = Array.isArray(modules) ? modules.find(m => m.id === currentModuleId) : null
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=modules]').click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.1rem;">${esc(course?.title || '')} / ${esc(currentModule?.title || '')} — الدروس</h4>
            </div>
            <div class="action-bar">
                <button class="ag-btn" id="openLessonModal"><i class="fa-solid fa-plus"></i> درس جديد</button>
            </div>
            <div id="lessonList">
                ${lessons.length ? lessons.map((l, i) => `
                    <div class="dash-card" style="margin-bottom:10px;padding:16px 20px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>${i + 1}. ${esc(l.title)}</strong>
                                ${l.description ? '<br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">' + esc(l.description) + '</span>' : ''}
                                ${l.duration ? '<span style="font-size:0.75rem;color:#00D4FF;margin-right:10px;"><i class="fa-regular fa-clock"></i> ' + l.duration + ' دقيقة</span>' : ''}
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="ag-btn edit-lesson-btn" data-id="${l.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(168,85,247,0.1);color:#A855F7;"><i class="fa-solid fa-pen"></i></button>
                                <button class="ag-btn delete-lesson-btn" data-id="${l.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(255,77,77,0.1);color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-video"></i><p>لا توجد دروس بعد. أضف أول درس!</p></div>'}
            </div>
            <!-- Lesson Modal -->
            <div class="modal-overlay" id="lessonModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:550px;width:90%;max-height:90vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="lessonModalTitle">درس جديد</h3>
                        <button id="closeLessonModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="lessonForm">
                        <input type="hidden" id="editLessonId">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">عنوان الدرس</label><input type="text" id="lTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الوصف</label><textarea id="lDesc" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:60px;"></textarea></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">رابط الفيديو</label><input type="url" id="lVideo" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" placeholder="https://youtube.com/... أو رابط مباشر"></div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">المدة (دقائق)</label><input type="number" id="lDuration" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="0"></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">مجاني؟</label><select id="lFree" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="false">لا</option><option value="true">نعم</option></select></div>
                        </div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">محتوى الدرس (نص)</label><textarea id="lContent" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:100px;font-family:monospace;"></textarea></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    async function bindLessonEvents(hasSupabase) {
        const modal = document.getElementById('lessonModal')
        if (!modal) return
        document.getElementById('openLessonModal').onclick = () => {
            modal.style.display = 'flex'
            document.getElementById('lessonModalTitle').textContent = 'درس جديد'
            document.getElementById('editLessonId').value = ''
            document.getElementById('lessonForm').reset()
        }
        document.getElementById('closeLessonModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        document.querySelectorAll('.edit-lesson-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const lessons = hasSupabase ? await sb.getModuleLessons(currentModuleId) : []
                const l = lessons.find(x => x.id === btn.dataset.id)
                if (!l) return
                document.getElementById('lessonModalTitle').textContent = 'تعديل الدرس'
                document.getElementById('editLessonId').value = l.id
                document.getElementById('lTitle').value = l.title || ''
                document.getElementById('lDesc').value = l.description || ''
                document.getElementById('lVideo').value = l.video_url || ''
                document.getElementById('lDuration').value = l.duration || 0
                document.getElementById('lFree').value = l.is_free ? 'true' : 'false'
                document.getElementById('lContent').value = l.content || ''
                modal.style.display = 'flex'
            })
        })

        document.querySelectorAll('.delete-lesson-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف هذا الدرس؟')) return
                if (hasSupabase) await sb.deleteLesson(btn.dataset.id)
                renderUI('lessons')
            })
        })

        document.getElementById('lessonForm').onsubmit = async (e) => {
            e.preventDefault()
            const editId = document.getElementById('editLessonId').value
            const data = {
                module_id: currentModuleId,
                title: document.getElementById('lTitle').value,
                description: document.getElementById('lDesc').value,
                video_url: document.getElementById('lVideo').value,
                duration: parseInt(document.getElementById('lDuration').value) || 0,
                is_free: document.getElementById('lFree').value === 'true',
                content: document.getElementById('lContent').value,
                order_index: Date.now()
            }
            if (editId) {
                if (hasSupabase) await sb.updateLesson(editId, data)
            } else {
                if (hasSupabase) await sb.createLesson(data)
            }
            modal.style.display = 'none'
            renderUI('lessons')
        }
    }

    /* ---- STUDENTS ---- */
    async function renderStudents(hasSupabase) {
        let enrollments = []
        if (hasSupabase) {
            enrollments = await sb.getTeacherEnrollments(uid())
        } else {
            const courses = window.db.getCourses().filter(c => c.teacherId === user.id || (c.teacherIds || []).includes(user.id))
            const allUsers = window.db.getUsers()
            enrollments = []
            courses.forEach(c => {
                (c.studentsEnrolled || []).forEach(sId => {
                    const s = allUsers.find(u => u.id === sId)
                    if (s) enrollments.push({ student: { full_name: s.name, email: s.email }, course: { title: c.title }, progress_percentage: 0 })
                })
            })
        }
        /* Group by student */
        const grouped = {}
        enrollments.forEach(e => {
            const email = e.student?.email || 'unknown'
            if (!grouped[email]) grouped[email] = { student: e.student, courses: [] }
            grouped[email].courses.push({ title: e.course?.title || '', progress: e.progress_percentage || 0 })
        })
        const list = Object.values(grouped)

        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>الطالب</th><th>البريد</th><th>الكورسات</th><th>التقدم</th></tr></thead>
                    <tbody>
                        ${list.length ? list.map(g => `
                            <tr>
                                <td><strong>${esc(g.student?.full_name || '')}</strong></td>
                                <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${esc(g.student?.email || '')}</td>
                                <td>${g.courses.map(c => esc(c.title)).join(', ')}</td>
                                <td><span style="color:#00D4FF;font-weight:700;">${Math.round(g.courses.reduce((s, c) => s + c.progress, 0) / g.courses.length)}%</span></td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا يوجد طلاب مسجلين</td></tr>'}
                    </tbody>
                </table>
            </div>
        `
    }

    /* ---- ASSESSMENTS ---- */
    async function renderAssessments(hasSupabase) {
        let assessments = [], courses = []
        if (hasSupabase) {
            courses = await sb.getTeacherCourses(uid())
            for (const c of courses) {
                const as = await sb.getCourseAssessments(c.id)
                as.forEach(a => a.course_title = c.title)
                assessments.push(...as)
            }
            for (const a of assessments) {
                a.questions_count = a.questions_count || 0
            }
        } else {
            courses = window.db.getCourses()
            window.db.getCourses().forEach(c => {
                window.db.getAssessments(c.id).forEach(a => {
                    a.course_title = c.title
                    a.questions_count = window.db.getQuestions(a.id).length
                    a.course_id = c.id
                    assessments.push(a)
                })
            })
        }
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <h4 style="margin:0;font-size:1.1rem;"><i class="fa-solid fa-file-pen" style="color:#A855F7;"></i> التقييمات</h4>
            </div>
            <div class="action-bar">
                <button class="ag-btn" id="openAssessmentModal"><i class="fa-solid fa-plus"></i> تقييم جديد</button>
            </div>
            <div id="assessmentList">
                ${assessments.length ? assessments.map((a, i) => `
                    <div class="dash-card" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;">
                        <div>
                            <strong>${esc(a.title)}</strong>
                            <br><span style="font-size:0.8rem;color:rgba(255,255,255,0.4);">${esc(a.course_title || '')} — ${a.questions_count || 0} أسئلة — ${a.passing_score || 0}% حد النجاح — ${a.time_limit || 0} دقيقة</span>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="ag-btn questions-btn" data-id="${a.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(0,212,255,0.1);color:#00D4FF;"><i class="fa-solid fa-list"></i> أسئلة</button>
                            <button class="ag-btn edit-assessment-btn" data-id="${a.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(168,85,247,0.1);color:#A855F7;"><i class="fa-solid fa-pen"></i></button>
                            <button class="ag-btn delete-assessment-btn" data-id="${a.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(255,77,77,0.1);color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state"><i class="fa-solid fa-file-pen"></i><p>لا توجد تقييمات بعد. أضف أول تقييم!</p></div>'}
            </div>
            <!-- Assessment Modal -->
            <div class="modal-overlay" id="assessmentModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:520px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="assessmentModalTitle">تقييم جديد</h3>
                        <button id="closeAssessmentModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="assessmentForm">
                        <input type="hidden" id="editAssessmentId">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">عنوان التقييم</label><input type="text" id="aTitle" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" required></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">وصف التقييم</label><textarea id="aDesc" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:60px;"></textarea></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الكورس</label><select id="aCourse" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;">${courses.map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></div>
                        <div style="display:flex;gap:12px;">
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الوقت (دقائق)</label><input type="number" id="aTime" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="0" value="30"></div>
                            <div style="flex:1;margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">حد النجاح (%)</label><input type="number" id="aPass" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="0" max="100" value="60"></div>
                        </div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    async function bindAssessmentEvents(hasSupabase) {
        const modal = document.getElementById('assessmentModal')
        if (!modal) return
        document.getElementById('openAssessmentModal').onclick = () => {
            modal.style.display = 'flex'
            document.getElementById('assessmentModalTitle').textContent = 'تقييم جديد'
            document.getElementById('editAssessmentId').value = ''
            document.getElementById('assessmentForm').reset()
        }
        document.getElementById('closeAssessmentModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        document.querySelectorAll('.edit-assessment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const a = hasSupabase ? await sb.getAssessmentById(btn.dataset.id) : window.db.getAssessmentById(btn.dataset.id)
                if (!a) return
                document.getElementById('assessmentModalTitle').textContent = 'تعديل التقييم'
                document.getElementById('editAssessmentId').value = a.id
                document.getElementById('aTitle').value = a.title || ''
                document.getElementById('aDesc').value = a.description || ''
                document.getElementById('aCourse').value = hasSupabase ? (a.course_id || '') : (a.courseId || '')
                document.getElementById('aTime').value = a.time_limit || 30
                document.getElementById('aPass').value = a.passing_score || 60
                modal.style.display = 'flex'
            })
        })

        document.querySelectorAll('.delete-assessment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف هذا التقييم وجميع أسئلته؟')) return
                if (hasSupabase) await sb.deleteAssessment(btn.dataset.id)
                else window.db.deleteAssessment(btn.dataset.id)
                renderUI('assessments')
            })
        })

        document.querySelectorAll('.questions-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentAssessmentId = btn.dataset.id
                renderUI('questions')
            })
        })

        document.getElementById('assessmentForm').onsubmit = async (e) => {
            e.preventDefault()
            const editId = document.getElementById('editAssessmentId').value
            const data = {
                course_id: document.getElementById('aCourse').value,
                title: document.getElementById('aTitle').value,
                description: document.getElementById('aDesc').value,
                time_limit: parseInt(document.getElementById('aTime').value) || 30,
                passing_score: parseInt(document.getElementById('aPass').value) || 60
            }
            if (editId) {
                if (hasSupabase) await sb.updateAssessment(editId, data)
                else window.db.updateAssessment(editId, { ...data, courseId: data.course_id })
            } else {
                if (hasSupabase) await sb.createAssessment(data)
                else window.db.addAssessment({ ...data, courseId: data.course_id })
            }
            modal.style.display = 'none'
            renderUI('assessments')
        }
    }

    /* ---- QUESTIONS ---- */
    async function renderQuestions(hasSupabase) {
        if (!currentAssessmentId) return '<div class="empty-state"><p>اختر تقييماً أولاً</p></div>'
        let assessment, questions = []
        if (hasSupabase) {
            assessment = await sb.getAssessmentById(currentAssessmentId)
            questions = await sb.getAssessmentQuestions(currentAssessmentId)
        } else {
            assessment = window.db.getAssessmentById(currentAssessmentId)
            questions = window.db.getQuestions(currentAssessmentId)
        }
        return `
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="ag-btn ag-btn-outline" onclick="document.querySelector('[data-section=assessments]').click()" style="padding:8px 18px;font-size:0.8rem;"><i class="fa-solid fa-arrow-right"></i> رجوع</button>
                <h4 style="margin:0;font-size:1.1rem;">${esc(assessment?.title || '')} — الأسئلة</h4>
            </div>
            <div class="action-bar" style="gap:10px;">
                <button class="ag-btn" id="openQuestionModal" data-type="mcq"><i class="fa-solid fa-plus"></i> MCQ</button>
                <button class="ag-btn" id="openQuestionTrueFalse" data-type="truefalse"><i class="fa-solid fa-plus"></i> صح/خطأ</button>
                <button class="ag-btn" id="openQuestionFillBlank" data-type="fillblank"><i class="fa-solid fa-plus"></i> أكمل الفراغ</button>
                <button class="ag-btn" id="aiGenerateBtn" style="background:linear-gradient(135deg,#A855F7,#FF3366);"><i class="fa-solid fa-wand-magic-sparkles"></i> توليد أسئلة بالذكاء الاصطناعي</button>
            </div>
            <div id="aiGenStatus" style="display:none;padding:12px 16px;border-radius:12px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);margin-bottom:15px;font-size:0.85rem;color:#c084fc;"></div>
            <div id="questionList">
                ${questions.length ? questions.map((q, i) => {
                    const typeLabels = { mcq: 'اختيار متعدد', truefalse: 'صح/خطأ', fillblank: 'أكمل الفراغ' }
                    const correctDisplay = q.question_type === 'truefalse' ? (q.correct_answer === 'true' ? 'صح' : 'خطأ') : esc(q.correct_answer || '')
                    return `
                    <div class="dash-card" style="margin-bottom:10px;padding:16px 20px;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                            <div style="flex:1;">
                                <strong>${i + 1}. ${esc(q.question_text)}</strong>
                                <br><span style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${typeLabels[q.question_type] || q.question_type} | الإجابة: ${correctDisplay}</span>
                                ${q.options && q.options.length ? '<br><span style="font-size:0.75rem;color:rgba(255,255,255,0.3);">الخيارات: ' + q.options.join(' | ') + '</span>' : ''}
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="ag-btn edit-question-btn" data-id="${q.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(168,85,247,0.1);color:#A855F7;"><i class="fa-solid fa-pen"></i></button>
                                <button class="ag-btn delete-question-btn" data-id="${q.id}" style="padding:6px 14px;font-size:0.75rem;background:rgba(255,77,77,0.1);color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>`
                }).join('') : '<div class="empty-state"><i class="fa-solid fa-question"></i><p>لا توجد أسئلة بعد. أضف سؤالاً أو ولّد أسئلة بالذكاء الاصطناعي!</p></div>'}
            </div>
            <!-- Question Modal -->
            <div class="modal-overlay" id="questionModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:550px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;">
                        <h3 style="margin:0;font-weight:800;" id="questionModalTitle">سؤال جديد</h3>
                        <button id="closeQuestionModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button>
                    </div>
                    <form id="questionForm">
                        <input type="hidden" id="editQuestionId">
                        <input type="hidden" id="qType">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">نص السؤال</label><textarea id="qText" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:60px;" required></textarea></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الدرجة</label><input type="number" id="qScore" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;" min="1" value="1"></div>
                        <div id="mcqOptions" style="margin-bottom:15px;display:none;">
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الخيارات (كل سطر خيار)</label>
                            <textarea id="qOptions" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;min-height:80px;font-family:monospace;" placeholder="خيار 1&#10;خيار 2&#10;خيار 3&#10;خيار 4"></textarea>
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;margin-top:10px;">الإجابة الصحيحة (نص مطابق لأحد الخيارات)</label>
                            <input type="text" id="qCorrect" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;">
                        </div>
                        <div id="truefalseOptions" style="margin-bottom:15px;display:none;">
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الإجابة الصحيحة</label>
                            <select id="tfCorrect" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option value="true">صح</option><option value="false">خطأ</option></select>
                        </div>
                        <div id="fillblankOptions" style="margin-bottom:15px;display:none;">
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">الإجابة الصحيحة</label>
                            <input type="text" id="fbCorrect" style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;">
                        </div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-save"></i> حفظ</button>
                    </form>
                </div>
            </div>
        `
    }

    async function bindQuestionEvents(hasSupabase) {
        function setupQuestionModal(type) {
            const modal = document.getElementById('questionModal')
            document.getElementById('questionModalTitle').textContent = type === 'mcq' ? 'سؤال اختيار متعدد' : type === 'truefalse' ? 'سؤال صح/خطأ' : 'سؤال أكمل الفراغ'
            document.getElementById('editQuestionId').value = ''
            document.getElementById('qType').value = type
            document.getElementById('questionForm').reset()
            document.getElementById('mcqOptions').style.display = type === 'mcq' ? 'block' : 'none'
            document.getElementById('truefalseOptions').style.display = type === 'truefalse' ? 'block' : 'none'
            document.getElementById('fillblankOptions').style.display = type === 'fillblank' ? 'block' : 'none'
            modal.style.display = 'flex'
        }

        document.getElementById('openQuestionModal')?.addEventListener('click', () => setupQuestionModal('mcq'))
        document.getElementById('openQuestionTrueFalse')?.addEventListener('click', () => setupQuestionModal('truefalse'))
        document.getElementById('openQuestionFillBlank')?.addEventListener('click', () => setupQuestionModal('fillblank'))

        const modal = document.getElementById('questionModal')
        if (!modal) return
        document.getElementById('closeQuestionModal').onclick = () => modal.style.display = 'none'
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none' })

        document.querySelectorAll('.edit-question-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const questions = hasSupabase ? await sb.getAssessmentQuestions(currentAssessmentId) : window.db.getQuestions(currentAssessmentId)
                const q = questions.find(x => x.id === btn.dataset.id)
                if (!q) return
                const type = q.question_type || 'mcq'
                document.getElementById('questionModalTitle').textContent = 'تعديل السؤال'
                document.getElementById('editQuestionId').value = q.id
                document.getElementById('qType').value = type
                document.getElementById('qText').value = q.question_text || ''
                document.getElementById('qScore').value = q.score || 1
                document.getElementById('mcqOptions').style.display = type === 'mcq' ? 'block' : 'none'
                document.getElementById('truefalseOptions').style.display = type === 'truefalse' ? 'block' : 'none'
                document.getElementById('fillblankOptions').style.display = type === 'fillblank' ? 'block' : 'none'
                if (type === 'mcq') {
                    document.getElementById('qOptions').value = (q.options || []).join('\n')
                    document.getElementById('qCorrect').value = q.correct_answer || ''
                } else if (type === 'truefalse') {
                    document.getElementById('tfCorrect').value = q.correct_answer === 'true' ? 'true' : 'false'
                } else if (type === 'fillblank') {
                    document.getElementById('fbCorrect').value = q.correct_answer || ''
                }
                modal.style.display = 'flex'
            })
        })

        document.querySelectorAll('.delete-question-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('حذف هذا السؤال؟')) return
                if (hasSupabase) await sb.deleteQuestion(btn.dataset.id)
                else window.db.deleteQuestion(btn.dataset.id)
                renderUI('questions')
            })
        })

        /* --- AI Question Generation (Pollinations) --- */
        const aiBtn = document.getElementById('aiGenerateBtn')
        if (aiBtn) {
            aiBtn.addEventListener('click', async () => {
                const status = document.getElementById('aiGenStatus')
                const assessment = hasSupabase ? await sb.getAssessmentById(currentAssessmentId) : window.db.getAssessmentById(currentAssessmentId)
                const course = window.db.getCourseById(parseInt(hasSupabase ? (assessment?.course_id || 0) : (assessment?.courseId || 0)))
                const topic = (assessment?.title || (course?.title || '') || 'General')
                const count = window.prompt('كم سؤالاً تريد توليدها؟ (1-20)', '5')
                const num = Math.max(1, Math.min(20, parseInt(count) || 5))
                status.style.display = 'block'
                status.textContent = '🤖 جارٍ توليد ' + num + ' أسئلة عن «' + topic + '»...'
                aiBtn.disabled = true
                try {
                    let generated = null
                    if (window.NextGen && window.NextGen.AI && typeof window.NextGen.AI.generateQuestions === 'function') {
                        generated = await window.NextGen.AI.generateQuestions(topic, num)
                    }
                    if (!generated || !generated.length) {
                        generated = await fetch('https://text.pollinations.ai/' + encodeURIComponent(
                            'Generate exactly ' + num + ' quiz questions about: ' + topic +
                            '. Return ONLY a valid JSON array. Each item: {"question_text":"...","question_type":"mcq","options":["A","B","C","D"],"correct_answer":"A","score":1}. Vary types: mcq, truefalse, fillblank. For truefalse use options [] and correct_answer "true" or "false". For fillblank: options [] and correct_answer the word.'
                        )).then(r => r.text()).then(t => {
                            const m = t.match(/\[[\s\S]*\]/)
                            if (!m) return []
                            return JSON.parse(m[0])
                        })
                    }
                    if (!generated || !generated.length) throw new Error('empty')
                    let added = 0
                    for (const q of generated) {
                        const qType = q.question_type || 'mcq'
                        if (hasSupabase) {
                            await sb.createQuestion({
                                assessment_id: currentAssessmentId,
                                question_type: qType,
                                question_text: q.question_text || q.questionText || '',
                                options: qType === 'mcq' ? (q.options || []).map(String) : [],
                                correct_answer: String(q.correct_answer || ''),
                                score: q.score || 1,
                                order_index: Date.now() + added
                            })
                        } else {
                            window.db.addQuestion({
                                assessmentId: currentAssessmentId,
                                question_type: qType,
                                question_text: q.question_text || q.questionText || '',
                                options: qType === 'mcq' ? (q.options || []).map(String) : [],
                                correct_answer: String(q.correct_answer || ''),
                                score: q.score || 1,
                                orderIndex: Date.now() + added
                            })
                        }
                        added++
                    }
                    status.style.color = '#4ade80'
                    status.textContent = '✅ تم توليد وإضافة ' + added + ' سؤال بنجاح!'
                    setTimeout(() => { status.style.display = 'none'; renderUI('questions') }, 1200)
                } catch (err) {
                    console.error('[teacher] AI generation error:', err)
                    status.style.color = '#ff4d4d'
                    status.textContent = 'فشل الاتصال بالذكاء الاصطناعي — تحقق من الإنترنت ثم أعد المحاولة.'
                } finally {
                    aiBtn.disabled = false
                }
            })
        }

        document.getElementById('questionForm').onsubmit = async (e) => {
            e.preventDefault()
            const editId = document.getElementById('editQuestionId').value
            const type = document.getElementById('qType').value
            let correctAnswer = ''
            let options = []
            if (type === 'mcq') {
                options = document.getElementById('qOptions').value.split('\n').map(s => s.trim()).filter(Boolean)
                correctAnswer = document.getElementById('qCorrect').value.trim()
            } else if (type === 'truefalse') {
                correctAnswer = document.getElementById('tfCorrect').value
            } else if (type === 'fillblank') {
                correctAnswer = document.getElementById('fbCorrect').value.trim()
            }
            const data = {
                assessment_id: currentAssessmentId,
                question_type: type,
                question_text: document.getElementById('qText').value,
                options: options,
                correct_answer: correctAnswer,
                score: parseInt(document.getElementById('qScore').value) || 1,
                order_index: Date.now()
            }
            if (editId) {
                if (hasSupabase) await sb.updateQuestion(editId, { question_text: data.question_text, options: data.options, correct_answer: data.correct_answer, score: data.score })
                else window.db.updateQuestion(editId, { question_text: data.question_text, options: data.options, correct_answer: data.correct_answer, score: data.score })
            } else {
                if (hasSupabase) await sb.createQuestion(data)
                else window.db.addQuestion({ ...data, assessmentId: data.assessment_id, orderIndex: data.order_index })
            }
            modal.style.display = 'none'
            renderUI('questions')
        }
    }

    /* ---- REVENUE ---- */
    async function renderRevenue(hasSupabase) {
        let revenues = [], totalTeacher = 0, totalAcademy = 0
        if (hasSupabase) {
            revenues = await sb.getTeacherRevenues(uid())
            totalTeacher = revenues.reduce((s, r) => s + (r.teacher_share || 0), 0)
            totalAcademy = revenues.reduce((s, r) => s + (r.academy_share || 0), 0)
        } else {
            const fin = (window.db.getFinancials() || []).filter(f => f.teacherId == user.id)
            revenues = fin.map(f => ({ course: { title: f.description || '' }, amount: f.amount, teacher_share: f.teacherShare, status: f.status || 'pending', created_at: f.at || f.createdAt }))
            totalTeacher = revenues.reduce((s, r) => s + (r.teacher_share || 0), 0)
            totalAcademy = revenues.reduce((s, r) => s + ((r.amount || 0) - (r.teacher_share || 0)), 0)
        }
        const paid = revenues.filter(r => r.status === 'paid').reduce((s, r) => s + (r.teacher_share || 0), 0)
        const pending = revenues.filter(r => r.status === 'pending').reduce((s, r) => s + (r.teacher_share || 0), 0)
        const myRequests = (window.db.getSettlementRequests() || []).filter(r => r.userId == user.id)
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">$${totalTeacher}</div><p class="label">حصة المعلم (70%)</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">$${totalAcademy}</div><p class="label">حصة الأكاديمية (30%)</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${pending}</div><p class="label">معلق</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">$${paid}</div><p class="label">مدفوع</p></div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>الكورس</th><th>المبلغ</th><th>حصة المعلم</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                    <tbody>
                        ${revenues.length ? revenues.map(r => `
                            <tr>
                                <td style="font-size:0.85rem;">${esc(r.course?.title || '')}</td>
                                <td>$${r.amount || 0}</td>
                                <td style="color:#10b981;font-weight:700;">$${r.teacher_share || 0}</td>
                                <td>${r.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">معلق</span>'}</td>
                                <td style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${r.created_at ? new Date(r.created_at).toLocaleDateString('ar') : '-'}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد أرباح بعد</td></tr>'}
                    </tbody>
                </table>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;margin-top:25px;">
                <div style="padding:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.09);border-radius:14px;">
                    <h4 style="color:#fff;margin:0 0 15px;"><i class="fa-solid fa-hand-holding-dollar" style="color:#10b981;margin-left:8px;"></i>طلب سحب الأرباح</h4>
                    <div class="form-group"><label class="form-label">المبلغ (USD)</label><input type="number" id="settleAmount" class="form-control" min="1" max="${Math.max(totalTeacher - (myRequests.filter(r => r.status === 'pending').reduce((s, r) => s + (r.amount || 0), 0)), 0)}" placeholder="0.00"></div>
                    <div class="form-group"><label class="form-label">طريقة الاستلام</label>
                        <select id="settleMethod" class="form-select">
                            <option value="bank">تحويل بنكي</option>
                            <option value="wallet">محفظة الكترونية</option>
                            <option value="cash">استلام نقدي</option>
                        </select>
                    </div>
                    <div class="form-group"><label class="form-label">بيانات الاستلام (رقم حساب / محفظة)</label><input type="text" id="settleDetails" class="form-control" placeholder="مثال: رقم IBAN أو رقم المحفظة"></div>
                    <button class="btn btn-neon" id="settleSubmitBtn" style="width:100%;">إرسال طلب السحب</button>
                    <div id="settleStatus" style="font-size:.8rem;margin-top:10px;min-height:16px;"></div>
                </div>
                <div>
                    <h4 style="color:#fff;margin:0 0 15px;"><i class="fa-solid fa-clock-rotate-left" style="color:#FBBF24;margin-left:8px;"></i>طلباتي السابقة</h4>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                            <tbody>
                                ${myRequests.length ? myRequests.map(r => `
                                    <tr>
                                        <td>$${r.amount || 0}</td>
                                        <td style="font-size:0.8rem;">${r.method === 'bank' ? 'تحويل بنكي' : r.method === 'wallet' ? 'محفظة' : 'نقدي'}</td>
                                        <td>${r.status === 'paid' ? '<span style="color:#10b981;">تم الدفع</span>' : r.status === 'rejected' ? '<span style="color:#ff5d7a;">مرفوض</span>' : '<span style="color:#FBBF24;">قيد المراجعة</span>'}</td>
                                        <td style="font-size:0.75rem;color:rgba(255,255,255,0.4);">${r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar') : '-'}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);">لا توجد طلبات سحب بعد</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `
    }

    function bindSettlementEvents() {
        const btn = document.getElementById('settleSubmitBtn')
        if (!btn) return
        btn.addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('settleAmount').value) || 0
            const method = document.getElementById('settleMethod').value
            const details = document.getElementById('settleDetails').value.trim()
            const statusEl = document.getElementById('settleStatus')
            const pendingAmount = (window.db.getSettlementRequests() || []).filter(r => r.userId == user.id && r.status === 'pending').reduce((s, r) => s + (r.amount || 0), 0)
            const available = Math.max((window.db.getFinancials() || []).filter(f => f.teacherId == user.id).reduce((s, f) => s + (f.teacherShare || 0), 0) - pendingAmount, 0)

            if (amount <= 0) { statusEl.textContent = 'أدخل مبلغاً صحيحاً'; statusEl.style.color = '#ff5d7a'; return }
            if (amount > available) { statusEl.textContent = `المبلغ المتاح للسحب $${available} فقط`; statusEl.style.color = '#ff5d7a'; return }
            if (!details) { statusEl.textContent = 'أدخل بيانات الاستلام'; statusEl.style.color = '#ff5d7a'; return }

            window.db.addSettlementRequest({ userId: user.id, userName: user.name, email: user.email, amount, method, details, status: 'pending' })
            try {
                if (window.db.addNotification) window.db.addNotification({ user_id: 3, title: 'طلب سحب أرباح جديد', message: `طلب سحب $${amount} من المعلم «${user.name}»`, type: 'financial' })
                window.db.addNotification({ user_id: user.id, title: 'تم إرسال طلب السحب', message: `طلب سحب $${amount} قيد المراجعة من الإدارة`, type: 'financial' })
            } catch (e) {}
            statusEl.textContent = '✓ تم إرسال الطلب بنجاح — قيد مراجعة الإدارة'
            statusEl.style.color = '#10b981'
            setTimeout(() => renderUI('revenue'), 1200)
        })
    }

    /* ---- NEXTGEN: Assignments ---- */
    function renderAssignments() {
        const courseContainer = document.createElement('div')
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const courses = (d.courses || []).filter(c => c.instructor_id == user.id || user.type === 'admin')
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-file-pen" style="color:#A855F7"></i> إدارة الواجبات</h3>
            <p style="color:#888;margin-bottom:20px">اختر كورساً لعرض وإدارة واجباته</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:15px;margin-bottom:20px">
                ${courses.map(c => `
                    <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.3s" onclick="document.getElementById('assignSection_${c.id}').style.display=document.getElementById('assignSection_${c.id}').style.display==='none'?'block':'none'">
                        <div style="color:#fff;font-weight:600;margin-bottom:5px">${esc(c.title)}</div>
                        <div style="color:#888;font-size:13px">${(d.assignments || []).filter(a => a.courseId == c.id).length} واجبات</div>
                    </div>
                    <div id="assignSection_${c.id}" style="display:none;grid-column:1/-1">
                        <div id="assignContainer_${c.id}"></div>
                    </div>
                `).join('')}
                ${courses.length === 0 ? '<p style="color:#666;padding:30px;text-align:center">لا توجد كورسات</p>' : ''}
            </div>
            <script>
                setTimeout(() => {
                    ${courses.map(c => `if(NextGen.Assignments) NextGen.Assignments.renderAssignmentList('${c.id}', 'assignContainer_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Live Classes ---- */
    function renderLive() {
        const courseContainer = document.createElement('div')
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const courses = (d.courses || []).filter(c => c.instructor_id == user.id || user.type === 'admin')
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-video" style="color:#22c55e"></i> الحصص المباشرة</h3>
            <p style="color:#888;margin-bottom:20px">اختر كورساً لإدارة الحصص المباشرة</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:15px;margin-bottom:20px">
                ${courses.map(c => `
                    <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.3s" onclick="document.getElementById('liveSection_${c.id}').style.display=document.getElementById('liveSection_${c.id}').style.display==='none'?'block':'none'">
                        <div style="color:#fff;font-weight:600;margin-bottom:5px">${esc(c.title)}</div>
                        <div style="color:#888;font-size:13px">${(d.liveClasses || []).filter(lc => lc.courseId == c.id).length} حصص</div>
                    </div>
                    <div id="liveSection_${c.id}" style="display:none;grid-column:1/-1">
                        <div id="liveContainer_${c.id}"></div>
                    </div>
                `).join('')}
                ${courses.length === 0 ? '<p style="color:#666;padding:30px;text-align:center">لا توجد كورسات</p>' : ''}
            </div>
            <script>
                setTimeout(() => {
                    ${courses.map(c => `if(NextGen.Live) NextGen.Live.renderSchedule('${c.id}', 'liveContainer_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Forum ---- */
    function renderForum() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const courses = (d.courses || []).filter(c => c.instructor_id == user.id || user.type === 'admin')
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-comments" style="color:#00D4FF"></i> مناقشات الكورسات</h3>
            <p style="color:#888;margin-bottom:20px">اختر كورساً لعرض المناقشات</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:15px;margin-bottom:20px">
                ${courses.map(c => {
                    const threadCount = (d.threads || []).filter(t => t.courseId == c.id).length
                    return `
                        <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.3s" onclick="document.getElementById('forumSection_${c.id}').style.display=document.getElementById('forumSection_${c.id}').style.display==='none'?'block':'none'">
                            <div style="color:#fff;font-weight:600;margin-bottom:5px">${esc(c.title)}</div>
                            <div style="color:#888;font-size:13px">${threadCount} نقاشات</div>
                        </div>
                        <div id="forumSection_${c.id}" style="display:none;grid-column:1/-1">
                            <div id="forumContainer_${c.id}"></div>
                        </div>
                    `
                }).join('')}
                ${courses.length === 0 ? '<p style="color:#666;padding:30px;text-align:center">لا توجد كورسات</p>' : ''}
            </div>
            <script>
                setTimeout(() => {
                    ${courses.map(c => `if(NextGen.Communication) NextGen.Communication.renderForum('${c.id}', 'forumContainer_${c.id}');`).join('')}
                }, 200)
            </script>
        `
    }

    /* ---- NEXTGEN: Teacher Analytics ---- */
    function renderAnalytics() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const courses = (d.courses || []).filter(c => c.instructor_id == user.id || user.type === 'admin')
        const courseIds = courses.map(c => c.id)
        const assignments = (d.assignments || []).filter(a => courseIds.includes(a.courseId))
        const submissions = (d.submissions || []).filter(s => assignments.some(a => a.id === s.assignmentId))
        const liveClasses = (d.liveClasses || []).filter(lc => courseIds.includes(lc.courseId))
        const threads = (d.threads || []).filter(t => courseIds.includes(t.courseId))
        const totalStudents = new Set((d.courses || []).filter(c => courseIds.includes(c.id)).flatMap(c => c.studentsEnrolled || [])).size

        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-chart-line" style="color:#00D4FF"></i> التحليلات</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;margin-bottom:25px">
                ${NextGen.UI ? `
                    ${NextGen.UI.renderStatCard('fa-book', 'الكورسات', courses.length, '#00D4FF')}
                    ${NextGen.UI.renderStatCard('fa-users', 'الطلاب', totalStudents, '#A855F7')}
                    ${NextGen.UI.renderStatCard('fa-file-pen', 'الواجبات', assignments.length, '#22c55e')}
                    ${NextGen.UI.renderStatCard('fa-check-circle', 'التصحيحات', submissions.filter(s=>s.status==='graded').length+'/'+submissions.length, '#FBBF24')}
                    ${NextGen.UI.renderStatCard('fa-video', 'الحصص المباشرة', liveClasses.length, '#22c55e')}
                    ${NextGen.UI.renderStatCard('fa-comments', 'المناقشات', threads.length, '#00D4FF')}
                ` : ''}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h4 style="color:#fff;margin:0 0 15px">📊 أداء الكورسات</h4>
                    ${courses.map(c => {
                        const cAssignments = assignments.filter(a => a.courseId == c.id)
                        const cSubs = submissions.filter(s => cAssignments.some(a => a.id === s.assignmentId))
                        const graded = cSubs.filter(s => s.status === 'graded')
                        const rate = cSubs.length ? Math.round((graded.length / cSubs.length) * 100) : 0
                        return `
                            <div style="margin-bottom:12px">
                                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                                    <span style="color:#aaa">${esc(c.title)}</span>
                                    <span style="color:#fff">${cSubs.length} تسليم · ${rate}% مصحح</span>
                                </div>
                                ${NextGen.UI ? NextGen.UI.renderProgressBar(rate, '#00D4FF') : ''}
                            </div>
                        `
                    }).join('') || '<p style="color:#666;text-align:center;padding:20px">لا توجد بيانات</p>'}
                </div>
                <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                    <h4 style="color:#fff;margin:0 0 15px">📈 الإحصائيات السريعة</h4>
                    <div style="display:grid;gap:10px">
                        <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px">
                            <span style="color:#aaa">متوسط درجات الطلاب</span>
                            <span style="color:#FBBF24;font-weight:700">${submissions.filter(s=>s.grade).length ? Math.round(submissions.filter(s=>s.grade).reduce((sum,s)=>sum+s.grade,0)/submissions.filter(s=>s.grade).length) : 0}%</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px">
                            <span style="color:#aaa">إجمالي الحصص المباشرة</span>
                            <span style="color:#22c55e;font-weight:700">${liveClasses.length}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px">
                            <span style="color:#aaa">إجمالي المشاركات</span>
                            <span style="color:#00D4FF;font-weight:700">${threads.reduce((s,t)=>s+(t.replies||0),0)}</span>
                        </div>
                    </div>
                    <div style="margin-top:15px">
                        <button onclick="NextGen.Analytics?.exportReport('courses')" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(0,212,255,0.3);background:transparent;color:#00D4FF;cursor:pointer">📥 تصدير التقرير</button>
                    </div>
                </div>
            </div>
        `
    }

    /* ---- INIT ---- */
    renderUI().catch(err => {
        console.error('[teacher] initial renderUI error:', err)
        const c = document.getElementById('dashboardContent')
        if (c) c.innerHTML = '<div class="dash-wrap" style="padding:100px 30px;text-align:center;color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;margin-bottom:20px;"></i><p style="font-size:1.1rem;">حدث خطأ أثناء تحميل لوحة التحكم</p><button class="ag-btn" onclick="location.reload()" style="margin-top:20px;">إعادة المحاولة</button></div>'
    })
})

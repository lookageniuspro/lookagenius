document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'teacher') return;

    const teacherId = window.auth.currentUser.id;

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function getMyCourses() {
        return window.db.getCourses().filter(c => {
            if (c.teacherId === teacherId) return true;
            if (Array.isArray(c.teacherIds) && c.teacherIds.includes(teacherId)) return true;
            return false;
        });
    }

    function renderTeacherUI(section) {
        section = section || 'courses';
        const courses = getMyCourses();

        const sidebar = `
            <li><a href="#" class="sidebar-link ${section === 'courses' ? 'active' : ''}" data-section="courses"><i class="fa-solid fa-chalkboard-teacher"></i> كورساتي</a></li>
            <li><a href="#" class="sidebar-link ${section === 'students' ? 'active' : ''}" data-section="students"><i class="fa-solid fa-users"></i> الطلاب</a></li>
            <li><a href="#" class="sidebar-link ${section === 'attendance' ? 'active' : ''}" data-section="attendance"><i class="fa-solid fa-clipboard-list"></i> الحضور والغياب</a></li>
            <li><a href="#" class="sidebar-link ${section === 'stats' ? 'active' : ''}" data-section="stats"><i class="fa-solid fa-chart-line"></i> الإحصائيات</a></li>
        `;

        let content = '';
        if (section === 'courses') content = renderCoursesSection(courses);
        else if (section === 'students') content = renderStudentsSection();
        else if (section === 'attendance') content = renderAttendanceSection(courses);
        else if (section === 'stats') content = renderStatsSection(courses);

        const container = document.getElementById('dashboardContent');
        if (!container) return;
        container.innerHTML = renderDashboardLayout('لوحة تحكم المعلم', sidebar, content);
        setupEventListeners(courses, section);

        /* Re-bind sidebar navigation */
        container.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderTeacherUI(link.dataset.section);
            });
        });
    }

    function renderCoursesSection(courses) {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="font-weight: 800;">إدارة الكورسات</h2>
                <button class="btn btn-neon" id="openAddModal"><i class="fa-solid fa-plus"></i> إضافة كورس جديد</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px;">
                ${courses.length ? courses.map(c => `
                    <div class="glass-card course-card" data-course-id="${c.id}">
                        <div style="height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 15px;">
                            <img src="${escHtml(c.image || 'https://picsum.photos/seed/course/400/250')}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <h4>${escHtml(c.title)}</h4>
                        <p style="color: var(--text-secondary); margin: 10px 0; font-size: 0.9rem;">
                            <i class="fa-solid fa-tag"></i> ${escHtml(c.category)} | <i class="fa-solid fa-dollar-sign"></i> ${c.currency || '$'}${c.price || 0}
                        </p>
                        <p style="color: var(--text-secondary); font-size: 0.8rem;">
                            <i class="fa-solid fa-clock"></i> ${escHtml(c.duration || '')} | <i class="fa-solid fa-layer-group"></i> ${escHtml(c.stage || 'all')}
                        </p>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-outline edit-course-btn" style="flex: 1; font-size: 0.8rem;" data-id="${c.id}"><i class="fa-solid fa-pen"></i> تعديل</button>
                            <button class="btn btn-outline delete-course-btn" style="flex: 1; font-size: 0.8rem; color: #ff4d4d; border-color: #ff4d4d;" data-id="${c.id}"><i class="fa-solid fa-trash"></i> حذف</button>
                        </div>
                    </div>
                `).join('') : '<p style="color: var(--text-secondary);">لم تقم بإضافة أي كورسات بعد.</p>'}
            </div>

            <!-- Add/Edit Course Modal -->
            <div class="modal-overlay" id="courseModal">
                <div class="modal-content" style="max-width: 550px;">
                    <span class="modal-close" id="closeCourseModal"><i class="fa-solid fa-xmark"></i></span>
                    <h3 style="margin-bottom: 25px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;" id="courseModalTitle">إضافة كورس جديد</h3>
                    <form id="courseForm">
                        <input type="hidden" id="editCourseId">
                        <div class="form-group">
                            <label>اسم الكورس</label>
                            <input type="text" id="courseTitle" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>القسم</label>
                            <select id="courseCategory" class="form-control" required>
                                <option value="tech">البرمجة والتقنية</option>
                                <option value="languages">اللغات</option>
                                <option value="physics">الفيزياء</option>
                                <option value="chemistry">الكيمياء</option>
                                <option value="math">الرياضيات</option>
                                <option value="science">العلوم</option>
                                <option value="engineering">الهندسة</option>
                                <option value="social">الاجتماعيات</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>المرحلة</label>
                            <select id="courseStage" class="form-control">
                                <option value="all">كل المراحل</option>
                                <option value="primary">ابتدائي</option>
                                <option value="middle">إعدادي</option>
                                <option value="high">ثانوي</option>
                                <option value="university">جامعي</option>
                                <option value="career">مهني</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <div class="form-group" style="flex: 2;">
                                <label>السعر</label>
                                <input type="number" id="coursePrice" class="form-control" required min="0" step="0.01">
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>العملة</label>
                                <select id="courseCurrency" class="form-control">
                                    <option value="$">$</option>
                                    <option value="EGP">ج.م</option>
                                    <option value="SAR">﷼</option>
                                    <option value="AED">د.إ</option>
                                    <option value="€">€</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>المدة</label>
                            <input type="text" id="courseDuration" class="form-control" placeholder="مثال: 30 ساعة">
                        </div>
                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="courseDesc" class="form-control" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>رابط الصورة</label>
                            <input type="url" id="courseImg" class="form-control" placeholder="https://..." value="https://picsum.photos/seed/course/400/250">
                        </div>
                        <button type="submit" class="btn btn-neon" style="width: 100%; padding: 15px; margin-top: 20px;">
                            <i class="fa-solid fa-save"></i> حفظ الكورس
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    function renderStudentsSection() {
        const students = window.db.getUsers().filter(u => u.type === 'student');
        return `
            <h2 style="font-weight: 800; margin-bottom: 20px;">قائمة الطلاب</h2>
            <div class="glass-card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px;">#</th>
                            <th style="padding: 12px;">الاسم</th>
                            <th style="padding: 12px;">البريد الإلكتروني</th>
                            <th style="padding: 12px;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.length ? students.map((s, i) => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px;">${i + 1}</td>
                                <td style="padding: 12px;">${escHtml(s.name)}</td>
                                <td style="padding: 12px; color: var(--text-secondary);">${escHtml(s.email)}</td>
                                <td style="padding: 12px;"><span style="color: var(--success);">${s.active !== false ? 'نشط' : 'موقوف'}</span></td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-secondary);">لا يوجد طلاب مسجلين</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderAttendanceSection(courses) {
        return `
            <h2 style="font-weight: 800; margin-bottom: 20px;">إدارة الحضور والغياب</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <select id="attCourseSelect" class="form-control" style="width: 250px;">
                    <option value="">اختر الكورس</option>
                    ${courses.map(c => `<option value="${c.id}">${escHtml(c.title)}</option>`).join('')}
                </select>
                <input type="date" id="attDate" class="form-control" style="width: 180px;">
                <button class="btn btn-neon" id="openAttSessionBtn"><i class="fa-solid fa-plus"></i> جلسة جديدة</button>
            </div>
            <div id="attendanceRecords">
                <p style="color: var(--text-secondary);">اختر كورس لعرض سجلات الحضور</p>
            </div>
        `;
    }

    function renderStatsSection(courses) {
        const allStudents = window.db.getUsers().filter(u => u.type === 'student');
        const totalCourses = courses.length;
        const totalStudents = allStudents.length;
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-blue);">
                    <h3>${totalCourses}</h3>
                    <p>الكورسات</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-green);">
                    <h3>${totalStudents}</h3>
                    <p>الطلاب المسجلين</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-pink);">
                    <h3>${totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0}</h3>
                    <p>معدل طلاب لكل كورس</p>
                </div>
            </div>
            <div class="glass-card">
                <h3 class="mb-3">الكورسات (${totalCourses})</h3>
                ${courses.length ? courses.map(c => `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span>${escHtml(c.title)}</span>
                        <span style="color: var(--neon-blue);">${c.currency || '$'}${c.price || 0}</span>
                    </div>
                `).join('') : '<p style="color: var(--text-secondary);">لا توجد كورسات</p>'}
            </div>
        `;
    }

    function setupEventListeners(courses, section) {
        /* Course modal */
        const modal = document.getElementById('courseModal');
        const openBtn = document.getElementById('openAddModal');
        const closeBtn = document.getElementById('closeCourseModal');
        const form = document.getElementById('courseForm');
        const modalTitle = document.getElementById('courseModalTitle');

        if (openBtn) {
            openBtn.onclick = () => {
                modalTitle.textContent = 'إضافة كورس جديد';
                document.getElementById('editCourseId').value = '';
                document.getElementById('courseForm').reset();
                document.getElementById('courseImg').value = 'https://picsum.photos/seed/course/400/250';
                modal.classList.add('active');
            };
        }
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

        /* Edit buttons */
        document.querySelectorAll('.edit-course-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const c = window.db.getCourses().find(x => x.id === id);
                if (!c) return;
                modalTitle.textContent = 'تعديل الكورس';
                document.getElementById('editCourseId').value = c.id;
                document.getElementById('courseTitle').value = c.title || '';
                document.getElementById('courseCategory').value = c.category || 'tech';
                document.getElementById('courseStage').value = c.stage || 'all';
                document.getElementById('coursePrice').value = c.price || 0;
                document.getElementById('courseCurrency').value = c.currency || '$';
                document.getElementById('courseDuration').value = c.duration || '';
                document.getElementById('courseDesc').value = c.description || '';
                document.getElementById('courseImg').value = c.image || 'https://picsum.photos/seed/course/400/250';
                modal.classList.add('active');
            });
        });

        /* Delete buttons */
        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
                    window.db.deleteCourse(id);
                    renderTeacherUI('courses');
                }
            });
        });

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const editId = document.getElementById('editCourseId').value;
                const courseData = {
                    title: document.getElementById('courseTitle').value,
                    category: document.getElementById('courseCategory').value,
                    stage: document.getElementById('courseStage').value,
                    price: parseFloat(document.getElementById('coursePrice').value) || 0,
                    currency: document.getElementById('courseCurrency').value,
                    duration: document.getElementById('courseDuration').value,
                    description: document.getElementById('courseDesc').value,
                    image: document.getElementById('courseImg').value,
                    teacherIds: [teacherId]
                };

                if (editId) {
                    window.db.updateCourse(parseInt(editId), courseData);
                    alert('تم تحديث الكورس بنجاح!');
                } else {
                    window.db.addCourse(courseData);
                    alert('تمت إضافة الكورس بنجاح!');
                }
                modal.classList.remove('active');
                renderTeacherUI('courses');
            };
        }

        /* Attendance */
        const attCourseSelect = document.getElementById('attCourseSelect');
        const attDate = document.getElementById('attDate');
        const openAttBtn = document.getElementById('openAttSessionBtn');
        const recordsDiv = document.getElementById('attendanceRecords');

        if (attCourseSelect) {
            attCourseSelect.onchange = () => renderAttendanceRecords(attCourseSelect.value, recordsDiv);
        }

        if (openAttBtn) {
            openAttBtn.onclick = () => {
                const courseId = attCourseSelect ? attCourseSelect.value : '';
                const date = attDate ? attDate.value : '';
                if (!courseId || !date) {
                    alert('يرجى اختيار الكورس والتاريخ أولاً');
                    return;
                }
                const students = window.db.getUsers().filter(u => u.type === 'student');
                const session = {
                    courseId: parseInt(courseId),
                    date: date,
                    records: students.map(s => ({ userId: s.id, status: 'absent' }))
                };
                window.db.addAttendanceSession(session);
                renderAttendanceRecords(courseId, recordsDiv);
                alert('تم إنشاء جلسة الحضور');
            };
        }

        if (recordsDiv) {
            recordsDiv.addEventListener('change', (e) => {
                if (e.target.classList.contains('att-status-select')) {
                    const sessionId = parseInt(e.target.dataset.sessionId);
                    const userId = parseInt(e.target.dataset.userId);
                    window.db.markAttendance(sessionId, userId, e.target.value);
                }
            });
        }
    }

    function renderAttendanceRecords(courseId, container) {
        if (!courseId || !container) {
            container.innerHTML = '<p style="color: var(--text-secondary);">اختر كورس لعرض سجلات الحضور</p>';
            return;
        }
        const sessions = window.db.getAttendanceForCourse(parseInt(courseId));
        const course = window.db.getCourses().find(c => c.id === parseInt(courseId));
        const students = window.db.getUsers().filter(u => u.type === 'student');

        if (!sessions.length) {
            container.innerHTML = '<p style="color: var(--text-secondary);">لا توجد جلسات حضور لهذا الكورس بعد. أنشئ جلسة جديدة.</p>';
            return;
        }

        let html = `
            <div class="glass-card" style="overflow-x: auto;">
                <h4 style="margin-bottom: 15px;">سجلات حضور: ${escHtml(course ? course.title : '')}</h4>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.85rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 8px;">الطالب</th>
                            ${sessions.map(s => `<th style="padding: 8px; text-align: center;">${s.date.slice(5)}</th>`).join('')}
                            <th style="padding: 8px; text-align: center;">النسبة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => {
                            const stats = window.db.getStudentAttendanceStats(student.id);
                            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 8px;">${escHtml(student.name)}</td>
                                    ${sessions.map(s => {
                                        const rec = s.records.find(r => r.userId === student.id);
                                        const status = rec ? rec.status : '-';
                                        const color = status === 'present' ? 'var(--success)' : status === 'absent' ? '#ff4d4d' : 'var(--text-secondary)';
                                        return `<td style="padding: 8px; text-align: center;">
                                            <select class="att-status-select" data-session-id="${s.id}" data-user-id="${student.id}" style="background: transparent; color: ${color}; border: 1px solid ${color}; border-radius: 5px; padding: 3px 5px; font-size: 0.75rem;">
                                                <option value="present" ${status === 'present' ? 'selected' : ''}>✔ حاضر</option>
                                                <option value="absent" ${status === 'absent' ? 'selected' : ''}>✘ غائب</option>
                                            </select>
                                        </td>`;
                                    }).join('')}
                                    <td style="padding: 8px; text-align: center; color: var(--neon-blue); font-weight: bold;">${stats.rate}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = html;
    }

    renderTeacherUI();
});

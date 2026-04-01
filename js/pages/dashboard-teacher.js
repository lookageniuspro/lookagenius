document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'teacher') return;

    const teacherId = window.auth.currentUser.id;
    
    function renderTeacherUI() {
        const courses = window.db.getCourses().filter(c => c.teacherId === teacherId);

        const sidebar = `
            <li><a href="#" class="sidebar-link active"><i class="fa-solid fa-chalkboard-teacher"></i> كورساتي</a></li>
            <li><a href="#" class="sidebar-link"><i class="fa-solid fa-users"></i> الطلاب</a></li>
            <li><a href="#" class="sidebar-link"><i class="fa-solid fa-chart-line"></i> الإحصائيات</a></li>
        `;

        const content = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="font-weight: 800;">إدارة الكورسات</h2>
                <button class="btn btn-neon" id="openAddModal"><i class="fa-solid fa-plus"></i> إضافة كورس جديد</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px;">
                ${courses.length ? courses.map(c => `
                    <div class="glass-card">
                        <div style="height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 15px;">
                            <img src="${c.image}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <h4>${c.title}</h4>
                        <p style="color: var(--text-secondary); margin: 10px 0; font-size: 0.9rem;">
                            <i class="fa-solid fa-tag"></i> القسم: ${c.category} | <i class="fa-solid fa-dollar-sign"></i> ${c.price}
                        </p>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.8rem;">تعديل</button>
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.8rem; color: #ff4d4d; border-color: #ff4d4d;">حذف</button>
                        </div>
                    </div>
                `).join('') : '<p style="color: var(--text-secondary);">لم تقم بإضافة أي كورسات بعد.</p>'}
            </div>

            <!-- Add Course Modal -->
            <div class="modal-overlay" id="addCourseModal">
                <div class="modal-content">
                    <span class="modal-close" id="closeAddModal"><i class="fa-solid fa-xmark"></i></span>
                    <h3 style="margin-bottom: 25px; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">إضافة كورس جديد</h3>
                    <form id="addCourseForm">
                        <div class="form-group">
                            <label>اسم الكورس</label>
                            <input type="text" id="courseTitle" class="form-control" placeholder="مثلاً: أساسيات البرمجة" required>
                        </div>
                        <div class="form-group">
                            <label>القسم</label>
                            <select id="courseCategory" class="form-control" required>
                                <option value="tech">البرمجة والتقنية</option>
                                <option value="languages">اللغات</option>
                                <option value="physics">الفيزياء</option>
                                <option value="chemistry">الكيمياء</option>
                                <option value="math">الرياضيات</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>السعر ($)</label>
                            <input type="number" id="coursePrice" class="form-control" placeholder="مثلاً: 50" required>
                        </div>
                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea id="courseDesc" class="form-control" rows="3" placeholder="وصف مختصر للكورس..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>رابط الصورة</label>
                            <input type="url" id="courseImg" class="form-control" placeholder="https://..." value="https://picsum.photos/seed/course/400/250">
                        </div>
                        <button type="submit" class="btn btn-neon" style="width: 100%; padding: 15px; margin-top: 20px;">نشر الكورس الآن <i class="fa-solid fa-paper-plane"></i></button>
                    </form>
                </div>
            </div>
        `;

        const container = document.getElementById('dashboardContent');
        if (container) {
            container.innerHTML = renderDashboardLayout('لوحة تحكم المعلم', sidebar, content);
            setupEventListeners();
        }
    }

    function setupEventListeners() {
        const modal = document.getElementById('addCourseModal');
        const openBtn = document.getElementById('openAddModal');
        const closeBtn = document.getElementById('closeAddModal');
        const form = document.getElementById('addCourseForm');

        if (openBtn) openBtn.onclick = () => modal.classList.add('active');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const courseData = {
                    title: document.getElementById('courseTitle').value,
                    category: document.getElementById('courseCategory').value,
                    price: parseFloat(document.getElementById('coursePrice').value),
                    description: document.getElementById('courseDesc').value,
                    image: document.getElementById('courseImg').value,
                    teacherId: teacherId
                };

                window.db.addCourse(courseData);
                alert('تمت إضافة الكورس بنجاح!');
                modal.classList.remove('active');
                renderTeacherUI(); // Refresh list
            };
        }
    }

    renderTeacherUI();
});

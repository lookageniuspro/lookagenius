document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'engineer') return;

    const user = window.auth.currentUser;

    function renderUI(section) {
        section = section || 'projects';

        const sidebar = `
            <li><a href="#" class="${section === 'projects' ? 'active' : ''}" data-section="projects"><i class="fa-solid fa-code"></i> المشاريع</a></li>
            <li><a href="#" class="${section === 'tasks' ? 'active' : ''}" data-section="tasks"><i class="fa-solid fa-tasks"></i> المهام</a></li>
            <li><a href="#" class="${section === 'stats' ? 'active' : ''}" data-section="stats"><i class="fa-solid fa-chart-simple"></i> الإحصائيات</a></li>
        `;

        let content = '';
        if (section === 'projects') content = renderProjects();
        else if (section === 'tasks') content = renderTasks();
        else if (section === 'stats') content = renderStats();

        const container = document.getElementById('dashboardContent');
        if (!container) return;
        container.innerHTML = renderDashboardLayout('لوحة تحكم المهندس', sidebar, content);
        bindLogout();
        bindNav();
        bindProjectEvents();
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => { e.preventDefault(); renderUI(link.dataset.section); });
        });
    }

    function renderProjects() {
        return `
            <div class="action-bar">
                <button class="ag-btn" id="openProjectModal"><i class="fa-solid fa-plus"></i> مشروع جديد</button>
            </div>
            <div class="course-grid">
                ${[1,2,3].map(i => `
                    <div class="course-card-dash">
                        <div class="img-wrap"><img src="https://picsum.photos/seed/project${i}/400/250" alt="" loading="lazy"><span class="badge">${['ويب','تطبيق','ذكاء اصطناعي'][i-1]}</span></div>
                        <div class="body"><h4>مشروع ${['نظام إدارة','متجر إلكتروني','مساعد ذكي'][i-1]}</h4><p class="meta" style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${['React + Node.js','Flutter','Python + TensorFlow'][i-1]} ● ${['نشط','قيد التطوير','مكتمل'][i-1]}</p></div>
                    </div>
                `).join('')}
            </div>

            <div class="modal-overlay" id="projectModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center;">
                <div class="dash-card" style="max-width:500px;width:90%;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;"><h3 style="margin:0;font-weight:800;">مشروع جديد</h3><button id="closeProjectModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button></div>
                    <form id="projectForm">
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">اسم المشروع</label><input type="text" required style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div>
                        <div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">نوع المشروع</label><select style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option>ويب</option><option>تطبيق</option><option>ذكاء اصطناعي</option></select></div>
                        <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-plus"></i> إنشاء المشروع</button>
                    </form>
                </div>
            </div>
        `;
    }

    function renderTasks() {
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>المهمة</th><th>المشروع</th><th>تاريخ التسليم</th><th>الحالة</th></tr></thead>
                    <tbody>
                        <tr><td>تصميم قاعدة البيانات</td><td>نظام إدارة</td><td style="color:rgba(255,255,255,0.4);">2026-07-10</td><td><span style="color:#00D4FF;">قيد التنفيذ</span></td></tr>
                        <tr><td>إعداد واجهة المستخدم</td><td>متجر إلكتروني</td><td style="color:rgba(255,255,255,0.4);">2026-07-15</td><td><span style="color:#10b981;">مكتمل</span></td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderStats() {
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">3</div><p class="label">المشاريع النشطة</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">12</div><p class="label">المهام المنجزة</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">2</div><p class="label">قيد التطوير</p></div>
            </div>
        `;
    }

    function bindProjectEvents() {
        const modal = document.getElementById('projectModal');
        if (!modal) return;
        document.getElementById('openProjectModal').onclick = () => modal.style.display = 'flex';
        document.getElementById('closeProjectModal').onclick = () => modal.style.display = 'none';
        modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.getElementById('projectForm').onsubmit = e => { e.preventDefault(); modal.style.display = 'none'; renderUI('projects'); };
    }

    renderUI();
});

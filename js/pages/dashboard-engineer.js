document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.ready
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'engineer') { window.location.href = 'login.html'; return }

    const user = window.auth.currentUser;

    function renderUI(section) {
        section = section || 'projects';

        const sidebar = `
            <li><a href="#" class="${section === 'projects' ? 'active' : ''}" data-section="projects"><i class="fa-solid fa-code"></i> المشاريع</a></li>
            <li><a href="#" class="${section === 'tasks' ? 'active' : ''}" data-section="tasks"><i class="fa-solid fa-tasks"></i> المهام</a></li>
            <li><a href="#" class="${section === 'stats' ? 'active' : ''}" data-section="stats"><i class="fa-solid fa-chart-simple"></i> الإحصائيات</a></li>
            <li><a href="#" class="${section === 'calendar' ? 'active' : ''}" data-section="calendar"><i class="fa-solid fa-calendar-days"></i> التقويم</a></li>
            <li><a href="#" class="${section === 'chat' ? 'active' : ''}" data-section="chat"><i class="fa-solid fa-comments"></i> المحادثات</a></li>
        `;

        let content = '';
        if (section === 'projects') content = renderProjects();
        else if (section === 'tasks') content = renderTasks();
        else if (section === 'stats') content = renderStats();
        else if (section === 'calendar') content = renderCalendar();
        else if (section === 'chat') content = renderChat();

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
                <div class="dash-card" style="max-width:500px;width:90%;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:15px;"><h3 style="margin:0;font-weight:800;">مشروع جديد</h3><button id="closeProjectModal" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.5rem;cursor:pointer;">&times;</button></div>
                    <form id="projectForm"><div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">اسم المشروع</label><input type="text" required style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;box-sizing:border-box;"></div><div style="margin-bottom:15px;"><label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.85rem;">نوع المشروع</label><select style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:white;outline:none;"><option>ويب</option><option>تطبيق</option><option>ذكاء اصطناعي</option></select></div>
                    <button type="submit" class="ag-btn" style="width:100%;justify-content:center;padding:14px;"><i class="fa-solid fa-plus"></i> إنشاء المشروع</button></form>
                </div>
            </div>
        `;
    }

    function renderTasks() {
        return `
            <div class="table-wrap"><table>
                <thead><tr><th>المهمة</th><th>المشروع</th><th>تاريخ التسليم</th><th>الحالة</th></tr></thead>
                <tbody><tr><td>تصميم قاعدة البيانات</td><td>نظام إدارة</td><td style="color:rgba(255,255,255,0.4);">2026-07-10</td><td><span style="color:#00D4FF;">قيد التنفيذ</span></td></tr>
                <tr><td>إعداد واجهة المستخدم</td><td>متجر إلكتروني</td><td style="color:rgba(255,255,255,0.4);">2026-07-15</td><td><span style="color:#10b981;">مكتمل</span></td></tr></tbody>
            </table></div>
        `;
    }

    function renderStats() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const projects = (d.learningPaths || []).filter(p => p.createdBy == user.id)
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">3</div><p class="label">المشاريع النشطة</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">12</div><p class="label">المهام المنجزة</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">2</div><p class="label">قيد التطوير</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${(d.messages||[]).filter(m=>m.to==user.id&&!m.read).length}</div><p class="label">رسائل غير مقروءة</p></div>
            </div>
            <div style="margin-top:20px;padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                <h4 style="color:#fff;margin:0 0 15px">📊 نشاطك</h4>
                <div id="engineerActivity"></div>
                <script>
                    setTimeout(() => {
                        if (NextGen.Communication) {
                            const d = NextGen.DB ? NextGen.DB.getData() : {}
                            const activities = (d.messages || []).filter(m => m.from === '${user.id}' || m.to === '${user.id}')
                                .map(m => ({ text: m.text.slice(0, 50) + (m.text.length > 50 ? '...' : ''), time: NextGen.UI ? NextGen.UI.formatDate(m.createdAt) : '', icon: 'fa-comment', color: '#00D4FF' }))
                            NextGen.Communication.renderActivityFeed('engineerActivity', activities)
                        }
                    }, 200)
                </script>
            </div>
        `;
    }

    function renderCalendar() {
        return `<h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-calendar-days" style="color:#00D4FF"></i> التقويم</h3><div id="engineerCalendar"></div>
            <script>setTimeout(() => { if (NextGen.Live) NextGen.Live.renderCalendar('engineerCalendar', '${user.id}') }, 200)</script>`
    }

    function renderChat() {
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-comments" style="color:#00D4FF"></i> المحادثات</h3>
            <p style="color:#888;margin-bottom:20px">تواصل مع فريق العمل والإدارة</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px">
                <button onclick="NextGen.Communication.openChat('admin', 'الإدارة')" style="padding:20px;border-radius:16px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);color:#00D4FF;cursor:pointer;font-size:16px;text-align:center;transition:all 0.3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'"><i class="fa-solid fa-building" style="display:block;font-size:32px;margin-bottom:10px"></i> الإدارة</button>
                <button onclick="NextGen.Communication.openChat('teacher', 'فريق التدريس')" style="padding:20px;border-radius:16px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);color:#A855F7;cursor:pointer;font-size:16px;text-align:center;transition:all 0.3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'"><i class="fa-solid fa-chalkboard-user" style="display:block;font-size:32px;margin-bottom:10px"></i> فريق التدريس</button>
            </div>
            <div style="padding:20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
                <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-clock-rotate-left" style="color:#00D4FF"></i> آخر المحادثات</h4>
                <div id="engineerChatHistory"></div>
                <script>
                    setTimeout(() => {
                        const d = NextGen.DB ? NextGen.DB.getData() : {}
                        const msgs = (d.messages || []).filter(m => m.from === '${user.id}' || m.to === '${user.id}').slice(-10).reverse()
                        const container = document.getElementById('engineerChatHistory')
                        if (container) {
                            if (msgs.length) {
                                container.innerHTML = msgs.map(m => \`
                                    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                                        <span style="color:#aaa;font-size:13px">\${m.from === '${user.id}' ? 'أنت:' : 'آخر:'} \${m.text.slice(0, 40)}\${m.text.length > 40 ? '...' : ''}</span>
                                        <span style="color:#666;font-size:11px">\${m.createdAt ? new Date(m.createdAt).toLocaleDateString('ar') : ''}</span>
                                    </div>
                                \`).join('')
                            } else {
                                container.innerHTML = '<p style="color:#666;text-align:center;padding:20px">لا توجد محادثات سابقة</p>'
                            }
                        }
                    }, 200)
                </script>
            </div>
        `
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

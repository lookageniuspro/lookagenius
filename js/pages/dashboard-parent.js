document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'parent') return;

    const user = window.auth.currentUser;

    function getChildren() {
        const studentEmail = user.details && user.details.studentEmail;
        if (!studentEmail) return [];
        return window.db.getUsers().filter(u => u.type === 'student' && u.email === studentEmail);
    }

    function getChildrenInvoices(childrenIds) {
        return window.db.getInvoices().filter(inv => childrenIds.includes(inv.userId));
    }

    function renderUI(section) {
        section = section || 'overview';
        const children = getChildren();
        const childrenIds = children.map(c => c.id);

        const sidebar = `
            <li><a href="#" class="${section === 'overview' ? 'active' : ''}" data-section="overview"><i class="fa-solid fa-users"></i> الأبناء</a></li>
            <li><a href="#" class="${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice"></i> الفواتير</a></li>
            <li><a href="#" class="${section === 'progress' ? 'active' : ''}" data-section="progress"><i class="fa-solid fa-chart-line"></i> التقارير</a></li>
        `;

        let content = '';
        if (section === 'overview') content = renderOverview(children);
        else if (section === 'invoices') content = renderInvoices(getChildrenInvoices(childrenIds));
        else if (section === 'progress') content = renderProgress(children);

        const container = document.getElementById('dashboardContent');
        if (!container) return;
        container.innerHTML = renderDashboardLayout('لوحة تحكم ولي الأمر', sidebar, content);
        bindLogout();
        bindNav();
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => { e.preventDefault(); renderUI(link.dataset.section); });
        });
    }

    function renderOverview(children) {
        if (!children.length) {
            return '<div class="empty-state"><i class="fa-solid fa-child"></i><p>لم يتم ربط أي طالب بحسابك. تواصل مع الإدارة.</p></div>';
        }
        return children.map(child => {
            const attStats = window.db.getStudentAttendanceStats(child.id);
            const enrolled = window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(child.id));
            const invoices = window.db.getInvoicesForUser(child.id);
            const pending = invoices.filter(i => i.status === 'pending');
            const paid = invoices.filter(i => i.status === 'paid');
            const totalPaid = paid.reduce((s, i) => s + (i.amount || 0), 0);
            return `
                <div class="dash-card" style="margin-bottom:20px;border-right:4px solid #00D4FF;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                        <div><h4 style="margin:0;"><i class="fa-solid fa-user-graduate" style="color:#00D4FF;"></i> ${escHtml(child.name)}</h4><p style="margin:4px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.4);">${escHtml(child.email)}</p></div>
                        <div style="display:flex;gap:15px;font-size:0.85rem;">
                            <span><i class="fa-solid fa-check-circle" style="color:#10b981;"></i> الحضور: ${attStats.rate}%</span>
                            <span><i class="fa-solid fa-book" style="color:#00D4FF;"></i> المسجل: ${enrolled.length}</span>
                            <span><i class="fa-solid fa-file-invoice" style="color:#FBBF24;"></i> فواتير: ${pending.length}</span>
                        </div>
                    </div>
                    <div style="margin-top:15px;">
                        <p style="font-size:0.85rem;color:rgba(255,255,255,0.5);">إجمالي المدفوعات: <strong style="color:#10b981;">$${totalPaid}</strong></p>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderInvoices(invoices) {
        if (!invoices.length) {
            return '<div class="empty-state"><i class="fa-solid fa-file-invoice"></i><p>لا توجد فواتير</p></div>';
        }
        const users = window.db.getUsers();
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>الطالب</th><th>الوصف</th><th>المبلغ</th><th>تاريخ الإصدار</th><th>تاريخ الاستحقاق</th><th>الحالة</th></tr></thead>
                    <tbody>${invoices.map((inv, i) => {
                        const student = users.find(u => u.id === inv.userId);
                        return `<tr><td>${i+1}</td><td>${escHtml(student ? student.name : '#' + inv.userId)}</td><td>${escHtml(inv.description || '')}</td><td style="font-weight:700;">${inv.currency || '$'}${inv.amount || 0}</td><td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.issuedAt || '-'}</td><td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.dueAt || '-'}</td><td>${inv.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">غير مدفوع</span>'}</td></tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        `;
    }

    function renderProgress(children) {
        if (!children.length) return '<div class="empty-state"><i class="fa-solid fa-child"></i><p>لم يتم ربط أي طالب</p></div>';
        return children.map(child => {
            const attStats = window.db.getStudentAttendanceStats(child.id);
            const enrolled = window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(child.id));
            return `
                <div class="dash-card" style="margin-bottom:20px;">
                    <h4>تقدم ${escHtml(child.name)}</h4>
                    <div class="stats-grid" style="margin-bottom:15px;">
                        <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;font-size:1.5rem;">${attStats.present}</div><p class="label">حضور</p></div>
                        <div class="stat-card" style="border-top:3px solid #ff4d4d;"><div class="num" style="color:#ff4d4d;font-size:1.5rem;">${attStats.absent}</div><p class="label">غياب</p></div>
                        <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;font-size:1.5rem;">${attStats.rate}%</div><p class="label">نسبة الحضور</p></div>
                    </div>
                    <h5 style="font-size:0.9rem;margin:0 0 10px;color:rgba(255,255,255,0.6);">الكورسات المسجلة</h5>
                    ${enrolled.length ? enrolled.map(c => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;"><span>${escHtml(c.title)}</span><span style="color:#00D4FF;">${c.currency || '$'}${c.price || 0}</span></div>`).join('') : '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">لا توجد كورسات مسجلة</p>'}
                </div>
            `;
        }).join('');
    }

    renderUI();
});

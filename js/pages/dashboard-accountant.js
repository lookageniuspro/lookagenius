document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'accountant') return;

    const user = window.auth.currentUser;

    function renderUI(section) {
        section = section || 'invoices';

        const sidebar = `
            <li><a href="#" class="${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice-dollar"></i> الفواتير</a></li>
            <li><a href="#" class="${section === 'payments' ? 'active' : ''}" data-section="payments"><i class="fa-solid fa-money-bill-transfer"></i> المدفوعات</a></li>
            <li><a href="#" class="${section === 'stats' ? 'active' : ''}" data-section="stats"><i class="fa-solid fa-chart-pie"></i> التقارير المالية</a></li>
        `;

        let content = '';
        if (section === 'invoices') content = renderInvoices();
        else if (section === 'payments') content = renderPayments();
        else if (section === 'stats') content = renderStats();

        const container = document.getElementById('dashboardContent');
        if (!container) return;
        container.innerHTML = renderDashboardLayout('لوحة تحكم المحاسب', sidebar, content);
        bindLogout();
        bindNav();
    }

    function bindNav() {
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => { e.preventDefault(); renderUI(link.dataset.section); });
        });
    }

    function renderInvoices() {
        const invoices = window.db.getInvoices();
        const users = window.db.getUsers();
        const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);
        const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
        return `
            <div class="stats-grid" style="margin-bottom:20px;">
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${totalPending}</div><p class="label">إجمالي المستحق</p></div>
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">$${totalPaid}</div><p class="label">إجمالي المدفوعات</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${invoices.length}</div><p class="label">عدد الفواتير</p></div>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>الطالب</th><th>الوصف</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                    <tbody>${invoices.length ? invoices.map((inv, i) => {
                        const student = users.find(u => u.id === inv.userId);
                        return `<tr><td>${i+1}</td><td>${escHtml(student ? student.name : '#' + inv.userId)}</td><td style="color:rgba(255,255,255,0.5);">${escHtml(inv.description || '')}</td><td style="font-weight:700;">${inv.currency || '$'}${inv.amount || 0}</td><td>${inv.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">غير مدفوع</span>'}</td><td style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${inv.issuedAt || '-'}</td></tr>`;
                    }).join('') : '<tr><td colspan="6" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد فواتير</td></tr>'}</tbody>
                </table>
            </div>
        `;
    }

    function renderPayments() {
        const payments = window.db.getPayments();
        const users = window.db.getUsers();
        if (!payments.length) return '<div class="empty-state"><i class="fa-solid fa-money-bill-wave"></i><p>لا توجد مدفوعات مسجلة</p></div>';
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>الطالب</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th></tr></thead>
                    <tbody>${payments.map((p, i) => {
                        const student = users.find(u => u.id === p.userId);
                        return `<tr><td>${i+1}</td><td>${escHtml(student ? student.name : '#' + p.userId)}</td><td style="font-weight:700;color:#10b981;">${p.currency || '$'}${p.amount || 0}</td><td style="color:rgba(255,255,255,0.5);">${escHtml(p.method || 'نقدي')}</td><td style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${p.date || '-'}</td></tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        `;
    }

    function renderStats() {
        const invoices = window.db.getInvoices();
        const payments = window.db.getPayments();
        const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">$${totalRevenue}</div><p class="label">الإيرادات</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${totalPending}</div><p class="label">المستحقات</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${payments.length}</div><p class="label">عدد المعاملات</p></div>
            </div>
        `;
    }

    renderUI();
});

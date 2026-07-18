document.addEventListener('DOMContentLoaded', async () => {
    await window.auth.ready
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'accountant') { window.location.href = 'login.html'; return }

    const user = window.auth.currentUser;

    function renderUI(section) {
        section = section || 'invoices';

        const sidebar = `
            <li><a href="#" class="${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice-dollar"></i> الفواتير</a></li>
            <li><a href="#" class="${section === 'payments' ? 'active' : ''}" data-section="payments"><i class="fa-solid fa-money-bill-transfer"></i> المدفوعات</a></li>
            <li><a href="#" class="${section === 'stats' ? 'active' : ''}" data-section="stats"><i class="fa-solid fa-chart-pie"></i> التقارير المالية</a></li>
            <li><a href="#" class="${section === 'paymob' ? 'active' : ''}" data-section="paymob"><i class="fa-solid fa-credit-card"></i> مدفوعات Paymob</a></li>
            <li><a href="#" class="${section === 'subscriptions' ? 'active' : ''}" data-section="subscriptions"><i class="fa-solid fa-arrows-rotate"></i> الاشتراكات</a></li>
            <li><a href="#" class="${section === 'coupons' ? 'active' : ''}" data-section="coupons"><i class="fa-solid fa-tags"></i> كوبونات الخصم</a></li>
        `;

        let content = '';
        if (section === 'invoices') content = renderInvoices();
        else if (section === 'payments') content = renderPayments();
        else if (section === 'stats') content = renderStats();
        else if (section === 'paymob') content = renderPaymobPayments();
        else if (section === 'subscriptions') content = renderSubscriptions();
        else if (section === 'coupons') content = renderCoupons();

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
                    <thead><tr><th>#</th><th>الطالب</th><th>الوصف</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
                    <tbody>${invoices.length ? invoices.map((inv, i) => {
                        const student = users.find(u => u.id === inv.userId);
                        return `<tr><td>${i+1}</td><td>${escHtml(student ? student.name : '#' + inv.userId)}</td><td style="color:rgba(255,255,255,0.5);">${escHtml(inv.description || '')}</td><td style="font-weight:700;">${inv.currency || '$'}${inv.amount || 0}</td><td>${inv.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : '<span style="color:#FBBF24;">غير مدفوع</span>'}</td><td style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${inv.issuedAt || '-'}</td>
                        <td>${inv.status !== 'paid' ? `<button onclick="window.db.payInvoice(${inv.id});renderUI('invoices')" style="padding:4px 10px;border-radius:6px;border:none;background:rgba(16,185,129,0.15);color:#10b981;cursor:pointer;font-size:11px">تسديد</button>` : '-'}</td>
                        </tr>`;
                    }).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد فواتير</td></tr>'}</tbody>
                </table>
            </div>
        `;
    }

    function renderPayments() {
        const payments = window.db.getPayments();
        const users = window.db.getUsers();
        if (!payments.length) return '<div class="empty-state"><i class="fa-solid fa-money-bill-wave"></i><p>لا توجد مدفوعات مسجلة</p></div>';
        return `
            <div class="table-wrap"><table>
                <thead><tr><th>#</th><th>الطالب</th><th>المبلغ</th><th>طريقة الدفع</th><th>التاريخ</th></tr></thead>
                <tbody>${payments.map((p, i) => {
                    const student = users.find(u => u.id === p.userId);
                    return `<tr><td>${i+1}</td><td>${escHtml(student ? student.name : '#' + p.userId)}</td><td style="font-weight:700;color:#10b981;">${p.currency || '$'}${p.amount || 0}</td><td style="color:rgba(255,255,255,0.5);">${escHtml(p.method || 'نقدي')}</td><td style="color:rgba(255,255,255,0.4);font-size:0.75rem;">${p.date || '-'}</td></tr>`;
                }).join('')}</tbody>
            </table></div>
        `;
    }

    function renderStats() {
        const invoices = window.db.getInvoices();
        const payments = window.db.getPayments();
        const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0);
        // NextGen enhanced stats
        const ngPayments = NextGen.DB ? NextGen.DB.getPayments() : []
        const ngTotalRevenue = ngPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
        const subscriptions = NextGen.DB ? (NextGen.DB.getData().subscriptions || []) : []
        const activeSubs = subscriptions.filter(s => s.status === 'active').length
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">$${totalRevenue + ngTotalRevenue}</div><p class="label">الإيرادات الكلية</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">$${totalPending}</div><p class="label">المستحقات</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${payments.length + ngPayments.length}</div><p class="label">عدد المعاملات</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${activeSubs}</div><p class="label">الاشتراكات النشطة</p></div>
            </div>
            ${NextGen.Analytics ? `<div style="margin-top:20px"><button onclick="NextGen.Analytics.exportReport('platform')" style="padding:12px 30px;border-radius:12px;border:1px solid rgba(0,212,255,0.3);background:transparent;color:#00D4FF;cursor:pointer">📥 تصدير تقرير المنصة</button></div>` : ''}
        `;
    }

    function renderPaymobPayments() {
        const payments = NextGen.DB ? NextGen.DB.getPayments().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
        const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-credit-card" style="color:#00D4FF"></i> مدفوعات Paymob</h3>
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${payments.filter(p => p.status === 'paid').length}</div><p class="label">مدفوع</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${payments.filter(p => p.status === 'pending').length}</div><p class="label">معلق</p></div>
                <div class="stat-card" style="border-top:3px solid #ef4444;"><div class="num" style="color:#ef4444;">${payments.filter(p => p.status === 'failed').length}</div><p class="label">فاشل</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${totalPaid.toFixed(2)} EGP</div><p class="label">إجمالي المدفوع</p></div>
            </div>
            ${payments.length ? `<div class="table-wrap"><table>
                <thead><tr><th>المستخدم</th><th>الوصف</th><th>المبلغ</th><th>طريقة الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                <tbody>${payments.map(p => `<tr>
                    <td style="font-size:0.85rem;">${escHtml(p.userId || '')}</td>
                    <td style="font-size:0.85rem;color:rgba(255,255,255,0.5)">${escHtml(p.description || '')}</td>
                    <td style="font-weight:700;color:${p.status === 'paid' ? '#10b981' : '#FBBF24'}">${p.amount || 0} ${p.currency || 'EGP'}</td>
                    <td style="font-size:0.85rem;">${escHtml(p.method || '-')}</td>
                    <td>${p.status === 'paid' ? '<span style="color:#10b981;">مدفوع</span>' : p.status === 'failed' ? '<span style="color:#ef4444;">فاشل</span>' : '<span style="color:#FBBF24;">معلق</span>'}</td>
                    <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('ar') : '-'}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-credit-card"></i><p>لا توجد مدفوعات إلكترونية</p></div>'}
        `
    }

    function renderSubscriptions() {
        const d = NextGen.DB ? NextGen.DB.getData() : {}
        const subs = (d.subscriptions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        const active = subs.filter(s => s.status === 'active')
        const totalMonthly = active.filter(s => s.interval === 'monthly').reduce((s, sub) => s + (sub.amount || 0), 0)
        const totalYearly = active.filter(s => s.interval === 'yearly').reduce((s, sub) => s + (sub.amount || 0), 0)
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-arrows-rotate" style="color:#00D4FF"></i> الاشتراكات</h3>
            <div class="stats-grid" style="margin-bottom:20px">
                <div class="stat-card" style="border-top:3px solid #10b981;"><div class="num" style="color:#10b981;">${active.length}</div><p class="label">نشط</p></div>
                <div class="stat-card" style="border-top:3px solid #FBBF24;"><div class="num" style="color:#FBBF24;">${subs.filter(s => s.status === 'cancelled').length}</div><p class="label">ملغي</p></div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;"><div class="num" style="color:#00D4FF;">${totalMonthly} EGP/شهر</div><p class="label">إيرادات شهرية</p></div>
                <div class="stat-card" style="border-top:3px solid #A855F7;"><div class="num" style="color:#A855F7;">${totalYearly} EGP/سنة</div><p class="label">إيرادات سنوية</p></div>
            </div>
            ${subs.length ? `<div class="table-wrap"><table>
                <thead><tr><th>المستخدم</th><th>الخطة</th><th>المبلغ</th><th>الدورة</th><th>الحالة</th><th>تاريخ البدء</th><th>التجديد القادم</th></tr></thead>
                <tbody>${subs.map(s => `<tr>
                    <td style="font-size:0.85rem;">${escHtml(s.userId || '')}</td>
                    <td>${escHtml(s.plan || '')}</td>
                    <td style="font-weight:700;">${s.amount || 0} ${s.currency || 'EGP'}</td>
                    <td>${s.interval === 'monthly' ? 'شهري' : s.interval === 'yearly' ? 'سنوي' : s.interval}</td>
                    <td>${s.status === 'active' ? '<span style="color:#10b981;">نشط</span>' : '<span style="color:#ef4444;">ملغي</span>'}</td>
                    <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${s.startDate ? new Date(s.startDate).toLocaleDateString('ar') : '-'}</td>
                    <td style="font-size:0.8rem;color:rgba(255,255,255,0.4)">${s.nextBilling ? new Date(s.nextBilling).toLocaleDateString('ar') : '-'}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-arrows-rotate"></i><p>لا توجد اشتراكات</p></div>'}
        `
    }

    function renderCoupons() {
        const coupons = NextGen.DB ? NextGen.DB.getCoupons() : []
        return `
            <h3 style="color:#fff;margin:0 0 20px"><i class="fa-solid fa-tags" style="color:#FBBF24"></i> كوبونات الخصم</h3>
            ${coupons.length ? `<div class="table-wrap"><table>
                <thead><tr><th>الكود</th><th>الخصم</th><th>النوع</th><th>الاستخدامات</th><th>الحد الأقصى</th><th>الصلاحية</th><th>الحالة</th></tr></thead>
                <tbody>${coupons.map(c => `<tr>
                    <td><strong style="color:#00D4FF;font-family:monospace">${escHtml(c.code)}</strong></td>
                    <td style="font-weight:700;color:#FBBF24">${c.discount}${c.type === 'percent' ? '%' : ' EGP'}</td>
                    <td>${c.type === 'percent' ? 'نسبة' : 'قيمة'}</td>
                    <td>${c.usedCount || 0}</td>
                    <td>${c.maxUses || 'غير محدود'}</td>
                    <td style="font-size:0.8rem">${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('ar') : 'غير محدد'}</td>
                    <td>${c.active !== false ? '<span style="color:#10b981;">نشط</span>' : '<span style="color:#ef4444;">معطل</span>'}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty-state"><i class="fa-solid fa-tags"></i><p>لا توجد كوبونات</p></div>'}
        `
    }

    renderUI();
});

document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'student') return;

    const user = window.auth.currentUser;

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function renderStudentUI(section) {
        section = section || 'home';
        const enrolledCourses = window.db.getCourses().filter(c => {
            const enrolled = c.studentsEnrolled || [];
            return enrolled.includes(user.id);
        });
        const invoices = window.db.getInvoicesForUser(user.id);
        const attStats = window.db.getStudentAttendanceStats(user.id);

        const sidebar = `
            <li><a href="#" class="sidebar-link ${section === 'home' ? 'active' : ''}" data-section="home"><i class="fa-solid fa-home"></i> الرئيسية</a></li>
            <li><a href="#" class="sidebar-link ${section === 'courses' ? 'active' : ''}" data-section="courses"><i class="fa-solid fa-book-open"></i> كورساتي</a></li>
            <li><a href="#" class="sidebar-link ${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice"></i> الفواتير ${invoices.filter(i => i.status === 'pending').length ? `<span style="background: #ff4d4d; border-radius: 50%; padding: 0 6px; font-size: 0.7rem; color: white;">${invoices.filter(i => i.status === 'pending').length}</span>` : ''}</a></li>
            <li><a href="#" class="sidebar-link ${section === 'attendance' ? 'active' : ''}" data-section="attendance"><i class="fa-solid fa-clipboard-check"></i> الحضور</a></li>
        `;

        let content = '';
        if (section === 'home') content = renderHomeSection(enrolledCourses, invoices, attStats);
        else if (section === 'courses') content = renderCoursesSection(enrolledCourses);
        else if (section === 'invoices') content = renderInvoicesSection(invoices);
        else if (section === 'attendance') content = renderAttendanceSection(enrolledCourses);

        const container = document.getElementById('dashboardContent');
        if (!container) return;
        container.innerHTML = renderDashboardLayout('لوحة تحكم الطالب', sidebar, content);

        /* Tooltip for chart if needed */
        setTimeout(() => {
            const ctx = document.getElementById('studentProgressChart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                        datasets: [{
                            label: 'درجات الاختبارات',
                            data: [65, 75, 70, 85, 90, attStats.rate || 0],
                            borderColor: '#00f3ff',
                            backgroundColor: 'rgba(0, 243, 255, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }, 100);

        /* Bind sidebar navigation */
        container.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                renderStudentUI(link.dataset.section);
            });
        });

        /* Bind invoice pay buttons */
        container.querySelectorAll('.pay-invoice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('هل أنت متأكد من دفع الفاتورة؟')) {
                    window.db.payInvoice(id);
                    renderStudentUI('invoices');
                }
            });
        });
    }

    function renderHomeSection(enrolledCourses, invoices, attStats) {
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const totalPaid = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-blue);">
                    <h3>${enrolledCourses.length}</h3>
                    <p>الكورسات المسجلة</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-green);">
                    <h3>${attStats.rate}%</h3>
                    <p>نسبة الحضور</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-pink);">
                    <h3>${invoices.filter(i => i.status === 'pending').length}</h3>
                    <p>الفواتير الغير مدفوعة</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--warning);">
                    <h3>$${totalPaid}</h3>
                    <p>إجمالي المدفوعات</p>
                </div>
            </div>
            <div class="glass-card" style="margin-bottom: 30px;">
                <h3 class="mb-3">مخطط تقدمك</h3>
                <canvas id="studentProgressChart" style="width: 100%; height: 250px;"></canvas>
            </div>
            <h3 class="mt-4 mb-3">كورساتي الحالية</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                ${enrolledCourses.length > 0 ? enrolledCourses.slice(0, 3).map(c => `
                    <div class="glass-card">
                        <h4>${escHtml(c.title)}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${escHtml(c.category)} | ${c.currency || '$'}${c.price || 0}</p>
                        <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 10px; height: 10px; overflow: hidden; margin-top: 15px;">
                            <div style="width: ${Math.min(100, Math.floor(Math.random() * 80) + 20)}%; background: var(--gradient-primary); height: 100%; border-radius: 10px;"></div>
                        </div>
                    </div>
                `).join('') : '<p style="color: var(--text-secondary);">لم تشترك في أي كورس بعد.</p>'}
                ${enrolledCourses.length > 3 ? `<p style="color: var(--neon-blue); text-align: center; margin-top: 10px;"><a href="#" onclick="renderStudentUI('courses'); return false;" style="color: var(--neon-blue);">عرض الكل (${enrolledCourses.length})</a></p>` : ''}
            </div>
        `;
    }

    function renderCoursesSection(enrolledCourses) {
        return `
            <h2 style="font-weight: 800; margin-bottom: 20px;">كورساتي المسجلة</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px;">
                ${enrolledCourses.length ? enrolledCourses.map(c => `
                    <div class="glass-card">
                        <div style="height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 15px;">
                            <img src="${escHtml(c.image || 'https://picsum.photos/seed/course/400/250')}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <h4>${escHtml(c.title)}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 8px 0;">
                            <i class="fa-solid fa-tag"></i> ${escHtml(c.category)} | ${c.currency || '$'}${c.price || 0}
                        </p>
                        <p style="color: var(--text-secondary); font-size: 0.8rem;">
                            <i class="fa-solid fa-clock"></i> ${escHtml(c.duration || '')}
                        </p>
                        <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 10px; height: 10px; overflow: hidden; margin-top: 15px;">
                            <div style="width: ${Math.min(100, Math.floor(Math.random() * 80) + 20)}%; background: var(--gradient-primary); height: 100%; border-radius: 10px;"></div>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 5px;">تقدم الكورس</p>
                    </div>
                `).join('') : '<p style="color: var(--text-secondary);">لم تشترك في أي كورس بعد. تصفح الكورسات المتاحة من <a href="index.html#courses" style="color: var(--neon-blue);">الصفحة الرئيسية</a>.</p>'}
            </div>
        `;
    }

    function renderInvoicesSection(invoices) {
        return `
            <h2 style="font-weight: 800; margin-bottom: 20px;">الفواتير</h2>
            <div class="glass-card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <th style="padding: 12px;">#</th>
                            <th style="padding: 12px;">الوصف</th>
                            <th style="padding: 12px;">المبلغ</th>
                            <th style="padding: 12px;">تاريخ الإصدار</th>
                            <th style="padding: 12px;">تاريخ الاستحقاق</th>
                            <th style="padding: 12px;">الحالة</th>
                            <th style="padding: 12px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.length ? invoices.map((inv, i) => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 12px;">${i + 1}</td>
                                <td style="padding: 12px;">${escHtml(inv.description || '')}</td>
                                <td style="padding: 12px; font-weight: bold;">${inv.currency || '$'}${inv.amount || 0}</td>
                                <td style="padding: 12px; color: var(--text-secondary); font-size: 0.85rem;">${inv.issuedAt || '-'}</td>
                                <td style="padding: 12px; color: var(--text-secondary); font-size: 0.85rem;">${inv.dueAt || '-'}</td>
                                <td style="padding: 12px;">
                                    ${inv.status === 'paid' ? '<span style="color: var(--success);">مدفوع</span>' : '<span style="color: var(--warning);">غير مدفوع</span>'}
                                </td>
                                <td style="padding: 12px;">
                                    ${inv.status === 'pending' ? `<button class="btn btn-neon pay-invoice-btn" data-id="${inv.id}" style="padding: 5px 15px; font-size: 0.8rem;">دفع</button>` : `<span style="color: var(--success); font-size: 0.8rem;"><i class="fa-solid fa-check-circle"></i></span>`}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="padding: 20px; text-align: center; color: var(--text-secondary);">لا توجد فواتير</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderAttendanceSection(enrolledCourses) {
        const allSessions = window.db.getAttendance();
        const mySessions = window.db.getAttendanceForStudent(user.id);
        const stats = window.db.getStudentAttendanceStats(user.id);

        let courseAttendanceHtml = '';
        if (enrolledCourses.length) {
            courseAttendanceHtml = enrolledCourses.map(c => {
                const courseSessions = window.db.getAttendanceForCourse(c.id);
                if (!courseSessions.length) return '';
                let present = 0, absent = 0;
                courseSessions.forEach(s => {
                    const rec = s.records.find(r => r.userId === user.id);
                    if (rec) {
                        if (rec.status === 'present') present++;
                        else if (rec.status === 'absent') absent++;
                    }
                });
                const total = present + absent;
                const rate = total ? Math.round((present / total) * 100) : 0;
                return `
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span>${escHtml(c.title)}</span>
                        <span style="color: var(--neon-blue);">${rate}% (${present}/${total})</span>
                    </div>
                `;
            }).join('');
        }

        return `
            <h2 style="font-weight: 800; margin-bottom: 20px;">الحضور والغياب</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="glass-card text-center" style="border-top: 3px solid var(--success);">
                    <h3 style="color: var(--success);">${stats.present}</h3>
                    <p>حضور</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid #ff4d4d;">
                    <h3 style="color: #ff4d4d;">${stats.absent}</h3>
                    <p>غياب</p>
                </div>
                <div class="glass-card text-center" style="border-top: 3px solid var(--neon-blue);">
                    <h3>${stats.rate}%</h3>
                    <p>نسبة الحضور</p>
                </div>
            </div>
            <div class="glass-card">
                <h3 class="mb-3">تفاصيل الحضور حسب الكورس</h3>
                ${courseAttendanceHtml || '<p style="color: var(--text-secondary);">لا توجد سجلات حضور</p>'}
            </div>
        `;
    }

    renderStudentUI();
});

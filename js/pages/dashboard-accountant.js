/**
 * dashboard-accountant.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'accountant') return;

    const sidebar = `
        <li><a href="#" class="sidebar-link active" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-chart-pie"></i> نظرة عامة</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-file-invoice"></i> الفواتير</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-money-bill-wave"></i> المدفوعات</a></li>
    `;

    const content = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div class="glass-card text-center" style="border-top: 3px solid var(--neon-green);">
                <h3>$5,400</h3><p>الإيرادات</p>
            </div>
            <div class="glass-card text-center" style="border-top: 3px solid var(--neon-blue);">
                <h3>120</h3><p>الطلاب</p>
            </div>
            <div class="glass-card text-center" style="border-top: 3px solid var(--neon-pink);">
                <h3>$800</h3><p>فواتير مستحقة</p>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="mb-3">التحليل المالي</h3>
            <canvas id="financeChart" style="width: 100%; height: 250px;"></canvas>
        </div>

        <h3 class="mt-4 mb-3">السجل المالي</h3>
        <table style="width: 100%; text-align: right; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <th style="padding: 10px;">الكورس</th>
                    <th style="padding: 10px;">المبلغ</th>
                </tr>
            </thead>
            <tbody>
                ${window.db.getPayments().map(p => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px;">${window.db.getCourseById(p.courseId)?.title || '-'}</td>
                        <td style="padding: 10px;">$${p.amount}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('dashboardContent').innerHTML = renderDashboardLayout('اللوحة المالية', sidebar, content);

    // Init Chart
    setTimeout(() => {
        const ctx = document.getElementById('financeChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل'],
                    datasets: [{
                        label: 'الإيرادات',
                        data: [1200, 1900, 800, 1500],
                        backgroundColor: 'rgba(188, 19, 254, 0.5)',
                        borderColor: '#bc13fe',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }, 100);
});

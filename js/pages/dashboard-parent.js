/**
 * dashboard-parent.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'parent') return;

    const sidebar = `
        <li><a href="#" class="sidebar-link active" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-users"></i> الأبناء</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-chart-line"></i> التقارير</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-envelope"></i> الرسائل</a></li>
    `;

    const content = `
        <div class="glass-card mb-4" style="border-right: 4px solid var(--neon-purple);">
            <h4>الابن: أحمد محمود</h4>
            <div style="display: flex; gap: 30px; margin-top: 15px; color: var(--text-secondary);">
                <span><i class="fa-solid fa-check-circle" style="color: var(--neon-green)"></i> نسبة الحضور: 95%</span>
                <span><i class="fa-solid fa-star" style="color: #ffd700"></i> التقييم: 85%</span>
                <span><i class="fa-solid fa-exclamation-circle" style="color: var(--neon-pink)"></i> واجبات متأخرة: 1</span>
            </div>
            <button class="btn btn-outline mt-3">عرض التقرير المفصل</button>
        </div>
        
        <h3 class="mb-3">الإشعارات الأخيرة</h3>
        <ul style="list-style: none;">
            <li class="glass-card" style="padding: 15px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px;">
                <i class="fa-solid fa-bell" style="color: var(--neon-blue);"></i>
                <div>
                    <strong>إشعار دفع</strong>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">يرجى تسديد القسط الخاص بشهر أبريل قبل موعد الاستحقاق.</p>
                </div>
            </li>
        </ul>
    `;

    document.getElementById('dashboardContent').innerHTML = renderDashboardLayout('لوحة تحكم ولي الأمر', sidebar, content);
});

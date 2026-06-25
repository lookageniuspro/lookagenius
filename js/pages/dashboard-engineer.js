/**
 * dashboard-engineer.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'engineer') return;

    const sidebar = `
        <li><a href="#" class="sidebar-link active" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-project-diagram"></i> المشاريع العملية</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-laptop-code"></i> كورسات تقنية</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-books"></i> المكتبة الهندسية</a></li>
    `;

    const content = `
        <div class="glass-card mb-4 text-center" style="background: linear-gradient(135deg, rgba(0,243,255,0.1), rgba(188,19,254,0.1));">
            <h3>مرحباً بك في مساحة المهندسين 🚀</h3>
            <p style="color: var(--text-secondary); margin-top: 10px;">طور مهاراتك التقنية، بناء بورتفوليو، واستكشاف التعلم الذاتي.</p>
        </div>
        
        <h3 class="mb-3">مشاريع مقترحة</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="glass-card">
                <i class="fa-solid fa-code" style="font-size: 2rem; color: var(--neon-blue); margin-bottom: 10px;"></i>
                <h4>بناء تطبيق ذكاء اصطناعي</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">بناء نموذج واجهة ذكية للتعلم.</p>
                <button class="btn btn-outline mt-3 btn-full">ابدأ المشروع</button>
            </div>
            <div class="glass-card">
                <i class="fa-solid fa-building" style="font-size: 2rem; color: var(--neon-purple); margin-bottom: 10px;"></i>
                <h4>تصميم منشأة ذكية (BIM)</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">استخدام أدوات نمذجة متقدمة.</p>
                <button class="btn btn-outline mt-3 btn-full">ابدأ المشروع</button>
            </div>
        </div>
    `;

    document.getElementById('dashboardContent').innerHTML = renderDashboardLayout('لوحة تحكم المهندس', sidebar, content);
});

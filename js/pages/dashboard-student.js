/**
 * dashboard-student.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'student') return;

    const user = window.auth.currentUser;
    const enrolledCourses = window.db.getCourses().filter(c => c.studentsEnrolled.includes(user.id));
    
    const sidebar = `
        <li><a href="#" class="sidebar-link active" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-home"></i> الرئيسية</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-book-open"></i> كورساتي</a></li>
        <li><a href="#" class="sidebar-link" style="display: block; padding: 15px 20px;"><i class="fa-solid fa-tasks"></i> الواجبات <span style="background: var(--neon-pink); border-radius: 50%; padding: 0 6px; font-size: 0.8rem; color: white;">2</span></a></li>
    `;

    const content = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="glass-card text-center" style="border-top: 3px solid var(--neon-blue);">
                <h3>${enrolledCourses.length}</h3>
                <p>الكورسات المسجلة</p>
            </div>
            <div class="glass-card text-center" style="border-top: 3px solid var(--neon-green);">
                <h3>85%</h3>
                <p>متوسط التقييم</p>
            </div>
        </div>

        <div class="glass-card">
            <h3 class="mb-3">مخطط تقدمك</h3>
            <canvas id="studentProgressChart" style="width: 100%; height: 250px;"></canvas>
        </div>

        <h3 class="mt-4 mb-3">كورساتي الحالية</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            ${enrolledCourses.length > 0 ? enrolledCourses.map(c => `
                <div class="glass-card">
                    <h4>${c.title}</h4>
                    <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 10px; height: 10px; overflow: hidden; margin-top: 15px;">
                        <div style="width: 40%; background: var(--gradient-primary); height: 100%;"></div>
                    </div>
                </div>
            `).join('') : '<p style="color: var(--text-secondary);">لم تشترك في أي كورس بعد.</p>'}
        </div>
    `;

    document.getElementById('dashboardContent').innerHTML = renderDashboardLayout('لوحة تحكم الطالب', sidebar, content);

    // Initialize Chart
    setTimeout(() => {
        const ctx = document.getElementById('studentProgressChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
                    datasets: [{
                        label: 'درجات الاختبارات',
                        data: [65, 75, 70, 85, 90],
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
});

document.addEventListener('DOMContentLoaded', () => {
    const coursesWrapper = document.getElementById('courses-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const stageBtns = document.querySelectorAll('.filter-stage-btn');

    let activeCategory = 'all';
    let activeStage = 'all';

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function renderCourses() {
        let courses = window.db.getCourses();
        if (activeCategory !== 'all') courses = courses.filter(c => c.category === activeCategory);
        if (activeStage !== 'all') courses = courses.filter(c => c.stage === activeStage || c.stage === 'all');
        const teachers = window.db.getUsers().filter(u => u.type === 'teacher');

        if (coursesWrapper) {
            if (courses.length === 0) {
                coursesWrapper.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-secondary);grid-column:1/-1;"><i class="fa-solid fa-search" style="font-size:2.5rem;margin-bottom:15px;display:block;"></i><p>لا توجد كورسات تطابق بحثك</p></div>';
                return;
            }
            coursesWrapper.innerHTML = courses.map((course, index) => {
                const tNames = (course.teacherIds || []).map(tid => {
                    const t = teachers.find(tt => tt.id === tid);
                    return t ? t.name : null;
                }).filter(Boolean).join(', ') || '';
                const stageText = course.stage === 'primary' ? 'ابتدائي' : course.stage === 'middle' ? 'إعدادي' : course.stage === 'high' ? 'ثانوي' : 'جميع المراحل';
                return `
                <div class="course-card hover-trigger" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                    <div class="course-img">
                        <img src="${course.image}" alt="${escHtml(course.title)}">
                        <span class="course-badge">${escHtml(course.badge)}</span>
                    </div>
                    <div class="course-body">
                        <h3 class="subject-title" style="font-size: 1.1rem; margin-bottom: 5px;">${escHtml(course.title)}</h3>
                        <p class="subject-desc" style="margin-bottom: 12px; height: 36px; overflow: hidden;font-size:0.85rem;">${escHtml(course.description)}</p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                            <span style="font-size:0.7rem;padding:2px 8px;border-radius:12px;background:rgba(0,212,255,0.1);color:var(--neon-blue);border:1px solid rgba(0,212,255,0.15);">${stageText}</span>
                            <span style="font-size:0.7rem;padding:2px 8px;border-radius:12px;background:rgba(168,85,247,0.1);color:var(--neon-violet);border:1px solid rgba(168,85,247,0.15);">${escHtml(course.category)}</span>
                        </div>
                        ${tNames ? `<p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;"><i class="fa-solid fa-chalkboard-user" style="color:var(--neon-violet);"></i> ${escHtml(tNames)}</p>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
                            <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                            <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.1rem;">${getCurrencySymbol(course.currency || 'USD')}${course.price}</span>
                        </div>
                        <div style="display:flex;gap:6px;margin-top:10px;">
                            <a href="course-view.html?id=${course.id}" class="ag-btn ag-btn-sm" style="flex:1;font-size:12px;padding:6px 10px;display:inline-flex;align-items:center;gap:5px;justify-content:center;border-radius:8px;text-decoration:none;">
                                <i class="fa-solid fa-eye"></i> عرض الكورس
                            </a>
                            <a href="https://wa.me/201098768356?text=${encodeURIComponent('أريد حجز كورس: ' + course.title)}" target="_blank" style="background:#25D366;flex:1;font-size:12px;padding:6px 10px;display:inline-flex;align-items:center;gap:5px;justify-content:center;border-radius:8px;color:white;text-decoration:none;">
                                <i class="fa-brands fa-whatsapp"></i> حجز
                            </a>
                        </div>
                    </div>
                </div>
            `}).join('');
        }
    }

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.filter;
            renderCourses();
        };
    });

    stageBtns.forEach(btn => {
        btn.onclick = () => {
            stageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeStage = btn.dataset.stage;
            renderCourses();
        };
    });

    renderCourses();
});

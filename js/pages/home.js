(() => {
    initDB();

    // ---- Dynamic Course Categories Filter (buttons only; filtering handled by script.js) ----
    const filterContainer = document.getElementById('filterTabsContainer');
    if (filterContainer) {
        const cats = window.db.getCourseCategories();
        filterContainer.innerHTML = `<button class="filter-btn active" data-filter="all">${document.dir === 'rtl' ? 'الكل' : 'All'}</button>` +
            cats.map(c => `<button class="filter-btn" data-filter="${c.id}">${escHtml(c.name)}</button>`).join('');
    }

    // ---- Courses ----
    const homeCourses = document.getElementById('homeCoursesContainer');
    if (homeCourses) {
        const courses = window.db.getCourses();
        function getCourseFilters(c) {
            const parts = [c.category];
            if (c.stage === 'high') parts.push('secondary');
            if (c.stage === 'middle' || c.stage === 'high') parts.push('university');
            if (c.category === 'career' || c.category === 'development') parts.push('career');
            return parts.join(' ');
        }
        homeCourses.innerHTML = courses.map((course, index) => `
            <div class="course-card hover-trigger" data-category="${getCourseFilters(course)}" data-stage="${course.stage || 'all'}" data-price="${course.price || 0}" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}">
                <div class="course-img">
                    <img src="${course.image}" alt="${course.title}" loading="lazy">
                    <span class="course-badge">${course.badge}</span>
                </div>
                <div class="course-body">
                    <h3 class="subject-title" style="font-size: 1.1rem; margin-bottom: 5px;">${course.title}</h3>
                    <p class="subject-desc" style="margin-bottom: 12px; height: 36px; overflow: hidden;">${course.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                        <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.1rem;">${getCurrencySymbol(course.currency || 'USD')}${course.price}</span>
                    </div>
                    <a href="https://wa.me/201098768356?text=${encodeURIComponent('أريد حجز كورس: ' + course.title)}" target="_blank" class="ag-btn ag-btn-sm" style="background: #25D366; border: none; font-size: 12px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; width: 100%; justify-content: center; border-radius: 8px; color: white; text-decoration: none;">
                        <i class="fa-brands fa-whatsapp"></i> ${(localStorage.getItem('lookagenius_lang')||'en') === 'ar' ? 'حجز عبر واتساب' : 'Book via WhatsApp'}
                    </a>
                </div>
            </div>
        `).join('');

    }

    // ---- Scholarships ----
    const homeScholarships = document.getElementById('homeScholarshipsContainer');
    if (homeScholarships) {
        const schols = window.db.getScholarships();
        homeScholarships.innerHTML = schols.map((sch, index) => `
            <div class="subject-card hover-trigger" data-aos="fade-up" data-aos-delay="${index * 100}" style="border-color: rgba(168,85,247,0.3);">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; width:100%;">
                    <i class="fa-solid fa-earth-europe" style="font-size:30px; color:var(--accent-violet);"></i>
                    <div>
                        <h3 style="color:#fff;">${sch.title}</h3>
                        <p style="color:var(--primary-blue); font-size:12px;">${sch.country}</p>
                    </div>
                </div>
                <div class="subject-desc" style="flex-grow:1; width:100%;">
                    <p style="margin-bottom:8px;"><i class="fa-solid fa-sack-dollar" style="color:var(--accent-pink); width:20px;"></i> ${sch.funding}</p>
                    <p style="margin-bottom:8px;"><i class="fa-solid fa-user-graduate" style="color:var(--accent-pink); width:20px;"></i> ${sch.university}</p>
                    <p><i class="fa-solid fa-calendar-xmark" style="color:var(--accent-pink); width:20px;"></i> ${document.dir === 'rtl' ? 'الموعد النهائي: ' : 'Deadline: '}${sch.deadline}</p>
                </div>
                <a href="${sch.link || '#'}" class="btn btn-secondary" style="width:100%; border-radius:12px; height: 50px;" target="_blank">${document.dir === 'rtl' ? 'تقديم الآن' : 'Apply Now'}</a>
            </div>
        `).join('');
    }

    // ---- Team ----
    const homeTeam = document.getElementById('homeTeamContainer');
    if (homeTeam) {
        const team = window.db.getTeam();
        const renderTeamCard = (member) => `
            <div class="team-card">
                <img class="team-bg-img" src="${member.image}" alt="${member.name}" loading="lazy" onerror="this.style.display='none'">
                <div class="team-info">
                    <div class="team-name">${member.name}</div>
                    <div class="team-role">${member.role}</div>
                </div>
            </div>
        `;
        homeTeam.innerHTML = team.map(renderTeamCard).join('') + team.map(renderTeamCard).join('');
    }

    // Helper
    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
})();
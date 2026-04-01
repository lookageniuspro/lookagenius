/**
 * home.js - Dynamic rendering for the restored 16 courses showcase
 */

document.addEventListener('DOMContentLoaded', () => {
    const homeCourses = document.getElementById('homeCourses');
    if (homeCourses) {
        const courses = window.db.getCourses().slice(0, 16);
        homeCourses.innerHTML = courses.map((course, index) => `
            <div class="course-card hover-trigger" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <div class="course-img">
                    <img src="${course.image}" alt="${course.title}">
                    <span class="course-badge">${course.badge}</span>
                </div>
                <div class="course-body">
                    <h3 class="subject-title" style="font-size: 1.1rem; margin-bottom: 5px;">${course.title}</h3>
                    <p class="subject-desc" style="margin-bottom: 12px; height: 36px; overflow: hidden;">${course.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                        <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.1rem;">$${course.price}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
});

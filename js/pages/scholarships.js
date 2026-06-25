/**
 * scholarships.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const scholarships = window.db.getScholarships();
    const catalog = document.getElementById('scholarshipsCatalog');
    
    if (catalog) {
        catalog.innerHTML = scholarships.map((sch, index) => `
            <div class="glass-card" data-aos="fade-up" data-aos-delay="${index * 100}" style="position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; background: var(--gradient-primary); padding: 30px; border-bottom-left-radius: 50%; width: 100px; height: 100px; z-index: 0; opacity: 0.2;"></div>
                
                <div style="position: relative; z-index: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <h3 style="color: var(--neon-blue);">${sch.title}</h3>
                        <span style="background: rgba(0,255,102,0.1); color: var(--neon-green); padding: 5px 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold;">
                            <i class="fa-solid fa-sack-dollar"></i> ${sch.funding}
                        </span>
                    </div>
                    
                    <ul style="list-style: none; margin-bottom: 25px;">
                        <li style="margin-bottom: 10px; color: var(--text-secondary);">
                            <i class="fa-solid fa-location-dot" style="margin-left: 10px; color: white;"></i>
                            الدولة: ${sch.country}
                        </li>
                        <li style="margin-bottom: 10px; color: var(--text-secondary);">
                            <i class="fa-solid fa-university" style="margin-left: 10px; color: white;"></i>
                            الجهة: ${sch.university}
                        </li>
                        <li style="margin-bottom: 10px; color: var(--text-secondary);">
                            <i class="fa-regular fa-calendar-xmark" style="margin-left: 10px; color: var(--neon-pink);"></i>
                            الموعد النهائي: ${sch.deadline}
                        </li>
                    </ul>
                    
                    <button class="btn btn-outline btn-full" onclick="alert('توجيه الموقع...')">تقدم الآن <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
                </div>
            </div>
        `).join('');
    }
});

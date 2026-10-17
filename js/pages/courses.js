/**
 * courses.js
 * Renders courses catalog with dynamic linking and Schema.org ItemList JSON-LD
 */

document.addEventListener('DOMContentLoaded', async () => {
    const coursesWrapper = document.getElementById('courses-container');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allCourses = [];
    try {
        const sb = window.supabaseApp;
        if (sb && sb.isReady && sb.isReady()) {
            const sbCourses = await sb.getPublishedCourses();
            if (sbCourses && sbCourses.length > 0) {
                allCourses = sbCourses.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    price: c.price || 0,
                    duration: (c.total_duration ? c.total_duration + ' ساعة' : '30 ساعة'),
                    badge: c.category || 'عام',
                    image: c.cover_image || 'https://picsum.photos/seed/' + c.id + '/400/250'
                }));
            }
        }
    } catch (e) {
        console.warn('[courses] Error fetching Supabase courses, using local DB:', e);
    }

    if (!allCourses || allCourses.length === 0) {
        allCourses = (window.db && window.db.getCourses) ? window.db.getCourses() : [];
    }

    function injectItemListSchema(courses) {
        const existingScript = document.getElementById('courses-schema-jsonld');
        if (existingScript) existingScript.remove();

        const schemaData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "كورس LookaGenius Academy",
            "description": "قائمة الكورسات التعليمية المتوفرة على منصة LookaGenius Academy",
            "itemListElement": courses.slice(0, 20).map((c, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Course",
                    "name": c.title,
                    "description": c.description || c.title,
                    "provider": {
                        "@type": "Organization",
                        "name": "LookaGenius Academy",
                        "sameAs": "https://www.lookagenius.com"
                    },
                    "url": `https://www.lookagenius.com/course-view.html?id=${c.id}`
                }
            }))
        };

        const script = document.createElement('script');
        script.id = 'courses-schema-jsonld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schemaData);
        document.head.appendChild(script);
    }

    function renderCourses(category = 'all') {
        const filtered = category === 'all' ? allCourses : allCourses.filter(c => c.category === category);
        
        if (coursesWrapper) {
            if (filtered.length === 0) {
                coursesWrapper.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <i class="fa-solid fa-book-open" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.4;"></i>
                        <p>لا توجد كورسات متاحة في هذا القسم حالياً.</p>
                    </div>
                `;
                return;
            }

            coursesWrapper.innerHTML = filtered.map((course, index) => `
                <a href="course-view.html?id=${course.id}" class="course-card hover-trigger" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}" style="text-decoration:none; color:inherit; display:block;">
                    <div class="course-img">
                        <img src="${course.image || 'https://picsum.photos/seed/' + course.id + '/400/250'}" alt="${course.title}">
                        <span class="course-badge">${course.badge || course.category || 'كورس'}</span>
                    </div>
                    <div class="course-body">
                        <h3 class="subject-title" style="font-size: 1.1rem; margin-bottom: 5px;">${course.title}</h3>
                        <p class="subject-desc" style="margin-bottom: 12px; height: 36px; overflow: hidden; line-height: 1.5;">${course.description}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 15px;">
                            <span style="font-size: 0.8rem; color: var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${course.duration || '30 ساعة'}</span>
                            <span style="color: var(--primary-blue); font-weight: 800; font-size: 1.1rem;">${course.price ? '$' + course.price : 'مجاني'}</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }

        injectItemListSchema(filtered);
    }

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCourses(btn.dataset.filter);
        };
    });

    renderCourses();
});

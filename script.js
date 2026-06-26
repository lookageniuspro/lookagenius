(() => {
    AOS.init({ duration: 800, once: true });

    // Typewriter Configuration
    const allPhrases = {
        ar: [
            "التعليم هو جواز السفر للمستقبل الأفضل 🌍",
            "استثمر في نفسك اليوم، واحصد النجاح غداً 🚀",
            "طريقك نحو القبول بالجامعات العالمية 🏆",
            "منح دراسية، كورسات، وإرشاد أكاديمي متكامل 🌟"
        ],
        en: [
            "Education is the passport to a better future 🌍",
            "Invest in yourself today, and reap success tomorrow 🚀",
            "Your path to admission at global universities 🏆",
            "Scholarships, courses, and integrated academic guidance 🌟"
        ]
    };

    const allSubjectQuotes = {
        ar: [
            "اللغة العربية: لغتي هويتي، وبحر من الإبداع والبيان 📖",
            "العلوم: رحلة استكشاف لا تنتهي في أسرار الكون 🔬",
            "الرياضيات: هي موسيقى العقل ولغة المنطق 🔢",
            "الدراسات: من يقرأ التاريخ يضف أعماراً إلى عمره 🌍",
            "الحساب الذهني: درب عقلك ليكون أسرع من الآلة الحاسبة 🧠",
            "القرآن الكريم: نور يضيء دربك وربيع لقلبك 📖",
            "الفيزياء: هي محاولة فهم لغة الكون وقوانينه ⚡",
            "الكيمياء: اكتشف سحر التفاعلات التي تبني عالمنا 🧪",
            "الأحياء: تأمل في إعجاز الخالق في كل خلية حية 🧬",
            "الجيولوجيا: اقرأ تاريخ الأرض المكتوب في صخورها 🪨"
        ],
        en: [
            "Arabic: My language, my identity, and a sea of creativity 📖",
            "English: English is your bridge to the world 🌍",
            "French: The language of love and culture ✨",
            "German: Opens doors to new horizons 🚀",
            "Science: An endless journey into the secrets of the universe 🔬",
            "Math: The music of the mind and language of logic 🔢",
            "Social Studies: Reading history adds years to your life 🌍",
            "Mental Math: Train your brain to be faster than a calculator 🧠",
            "Quran: Light that illuminates your path 📖",
            "Physics: Understanding the laws of the universe ⚡",
            "Chemistry: Discover the magic of reactions 🧪",
            "Biology: Contemplate the miracles in every living cell 🧬",
            "Geology: Read the history of the Earth in its rocks 🪨"
        ]
    };

    let scriptLang = localStorage.getItem('lookagenius_lang') || 'en';
    let currentPhrases = allPhrases[scriptLang] || allPhrases['en'];
    let currentSubjectQuotes = allSubjectQuotes[scriptLang] || allSubjectQuotes['en'];

    // 1. Main Hero Typewriter
    let type_i = 0; let type_j = 0;
    let isDeleting = false;
    function loopTypewriter() {
        const textDisplay = document.getElementById('typewriter');
        if (!textDisplay) return;

        const currentPhrase = currentPhrases[type_i];
        if (!currentPhrase) {
            type_i = 0;
            setTimeout(loopTypewriter, 100);
            return;
        }

        let displayContent = currentPhrase.substring(0, type_j);
        textDisplay.innerHTML = displayContent;

        let delta = isDeleting ? 80 : 150;

        if (!isDeleting && type_j < currentPhrase.length) {
            type_j++;
        } else if (isDeleting && type_j > 0) {
            type_j--;
        } else if (!isDeleting && type_j === currentPhrase.length) {
            isDeleting = true;
            delta = 2000; // Pause at end
        } else if (isDeleting && type_j === 0) {
            isDeleting = false;
            type_i = (type_i + 1) % currentPhrases.length;
            delta = 500; // Pause before new
        }

        setTimeout(loopTypewriter, delta);
    }

    // 2. Featured Courses Section Typewriter
    let qc_i = 0; let qc_j = 0;
    let quoteDeleting = false;
    function loopQuotesTypewriter() {
        const quotesDisplay = document.getElementById('quotes-typewriter');
        if (!quotesDisplay) return;

        const currentQuote = currentSubjectQuotes[qc_i];
        if (!currentQuote) {
            qc_i = 0;
            setTimeout(loopQuotesTypewriter, 100);
            return;
        }

        quotesDisplay.innerHTML = currentQuote.substring(0, qc_j);

        let delta = quoteDeleting ? 60 : 120;

        if (!quoteDeleting && qc_j < currentQuote.length) {
            qc_j++;
        } else if (quoteDeleting && qc_j > 0) {
            qc_j--;
        } else if (!quoteDeleting && qc_j === currentQuote.length) {
            quoteDeleting = true;
            delta = 3000;
        } else if (quoteDeleting && qc_j === 0) {
            quoteDeleting = false;
            qc_i = (qc_i + 1) % currentSubjectQuotes.length;
            delta = 500;
        }

        setTimeout(loopQuotesTypewriter, delta);
    }

    // 3. Card Typewriters (Inside Subject Cards)
    function initCardTypewriters() {
        const cards = document.querySelectorAll('.card-typewriter');
        cards.forEach(card => {
            let ci = 0; let cj = 0; let del = false;
            function loop() {
                const lang = localStorage.getItem('lookagenius_lang') || 'en';
                const raw = card.getAttribute(`data-quotes-${lang}`);
                let quotes = [];
                try { quotes = JSON.parse(raw || '[]'); } catch(e) { }
                if (quotes.length === 0) return;

                if (ci >= quotes.length) ci = 0;
                const q = quotes[ci];
                card.innerHTML = q.substring(0, cj);

                let d = del ? 60 : 120;
                if (!del && cj < q.length) { cj++; }
                else if (del && cj > 0) { cj--; }
                else if (!del && cj === q.length) { del = true; d = 2000; }
                else if (del && cj === 0) { del = false; ci = (ci + 1) % quotes.length; d = 500; }
                
                setTimeout(loop, d);
            }
            loop();
        });
    }

    // Global Language Change Listener
    window.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        if (allPhrases[lang]) {
            currentPhrases = allPhrases[lang];
            currentSubjectQuotes = allSubjectQuotes[lang];
            
            // Reset Main Counters
            type_i = 0; type_j = 0; isDeleting = false;
            qc_i = 0; qc_j = 0; quoteDeleting = false;
            
            // Swap Borders for RTL
            const indicators = document.querySelectorAll('#typewriter, #quotes-typewriter');
            indicators.forEach(el => {
                if (lang === 'ar') {
                    el.style.borderLeft = 'none'; el.style.paddingLeft = '0';
                    el.style.borderRight = '2px solid var(--success)'; el.style.paddingRight = '5px';
                } else {
                    el.style.borderRight = 'none'; el.style.paddingRight = '0';
                    el.style.borderLeft = '2px solid var(--success)'; el.style.paddingLeft = '5px';
                }
            });

            // Fix Subject Cards Borders
            document.querySelectorAll('.subject-desc').forEach(el => {
                if (lang === 'ar') {
                    el.style.borderLeft = 'none'; el.style.paddingLeft = '0';
                    el.style.borderRight = '2px solid' + (el.style.borderLeftColor || 'var(--primary-blue)');
                    el.style.paddingRight = '8px';
                } else {
                    el.style.borderRight = 'none'; el.style.paddingRight = '0';
                    el.style.borderLeft = '2px solid var(--primary-blue)';
                    el.style.paddingLeft = '8px';
                }
            });
        }
        renderHomeTeam();
        renderHomeCourses();
        renderHomeScholarships();
    });

    // 4. Cursor Logic
    const initCursor = () => {
        const dot = document.querySelector('[data-cursor-dot]');
        const out = document.querySelector('[data-cursor-outline]');
        if (!dot || !out) return;
        window.addEventListener('mousemove', (e) => {
            dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`;
            out.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
        });
        document.querySelectorAll('.hover-trigger').forEach(el => {
            el.addEventListener('mouseenter', () => out.classList.add('hovered'));
            el.addEventListener('mouseleave', () => out.classList.remove('hovered'));
        });
    };

    // 5. Three.js: Blue/Violet Network
    function initThreeJS() {
        const container = document.getElementById('canvas-container');
        if (!container) return;
        const THREE = window.THREE;
        if (!THREE) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 20;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const count = 100;
        const geometry = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 35;
        geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({ size: 0.3, color: 0x00D4FF, transparent: true, opacity: 0.8 });
        const lineMat = new THREE.LineBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.15 });

        const mesh = new THREE.Points(geometry, mat); scene.add(mesh);
        const lineGeo = new THREE.BufferGeometry();
        const lineMesh = new THREE.LineSegments(lineGeo, lineMat); scene.add(lineMesh);

        let mx = 0, my = 0;
        document.addEventListener('mousemove', (e) => { mx = e.clientX - window.innerWidth / 2; my = e.clientY - window.innerHeight / 2; });

        const clock = new THREE.Clock();
        const anim = () => {
            requestAnimationFrame(anim);
            const t = clock.getElapsedTime();
            mesh.rotation.y = t * 0.05 + mx * 0.00005;
            mesh.rotation.x = t * 0.02 + my * 0.00005;
            lineMesh.rotation.copy(mesh.rotation);
            
            const positions = mesh.geometry.attributes.position.array;
            const pts = []; const v = new THREE.Vector3();
            for (let i = 0; i < count; i++) { v.set(positions[i*3], positions[i*3+1], positions[i*3+2]).applyMatrix4(mesh.matrixWorld); pts.push(v.clone()); }
            const lPos = [];
            for (let i = 0; i < count; i++) { for (let j = i+1; j < count; j++) { if (pts[i].distanceTo(pts[j]) < 6) lPos.push(positions[i*3], positions[i*3+1], positions[i*3+2], positions[j*3], positions[j*3+1], positions[j*3+2]); } }
            lineMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(lPos, 3));
            renderer.render(scene, camera);
        };
        anim();
        window.addEventListener('resize', () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });
    }

    // Mobile Menu Logic
    function initMobileMenu() {
        const headerContainer = document.querySelector('.header-container');
        if (headerContainer && !document.querySelector('.mobile-menu-btn')) {
            const btn = document.createElement('button');
            btn.className = 'mobile-menu-btn';
            btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            headerContainer.appendChild(btn);

            const navLinks = document.querySelector('.nav-links');
            const headerBtns = document.querySelector('.header-btns');

            // Handle header btns for mobile avoiding duplicates
            if (headerBtns && navLinks && !navLinks.querySelector('.header-btns-mobile')) {
                const mobileBtns = headerBtns.cloneNode(true);
                mobileBtns.className = 'header-btns-mobile ag-hide-desktop';
                navLinks.appendChild(mobileBtns);
            }

            btn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                if(navLinks.classList.contains('active')) {
                    btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                } else {
                    btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });
        }
    }

    // 6. Course Filter & Search Logic
    function initCourseFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const courseSearch = document.getElementById('courseSearch');

        function filterCourses() {
            const query = (courseSearch ? courseSearch.value.toLowerCase().trim() : '');
            const activeBtn = document.querySelector('.filter-btn.active');
            const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

            document.querySelectorAll('.course-card').forEach(card => {
                const title = (card.querySelector('.course-title')?.innerText || '').toLowerCase();
                const desc = (card.querySelector('.subject-desc')?.innerText || '').toLowerCase();
                const categories = card.getAttribute('data-category') || '';
                
                const matchesSearch = title.includes(query) || desc.includes(query);
                const matchesFilter = activeFilter === 'all' || categories.split(' ').includes(activeFilter);

                if (matchesSearch && matchesFilter) {
                    card.style.display = 'block';
                    card.setAttribute('data-aos', 'fade-up');
                } else {
                    card.style.display = 'none';
                }
            });
            AOS.refresh();
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterCourses();
            });
        });

        if (courseSearch) {
            courseSearch.addEventListener('input', filterCourses);
        }
    }

    // 7. Dynamic Homepage Rendering from Database
    function renderHomeTeam() {
        const track = document.querySelector('.team-track')
        if (!track || !window.db) return
        const members = window.db.getTeam()
        if (!members.length) return
        const html = members.map(m => `
                <div class="team-card">
                    <img class="team-card-img" src="${escHtml(m.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name) + '&background=0D8ABC&color=fff&size=150')}" alt="${escHtml(m.name)}">
                    <div class="team-card-overlay"></div>
                    <div class="team-card-content">
                        <div class="team-name">${escHtml(m.name)}</div>
                        <div class="team-role">${escHtml(m.role)}</div>
                    </div>
                </div>
        `).join('')
        track.innerHTML = html + html
    }

    function escHtml(str) {
        const d = document.createElement('div')
        d.textContent = str
        return d.innerHTML
    }

    function renderHomeCourses() {
        const wrapper = document.querySelector('.courses-wrapper')
        if (!wrapper || !window.db) return
        const courses = window.db.getCourses()
        if (!courses.length) return
        wrapper.innerHTML = courses.map(c => `
            <div class="course-card glass-card" data-category="${escHtml(c.category || '')} ${escHtml(c.stage || '')}" data-aos="fade-up">
                <div class="course-badge" style="background: ${c.category === 'languages' ? '#0D8ABC' : c.category === 'science' || c.category === 'physics' || c.category === 'chemistry' ? '#10b981' : c.category === 'math' ? '#f59e0b' : c.category === 'tech' ? '#8b5cf6' : '#ec4899'}">${escHtml(c.badge || c.category)}</div>
                <div class="course-img"><img src="${escHtml(c.image || 'https://picsum.photos/seed/' + c.id + '/400/250')}" alt="${escHtml(c.title)}" loading="lazy"></div>
                <div class="course-content">
                    <h3 class="course-title">${escHtml(c.title)}</h3>
                    <p class="subject-desc">${escHtml(c.description || '')}</p>
                    <div class="course-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
                        <span style="color:var(--success);font-weight:700;">${c.currency || '$'}${c.price || 0}</span>
                        <a href="login.html" class="ag-btn ag-btn-sm hover-trigger" data-i18n="course_btn">View Details</a>
                    </div>
                </div>
            </div>
        `).join('')
        AOS.refresh()
    }

    function renderHomeScholarships() {
        const grid = document.querySelector('#scholarships .subjects-grid')
        if (!grid || !window.db) return
        const items = window.db.getScholarships()
        if (!items.length) return
        grid.innerHTML = items.map(s => `
            <div class="subject-card glass-card" data-aos="fade-up">
                <div class="subject-icon" style="background:rgb(251,191,36,0.12); color:#FBBF24;">
                    <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h3>${escHtml(s.title)}</h3>
                <div class="scholarship-details">
                    <span><i class="fa-solid fa-location-dot"></i> ${escHtml(s.country || '')}</span>
                    <span><i class="fa-solid fa-university"></i> ${escHtml(s.university || '')}</span>
                    <span><i class="fa-solid fa-money-bill-wave"></i> ${escHtml(s.funding || '')}</span>
                    <span><i class="fa-solid fa-calendar"></i> ${s.deadline ? escHtml(s.deadline) : ''}</span>
                </div>
                <a href="login.html" class="ag-btn hover-trigger ag-float" style="width:100%;justify-content:center;margin-top:15px;" data-i18n="schol_apply">Apply Now</a>
            </div>
        `).join('')
        AOS.refresh()
    }

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        loopTypewriter();
        loopQuotesTypewriter();
        initCardTypewriters();
        initThreeJS();
        initCursor();
        initMobileMenu();
        initCourseFilter();
        renderHomeTeam();
        renderHomeCourses();
        renderHomeScholarships();
        const lang = localStorage.getItem('lookagenius_lang') || 'ar'
        if (typeof setLanguage === 'function') setLanguage(lang)
    });
})();

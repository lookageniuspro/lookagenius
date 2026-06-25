(function(){
    const CART_KEY = 'lookagenius_student_cart';

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e) { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function addToCart(courseId) {
        const cart = getCart();
        if (!cart.includes(courseId)) {
            cart.push(courseId);
            saveCart(cart);
            updateCartBadge();
            renderBrowseCourses();
            showToast('تمت إضافة الكورس إلى السلة 🛒');
        } else {
            showToast('الكورس موجود بالفعل في السلة');
        }
    }

    function removeFromCart(courseId) {
        let cart = getCart();
        cart = cart.filter(id => id !== courseId);
        saveCart(cart);
        updateCartBadge();
        renderCart();
        renderBrowseCourses();
        showToast('تمت إزالة الكورس من السلة');
    }

    function clearCart() {
        saveCart([]);
        updateCartBadge();
        renderCart();
        renderBrowseCourses();
    }

    function isInCart(courseId) {
        return getCart().includes(courseId);
    }

    function updateCartBadge() {
        const cart = getCart();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            if (cart.length > 0) {
                badge.textContent = cart.length;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
        const ct = document.getElementById('sdCartCount');
        if (ct) ct.textContent = cart.length;
    }

    function getCurrencySymbol(currency) {
        const map = { 'USD':'$', 'EGP':'ج.م', 'SAR':'﷼', 'AED':'د.إ', 'EUR':'€' };
        return map[currency] || '$';
    }

    function switchPage(page) {
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById('page-' + page).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (btn) btn.classList.add('active');
        const titles = { dashboard:'الرئيسية', courses:'تصفح الكورسات', mycourses:'كورساتي', cart:'سلة المشتريات' };
        document.getElementById('pageTitle').innerHTML = `<span>LookaGenius</span> | ${titles[page] || page}`;
        if (page === 'dashboard') renderDashboard();
        if (page === 'courses') renderBrowseCourses();
        if (page === 'mycourses') renderMyCourses();
        if (page === 'cart') renderCart();
        if (window.innerWidth <= 768) toggleSidebar();
    }

    function toggleSidebar() {
        document.getElementById('mainSidebar').classList.toggle('open');
    }

    function showToast(msg, type) {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:white;padding:12px 24px;border-radius:12px;z-index:9999;font-size:14px;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(10px);max-width:90%;text-align:center;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 2500);
    }

    function renderDashboard() {
        const user = window.auth.currentUser;
        const enrolled = window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(user.id));
        document.getElementById('sdEnrolledCount').textContent = enrolled.length;
        const cart = getCart();
        document.getElementById('sdCartCount').textContent = cart.length;

        const progress = enrolled.length > 0 ? Math.min(100, Math.round(40 + Math.random() * 40)) : 0;
        document.getElementById('sdProgressAvg').textContent = progress + '%';

        const container = document.getElementById('sdRecentCourses');
        if (enrolled.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book"></i><h3>لم تسجل في أي كورس بعد</h3><p>تصفح الكورسات المتاحة وابدأ رحلة التعلم!</p><button class="ag-btn" onclick="switchPage(\'courses\')" style="margin-top:10px;"><i class="fa-solid fa-search"></i> تصفح الكورسات</button></div>';
        } else {
            container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">' +
                enrolled.slice(0, 6).map(c => `
                    <div class="course-card">
                        <img src="${c.image || 'https://picsum.photos/seed/'+c.id+'/400/250'}" alt="${c.title}" onerror="this.src='https://ui-avatars.com/api/?name=Course&background=0D8ABC&color=fff&size=400'">
                        <div class="course-card-body">
                            <h4>${c.title}</h4>
                            <p>${c.description || ''}</p>
                            <div style="margin-top:8px;">
                                <div style="width:100%;background:rgba(255,255,255,0.1);border-radius:10px;height:6px;overflow:hidden;">
                                    <div style="width:${Math.min(100, 20 + Math.floor(Math.random() * 60))}%;background:var(--gradient-primary, linear-gradient(135deg, var(--neon-blue), var(--neon-violet)));height:100%;border-radius:10px;"></div>
                                </div>
                                <span style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px;display:block;">${Math.floor(Math.random() * 80) + 10}% مكتمل</span>
                            </div>
                        </div>
                        <div class="course-card-footer">
                            <span class="badge">${c.category || 'General'}</span>
                            <span style="color:var(--text-secondary);font-size:0.8rem;">${(c.studentsEnrolled || []).length || 0} طالب</span>
                        </div>
                    </div>
                `).join('') + '</div>';
        }
    }

    function renderBrowseCourses() {
        const search = (document.getElementById('sdCourseSearch').value || '').toLowerCase().trim();
        const catFilter = document.getElementById('sdCategoryFilter').value;
        let courses = window.db.getCourses();
        const user = window.auth.currentUser;

        if (search) courses = courses.filter(c => c.title.toLowerCase().includes(search) || (c.description||'').toLowerCase().includes(search));
        if (catFilter && catFilter !== 'all') courses = courses.filter(c => c.category === catFilter);

        const container = document.getElementById('sdCourseGrid');
        if (courses.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-search"></i><h3>لا توجد نتائج</h3><p>حاول تغيير معايير البحث</p></div>';
            return;
        }

        container.innerHTML = courses.map(c => {
            const enrolled = (c.studentsEnrolled || []).includes(user.id);
            const inCart = isInCart(c.id);
            return `
                <div class="course-card">
                    <img src="${c.image || 'https://picsum.photos/seed/'+c.id+'/400/250'}" alt="${c.title}" onerror="this.src='https://ui-avatars.com/api/?name=Course&background=0D8ABC&color=fff&size=400'">
                    <div class="course-card-body">
                        <h4>${c.title}</h4>
                        <p>${c.description || ''}</p>
                        <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:8px;">
                            <span class="badge">${c.category || 'General'}</span>
                            <span style="margin-right:8px;">${c.duration || ''}</span>
                        </div>
                    </div>
                    <div class="course-card-footer">
                        <span class="price">${getCurrencySymbol(c.currency)}${c.price}</span>
                        <div>
                            ${enrolled ? '<span class="ag-btn ag-btn-sm ag-btn-success" style="opacity:0.8;"><i class="fa-solid fa-check"></i> مسجل</span>' :
                            inCart ? '<button class="ag-btn ag-btn-sm ag-btn-outline" onclick="removeFromCart('+c.id+')"><i class="fa-solid fa-minus"></i> إزالة</button>' :
                            '<button class="ag-btn ag-btn-sm" onclick="addToCart('+c.id+')"><i class="fa-solid fa-cart-plus"></i> أضف للسلة</button>'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderMyCourses() {
        const user = window.auth.currentUser;
        const enrolled = window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(user.id));
        const container = document.getElementById('sdMyCoursesGrid');

        if (enrolled.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book-open"></i><h3>لم تسجل في أي كورس</h3><p>تصفح الكورسات وسجل في ما يناسبك</p><button class="ag-btn" onclick="switchPage(\'courses\')" style="margin-top:10px;"><i class="fa-solid fa-search"></i> تصفح الكورسات</button></div>';
            return;
        }

        container.innerHTML = enrolled.map(c => `
            <div class="course-card">
                <img src="${c.image || 'https://picsum.photos/seed/'+c.id+'/400/250'}" alt="${c.title}" onerror="this.src='https://ui-avatars.com/api/?name=Course&background=0D8ABC&color=fff&size=400'">
                <div class="course-card-body">
                    <h4>${c.title}</h4>
                    <p>${c.description || ''}</p>
                    <div style="margin-top:8px;">
                        <div style="width:100%;background:rgba(255,255,255,0.1);border-radius:10px;height:6px;overflow:hidden;">
                            <div style="width:${Math.min(100, 10 + Math.floor(Math.random() * 70))}%;background:linear-gradient(135deg, var(--neon-blue), var(--neon-violet));height:100%;border-radius:10px;"></div>
                        </div>
                        <span style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px;display:block;">${Math.floor(Math.random() * 80) + 10}% مكتمل</span>
                    </div>
                </div>
                <div class="course-card-footer">
                    <span class="badge">${c.category || 'General'}</span>
                    <span style="color:var(--success);font-size:0.8rem;"><i class="fa-solid fa-check-circle"></i> مسجل</span>
                </div>
            </div>
        `).join('');
    }

    function renderCart() {
        const cart = getCart();
        const courses = window.db.getCourses().filter(c => cart.includes(c.id));
        const container = document.getElementById('sdCartContent');

        if (courses.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-cart-empty"></i><h3>السلة فارغة</h3><p>تصفح الكورسات وأضف ما يناسبك إلى السلة</p><button class="ag-btn" onclick="switchPage(\'courses\')" style="margin-top:10px;"><i class="fa-solid fa-search"></i> تصفح الكورسات</button></div>';
            return;
        }

        const total = courses.reduce((sum, c) => {
            const rate = c.currency === 'EGP' ? 50 : c.currency === 'SAR' ? 3.75 : c.currency === 'AED' ? 3.67 : c.currency === 'EUR' ? 0.92 : 1;
            return sum + (c.price / rate);
        }, 0);

        const user = window.auth.currentUser;
        const phone = user.whatsapp || user.phone || '';
        const waMsg = encodeURIComponent(`مرحباً LookaGenius! أود حجز الكورسات التالية:\n${courses.map(c => `- ${c.title} (${getCurrencySymbol(c.currency)}${c.price})`).join('\n')}\n\nالإجمالي التقريبي: $${total.toFixed(2)}\n\nالاسم: ${user.name}\nالبريد: ${user.email}`);

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px;">
                <span style="font-weight:700;">${courses.length} كورس في السلة</span>
                <div style="display:flex;gap:8px;">
                    <button class="ag-btn ag-btn-whatsapp" onclick="window.open('https://wa.me/${phone.replace(/[^0-9]/g,'') || '201234567890'}?text=${waMsg}','_blank')"><i class="fa-brands fa-whatsapp"></i> حجز عبر واتساب</button>
                    <button class="ag-btn ag-btn-outline" onclick="clearCart()"><i class="fa-solid fa-trash"></i> تفريغ السلة</button>
                </div>
            </div>
            <table>
                <thead><tr><th>#</th><th>الكورس</th><th>التصنيف</th><th>السعر</th><th></th></tr></thead>
                <tbody>
                    ${courses.map((c, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td style="font-weight:700;">${c.title}</td>
                            <td><span class="badge">${c.category || 'General'}</span></td>
                            <td style="color:var(--success);font-weight:700;">${getCurrencySymbol(c.currency)}${c.price}</td>
                            <td><button class="ag-btn ag-btn-sm ag-btn-outline" onclick="removeFromCart(${c.id})"><i class="fa-solid fa-xmark"></i></button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top:15px;text-align:left;font-size:0.9rem;color:var(--text-secondary);">
                الإجمالي التقريبي: <strong style="color:var(--success);font-size:1.2rem;">$${total.toFixed(2)}</strong>
                <span style="display:block;font-size:0.75rem;margin-top:4px;">* الأسعار تقريبية حسب سعر الصرف</span>
            </div>
        `;
    }

    function init() {
        const user = window.auth && window.auth.currentUser;
        if (!user || user.type !== 'student') {
            window.location.href = 'login.html';
            return;
        }

        // Update sidebar user info
        document.getElementById('sdUserName').textContent = user.name;
        document.getElementById('sdUserRole').textContent = window.auth.getRoleAr ? window.auth.getRoleAr('student') : 'طالب';
        const av = document.getElementById('sdAvatar');
        av.src = user.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(user.name)+'&background=0D8ABC&color=fff&size=80';
        av.onerror = function(){ this.src = 'https://ui-avatars.com/api/?name='+encodeURIComponent(user.name)+'&background=0D8ABC&color=fff&size=80'; };

        const now = new Date();
        const hour = now.getHours();
        let greet = 'مرحباً';
        if (hour < 12) greet = 'صباح الخير';
        else if (hour < 18) greet = 'مساء الخير';
        else greet = 'مساء الخير';
        document.getElementById('sdGreeting').textContent = greet + '، ' + user.name.split(' ')[0];

        // Populate category filter
        const cats = window.db.getCourseCategories ? window.db.getCourseCategories() : [];
        const sel = document.getElementById('sdCategoryFilter');
        if (sel && cats.length > 0) {
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id || c.name;
                opt.textContent = c.name;
                sel.appendChild(opt);
            });
        }

        // Set up navigation
        document.querySelectorAll('.nav-link[data-page]').forEach(btn => {
            btn.addEventListener('click', () => switchPage(btn.getAttribute('data-page')));
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (window.auth) { window.auth.logout(); }
            window.location.href = 'login.html';
        });

        updateCartBadge();
        renderDashboard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    window.switchPage = switchPage;
    window.toggleSidebar = toggleSidebar;
})();
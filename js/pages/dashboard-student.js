document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth.currentUser || window.auth.currentUser.type !== 'student') return;

    const user = window.auth.currentUser;
    const CART_KEY = 'lookagenius_cart';

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function addToCart(courseId) {
        const cart = getCart();
        if (cart.includes(courseId)) return false;
        cart.push(courseId);
        saveCart(cart);
        return true;
    }

    function removeFromCart(courseId) {
        saveCart(getCart().filter(id => id !== courseId));
    }

    function clearCart() {
        localStorage.removeItem(CART_KEY);
    }

    function cartCount() {
        return getCart().length;
    }

    function getEnrolledCourses() {
        return window.db.getCourses().filter(c => {
            const enrolled = c.studentsEnrolled || [];
            return enrolled.includes(user.id);
        });
    }

    function renderStudentUI(section) {
        section = section || 'home';
        const enrolled = getEnrolledCourses();
        const invoices = window.db.getInvoicesForUser(user.id);
        const attStats = window.db.getStudentAttendanceStats(user.id);
        const allCourses = window.db.getCourses();
        const cart = getCart();
        const cartCourses = allCourses.filter(c => cart.includes(c.id));

        const container = document.getElementById('dashboardContent');
        if (!container) return;

        container.innerHTML = `
            <style>
                .dash-wrap { display: flex; gap: 25px; padding: 20px 30px 60px; max-width: 1400px; margin: 0 auto; min-height: 80vh; }
                .dash-sidebar { width: 260px; flex-shrink: 0; align-self: flex-start; position: sticky; top: 100px; border-radius: 20px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 32px 0 rgba(0,0,0,0.8); overflow: hidden; }
                .dash-sidebar .profile { text-align: center; padding: 30px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
                .dash-sidebar .profile .avatar { width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #A855F7); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white; box-shadow: 0 0 30px rgba(0,212,255,0.3); }
                .dash-sidebar .profile h4 { font-size: 1rem; font-weight: 800; margin: 0 0 4px; }
                .dash-sidebar .profile p { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin: 0; }
                .dash-sidebar .nav-list { list-style: none; padding: 10px 0; margin: 0; }
                .dash-sidebar .nav-list li a { display: flex; align-items: center; gap: 12px; padding: 14px 24px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: 0.2s; border-right: 3px solid transparent; }
                .dash-sidebar .nav-list li a:hover { background: rgba(255,255,255,0.04); color: white; }
                .dash-sidebar .nav-list li a.active { background: rgba(0,212,255,0.08); color: #00D4FF; border-right-color: #00D4FF; }
                .dash-sidebar .nav-list li a .badge { background: #FF3366; color: white; font-size: 0.65rem; padding: 2px 7px; border-radius: 20px; margin-right: auto; }
                .dash-sidebar .nav-list li a.logout { border-top: 1px solid rgba(255,255,255,0.06); margin-top: 10px; padding-top: 18px; color: #ff4d4d; }
                .dash-sidebar .nav-list li a.logout:hover { background: rgba(255,77,77,0.08); }
                .dash-main { flex: 1; min-width: 0; }
                .dash-header { margin-bottom: 30px; }
                .dash-header h2 { font-size: 1.6rem; font-weight: 900; margin: 0 0 5px; background: linear-gradient(135deg, #00D4FF, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .dash-header p { color: rgba(255,255,255,0.4); margin: 0; font-size: 0.85rem; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 30px; }
                .stat-card { padding: 22px; border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: 0.3s; }
                .stat-card:hover { border-color: var(--ag-primary); transform: translateY(-3px); box-shadow: 0 0 30px rgba(0,212,255,0.1); }
                .stat-card .num { font-size: 2rem; font-weight: 900; margin: 0 0 4px; }
                .stat-card .label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin: 0; }
                .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
                .course-card-dash { border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); overflow: hidden; transition: 0.3s; }
                .course-card-dash:hover { border-color: var(--ag-primary); transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,212,255,0.12); }
                .course-card-dash .img-wrap { height: 160px; overflow: hidden; position: relative; }
                .course-card-dash .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .course-card-dash .img-wrap .badge { position: absolute; top: 12px; right: 12px; padding: 4px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; background: rgba(0,212,255,0.2); backdrop-filter: blur(10px); color: #00D4FF; border: 1px solid rgba(0,212,255,0.3); }
                .course-card-dash .body { padding: 18px; }
                .course-card-dash .body h4 { font-size: 1rem; font-weight: 800; margin: 0 0 8px; }
                .course-card-dash .body .meta { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin: 0 0 4px; }
                .course-card-dash .body .meta i { width: 16px; }
                .course-card-dash .body .price { font-size: 1.1rem; font-weight: 900; color: #00D4FF; margin: 12px 0 0; }
                .course-card-dash .body .actions { display: flex; gap: 10px; margin-top: 14px; }
                .course-card-dash .body .actions .ag-btn { padding: 8px 16px; font-size: 0.8rem; border-radius: 30px; flex: 1; justify-content: center; }
                .course-card-dash .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 12px; }
                .course-card-dash .progress-bar .fill { height: 100%; background: linear-gradient(90deg, #00D4FF, #A855F7); border-radius: 10px; }
                .table-wrap { overflow-x: auto; border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
                .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
                .table-wrap th { padding: 14px 16px; text-align: right; font-weight: 700; color: rgba(255,255,255,0.5); border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .table-wrap td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
                .table-wrap tr:last-child td { border-bottom: none; }
                .table-wrap tr:hover td { background: rgba(255,255,255,0.02); }
                .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
                .empty-state i { font-size: 3rem; margin-bottom: 15px; display: block; }
                .empty-state p { font-size: 0.9rem; margin: 0; }
                .cart-sidebar { position: fixed; top: 0; left: 0; width: 380px; height: 100vh; background: rgba(5,5,16,0.98); backdrop-filter: blur(30px); border-right: 1px solid rgba(255,255,255,0.08); z-index: 9999; transform: translateX(-100%); transition: 0.4s cubic-bezier(0.22, 1, 0.36, 1); padding: 25px; display: flex; flex-direction: column; }
                .cart-sidebar.open { transform: translateX(0); }
                .cart-sidebar h3 { font-size: 1.2rem; font-weight: 800; margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
                .cart-sidebar .close-cart { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 1.5rem; cursor: pointer; margin-right: auto; }
                .cart-sidebar .cart-items { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
                .cart-sidebar .cart-item { display: flex; gap: 12px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
                .cart-sidebar .cart-item img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
                .cart-sidebar .cart-item .info { flex: 1; }
                .cart-sidebar .cart-item .info h5 { margin: 0 0 4px; font-size: 0.85rem; font-weight: 700; }
                .cart-sidebar .cart-item .info .p { font-size: 0.8rem; color: #00D4FF; font-weight: 700; }
                .cart-sidebar .cart-item .remove-btn { background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 1rem; align-self: center; }
                .cart-sidebar .cart-footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; margin-top: 15px; }
                .cart-sidebar .cart-footer .total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; }
                .cart-sidebar .cart-footer .total span:last-child { color: #00D4FF; }
                .cart-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9998; display: none; }
                .cart-overlay.show { display: block; }
                .cart-btn-float { position: fixed; bottom: 30px; left: 30px; z-index: 999; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #A855F7); border: none; color: white; font-size: 1.5rem; cursor: pointer; box-shadow: 0 10px 40px rgba(0,212,255,0.3); display: none; align-items: center; justify-content: center; transition: 0.3s; }
                .cart-btn-float:hover { transform: scale(1.1); }
                .cart-btn-float .count { position: absolute; top: -5px; right: -5px; background: #FF3366; width: 24px; height: 24px; border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 0 20px rgba(255,51,102,0.4); }
                .search-bar { display: flex; gap: 12px; margin-bottom: 25px; flex-wrap: wrap; }
                .search-bar input { flex: 1; min-width: 200px; padding: 12px 20px; border-radius: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: white; font-size: 0.9rem; outline: none; }
                .search-bar input:focus { border-color: #00D4FF; }
                .search-bar select { padding: 12px 20px; border-radius: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); font-size: 0.85rem; outline: none; }
                .toast-notif { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(5,5,16,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(0,212,255,0.3); padding: 12px 28px; border-radius: 50px; color: white; font-weight: 600; z-index: 99999; opacity: 0; transition: 0.3s; pointer-events: none; font-size: 0.85rem; }
                .toast-notif.show { opacity: 1; bottom: 120px; }
                @media (max-width: 768px) { .dash-wrap { flex-direction: column; padding: 15px; } .dash-sidebar { width: 100%; position: static; } .cart-sidebar { width: 100%; } }
            </style>

            <div class="dash-wrap">
                <aside class="dash-sidebar">
                    <div class="profile">
                        <div class="avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'S'}</div>
                        <h4>${escHtml(user.name)}</h4>
                        <p>${window.auth.getRoleAr ? window.auth.getRoleAr('student') : 'طالب'}</p>
                    </div>
                    <ul class="nav-list">
                        <li><a href="#" class="${section === 'home' ? 'active' : ''}" data-section="home"><i class="fa-solid fa-house"></i> الرئيسية</a></li>
                        <li><a href="#" class="${section === 'catalog' ? 'active' : ''}" data-section="catalog"><i class="fa-solid fa-store"></i> المتجر</a></li>
                        <li><a href="#" class="${section === 'library' ? 'active' : ''}" data-section="library"><i class="fa-solid fa-book"></i> مكتبتي ${enrolled.length ? `<span class="badge">${enrolled.length}</span>` : ''}</a></li>
                        <li><a href="#" class="${section === 'cart' ? 'active' : ''}" data-section="cart"><i class="fa-solid fa-cart-shopping"></i> السلة ${cartCount() ? `<span class="badge">${cartCount()}</span>` : ''}</a></li>
                        <li><a href="#" class="${section === 'invoices' ? 'active' : ''}" data-section="invoices"><i class="fa-solid fa-file-invoice"></i> الفواتير ${invoices.filter(i => i.status === 'pending').length ? `<span class="badge" style="background:#ff4d4d;">${invoices.filter(i => i.status === 'pending').length}</span>` : ''}</a></li>
                        <li><a href="#" class="${section === 'attendance' ? 'active' : ''}" data-section="attendance"><i class="fa-solid fa-calendar-check"></i> الحضور</a></li>
                        <li><a href="#" class="logout" id="studentLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج</a></li>
                    </ul>
                </aside>
                <main class="dash-main">
                    <div class="dash-header">
                        <h2>${sectionTitles[section] || 'لوحة التحكم'}</h2>
                        <p>${sectionDescriptions[section] || ''}</p>
                    </div>
                    ${renderSection(section, enrolled, invoices, attStats, allCourses, cartCourses)}
                </main>
            </div>

            <div class="cart-overlay" id="cartOverlay"></div>
            <aside class="cart-sidebar" id="cartSidebar">
                <h3><i class="fa-solid fa-cart-shopping" style="color:#00D4FF;"></i> سلة المشتريات <button class="close-cart" id="closeCartBtn">&times;</button></h3>
                <div class="cart-items" id="cartItemsContainer">
                    ${renderCartItems(cartCourses)}
                </div>
                <div class="cart-footer">
                    <div class="total"><span>المجموع</span><span>${cartCourses.length ? '$' + cartCourses.reduce((s, c) => s + (c.price || 0), 0) : '$0'}</span></div>
                    <button class="ag-btn" style="width:100%;justify-content:center;${!cartCourses.length ? 'opacity:0.4;pointer-events:none;' : ''}" id="checkoutBtn"><i class="fa-solid fa-lock"></i> إتمام الشراء</button>
                </div>
            </aside>

            <button class="cart-btn-float" id="cartFloatBtn" style="${cartCount() ? 'display:flex;' : 'display:none;'}">
                <i class="fa-solid fa-cart-shopping"></i>
                <span class="count">${cartCount()}</span>
            </button>

            <div class="toast-notif" id="dashToast"></div>
        `;

        bindEvents(section, enrolled, allCourses, cartCourses);
    }

    const sectionTitles = {
        home: 'لوحة التحكم',
        catalog: 'المتجر التعليمي',
        library: 'مكتبتي',
        cart: 'سلة المشتريات',
        invoices: 'الفواتير',
        attendance: 'الحضور والغياب'
    };

    const sectionDescriptions = {
        home: 'مرحباً! إليك ملخص حسابك التعليمي.',
        catalog: 'تصفح جميع الكورسات المتاحة وأضفها إلى سلة المشتريات.',
        library: 'الكورسات التي قمت بالتسجيل فيها.',
        cart: 'الكورسات التي اخترتها للشراء.',
        invoices: 'سجل الفواتير والمدفوعات.',
        attendance: 'سجل حضورك وغيابك في الكورسات.'
    };

    function renderSection(section, enrolled, invoices, attStats, allCourses, cartCourses) {
        switch (section) {
            case 'home': return renderHome(enrolled, invoices, attStats);
            case 'catalog': return renderCatalog(allCourses, enrolled, cartCourses);
            case 'library': return renderLibrary(enrolled);
            case 'cart': return '';
            case 'invoices': return renderInvoices(invoices);
            case 'attendance': return renderAttendance(enrolled);
            default: return renderHome(enrolled, invoices, attStats);
        }
    }

    function renderHome(enrolled, invoices, attStats) {
        const paid = invoices.filter(i => i.status === 'paid');
        const totalPaid = paid.reduce((s, i) => s + (i.amount || 0), 0);
        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top: 3px solid #00D4FF;">
                    <div class="num" style="color:#00D4FF;">${enrolled.length}</div>
                    <p class="label">الكورسات المسجلة</p>
                </div>
                <div class="stat-card" style="border-top: 3px solid #10b981;">
                    <div class="num" style="color:#10b981;">${attStats.rate}%</div>
                    <p class="label">نسبة الحضور</p>
                </div>
                <div class="stat-card" style="border-top: 3px solid #FF3366;">
                    <div class="num" style="color:#FF3366;">${invoices.filter(i => i.status === 'pending').length}</div>
                    <p class="label">الفواتير غير المدفوعة</p>
                </div>
                <div class="stat-card" style="border-top: 3px solid #FBBF24;">
                    <div class="num" style="color:#FBBF24;">$${totalPaid}</div>
                    <p class="label">إجمالي المدفوعات</p>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px;">
                <div class="course-card-dash" style="padding:20px;">
                    <h4 style="margin:0 0 15px;font-size:1rem;"><i class="fa-solid fa-chart-line" style="color:#00D4FF;"></i> مخطط التقدم</h4>
                    <canvas id="studentProgressChart" style="width:100%;height:220px;"></canvas>
                </div>
                <div class="course-card-dash" style="padding:20px;">
                    <h4 style="margin:0 0 15px;font-size:1rem;"><i class="fa-solid fa-clock" style="color:#A855F7;"></i> آخر النشاطات</h4>
                    ${enrolled.slice(0, 4).map(c => `
                        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;">
                            <span>${escHtml(c.title)}</span>
                            <span style="color:rgba(255,255,255,0.3);font-size:0.75rem;">${Math.floor(Math.random() * 7) + 1} أيام</span>
                        </div>
                    `).join('') || '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">لا توجد نشاطات حديثة</p>'}
                </div>
            </div>
            <h4 style="font-size:1rem;font-weight:800;margin:0 0 15px;"><i class="fa-solid fa-book-open" style="color:#00D4FF;"></i> كورساتي الحالية</h4>
            <div class="course-grid">
                ${enrolled.length ? enrolled.slice(0, 6).map(c => courseCard(c, 'library')).join('') : '<div class="empty-state"><i class="fa-solid fa-book"></i><p>لم تشترك في أي كورس بعد. تصفح <a href="#" onclick="renderStudentUI(\'catalog\');return false;" style="color:#00D4FF;">المتجر</a> لبدء التعلم.</p></div>'}
            </div>
        `;
    }

    function renderCatalog(allCourses, enrolled, cartCourses) {
        const enrolledIds = enrolled.map(c => c.id);
        const cartIds = cartCourses.map(c => c.id);
        return `
            <div class="search-bar">
                <input type="text" id="catalogSearch" placeholder="ابحث عن كورس..." oninput="window._filterCatalog()">
                <select id="catalogFilter" onchange="window._filterCatalog()">
                    <option value="all">جميع التصنيفات</option>
                    <option value="languages">لغات</option>
                    <option value="science">علوم</option>
                    <option value="math">رياضيات</option>
                    <option value="tech">تقنية</option>
                    <option value="physics">فيزياء</option>
                    <option value="chemistry">كيمياء</option>
                    <option value="engineering">هندسة</option>
                    <option value="social">اجتماعيات</option>
                </select>
            </div>
            <div class="course-grid" id="catalogGrid">
                ${allCourses.map(c => {
                    const inCart = cartIds.includes(c.id);
                    const isEnrolled = enrolledIds.includes(c.id);
                    return `
                        <div class="course-card-dash" data-category="${c.category || ''}" data-title="${escHtml(c.title).toLowerCase()}" data-desc="${(c.description || '').toLowerCase()}">
                            <div class="img-wrap">
                                <img src="${escHtml(c.image || 'https://picsum.photos/seed/' + c.id + '/400/250')}" alt="" loading="lazy">
                                <span class="badge">${escHtml(c.badge || c.category)}</span>
                            </div>
                            <div class="body">
                                <h4>${escHtml(c.title)}</h4>
                                <p class="meta"><i class="fa-solid fa-tag"></i> ${escHtml(c.category)} <i class="fa-solid fa-clock" style="margin-right:10px;"></i> ${escHtml(c.duration || '')}</p>
                                <div class="price">${c.currency || '$'}${c.price || 0}</div>
                                <div class="actions">
                                    ${isEnrolled ? '<span class="ag-btn" style="background:rgba(16,185,129,0.2);color:#10b981;border:1px solid rgba(16,185,129,0.3);pointer-events:none;"><i class="fa-solid fa-check"></i> مسجل</span>' :
                                    inCart ? '<button class="ag-btn ag-btn-outline in-cart-btn" disabled style="opacity:0.6;"><i class="fa-solid fa-check"></i> في السلة</button>' :
                                    `<button class="ag-btn add-to-cart-btn" data-id="${c.id}"><i class="fa-solid fa-cart-plus"></i> أضف للسلة</button>`}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderLibrary(enrolled) {
        return `
            <div class="course-grid">
                ${enrolled.length ? enrolled.map(c => courseCard(c, 'library')).join('') : '<div class="empty-state"><i class="fa-solid fa-book"></i><p>لم تشترك في أي كورس بعد. <a href="#" onclick="renderStudentUI(\'catalog\');return false;" style="color:#00D4FF;">تصفح المتجر</a></p></div>'}
            </div>
        `;
    }

    function courseCard(c, from) {
        return `
            <div class="course-card-dash">
                <div class="img-wrap">
                    <img src="${escHtml(c.image || 'https://picsum.photos/seed/' + c.id + '/400/250')}" alt="" loading="lazy">
                    <span class="badge">${escHtml(c.badge || c.category)}</span>
                </div>
                <div class="body">
                    <h4>${escHtml(c.title)}</h4>
                    <p class="meta"><i class="fa-solid fa-tag"></i> ${escHtml(c.category)} <i class="fa-solid fa-clock" style="margin-right:10px;"></i> ${escHtml(c.duration || '')}</p>
                    <div class="price">${c.currency || '$'}${c.price || 0}</div>
                    <div class="progress-bar"><div class="fill" style="width:${Math.floor(Math.random() * 50) + 30}%;"></div></div>
                </div>
            </div>
        `;
    }

    function renderCartItems(cartCourses) {
        if (!cartCourses.length) {
            return '<div class="empty-state" style="padding:30px 10px;"><i class="fa-solid fa-cart-empty" style="font-size:2rem;"></i><p>السلة فارغة</p></div>';
        }
        return cartCourses.map(c => `
            <div class="cart-item" data-id="${c.id}">
                <img src="${escHtml(c.image || 'https://picsum.photos/seed/' + c.id + '/60/60')}" alt="">
                <div class="info">
                    <h5>${escHtml(c.title)}</h5>
                    <div class="p">${c.currency || '$'}${c.price || 0}</div>
                </div>
                <button class="remove-btn" data-id="${c.id}" title="إزالة">&times;</button>
            </div>
        `).join('');
    }

    function renderInvoices(invoices) {
        return `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>#</th><th>الوصف</th><th>المبلغ</th><th>تاريخ الإصدار</th><th>تاريخ الاستحقاق</th><th>الحالة</th><th></th></tr></thead>
                    <tbody>
                        ${invoices.length ? invoices.map((inv, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${escHtml(inv.description || '')}</td>
                                <td style="font-weight:700;">${inv.currency || '$'}${inv.amount || 0}</td>
                                <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.issuedAt || '-'}</td>
                                <td style="color:rgba(255,255,255,0.4);font-size:0.8rem;">${inv.dueAt || '-'}</td>
                                <td>${inv.status === 'paid' ? '<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> مدفوع</span>' : '<span style="color:#FBBF24;"><i class="fa-solid fa-circle-exclamation"></i> غير مدفوع</span>'}</td>
                                <td>${inv.status === 'pending' ? '<button class="ag-btn pay-invoice-btn" data-id="' + inv.id + '" style="padding:6px 18px;font-size:0.8rem;">دفع</button>' : '<span style="color:rgba(255,255,255,0.2);"><i class="fa-solid fa-check"></i></span>'}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);">لا توجد فواتير</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderAttendance(enrolled) {
        const stats = window.db.getStudentAttendanceStats(user.id);
        let courseHtml = enrolled.map(c => {
            const sessions = window.db.getAttendanceForCourse(c.id);
            if (!sessions.length) return '';
            let present = 0, absent = 0;
            sessions.forEach(s => {
                const rec = s.records.find(r => r.userId === user.id);
                if (rec) { if (rec.status === 'present') present++; else if (rec.status === 'absent') absent++; }
            });
            const total = present + absent;
            const rate = total ? Math.round((present / total) * 100) : 0;
            return `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.85rem;"><span>${escHtml(c.title)}</span><span style="color:#00D4FF;font-weight:700;">${rate}% (${present}/${total})</span></div>`;
        }).filter(Boolean).join('');

        return `
            <div class="stats-grid">
                <div class="stat-card" style="border-top:3px solid #10b981;">
                    <div class="num" style="color:#10b981;">${stats.present}</div>
                    <p class="label">حضور</p>
                </div>
                <div class="stat-card" style="border-top:3px solid #ff4d4d;">
                    <div class="num" style="color:#ff4d4d;">${stats.absent}</div>
                    <p class="label">غياب</p>
                </div>
                <div class="stat-card" style="border-top:3px solid #00D4FF;">
                    <div class="num" style="color:#00D4FF;">${stats.rate}%</div>
                    <p class="label">نسبة الحضور</p>
                </div>
            </div>
            <div class="course-card-dash" style="padding:20px;">
                <h4 style="margin:0 0 15px;font-size:1rem;">تفاصيل الحضور حسب الكورس</h4>
                ${courseHtml || '<p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">لا توجد سجلات حضور</p>'}
            </div>
        `;
    }

    function bindEvents(section, enrolled, allCourses, cartCourses) {
        /* Sidebar navigation */
        document.querySelectorAll('.dash-sidebar .nav-list a[data-section]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                renderStudentUI(link.dataset.section);
            });
        });

        /* Logout */
        document.getElementById('studentLogoutBtn').addEventListener('click', e => {
            e.preventDefault();
            window.auth.logout();
        });

        /* Add to cart buttons */
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (addToCart(id)) {
                    showToast('تمت الإضافة إلى السلة ✓');
                    renderStudentUI('catalog');
                } else {
                    showToast('الكورس موجود بالفعل في السلة');
                }
            });
        });

        /* Cart sidebar */
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartFloatBtn = document.getElementById('cartFloatBtn');

        document.querySelectorAll('[data-section="cart"]').forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                cartSidebar.classList.add('open');
                cartOverlay.classList.add('show');
            });
        });

        document.getElementById('cartFloatBtn').addEventListener('click', () => {
            cartSidebar.classList.add('open');
            cartOverlay.classList.add('show');
        });

        document.getElementById('closeCartBtn').addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
        });

        cartOverlay.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('show');
        });

        /* Remove from cart */
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(parseInt(btn.dataset.id));
                renderStudentUI(section);
                updateCartFloat();
            });
        });

        /* Checkout */
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (!cartCourses.length) return;
            if (confirm('هل أنت متأكد من إتمام شراء ' + cartCourses.length + ' كورس؟')) {
                cartCourses.forEach(c => {
                    const data = JSON.parse(localStorage.getItem('lookagenius_db')) || {};
                    const course = (data.courses || []).find(x => x.id === c.id);
                    if (course) {
                        if (!course.studentsEnrolled) course.studentsEnrolled = [];
                        if (!course.studentsEnrolled.includes(user.id)) {
                            course.studentsEnrolled.push(user.id);
                        }
                    }
                    localStorage.setItem('lookagenius_db', JSON.stringify(data));
                    window.db.addInvoice({
                        userId: user.id,
                        courseId: c.id,
                        amount: c.price || 0,
                        currency: c.currency || '$',
                        description: c.title,
                        status: 'paid',
                        dueAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                        paidAt: new Date().toISOString().slice(0, 10)
                    });
                });
                clearCart();
                cartSidebar.classList.remove('open');
                cartOverlay.classList.remove('show');
                showToast('تم الشراء بنجاح! ✓ تمت إضافة الكورسات إلى مكتبتك.');
                setTimeout(() => renderStudentUI('library'), 500);
            }
        });

        /* Pay invoice */
        document.querySelectorAll('.pay-invoice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('تأكيد دفع الفاتورة؟')) {
                    window.db.payInvoice(id);
                    showToast('تم الدفع ✓');
                    renderStudentUI('invoices');
                }
            });
        });

        /* Chart */
        setTimeout(() => {
            const ctx = document.getElementById('studentProgressChart');
            if (ctx) {
                const attStats = window.db.getStudentAttendanceStats(user.id);
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                        datasets: [{
                            label: 'التقدم',
                            data: [65, 75, 70, 85, 90, attStats.rate || 70],
                            borderColor: '#00D4FF',
                            backgroundColor: 'rgba(0, 212, 255, 0.08)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#00D4FF',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } },
                            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)' } }
                        }
                    }
                });
            }
        }, 100);
    }

    /* Catalog filter */
    window._filterCatalog = function() {
        const search = (document.getElementById('catalogSearch').value || '').toLowerCase();
        const cat = document.getElementById('catalogFilter').value;
        document.querySelectorAll('#catalogGrid .course-card-dash').forEach(card => {
            const title = (card.dataset.title || '');
            const desc = (card.dataset.desc || '');
            const category = (card.dataset.category || '');
            const matchSearch = title.includes(search) || desc.includes(search);
            const matchCat = cat === 'all' || category === cat;
            card.style.display = matchSearch && matchCat ? '' : 'none';
        });
    };

    function updateCartFloat() {
        const btn = document.getElementById('cartFloatBtn');
        const count = cartCount();
        if (btn) {
            btn.style.display = count ? 'flex' : 'none';
            const badge = btn.querySelector('.count');
            if (badge) badge.textContent = count;
        }
    }

    function showToast(msg) {
        const t = document.getElementById('dashToast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._timeout);
        t._timeout = setTimeout(() => t.classList.remove('show'), 2500);
    }

    renderStudentUI();
});

/**
 * components.js — Global Layout Components for LookaGenius Academy
 * Provides unified responsive header with official logo, navigation links,
 * mobile drawer menu, dynamic auth states, and elegant luxury glass footer.
 */

const renderNavbar = () => {
    // If header is already in DOM, do not re-insert
    if (document.getElementById('mainHeader')) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const user = window.auth ? window.auth.currentUser : null;
    
    // Official Logo HTML
    const logoHtml = `
        <a href="index.html" class="logo ag-text-gradient" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <img src="assets/img/logo.png" alt="LookaGenius Logo" style="height: 42px; width: auto; filter: drop-shadow(0 0 8px rgba(0,212,255,0.4));">
            <span class="logo-text" style="font-size: 1.35rem; font-weight: 800; color: #fff; letter-spacing: -0.5px;">Looka<span style="color: var(--primary-blue, #00D4FF);">Genius</span></span>
        </a>
    `;

    const navHtml = `
    <!-- Global Header -->
    <header class="ag-header ag-glass" id="mainHeader" style="position: fixed; top: 15px; left: 3%; right: 3%; z-index: 1000; padding: 0 25px; height: 68px; display: flex; align-items: center; justify-content: space-between; border-radius: 50px; background: rgba(10, 15, 30, 0.78); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(0, 212, 255, 0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.45);">
        <div class="header-container" style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
            ${logoHtml}

            <nav class="nav-links" style="display: flex; gap: 22px; list-style: none; margin: 0; padding: 0;">
                <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}" style="color: ${currentPath === 'index.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_home">الرئيسية</a>
                <a href="courses.html" class="nav-link ${currentPath === 'courses.html' ? 'active' : ''}" style="color: ${currentPath === 'courses.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_courses">الكورسات</a>
                <a href="books.html" class="nav-link ${currentPath === 'books.html' ? 'active' : ''}" style="color: ${currentPath === 'books.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_books">الكتب</a>
                <a href="scholarships.html" class="nav-link ${currentPath === 'scholarships.html' ? 'active' : ''}" style="color: ${currentPath === 'scholarships.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_scholarships">المنح الدراسية</a>
                <a href="services.html" class="nav-link ${currentPath === 'services.html' ? 'active' : ''}" style="color: ${currentPath === 'services.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_services">الخدمات</a>
                <a href="blog.html" class="nav-link ${currentPath === 'blog.html' ? 'active' : ''}" style="color: ${currentPath === 'blog.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_blog">المدونة</a>
                <a href="support.html" class="nav-link ${currentPath === 'support.html' ? 'active' : ''}" style="color: ${currentPath === 'support.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_about">من نحن</a>
                <a href="join-us.html" class="nav-link ${currentPath === 'join-us.html' ? 'active' : ''}" style="color: ${currentPath === 'join-us.html' ? 'var(--primary-blue, #00D4FF)' : '#e2e8f0'}; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.3s;" data-i18n="nav_join">انضم لنا</a>
            </nav>

            <div class="header-actions" style="display: flex; gap: 10px; align-items: center;">
                ${user ? `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="dashboard-${user.type}.html" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.85rem; border-radius: 30px; background: linear-gradient(135deg, #00D4FF, #A855F7); color: #fff; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-gauge"></i> لوحة التحكم</a>
                    <a href="profile.html" class="btn btn-outline" title="الملف الشخصي" style="padding: 8px 12px; font-size: 0.85rem; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); color: #fff; text-decoration: none;"><i class="fa-solid fa-user"></i></a>
                    <a href="#" class="logout-trigger" style="color: var(--accent-pink, #ff4d4d); font-size: 1.1rem; padding: 6px 10px; text-decoration: none;" title="تسجيل الخروج"><i class="fa-solid fa-right-from-bracket"></i></a>
                </div>
                ` : `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="login.html" class="btn btn-outline" style="padding: 8px 18px; font-size: 0.85rem; border-radius: 30px; border: 1px solid rgba(0,212,255,0.4); color: #00D4FF; text-decoration: none; font-weight: 700; transition: 0.3s;" data-i18n="btn_login">تسجيل الدخول</a>
                    <a href="register.html" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.85rem; border-radius: 30px; background: linear-gradient(135deg, #00D4FF, #A855F7); color: #fff; text-decoration: none; font-weight: 700; box-shadow: 0 4px 15px rgba(0,212,255,0.3); transition: 0.3s;" data-i18n="btn_register">حساب جديد <i class="fa-solid fa-user-plus"></i></a>
                </div>
                `}
            </div>

            <div class="mobile-btn" id="mobileMenuBtn" style="display: none; color: #fff; font-size: 1.4rem; cursor: pointer;">
                <i class="fa-solid fa-bars-staggered"></i>
            </div>
        </div>
    </header>

    <!-- Mobile Drawer Sidebar -->
    <div class="sidebar-overlay" id="sidebarOverlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 1999; display: none;"></div>
    <div class="sidebar" id="mobileSidebar" style="position: fixed; top: 0; right: -320px; width: 300px; height: 100vh; background: #0a0f1f; z-index: 2000; padding: 25px; transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: -10px 0 30px rgba(0,0,0,0.5); border-left: 1px solid rgba(0,212,255,0.2); overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <div id="sidebarClose" style="color: #fff; font-size: 1.4rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></div>
            ${logoHtml}
        </div>

        <nav style="display: flex; flex-direction: column; gap: 14px; text-align: right;">
            <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_home">الرئيسية</a>
            <a href="courses.html" class="nav-link ${currentPath === 'courses.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_courses">الكورسات</a>
            <a href="books.html" class="nav-link ${currentPath === 'books.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_books">الكتب والمناهج</a>
            <a href="scholarships.html" class="nav-link ${currentPath === 'scholarships.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_scholarships">المنح الدراسية</a>
            <a href="services.html" class="nav-link ${currentPath === 'services.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_services">الخدمات</a>
            <a href="blog.html" class="nav-link ${currentPath === 'blog.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_blog">المدونة</a>
            <a href="support.html" class="nav-link ${currentPath === 'support.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_about">من نحن</a>
            <a href="join-us.html" class="nav-link ${currentPath === 'join-us.html' ? 'active' : ''}" style="color: #fff; text-decoration: none; padding: 10px; border-radius: 10px; font-weight: 700;" data-i18n="nav_join">انضم لنا</a>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;">
            ${user ? `
            <a href="dashboard-${user.type}.html" class="btn btn-primary" style="padding: 12px; border-radius: 12px; background: linear-gradient(135deg, #00D4FF, #A855F7); color: #fff; text-decoration: none; font-weight: 700; text-align: center;">لوحة التحكم</a>
            <a href="profile.html" class="btn btn-outline" style="padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); color: #fff; text-decoration: none; font-weight: 700; text-align: center;">الملف الشخصي</a>
            <a href="#" class="logout-trigger" style="padding: 12px; border-radius: 12px; background: rgba(255,77,77,0.1); color: #ff4d4d; text-decoration: none; font-weight: 700; text-align: center;">تسجيل الخروج</a>
            ` : `
            <a href="login.html" class="btn btn-outline" style="padding: 12px; border-radius: 12px; border: 1px solid rgba(0,212,255,0.4); color: #00D4FF; text-decoration: none; font-weight: 700; text-align: center;">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-primary" style="padding: 12px; border-radius: 12px; background: linear-gradient(135deg, #00D4FF, #A855F7); color: #fff; text-decoration: none; font-weight: 700; text-align: center;">حساب جديد</a>
            `}
        </nav>
    </div>

    <!-- Responsive media styling for header -->
    <style>
        @media (max-width: 992px) {
            #mainHeader .nav-links { display: none !important; }
            #mainHeader .header-actions { display: none !important; }
            #mainHeader .mobile-btn { display: block !important; }
            #mobileSidebar.active { right: 0 !important; }
            #sidebarOverlay.active { display: block !important; }
        }
    </style>
    `;
    
    const globalNav = document.getElementById('global-nav');
    if (globalNav) {
        globalNav.innerHTML = navHtml;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navHtml);
    }
    
    // Sidebar Logic
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('sidebarClose');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('mobileSidebar');

    if (mobileBtn && sidebar) {
        mobileBtn.onclick = () => {
            sidebar.classList.add('active');
            sidebar.style.right = '0';
            if (overlay) {
                overlay.classList.add('active');
                overlay.style.display = 'block';
            }
        };
    }
    const closeDrawer = () => {
        if (sidebar) {
            sidebar.classList.remove('active');
            sidebar.style.right = '-320px';
        }
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        }
    };
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (overlay) overlay.onclick = closeDrawer;

    // Logout handling
    document.querySelectorAll('.logout-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            if (window.auth) window.auth.logout();
            else {
                localStorage.removeItem('lookagenius_session');
                window.location.reload();
            }
        };
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (header) {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
                header.style.background = 'rgba(7, 11, 22, 0.92)';
            } else {
                header.classList.remove('scrolled');
                header.style.background = 'rgba(10, 15, 30, 0.78)';
            }
        }
    });
};

const renderFooter = () => {
    // If chic footer or global footer already rendered, do not duplicate
    if (document.getElementById('footer') || document.querySelector('.auth-footer-chic')) return;

    const footerHtml = `
    <!-- Elegant Minimalist Platform Footer -->
    <footer id="footer" class="ag-glass" style="margin-top: 70px; padding: 50px 6% 30px; background: rgba(10, 15, 30, 0.75); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid rgba(0, 212, 255, 0.16); box-shadow: 0 -10px 30px rgba(0,0,0,0.35);">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 40px; margin-bottom: 40px; text-align: right;">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                    <img src="assets/img/logo.png" alt="LookaGenius Logo" style="height: 38px; width: auto; filter: drop-shadow(0 0 8px rgba(0,212,255,0.4));">
                    <span style="font-size: 1.3rem; font-weight: 800; color: #fff;">Looka<span style="color: var(--primary-blue, #00D4FF);">Genius</span></span>
                </div>
                <p style="color: var(--text-secondary, #94a3b8); line-height: 1.8; font-size: 0.9rem;">
                    الأكاديمية التعليمية الذكية الشاملة. نوفر برامج دراسية متطورة، منحًا أوروبية ممولة، وإرشادًا أكاديميًا لمستقبل تعليمي واعد.
                </p>
                <div style="display: flex; gap: 12px; margin-top: 18px;">
                    <a href="https://wa.me/201098768356" target="_blank" title="واتساب" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00D4FF; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: 0.3s;"><i class="fa-brands fa-whatsapp"></i></a>
                    <a href="#" title="تليجرام" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00D4FF; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: 0.3s;"><i class="fa-brands fa-telegram"></i></a>
                    <a href="#" title="فيسبوك" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00D4FF; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: 0.3s;"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" title="لينكد إن" style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.25); color: #00D4FF; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: 0.3s;"><i class="fa-brands fa-linkedin-in"></i></a>
                </div>
            </div>
            <div>
                <h4 style="color: #fff; font-size: 1.05rem; font-weight: 700; margin-bottom: 18px; border-bottom: 2px solid var(--primary-blue, #00D4FF); display: inline-block; padding-bottom: 6px;">روابط المنصة</h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                    <li><a href="index.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;" data-i18n="nav_home">الرئيسية</a></li>
                    <li><a href="courses.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;" data-i18n="nav_courses">الكورسات المتاحة</a></li>
                    <li><a href="books.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;" data-i18n="nav_books">المكتبة الرقمية والكتب</a></li>
                    <li><a href="scholarships.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;" data-i18n="nav_scholarships">المنح الدراسية الأوروبية</a></li>
                    <li><a href="services.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;" data-i18n="nav_services">الخدمات الأكاديمية</a></li>
                </ul>
            </div>
            <div>
                <h4 style="color: #fff; font-size: 1.05rem; font-weight: 700; margin-bottom: 18px; border-bottom: 2px solid var(--neon-violet, #A855F7); display: inline-block; padding-bottom: 6px;">معلومات وانضمام</h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                    <li><a href="blog.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;">المدونة التعليمية</a></li>
                    <li><a href="support.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;">من نحن والدعم الفني</a></li>
                    <li><a href="join-us.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;">انضم لفريق المعلمين</a></li>
                    <li><a href="verify-certificate.html" style="color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: 0.2s;">التحقق من الشهادات</a></li>
                </ul>
            </div>
        </div>
        <div style="max-width: 1200px; margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 15px; font-size: 0.82rem; color: #64748b;">
            <p style="margin: 0;">&copy; 2026 LookaGenius Academy. جميع الحقوق محفوظة | شهادات معتمدة | إرشاد أكاديمي</p>
            <div style="display: flex; gap: 20px;">
                <a href="support.html" style="color: #64748b; text-decoration: none;">شروط الاستخدام</a>
                <a href="support.html" style="color: #64748b; text-decoration: none;">سياسة الخصوصية</a>
            </div>
        </div>
    </footer>
    `;

    const footerPlaceholder = document.getElementById('global-footer');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHtml;
    } else {
        const f = document.querySelector('footer');
        if (f) f.outerHTML = footerHtml;
        else document.body.insertAdjacentHTML('beforeend', footerHtml);
    }
};

function reRenderNav() {
    const oldHeader = document.getElementById('mainHeader') || document.querySelector('.ag-header') || document.querySelector('.header');
    if (oldHeader) oldHeader.remove();
    const oldOverlay = document.getElementById('sidebarOverlay');
    if (oldOverlay) oldOverlay.remove();
    const oldSidebar = document.getElementById('mobileSidebar');
    if (oldSidebar) oldSidebar.remove();
    renderNavbar();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('mainHeader') && !document.querySelector('.ag-header') && !document.querySelector('.header')) {
        renderNavbar();
    }
    if (!document.getElementById('footer') && !document.querySelector('footer') && !document.querySelector('.auth-footer-chic')) {
        renderFooter();
    }
});

window.addEventListener('auth:ready', () => {
    reRenderNav();
});

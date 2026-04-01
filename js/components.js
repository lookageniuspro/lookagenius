const renderNavbar = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const user = window.auth ? window.auth.currentUser : null;
    
    // Logo HTML with fallback if image fails
    const logoHtml = `
        <a href="index.html" class="logo">
            <img src="assets/logo.png" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="height: 50px; width: auto; object-fit: contain;">
            <span style="font-size: 1.4rem; margin-right: 10px; display: none;">Looka<span>Genius</span></span>
        </a>
    `;

    const navHtml = `
    <!-- Header -->
    <header class="header" id="mainHeader">
        <div class="header-actions">
            ${user ? `
            <div style="display: flex; gap: 10px; align-items: center;">
                <a href="dashboard-${user.type}.html" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.8rem;"><i class="fa-solid fa-gauge"></i> لوحة التحكم</a>
                <a href="#" class="logout-trigger" style="color: var(--accent-pink); font-size: 1.2rem;" title="تسجيل الخروج"><i class="fa-solid fa-right-from-bracket"></i></a>
            </div>
            ` : `
            <div style="display: flex; gap: 10px;">
                <a href="login.html" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.8rem;">دخول</a>
                <a href="register.html" class="btn btn-secondary" style="padding: 8px 18px; font-size: 0.8rem;">ابدأ مجاناً</a>
            </div>
            `}
        </div>

        <nav class="nav-links">
            <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">الرئيسية</a>
            <a href="courses.html" class="nav-link ${currentPath === 'courses.html' ? 'active' : ''}">الكورسات</a>
            <a href="scholarships.html" class="nav-link ${currentPath === 'scholarships.html' ? 'active' : ''}">المنح</a>
            <a href="support.html" class="nav-link">من نحن</a>
        </nav>

        ${logoHtml}

        <div class="mobile-btn" id="mobileMenuBtn">
            <i class="fa-solid fa-bars-staggered"></i>
        </div>
    </header>

    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Mobile Sidebar -->
    <div class="sidebar" id="mobileSidebar">
        <div class="sidebar-close" id="sidebarClose"><i class="fa-solid fa-xmark"></i></div>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
             ${logoHtml}
        </div>

        <nav style="display: flex; flex-direction: column; gap: 20px; text-align: right;">
            <a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">الرئيسية</a>
            <a href="courses.html" class="nav-link ${currentPath === 'courses.html' ? 'active' : ''}">الكورسات</a>
            <a href="scholarships.html" class="nav-link ${currentPath === 'scholarships.html' ? 'active' : ''}">المنح</a>
            <a href="support.html" class="nav-link">من نحن</a>
            <hr style="border: none; border-top: 1px solid var(--border-color);">
            ${user ? `
            <a href="dashboard-${user.type}.html" class="btn btn-primary" style="width: 100%; justify-content: center;">لوحة التحكم</a>
            <a href="#" class="logout-trigger btn btn-secondary" style="width: 100%; justify-content: center; color: var(--accent-pink);">تسجيل الخروج</a>
            ` : `
            <a href="login.html" class="btn btn-primary" style="width: 100%; justify-content: center;">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-secondary" style="width: 100%; justify-content: center;">ابدأ مجاناً</a>
            `}
        </nav>
    </div>

    <!-- Custom Cursor -->
    <div class="cursor-dot" data-cursor-dot></div>
    <div class="cursor-outline" data-cursor-outline></div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', navHtml);
    
    // Sidebar Logic
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('sidebarClose');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('mobileSidebar');

    if (mobileBtn) mobileBtn.onclick = () => { sidebar.classList.add('active'); overlay.classList.add('active'); };
    if (closeBtn) closeBtn.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };
    if (overlay) overlay.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };

    // Logout handling
    document.querySelectorAll('.logout-trigger').forEach(btn => {
        btn.onclick = () => { if(window.auth) window.auth.logout(); else { localStorage.removeItem('lookagenius_session'); window.location.reload(); } };
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('mainHeader');
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });
};

const renderFooter = () => {
    const footerHtml = `
    <footer id="footer" style="padding: 60px 6%; background: rgba(0,0,0,0.2);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; text-align: right;">
            <div>
                <h3 style="margin-bottom: 20px; font-weight: 800;">Looka<span style="color: var(--primary-blue)">Genius</span> Academy</h3>
                <p style="color: var(--text-secondary); line-height: 1.8;">منصتك الأولى للتعلم الذكي، استكشف عالم المعرفة والتكنولوجيا بخطوات مبسطة وتصميم استثنائي.</p>
            </div>
            <div>
                <h4 style="margin-bottom: 20px;">روابط سريعة</h4>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                    <li><a href="index.html" class="nav-link">الرئيسية</a></li>
                    <li><a href="courses.html" class="nav-link">الكورسات</a></li>
                    <li><a href="scholarships.html" class="nav-link">المنح الدراسية</a></li>
                </ul>
            </div>
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
            <p>© 2025 LookaGenius Academy. جميع الحقوق محفوظة | شهادات معتمدة | إرشاد أكاديمي</p>
        </div>
    </footer>
    `;
    const footerPlaceholder = document.getElementById('global-footer');
    if(footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;
    else {
        const f = document.querySelector('footer');
        if(f) f.innerHTML = footerHtml;
        else document.body.insertAdjacentHTML('beforeend', footerHtml);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if(!document.querySelector('.header')) renderNavbar();
    if(!document.querySelector('footer p')) renderFooter();
});

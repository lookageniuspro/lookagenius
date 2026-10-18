/**
 * dashboard-common.js
 * Professional shared luxury dashboard layout — used by all 6 role dashboards:
 * Student, Teacher, Parent, Admin, Engineer, Accountant.
 * Features:
 * - Off-canvas sliding mobile drawer with touch backdrop
 * - Horizontal quick-nav pills for 1-tap mobile navigation
 * - Luxury glassmorphism KPI analytics cards
 * - Responsive 1-column collapse on mobile/tablet
 * - Status banner with academy role verification & live indicator
 */

const renderDashboardLayout = (title, sidebarItemsHtml, contentHtml) => {
    const user = window.auth && window.auth.currentUser;
    if (!user) return '<div class="dash-wrap" style="text-align:center;padding:120px 20px;"><p style="font-size:1.2rem;color:rgba(255,255,255,0.7);">يرجى تسجيل الدخول للوصول إلى لوحة التحكم.</p><a href="login.html" class="ag-btn" style="margin-top:15px;display:inline-block;padding:10px 25px;border-radius:50px;background:#00D4FF;color:#000;text-decoration:none;font-weight:700;">تسجيل الدخول</a></div>';

    const initial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

    const roleLabels = {
        student: 'طالب معتمد',
        teacher: 'معلم خبير',
        parent: 'ولي أمر معتمد',
        admin: 'مسؤول النظام (Admin)',
        engineer: 'مهندس المنصة',
        accountant: 'محاسب مالي معتمد'
    };
    const roleName = (window.auth && typeof window.auth.getRoleAr === 'function' && window.auth.getRoleAr(user.type)) || roleLabels[user.type] || user.type || 'عضو الأكاديمية';

    let arabicDate = '';
    try {
        arabicDate = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    } catch (e) {
        arabicDate = 'أكاديمية LookaGenius';
    }

    const quickPillsHtml = extractQuickPills(sidebarItemsHtml);

    return `
    <style>
        /* Dashboard Global Glass System */
        .dash-wrap {
            display: flex;
            gap: 28px;
            padding: 100px 24px 70px;
            max-width: 1440px;
            margin: 0 auto;
            min-height: 85vh;
            position: relative;
            box-sizing: border-box;
        }

        /* Mobile Header Bar (hidden on desktop) */
        .dash-mobile-bar {
            display: none;
        }

        /* Drawer Overlay Backdrop */
        .dash-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(3, 7, 18, 0.78);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 99998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dash-backdrop.is-open {
            opacity: 1;
            pointer-events: auto;
        }

        /* Sidebar Desktop */
        .dash-sidebar {
            width: 280px;
            flex-shrink: 0;
            align-self: flex-start;
            position: sticky;
            top: 95px;
            max-height: calc(100vh - 115px);
            overflow-y: auto;
            overflow-x: hidden;
            border-radius: 24px;
            background: rgba(13, 20, 36, 0.72);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
            display: flex;
            flex-direction: column;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 212, 255, 0.25) transparent;
            transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 100;
        }
        .dash-sidebar::-webkit-scrollbar {
            width: 5px;
        }
        .dash-sidebar::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.25);
            border-radius: 10px;
        }

        /* Drawer Header (mobile only close bar) */
        .dash-drawer-header {
            display: none;
            padding: 16px 20px;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .dash-drawer-brand {
            font-size: 0.95rem;
            font-weight: 800;
            background: linear-gradient(135deg, #00D4FF, #A855F7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dash-drawer-close {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 15px;
            transition: all 0.2s ease;
        }
        .dash-drawer-close:hover {
            background: rgba(255, 51, 102, 0.2);
            color: #ff3366;
            border-color: rgba(255, 51, 102, 0.4);
            transform: rotate(90deg);
        }

        /* Profile in Sidebar */
        .dash-sidebar .profile {
            text-align: center;
            padding: 26px 20px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            position: relative;
        }
        .dash-sidebar .profile .avatar-wrap {
            position: relative;
            width: 74px;
            height: 74px;
            margin: 0 auto 12px;
        }
        .dash-sidebar .profile .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #00D4FF 0%, #A855F7 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: 800;
            color: #ffffff;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.35);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .dash-sidebar .profile .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 15px;
            height: 15px;
            background: #10b981;
            border: 2.5px solid #0d1424;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
        }
        .dash-sidebar .profile h4 {
            font-size: 1.05rem;
            font-weight: 800;
            margin: 0 0 6px;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .dash-sidebar .profile .role-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.74rem;
            font-weight: 700;
            padding: 3px 12px;
            border-radius: 30px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(168, 85, 247, 0.12));
            border: 1px solid rgba(0, 212, 255, 0.28);
            color: #00D4FF;
        }

        /* Navigation List */
        .dash-sidebar .nav-list {
            list-style: none;
            padding: 10px 10px 16px;
            margin: 0;
            flex: 1;
        }
        .dash-sidebar .nav-list li {
            margin-bottom: 3px;
        }
        .dash-sidebar .nav-list li a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: rgba(255, 255, 255, 0.65);
            text-decoration: none;
            font-size: 0.88rem;
            font-weight: 600;
            border-radius: 12px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            border-right: 3px solid transparent;
        }
        .dash-sidebar .nav-list li a:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            transform: translateX(-3px);
        }
        .dash-sidebar .nav-list li a.active {
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.16) 0%, rgba(168, 85, 247, 0.08) 100%);
            color: #00D4FF;
            border-right-color: #00D4FF;
            font-weight: 700;
            box-shadow: inset 0 0 20px rgba(0, 212, 255, 0.08);
        }
        .dash-sidebar .nav-list li a i {
            width: 20px;
            text-align: center;
            font-size: 1rem;
            opacity: 0.85;
        }
        .dash-sidebar .nav-list li a.active i {
            opacity: 1;
            color: #00D4FF;
        }
        .dash-sidebar .nav-list li a .badge {
            background: linear-gradient(135deg, #FF3366, #e11d48);
            color: #ffffff;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
            margin-right: auto;
            box-shadow: 0 0 10px rgba(255, 51, 102, 0.35);
        }
        .dash-sidebar .nav-list li a.logout {
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            margin-top: 10px;
            padding-top: 15px;
            color: #ff6b6b;
            border-radius: 0 0 12px 12px;
        }
        .dash-sidebar .nav-list li a.logout:hover {
            background: rgba(255, 77, 77, 0.1);
            color: #ff4d4d;
        }

        /* Main Content Container */
        .dash-main {
            flex: 1;
            min-width: 0;
        }

        /* Welcome Hero Banner */
        .dash-welcome-hero {
            border-radius: 22px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 212, 255, 0.03) 50%, rgba(168, 85, 247, 0.04) 100%);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 22px 26px;
            margin-bottom: 22px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        }
        .dash-welcome-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -20%;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, rgba(0, 212, 255, 0.12), transparent 70%);
            pointer-events: none;
        }
        .dash-welcome-hero .hero-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 14px;
        }
        .dash-welcome-hero h2 {
            font-size: 1.6rem;
            font-weight: 900;
            margin: 0 0 6px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .dash-welcome-hero h2 .title-grad {
            background: linear-gradient(135deg, #00D4FF 0%, #A855F7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .dash-welcome-hero p {
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            font-size: 0.88rem;
            max-width: 650px;
        }
        .dash-welcome-hero .hero-chips {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 14px;
        }
        .dash-welcome-hero .hero-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.74rem;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.75);
        }
        .dash-welcome-hero .hero-chip.online {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.25);
            color: #10b981;
        }
        .dash-welcome-hero .pulse-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 8px #10b981;
            display: inline-block;
            animation: pulseGlow 2s infinite;
        }
        @keyframes pulseGlow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* Horizontal Quick Nav Pills */
        .dash-quick-nav {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 4px 2px 14px;
            margin-bottom: 22px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        .dash-quick-nav::-webkit-scrollbar {
            display: none;
        }
        .dash-quick-pill {
            white-space: nowrap;
            padding: 8px 16px;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.22s ease;
            font-family: inherit;
            flex-shrink: 0;
        }
        .dash-quick-pill:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            border-color: rgba(0, 212, 255, 0.3);
        }
        .dash-quick-pill.active {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%);
            border-color: #00D4FF;
            color: #ffffff;
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.25);
            font-weight: 700;
        }
        .dash-quick-badge {
            background: #FF3366;
            color: #ffffff;
            font-size: 0.65rem;
            padding: 1px 6px;
            border-radius: 20px;
            font-weight: 700;
        }

        /* KPI Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 16px;
            margin-bottom: 25px;
        }
        .stat-card {
            padding: 22px 20px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.035);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #00D4FF, #A855F7);
            opacity: 0.7;
        }
        .stat-card:hover {
            border-color: rgba(0, 212, 255, 0.4);
            transform: translateY(-4px);
            box-shadow: 0 15px 40px rgba(0, 212, 255, 0.15);
        }
        .stat-card .num {
            font-size: 2.1rem;
            font-weight: 900;
            margin: 0 0 6px;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }
        .stat-card .label {
            font-size: 0.82rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            font-weight: 600;
        }

        /* Responsive 2-column Grid & Cards */
        .dash-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 28px;
        }
        .dash-card {
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.035);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 22px;
            transition: border-color 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            min-width: 0;
        }
        .dash-card:hover {
            border-color: rgba(0, 212, 255, 0.3);
        }
        .dash-card h4 {
            font-size: 1.05rem;
            font-weight: 800;
            margin: 0 0 18px;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Course Grid */
        .course-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 20px;
        }
        .course-card-dash {
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.035);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .course-card-dash:hover {
            border-color: #00D4FF;
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 212, 255, 0.15);
        }
        .course-card-dash .img-wrap {
            height: 160px;
            overflow: hidden;
            position: relative;
        }
        .course-card-dash .img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
        }
        .course-card-dash:hover .img-wrap img {
            transform: scale(1.04);
        }
        .course-card-dash .img-wrap .badge {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(10px);
            color: #00D4FF;
            border: 1px solid rgba(0, 212, 255, 0.35);
        }
        .course-card-dash .body {
            padding: 18px;
        }
        .course-card-dash .body h4 {
            font-size: 1rem;
            font-weight: 800;
            margin: 0 0 8px;
            color: #ffffff;
        }
        .course-card-dash .body .meta {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 4px;
        }
        .course-card-dash .body .price {
            font-size: 1.15rem;
            font-weight: 900;
            color: #00D4FF;
            margin: 12px 0 0;
        }

        /* Tables */
        .table-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            position: relative;
        }
        .table-wrap table {
            width: 100%;
            min-width: 600px;
            border-collapse: collapse;
            font-size: 0.88rem;
        }
        .table-wrap th {
            padding: 16px 18px;
            text-align: right;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.55);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: rgba(255, 255, 255, 0.02);
        }
        .table-wrap td {
            padding: 16px 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: rgba(255, 255, 255, 0.85);
        }
        .table-wrap tr:last-child td {
            border-bottom: none;
        }
        .table-wrap tr:hover td {
            background: rgba(255, 255, 255, 0.03);
        }

        /* Action Bars */
        .action-bar {
            display: flex;
            gap: 12px;
            margin-bottom: 25px;
            flex-wrap: wrap;
            align-items: center;
        }
        .action-bar .ag-btn {
            padding: 10px 22px;
            font-size: 0.85rem;
            border-radius: 50px;
            border: none;
            background: linear-gradient(135deg, #00D4FF 0%, #A855F7 100%);
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            transition: all 0.25s ease;
            font-family: inherit;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25);
        }
        .action-bar .ag-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(168, 85, 247, 0.35);
        }
        .action-bar .ag-btn-outline {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.8);
            box-shadow: none;
        }
        .action-bar .ag-btn-outline:hover {
            border-color: #00D4FF;
            color: #00D4FF;
            background: rgba(0, 212, 255, 0.08);
        }
        .action-bar input, .action-bar select {
            padding: 10px 18px;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 0.85rem;
            outline: none;
            font-family: inherit;
        }
        .action-bar input:focus, .action-bar select:focus {
            border-color: #00D4FF;
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255, 255, 255, 0.4);
        }
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
            color: rgba(0, 212, 255, 0.4);
        }
        .empty-state p {
            font-size: 0.95rem;
            margin: 0;
        }

        /* Mobile & Tablet Optimizations */
        @media (max-width: 992px) {
            .dash-wrap {
                flex-direction: column;
                padding: 15px 16px 60px;
                gap: 16px;
            }
            .dash-mobile-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 18px;
                border-radius: 18px;
                background: rgba(13, 20, 36, 0.88);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 16px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            }
            .dash-menu-trigger {
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(168, 85, 247, 0.18));
                border: 1px solid rgba(0, 212, 255, 0.35);
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 50px;
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-family: inherit;
                transition: all 0.2s ease;
            }
            .dash-menu-trigger:hover {
                background: rgba(0, 212, 255, 0.28);
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            }
            .dash-mobile-title {
                font-size: 0.95rem;
                font-weight: 800;
                color: #ffffff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .dash-mobile-user {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .dash-mobile-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00D4FF, #A855F7);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 14px;
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
            }

            /* Off-canvas Sidebar Drawer */
            .dash-sidebar {
                position: fixed !important;
                top: 0 !important;
                bottom: 0 !important;
                right: 0 !important;
                left: auto !important;
                width: 310px !important;
                max-width: 86vw !important;
                height: 100vh !important;
                z-index: 100000 !important;
                border-radius: 24px 0 0 24px !important;
                background: rgba(10, 16, 31, 0.96) !important;
                backdrop-filter: blur(35px) !important;
                -webkit-backdrop-filter: blur(35px) !important;
                border-left: 1px solid rgba(0, 212, 255, 0.3) !important;
                box-shadow: -15px 0 60px rgba(0, 0, 0, 0.85) !important;
                transform: translateX(110%) !important;
                transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
                overflow-y: auto !important;
            }
            .dash-sidebar.is-open {
                transform: translateX(0) !important;
            }
            .dash-drawer-header {
                display: flex !important;
            }

            /* Force all 2-col grids to 1-col on mobile/tablet */
            .dash-grid-2,
            [style*="grid-template-columns:1fr 1fr"],
            [style*="grid-template-columns: 1fr 1fr"],
            [style*="grid-template-columns:1fr 1fr;"],
            [style*="grid-template-columns: 1fr 1fr;"] {
                grid-template-columns: 1fr !important;
            }
        }

        @media (max-width: 576px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 10px !important;
            }
            .stat-card {
                padding: 16px 12px !important;
                border-radius: 16px !important;
            }
            .stat-card .num {
                font-size: 1.6rem !important;
            }
            .stat-card .label {
                font-size: 0.74rem !important;
            }
            .dash-welcome-hero {
                padding: 18px 16px !important;
                border-radius: 18px !important;
            }
            .dash-welcome-hero h2 {
                font-size: 1.35rem !important;
            }
            .dash-card {
                padding: 16px !important;
                border-radius: 16px !important;
            }
            .course-grid {
                grid-template-columns: 1fr !important;
            }
        }
    </style>

    <!-- Mobile Drawer Overlay Backdrop -->
    <div class="dash-backdrop" id="dashBackdrop"></div>

    <div class="dash-wrap">
        <!-- Mobile Top App Bar -->
        <div class="dash-mobile-bar">
            <button id="dashMobileToggleBtn" class="dash-menu-trigger" type="button" aria-label="فتح القائمة">
                <i class="fa-solid fa-bars-staggered"></i>
                <span>الأقسام</span>
            </button>
            <div class="dash-mobile-title">${escHtml(title)}</div>
            <div class="dash-mobile-user">
                <div id="notificationContainerMobile"></div>
                <div class="dash-mobile-avatar">${initial}</div>
            </div>
        </div>

        <!-- Sidebar (Desktop Sticky / Mobile Sliding Drawer) -->
        <aside class="dash-sidebar" id="dashSidebar">
            <div class="dash-drawer-header">
                <span class="dash-drawer-brand"><i class="fa-solid fa-graduation-cap"></i> LookaGenius</span>
                <button type="button" class="dash-drawer-close" id="dashDrawerCloseBtn" aria-label="إغلاق القائمة">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="profile">
                <div class="avatar-wrap">
                    <div class="avatar">${initial}</div>
                    <span class="online-dot" title="متصل الآن"></span>
                </div>
                <h4>${escHtml(user.name || user.email || 'مستخدم')}</h4>
                <div class="role-tag"><i class="fa-solid fa-shield-halved"></i> ${escHtml(roleName)}</div>
                <div id="notificationContainer" style="margin-top:14px;display:flex;justify-content:center;"></div>
            </div>
            <ul class="nav-list">
                ${sidebarItemsHtml}
                <li><a href="#" class="logout" id="globalLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج</a></li>
            </ul>
        </aside>

        <!-- Main Dashboard Viewport -->
        <main class="dash-main">
            <!-- Welcome Hero Bar -->
            <div class="dash-welcome-hero">
                <div class="hero-top">
                    <div>
                        <h2>مرحباً، <span class="title-grad">${escHtml(user.name ? user.name.split(' ')[0] : 'بك')}</span> 👋</h2>
                        <p>أهلاً بك في منصة LookaGenius الأكاديمية العالمية. إليك مؤشرات الأداء والبيانات المباشرة.</p>
                    </div>
                </div>
                <div class="hero-chips">
                    <span class="hero-chip online"><span class="pulse-dot"></span> متصل الآن</span>
                    <span class="hero-chip"><i class="fa-solid fa-calendar-day"></i> ${escHtml(arabicDate)}</span>
                    <span class="hero-chip"><i class="fa-solid fa-bolt" style="color:#00D4FF;"></i> منظومة ذكية متكاملة</span>
                </div>
            </div>

            <!-- Horizontal Quick Navigation Pills (Instant Section Switcher) -->
            ${quickPillsHtml ? `<div class="dash-quick-nav">${quickPillsHtml}</div>` : ''}

            <!-- Role Content Injected -->
            <div id="dashRoleContent" data-aos="fade-up">${contentHtml}</div>
        </main>
    </div>`;
};

/**
 * Extracts links from sidebarItemsHtml to render horizontal quick-nav pills
 */
function extractQuickPills(sidebarHtml) {
    if (!sidebarHtml) return '';
    try {
        const temp = document.createElement('div');
        temp.innerHTML = sidebarHtml;
        const links = temp.querySelectorAll('a[data-section]');
        if (!links.length) return '';
        let pillsHtml = '';
        links.forEach(a => {
            const section = a.getAttribute('data-section');
            const isActive = a.classList.contains('active');
            const badgeEl = a.querySelector('.badge');
            const badge = badgeEl ? `<span class="dash-quick-badge">${escHtml(badgeEl.textContent.trim())}</span>` : '';
            const icon = a.querySelector('i');
            const iconHtml = icon ? icon.outerHTML : '';
            const clone = a.cloneNode(true);
            const badgeInClone = clone.querySelector('.badge');
            if (badgeInClone) badgeInClone.remove();
            const text = clone.textContent.trim();
            pillsHtml += `<button type="button" class="dash-quick-pill ${isActive ? 'active' : ''}" data-section="${escHtml(section)}">${iconHtml}<span>${escHtml(text)}</span>${badge}</button>`;
        });
        return pillsHtml;
    } catch (e) {
        return '';
    }
}

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

/**
 * Re-bind logout and attach mobile drawer & quick pills events
 * Called after layout is injected in any dashboard
 */
function bindLogout() {
    const btn = document.getElementById('globalLogoutBtn');
    if (btn) {
        btn.addEventListener('click', e => {
            e.preventDefault();
            if (window.auth && typeof window.auth.logout === 'function') {
                window.auth.logout();
            }
        });
    }
    mountNotificationBell();
    bindDashboardDrawer();
}

/**
 * Binds off-canvas drawer toggle, backdrop close, and quick pill triggers
 */
function bindDashboardDrawer() {
    const toggleBtn = document.getElementById('dashMobileToggleBtn');
    const closeBtn = document.getElementById('dashDrawerCloseBtn');
    const backdrop = document.getElementById('dashBackdrop');
    const sidebar = document.getElementById('dashSidebar');

    const openDrawer = () => {
        if (sidebar) sidebar.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        if (sidebar) sidebar.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    if (toggleBtn) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            openDrawer();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeDrawer();
        };
    }

    if (backdrop) {
        backdrop.onclick = () => closeDrawer();
    }

    // Auto-close drawer when clicking any link inside the sidebar
    if (sidebar) {
        sidebar.querySelectorAll('.nav-list a').forEach(a => {
            a.addEventListener('click', () => {
                closeDrawer();
            });
        });
    }

    // Bind Quick Nav Pills to trigger sidebar link click
    document.querySelectorAll('.dash-quick-pill[data-section]').forEach(pill => {
        pill.onclick = (e) => {
            e.preventDefault();
            const section = pill.getAttribute('data-section');
            const target = document.querySelector(`.dash-sidebar .nav-list a[data-section="${section}"]`);
            if (target) {
                target.click();
            }
        };
    });
}

/**
 * Mount the shared notification bell (NextGen.Communication)
 */
function mountNotificationBell() {
    if (window.NextGen && NextGen.Communication && typeof NextGen.Communication.renderNotificationBell === 'function') {
        try {
            NextGen.Communication.renderNotificationBell('notificationContainer');
            NextGen.Communication.renderNotificationBell('notificationContainerMobile');
        } catch (e) {
            console.warn('[common] bell mount failed', e);
        }
    }
}

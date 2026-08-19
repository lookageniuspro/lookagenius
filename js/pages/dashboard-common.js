/**
 * dashboard-common.js
 * Professional shared dashboard layout — used by all role dashboards
 */

const renderDashboardLayout = (title, sidebarItemsHtml, contentHtml) => {
    const user = window.auth.currentUser;
    if (!user) return '<p>Please log in.</p>';

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return `
    <style>
        .dash-wrap { display: flex; gap: 25px; padding: 100px 30px 60px; max-width: 1400px; margin: 0 auto; min-height: 80vh; }
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
        .stat-card:hover { border-color: #00D4FF; transform: translateY(-3px); box-shadow: 0 0 30px rgba(0,212,255,0.1); }
        .stat-card .num { font-size: 2rem; font-weight: 900; margin: 0 0 4px; }
        .stat-card .label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin: 0; }
        .dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .dash-card { border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); padding: 20px; transition: 0.3s; }
        .dash-card:hover { border-color: #00D4FF; }
        .dash-card h4 { font-size: 1rem; font-weight: 800; margin: 0 0 15px; }
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .course-card-dash { border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); overflow: hidden; transition: 0.3s; }
        .course-card-dash:hover { border-color: #00D4FF; transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,212,255,0.12); }
        .course-card-dash .img-wrap { height: 160px; overflow: hidden; position: relative; }
        .course-card-dash .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .course-card-dash .img-wrap .badge { position: absolute; top: 12px; right: 12px; padding: 4px 14px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; background: rgba(0,212,255,0.2); backdrop-filter: blur(10px); color: #00D4FF; border: 1px solid rgba(0,212,255,0.3); }
        .course-card-dash .body { padding: 18px; }
        .course-card-dash .body h4 { font-size: 1rem; font-weight: 800; margin: 0 0 8px; }
        .course-card-dash .body .meta { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin: 0 0 4px; }
        .course-card-dash .body .price { font-size: 1.1rem; font-weight: 900; color: #00D4FF; margin: 12px 0 0; }
        .table-wrap { overflow-x: auto; border-radius: 16px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
        .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .table-wrap th { padding: 14px 16px; text-align: right; font-weight: 700; color: rgba(255,255,255,0.5); border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-wrap td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .table-wrap tr:last-child td { border-bottom: none; }
        .table-wrap tr:hover td { background: rgba(255,255,255,0.02); }
        .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
        .empty-state i { font-size: 3rem; margin-bottom: 15px; display: block; }
        .empty-state p { font-size: 0.9rem; margin: 0; }
        .action-bar { display: flex; gap: 12px; margin-bottom: 25px; flex-wrap: wrap; align-items: center; }
        .action-bar .ag-btn { padding: 10px 22px; font-size: 0.85rem; border-radius: 50px; border: none; background: linear-gradient(135deg, #00D4FF, #A855F7); color: white; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; transition: 0.3s; }
        .action-bar .ag-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(168,85,247,0.3); }
        .action-bar .ag-btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }
        .action-bar .ag-btn-outline:hover { border-color: #00D4FF; color: #00D4FF; background: rgba(0,212,255,0.05); }
        .action-bar input, .action-bar select { padding: 10px 18px; border-radius: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: white; font-size: 0.85rem; outline: none; }
        .action-bar input:focus, .action-bar select:focus { border-color: #00D4FF; }
        @media (max-width: 768px) { .dash-wrap { flex-direction: column; padding: 80px 15px 30px; } .dash-sidebar { width: 100%; position: static; } .dash-grid-2 { grid-template-columns: 1fr; } }
    </style>

    <div class="dash-wrap">
        <aside class="dash-sidebar">
            <div class="profile">
                <div class="avatar">${initial}</div>
                <h4>${escHtml(user.name)}</h4>
                <p>${window.auth.getRoleAr ? window.auth.getRoleAr(user.type) : user.type}</p>
                <div id="notificationContainer" style="margin-top:14px;display:flex;justify-content:center;"></div>
            </div>
            <ul class="nav-list">
                ${sidebarItemsHtml}
                <li><a href="#" class="logout" id="globalLogoutBtn"><i class="fa-solid fa-right-from-bracket"></i> تسجيل الخروج</a></li>
            </ul>
        </aside>
        <main class="dash-main">
            <div class="dash-header">
                <h2>${title}</h2>
                <p>مرحباً! إليك لوحة التحكم الخاصة بك.</p>
            </div>
            <div data-aos="fade-up">${contentHtml}</div>
        </main>
    </div>`;
};

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

/* Re-bind logout — called after layout is injected */
function bindLogout() {
    const btn = document.getElementById('globalLogoutBtn');
    if (btn) btn.addEventListener('click', e => { e.preventDefault(); window.auth.logout(); });
    mountNotificationBell();
}

/* Mount the shared notification bell (NextGen.Communication) */
function mountNotificationBell() {
    if (window.NextGen && NextGen.Communication && typeof NextGen.Communication.renderNotificationBell === 'function') {
        try {
            NextGen.Communication.renderNotificationBell('notificationContainer');
        } catch (e) { console.warn('[common] bell mount failed', e); }
    }
}

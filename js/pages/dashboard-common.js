/**
 * dashboard-common.js
 * Common Dashboard Layout Wrapper
 */

const renderDashboardLayout = (title, itemsHtml, contentHtml) => {
    return `
        <div class="container" style="display: flex; gap: 20px; padding-bottom: 40px; margin-top: 15px;">
            <aside class="glass-card" style="width: 250px; flex-shrink: 0; align-self: start;">
                <div class="text-center mb-4" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                    <i class="fa-solid fa-user-circle" style="font-size: 3rem; color: var(--neon-blue); margin-bottom: 10px;"></i>
                    <h4>${window.auth.currentUser.name}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${window.auth.getRoleAr(window.auth.currentUser.type)}</p>
                </div>
                <ul style="padding: 0;">
                    ${itemsHtml}
                </ul>
            </aside>
            <div style="flex: 1;">
                <h2 class="mb-4 neon-text" data-aos="fade-down">${title}</h2>
                <div data-aos="fade-up">
                    ${contentHtml}
                </div>
            </div>
        </div>
    `;
};

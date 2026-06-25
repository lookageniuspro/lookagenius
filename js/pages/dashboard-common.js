/**
 * dashboard-common.js
 * Common Dashboard Layout Wrapper
 */

const renderDashboardLayout = (title, itemsHtml, contentHtml) => {
    const user = window.auth.currentUser;
    const avatarSrc = user.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(user.name)+'&background=0D8ABC&color=fff&size=80';
    return `
        <div class="container" style="display: flex; gap: 20px; padding-bottom: 40px; margin-top: 15px;">
            <aside class="glass-card" style="width: 250px; flex-shrink: 0; align-self: start;">
                <div class="text-center mb-4" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                    <img src="${avatarSrc}" style="width: 64px; height: 64px; border-radius: 50%; border: 3px solid var(--neon-blue); object-fit: cover; margin-bottom: 10px;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-block'">
                    <i class="fa-solid fa-user-circle" style="font-size: 3rem; color: var(--neon-blue); margin-bottom: 10px; display: none;"></i>
                    <h4>${user.name}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${window.auth.getRoleAr(user.type)}</p>
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

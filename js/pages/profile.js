/**
 * profile.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = window.auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('profileContent');
    if (container) {
        container.innerHTML = `
            <h2 class="neon-text mb-4 text-center">الملف الشخصي</h2>
            
            <div class="glass-card" style="display: flex; gap: 30px; align-items: flex-start; flex-wrap: wrap;">
                <div style="text-align: center; flex: 1; min-width: 250px;">
                    <div style="width: 150px; height: 150px; border-radius: 50%; background: var(--gradient-primary); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white;">
                        ${user.name.charAt(0)}
                    </div>
                    <h3 style="margin-bottom: 5px;">${user.name}</h3>
                    <p style="color: var(--neon-blue); margin-bottom: 15px;">${window.auth.getRoleAr(user.type)}</p>
                    <button class="btn btn-outline btn-full"><i class="fa-solid fa-camera"></i> تغيير الصورة</button>
                </div>

                <div style="flex: 2; min-width: 300px;">
                    <form id="profileEditForm">
                        <div class="form-group"><label class="form-label">الاسم الكامل</label><input type="text" class="form-control" value="${user.name}"></div>
                        <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input type="email" class="form-control" value="${user.email}"></div>
                        
                        <h4 class="mt-4 mb-3" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">إعدادات الأمان</h4>
                        <div class="form-group"><label class="form-label">كلمة المرور الحالية</label><input type="password" class="form-control"></div>
                        <div class="form-group"><label class="form-label">كلمة المرور الجديدة</label><input type="password" class="form-control"></div>
                        
                        <button type="button" class="btn btn-neon mt-3" onclick="alert('تم حفظ البيانات بنجاح!')">حفظ التغييرات <i class="fa-solid fa-save"></i></button>
                    </form>
                </div>
            </div>
        `;
    }
});

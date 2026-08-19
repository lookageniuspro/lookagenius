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

                        <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border:1px solid rgba(0,212,255,.25);border-radius:12px;background:rgba(0,212,255,.05);margin-bottom:10px;">
                            <div>
                                <div style="font-weight:700;">التحقق بخطوتين (2FA) ${user.supabase ? '<span style="font-size:.7rem;color:#8b96b5;">(يتوفر لحسابات النظام المحلية)</span>' : ''}</div>
                                <div style="font-size:.78rem;color:#8b96b5;">كود OTP عند كل تسجيل دخول — يظهر في إشعاراتك</div>
                            </div>
                            <label style="position:relative;display:inline-block;width:52px;height:28px;flex-shrink:0;">
                                <input type="checkbox" id="twoFAToggle" ${window.auth.getOTPSetting(user.id) ? 'checked' : ''} style="opacity:0;width:0;height:0;" ${user.supabase ? 'disabled' : ''}>
                                <span id="twoFATrack" style="position:absolute;inset:0;border-radius:20px;background:#1c2a45;transition:.3s;cursor:pointer;"></span>
                                <span id="twoFAKnob" style="position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:#8b96b5;transition:.3s;cursor:pointer;"></span>
                            </label>
                        </div>
                        <div id="twoFAStatus" style="font-size:.8rem;color:#00d4ff;margin:0 0 10px;min-height:16px;"></div>

                        <button type="button" class="btn btn-neon mt-3" onclick="alert('تم حفظ البيانات بنجاح!')">حفظ التغييرات <i class="fa-solid fa-save"></i></button>
                    </form>
                </div>
            </div>
        `;

        const twoFAToggle = document.getElementById('twoFAToggle');
        const twoFAStatus = document.getElementById('twoFAStatus');
        if (twoFAToggle && !user.supabase) {
            twoFAToggle.addEventListener('change', () => {
                const on = twoFAToggle.checked;
                window.auth.setOTPSetting(user.id, on);
                document.getElementById('twoFATrack').style.background = on ? '#00d4ff' : '#1c2a45';
                document.getElementById('twoFAKnob').style.background = on ? '#001018' : '#8b96b5';
                document.getElementById('twoFAKnob').style.left = on ? '3px' : 'auto';
                document.getElementById('twoFAKnob').style.right = on ? 'auto' : '3px';
                twoFAStatus.textContent = on ? '✓ تم تفعيل التحقق بخطوتين — سيُطلب كود OTP في كل تسجيل دخول' : 'تم إيقاف التحقق بخطوتين';
            });
        }
    }
});

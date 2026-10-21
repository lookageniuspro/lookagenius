/**
 * authForms.js
 * Handles Login and Register UI Logic
 */

function showAuthError(msg) {
    const errBox = document.getElementById('loginErrorMsg') || document.getElementById('regErrorMsg');
    if (errBox) {
        errBox.textContent = msg;
        errBox.classList.remove('hidden');
    } else {
        alert(msg);
    }
}

// Emergency token resolver: if Supabase redirected to localhost, user can paste URL to login immediately
window.resolveGoogleToken = function(customUrl) {
    const input = customUrl || prompt('الصق الرابط الكامل الذي ظهر لك وفيه localhost:');
    if (!input) return;
    try {
        let hashOrQuery = input;
        if (hashOrQuery.includes('#')) hashOrQuery = hashOrQuery.split('#')[1];
        else if (hashOrQuery.includes('?')) hashOrQuery = hashOrQuery.split('?')[1];
        const params = new URLSearchParams(hashOrQuery);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token) {
            window.location.hash = `#access_token=${access_token}&refresh_token=${refresh_token || ''}`;
            if (window.auth && typeof window.auth.init === 'function') {
                window.auth.init();
            }
            return;
        }
    } catch(e) {
        console.warn('Error parsing token:', e);
    }
    alert('لم يتم العثور على رمز تسجيل دخول صالح في الرابط المُدخل.');
};

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#googleAuthBtn');
    if (btn) {
        e.preventDefault();
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> <span>جارٍ تحويلك إلى Google...</span>';

        const sb = window.supabaseApp;
        if (sb && typeof sb.init === 'function' && !sb.isReady()) {
            try { sb.init(); } catch (err) {}
        }

        if (sb) {
            try {
                const { data, error } = await sb.signInWithGoogle();
                if (error) {
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                    showAuthError('تعذر الاتصال بـ Google OAuth: ' + (error.message || error));
                } else if (data?.url) {
                    window.location.href = data.url;
                }
            } catch(err) {
                btn.disabled = false;
                btn.innerHTML = originalContent;
                showAuthError('حدث خطأ أثناء بدء تسجيل الدخول.');
            }
        } else {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            showAuthError('خدمة المصادقة غير جاهزة حالياً، يرجى المحاولة بعد قليل.');
        }
    }

    const resolveBtn = e.target.closest('#resolveLocalhostBtn');
    if (resolveBtn) {
        e.preventDefault();
        window.resolveGoogleToken();
    }
});

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'loginForm') {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const errorMsg = document.getElementById('loginErrorMsg');
        errorMsg.classList.add('hidden');

        try {
            const result = await window.auth.login(email, pass);
            if (result.success) {
                window.location.href = `dashboard-${result.user.type}.html`;
            } else if (result.need2FA) {
                errorMsg.classList.add('hidden');
                show2FAModal(result.userId);
            } else {
                errorMsg.textContent = result.message;
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.textContent = 'حدث خطأ غير متوقع';
            errorMsg.classList.remove('hidden');
        }
    }

    if (e.target && e.target.id === 'registerForm') {
        e.preventDefault();
        const type = document.getElementById('regType').value;
        if (!type) {
            const errorMsg = document.getElementById('regErrorMsg');
            errorMsg.textContent = 'يرجى اختيار نوع الحساب';
            errorMsg.classList.remove('hidden');
            return;
        }
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        let details = {};
        if (type === 'student') {
            details.level = document.getElementById('regLevel')?.value || '';
            details.interests = document.getElementById('regInterests')?.value || '';
        } else if (type === 'parent') {
            details.studentEmail = document.getElementById('regStudentEmail')?.value || '';
        } else if (type === 'teacher') {
            details.specialty = document.getElementById('regSpecialty')?.value || '';
            details.experience = document.getElementById('regExp')?.value || '';
        } else if (type === 'engineer') {
            details.specialty = document.getElementById('regEngType')?.value || '';
        } else if (type === 'accountant') {
            details.qualification = document.getElementById('regQual')?.value || '';
        }

        try {
            const result = await window.auth.register({ name, email, password, type, details });
            if (result.success) {
                window.location.href = `dashboard-${type}.html`;
            } else {
                const errorMsg = document.getElementById('regErrorMsg');
                errorMsg.textContent = result.message;
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            const errorMsg = document.getElementById('regErrorMsg');
            errorMsg.textContent = 'حدث خطأ غير متوقع';
            errorMsg.classList.remove('hidden');
        }
    }
});

function show2FAModal(userId) {
    const existing = document.getElementById('otpModal')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'otpModal'
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,25,.85);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl'
    overlay.innerHTML = `
        <div style="background:linear-gradient(145deg,#0d1326,#131b33);border:1px solid rgba(0,212,255,.35);border-radius:18px;padding:32px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6)">
            <div style="font-size:2.4rem;margin-bottom:10px">🔐</div>
            <h3 style="color:#fff;margin:0 0 6px;font-family:Cairo,sans-serif">التحقق بخطوتين (2FA)</h3>
            <p style="color:#9aa7c7;font-size:.85rem;margin:0 0 16px;font-family:Cairo,sans-serif">أدخل كود التحقق المكوّن من 6 أرقام<br>(في هذه النسخة التجريبية يظهر الكود في إشعاراتك داخل النظام)</p>
            <input id="otpCodeInput" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code"
                style="width:100%;padding:14px;text-align:center;letter-spacing:10px;font-size:1.4rem;font-weight:700;color:#00d4ff;background:#0a101f;border:1px solid rgba(0,212,255,.4);border-radius:12px;outline:none;font-family:monospace;direction:ltr">
            <div id="otpError" style="color:#ff5d7a;font-size:.8rem;margin-top:8px;min-height:18px;font-family:Cairo,sans-serif"></div>
            <button id="otpVerifyBtn" style="width:100%;padding:13px;margin-top:10px;border:none;border-radius:12px;background:linear-gradient(90deg,#00d4ff,#0072ff);color:#001018;font-weight:800;font-size:1rem;cursor:pointer;font-family:Cairo,sans-serif">تحقق ودخول</button>
            <button id="otpCancelBtn" style="width:100%;padding:10px;margin-top:8px;border:none;border-radius:12px;background:transparent;color:#8b96b5;font-size:.85rem;cursor:pointer;font-family:Cairo,sans-serif">إلغاء والعودة لتسجيل الدخول</button>
        </div>
    `
    document.body.appendChild(overlay)

    const codeInput = document.getElementById('otpCodeInput')
    const errorEl = document.getElementById('otpError')
    const verifyBtn = document.getElementById('otpVerifyBtn')
    codeInput.focus()

    const submit = async () => {
        verifyBtn.disabled = true
        const res = await window.auth.verifyOTP(userId, codeInput.value)
        if (res.success) {
            window.location.href = `dashboard-${res.user.type}.html`
        } else {
            errorEl.textContent = res.message
            verifyBtn.disabled = false
            codeInput.value = ''
            codeInput.focus()
        }
    }

    verifyBtn.addEventListener('click', submit)
    codeInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submit() })
    document.getElementById('otpCancelBtn').addEventListener('click', () => overlay.remove())
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove() })
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'regType') {
        const type = e.target.value;
        const container = document.getElementById('dynamicFields');
        const submitBtn = document.getElementById('regSubmitBtn');
        
        submitBtn.disabled = false;
        container.innerHTML = '';
        
        if (type === 'student') {
            container.innerHTML = `
                <div class="form-group fade-in">
                    <label class="form-label">المرحلة الدراسية</label>
                    <select id="regLevel" class="form-select" required>
                        <option value="primary">ابتدائي</option>
                        <option value="middle">إعدادي</option>
                        <option value="high">ثانوي</option>
                        <option value="university">جامعي</option>
                    </select>
                </div>
                <div class="form-group fade-in"><label class="form-label">المواد المفضلة</label><input type="text" id="regInterests" class="form-control" placeholder="لغات، برمجة..." required></div>
            `;
        } else if (type === 'parent') {
            container.innerHTML = `<div class="form-group fade-in"><label class="form-label">البريد الإلكتروني للطالب</label><input type="email" id="regStudentEmail" class="form-control" required></div>`;
        } else if (type === 'teacher') {
            container.innerHTML = `
                <div class="form-group fade-in"><label class="form-label">التخصص</label><input type="text" id="regSpecialty" class="form-control" required></div>
                <div class="form-group fade-in"><label class="form-label">سنوات الخبرة</label><input type="number" id="regExp" class="form-control" required></div>
            `;
        } else if (type === 'engineer') {
            container.innerHTML = `
                <div class="form-group fade-in">
                    <label class="form-label">التخصص الهندسي</label>
                    <select id="regEngType" class="form-select" required>
                        <option value="software">برمجيات</option><option value="civil">مدني</option>
                    </select>
                </div>
            `;
        } else if (type === 'accountant') {
            container.innerHTML = `<div class="form-group fade-in"><label class="form-label">المؤهل</label><input type="text" id="regQual" class="form-control" required></div>`;
        }
    }
});

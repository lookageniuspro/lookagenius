/**
 * authForms.js
 * Handles Login and Register UI Logic
 */

document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'loginForm') {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const errorMsg = document.getElementById('loginErrorMsg');
        
        const result = window.auth.login(email, pass);
        if (result.success) {
            window.location.href = `dashboard-${result.user.type}.html`;
        } else {
            errorMsg.textContent = result.message;
            errorMsg.classList.remove('hidden');
        }
    }

    if (e.target && e.target.id === 'registerForm') {
        e.preventDefault();
        const type = document.getElementById('regType').value;
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        let details = {};
        if (type === 'student') {
            details.level = document.getElementById('regLevel').value;
            details.interests = document.getElementById('regInterests').value;
        } else if (type === 'parent') {
            details.studentEmail = document.getElementById('regStudentEmail').value;
        } else if (type === 'teacher') {
            details.specialty = document.getElementById('regSpecialty').value;
            details.experience = document.getElementById('regExp').value;
        } else if (type === 'engineer') {
            details.specialty = document.getElementById('regEngType').value;
        } else if (type === 'accountant') {
            details.qualification = document.getElementById('regQual').value;
        }

        const result = window.auth.register({ name, email, password, type, details });
        
        if (result.success) {
            window.location.href = `dashboard-${type}.html`;
        } else {
            const errorMsg = document.getElementById('regErrorMsg');
            errorMsg.textContent = result.message;
            errorMsg.classList.remove('hidden');
        }
    }
});

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

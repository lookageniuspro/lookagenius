(function(){
    function init() {
        const user = window.auth && window.auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const container = document.getElementById('profileContent');
        if (!container) return;

        const countryCodes = [
            {code:'+20',flag:'🇪🇬',name:'Egypt'},
            {code:'+966',flag:'🇸🇦',name:'Saudi Arabia'},
            {code:'+971',flag:'🇦🇪',name:'UAE'},
            {code:'+974',flag:'🇶🇦',name:'Qatar'},
            {code:'+973',flag:'🇧🇭',name:'Bahrain'},
            {code:'+968',flag:'🇴🇲',name:'Oman'},
            {code:'+965',flag:'🇰🇼',name:'Kuwait'},
            {code:'+962',flag:'🇯🇴',name:'Jordan'},
            {code:'+961',flag:'🇱🇧',name:'Lebanon'},
            {code:'+1',flag:'🇺🇸',name:'USA'},
            {code:'+44',flag:'🇬🇧',name:'UK'},
            {code:'+49',flag:'🇩🇪',name:'Germany'},
            {code:'+33',flag:'🇫🇷',name:'France'}
        ];
        const ccOpts = countryCodes.map(c => `<option value="${c.code}" ${(user.countryCode||'+20')===c.code?'selected':''}>${c.flag} ${c.code}</option>`).join('');

        const eduOpts = ['','kindergarten','primary','middle','high','university','postgraduate','career'].map(v =>
            `<option value="${v}" ${user.educationStage===v?'selected':''}>${v ? v.charAt(0).toUpperCase()+v.slice(1) : '-- Select --'}</option>`
        ).join('');

        const stages = ['kindergarten','primary','middle','high','university','postgraduate','career'];
        const stageLabels = {kindergarten:'Kindergarten',primary:'Primary',middle:'Middle School',high:'High School',university:'University',postgraduate:'Postgraduate',career:'Career Development'};
        const eduOpts2 = ['',...stages].map(v =>
            `<option value="${v}" ${user.educationStage===v?'selected':''}>${v ? stageLabels[v] : '-- Select --'}</option>`
        ).join('');

        const isStudent = user.type === 'student';
        const userPhone = user.phone || '';
        const userWhatsapp = (user.whatsapp || '').replace(/^\+\d+/, '');
        const userParentPhone = (user.parentPhone || '').replace(/^\+\d+/, '');

        container.innerHTML = `
            <h2 class="section-title" style="text-align:center;margin-bottom:30px;"><i class="fa-solid fa-user-gear"></i> Profile Settings</h2>
            <div class="glass-card" style="display:flex;gap:30px;align-items:flex-start;flex-wrap:wrap;padding:30px;border-radius:20px;">
                <div style="text-align:center;flex:1;min-width:220px;">
                    <div style="position:relative;width:150px;height:150px;margin:0 auto 20px;">
                        <img id="profAvatar" src="${user.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(user.name)+'&background=0D8ABC&color=fff&size=150'}" style="width:150px;height:150px;border-radius:50%;border:3px solid var(--neon-blue);object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&size=150'">
                        <label for="profAvatarInput" style="position:absolute;bottom:5px;right:5px;background:var(--neon-blue);color:#000;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid var(--bg-dark);font-size:14px;"><i class="fa-solid fa-camera"></i></label>
                        <input type="file" id="profAvatarInput" accept="image/*" style="display:none;">
                    </div>
                    <h3 style="margin-bottom:5px;">${user.name}</h3>
                    <p style="color:var(--neon-blue);font-size:0.85rem;">${user.type}</p>
                    ${user.type === 'teacher' ? `<button class="ag-btn ag-btn-sm ag-btn-outline" style="margin-top:10px;font-size:12px;" onclick="window.open(location.origin+location.pathname.replace('profile.html','teacher-profile.html')+'?id='+${user.id},'_blank')"><i class="fa-solid fa-share-nodes"></i> Share Profile</button>` : ''}
                </div>
                <div style="flex:2;min-width:300px;">
                    <form id="profForm">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div class="form-group"><label>First Name</label><input type="text" id="pfFirstName" class="form-control" value="${user.firstName||''}" required></div>
                            <div class="form-group"><label>Father Name</label><input type="text" id="pfFatherName" class="form-control" value="${user.fatherName||''}"></div>
                            <div class="form-group"><label>Grandfather Name</label><input type="text" id="pfGrandfatherName" class="form-control" value="${user.grandfatherName||''}"></div>
                            <div class="form-group"><label>Family Name</label><input type="text" id="pfFamilyName" class="form-control" value="${user.familyName||''}" required></div>
                        </div>
                        <div class="form-group"><label>Email</label><input type="email" id="pfEmail" class="form-control" value="${user.email}" readonly style="opacity:0.6;"></div>
                        <div class="form-group"><label>Phone</label><input type="tel" id="pfPhone" class="form-control" value="${userPhone}"></div>
                        <div class="form-group"><label>Country</label><input type="text" id="pfCountry" class="form-control" value="${user.country||''}"></div>
                        <div class="form-group"><label>Address</label><input type="text" id="pfAddress" class="form-control" value="${user.address||''}"></div>
                        <div class="form-group"><label>WhatsApp</label>
                            <div style="display:flex;gap:8px;">
                                <select id="pfCountryCode" style="width:130px;flex-shrink:0;padding:10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);color:white;">${ccOpts}</select>
                                <input type="tel" id="pfWhatsapp" class="form-control" value="${userWhatsapp}" style="flex:1;">
                            </div>
                        </div>
                        ${isStudent ? `
                        <div class="form-group"><label>Parent / Guardian Phone</label>
                            <div style="display:flex;gap:8px;">
                                <select id="pfParentCode" style="width:130px;flex-shrink:0;padding:10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);color:white;">${ccOpts}</select>
                                <input type="tel" id="pfParentPhone" class="form-control" value="${userParentPhone}" style="flex:1;">
                            </div>
                        </div>
                        <div class="form-group"><label>Educational Stage</label>
                            <select id="pfEducationStage" style="width:100%;padding:10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);color:white;">${eduOpts2}</select>
                        </div>` : ''}
                        <hr style="border-color:var(--border-color);margin:20px 0;">
                        <h4 style="margin-bottom:15px;">Change Password</h4>
                        <div class="form-group"><label>Current Password</label><input type="password" id="pfCurPass" class="form-control"></div>
                        <div class="form-group"><label>New Password</label><input type="password" id="pfNewPass" class="form-control"></div>
                        <button type="submit" class="ag-btn" style="margin-top:10px;"><i class="fa-solid fa-save"></i> Save Changes</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('profAvatarInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('profAvatar').src = ev.target.result;
                window.db.updateUser(user.id, { avatar: ev.target.result });
                if (window.auth && window.auth.currentUser) {
                    window.auth.currentUser.avatar = ev.target.result;
                    localStorage.setItem('lookagenius_session', JSON.stringify(window.auth.currentUser));
                }
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('profForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const users = window.db.getUsers();
            const u = users.find(x => x.id === user.id);
            if (!u) return;

            u.firstName = document.getElementById('pfFirstName').value.trim();
            u.fatherName = document.getElementById('pfFatherName').value.trim();
            u.grandfatherName = document.getElementById('pfGrandfatherName').value.trim();
            u.familyName = document.getElementById('pfFamilyName').value.trim();
            u.name = [u.firstName, u.fatherName, u.grandfatherName, u.familyName].filter(Boolean).join(' ');
            u.phone = document.getElementById('pfPhone').value.trim();
            u.country = document.getElementById('pfCountry').value.trim();
            u.address = document.getElementById('pfAddress').value.trim();
            u.countryCode = document.getElementById('pfCountryCode').value;
            u.whatsapp = u.countryCode + document.getElementById('pfWhatsapp').value.trim();

            if (u.type === 'student') {
                const pc = document.getElementById('pfParentCode');
                const pp = document.getElementById('pfParentPhone');
                u.parentPhone = (pc ? pc.value : '') + (pp ? pp.value.trim() : '');
                const es = document.getElementById('pfEducationStage');
                u.educationStage = es ? es.value : '';
            }

            // Password change
            const curPass = document.getElementById('pfCurPass').value;
            const newPass = document.getElementById('pfNewPass').value;
            if (curPass && newPass) {
                if (curPass !== u.password) {
                    alert('Current password is incorrect.');
                    return;
                }
                u.password = newPass;
            }

            window.db.updateUser(user.id, u);
            if (window.auth && window.auth.currentUser) {
                Object.assign(window.auth.currentUser, u);
                localStorage.setItem('lookagenius_session', JSON.stringify(window.auth.currentUser));
            }
            alert('Profile saved successfully!');
            document.getElementById('pfCurPass').value = '';
            document.getElementById('pfNewPass').value = '';
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('joinUsApp');
    if (!app) return;

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function showMessage(msg, type) {
        const el = document.getElementById('joinMsg');
        if (!el) return;
        el.textContent = msg;
        el.style.display = 'block';
        el.style.color = type === 'error' ? 'var(--neon-pink)' : 'var(--success)';
        setTimeout(() => el.style.display = 'none', 5000);
    }

    app.innerHTML = `
        <style>
            .join-hero { text-align:center; padding:40px 6% 20px; }
            .join-hero h1 { font-size:clamp(32px,5vw,52px); font-weight:900; }
            .join-hero p { color:var(--text-secondary); max-width:650px; margin:15px auto; font-size:1.05rem; line-height:1.7; }
            .join-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px; padding:20px 6% 60px; max-width:1200px; margin:0 auto; }
            .join-card { background:var(--glass,rgba(255,255,255,0.02)); border:1px solid var(--border-color); border-radius:20px; padding:28px; transition:0.3s; }
            .join-card:hover { border-color:var(--neon-blue); transform:translateY(-3px); }
            .join-card h3 { font-size:1.2rem; margin-bottom:15px; display:flex; align-items:center; gap:10px; }
            .join-card h3 i { color:var(--neon-blue); }
            .join-field { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color); }
            .join-field:last-child { border-bottom:none; }
            .join-field .fi { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.9rem; flex-shrink:0; }
            .join-field .fi-blue { background:rgba(0,212,255,0.12); color:var(--neon-blue); }
            .join-field .fi-violet { background:rgba(168,85,247,0.12); color:var(--neon-violet); }
            .join-field .fi-pink { background:rgba(255,51,102,0.12); color:var(--neon-pink); }
            .join-field .fi-green { background:rgba(0,255,170,0.12); color:var(--success); }
            .join-field .fi-yellow { background:rgba(251,191,36,0.12); color:var(--warning); }
            .join-field strong { font-size:0.85rem; }
            .join-field small { color:var(--text-secondary); font-size:0.75rem; }
            .form-section { max-width:600px; margin:0 auto; padding:30px 6% 60px; }
            .why-list { list-style:none; padding:0; }
            .why-list li { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.95rem; }
            .why-list li i { width:24px; text-align:center; font-size:1.1rem; }
            @media (max-width:768px) { .join-grid { grid-template-columns:1fr; } }
        </style>

        <section class="join-hero" data-aos="fade-down">
            <span class="tagline"><i class="fa-solid fa-rocket"></i> انضم إلى ثورة التعليم</span>
            <h1>نحن لا نبحث فقط عن معلمين..<br>بل عن <span class="neon">عباقرة ومبدعين وقادة</span></h1>
            <p>في LookaGenius، نؤمن بأن التعليم الحقيقي يدمج بين المعرفة الأكاديمية، المهارات العملية، ومهارات المستقبل. نبحث عن كل من يمتلك شغفاً بالتعليم ورغبة في التأثير.</p>
        </section>

        <div class="join-grid">
            <div class="join-card" data-aos="fade-left">
                <h3><i class="fa-solid fa-users"></i> من نبحث عنه؟</h3>
                <div class="join-field"><div class="fi fi-blue"><i class="fa-solid fa-chalkboard-user"></i></div><div><strong>المعلمون الأكاديميون</strong><br><small>رياضيات، فيزياء، كيمياء، لغات، تاريخ</small></div></div>
                <div class="join-field"><div class="fi fi-violet"><i class="fa-solid fa-code"></i></div><div><strong>المبرمجون ومطورو الويب</strong><br><small>HTML, CSS, JS, Python, Cybersecurity</small></div></div>
                <div class="join-field"><div class="fi fi-pink"><i class="fa-solid fa-brain"></i></div><div><strong>خبراء الذكاء الاصطناعي</strong><br><small>Machine Learning, NLP, Data Science</small></div></div>
                <div class="join-field"><div class="fi fi-green"><i class="fa-solid fa-building"></i></div><div><strong>المهندسون (جميع التخصصات)</strong><br><small>مدني، كهرباء، ميكانيكا، برمجيات</small></div></div>
                <div class="join-field"><div class="fi fi-yellow"><i class="fa-solid fa-palette"></i></div><div><strong>المصممون والرسامون</strong><br><small>UI/UX, Graphic Design, Motion Graphics</small></div></div>
                <div class="join-field"><div class="fi fi-blue"><i class="fa-solid fa-chart-line"></i></div><div><strong>خبراء التسويق والإدارة</strong><br><small>Digital Marketing, Content, Project Management</small></div></div>
                <div class="join-field"><div class="fi fi-violet"><i class="fa-solid fa-microscope"></i></div><div><strong>العلماء والباحثون</strong><br><small>جميع فروع العلوم الطبيعية والإنسانية</small></div></div>
            </div>

            <div class="join-card" data-aos="fade-right">
                <h3><i class="fa-solid fa-star" style="color:var(--warning);"></i> لماذا تتعاون معنا؟</h3>
                <ul class="why-list">
                    <li><i class="fa-solid fa-globe" style="color:var(--neon-blue);"></i> <strong>جمهور عالمي</strong> — محتواك سيصل لآلاف الطلاب</li>
                    <li><i class="fa-solid fa-certificate" style="color:var(--success);"></i> <strong>شهادات معتمدة</strong> — اعتماد المنصة من مؤسسات تعليمية</li>
                    <li><i class="fa-solid fa-coins" style="color:var(--warning);"></i> <strong>مكافآت مالية</strong> — مشاركة في أرباح المنصة</li>
                    <li><i class="fa-solid fa-lightbulb" style="color:var(--neon-pink);"></i> <strong>بيئة إبداعية</strong> — فريق من العباقرة بروح الفريق</li>
                    <li><i class="fa-solid fa-graduation-cap" style="color:var(--neon-violet);"></i> <strong>تطوير مستمر</strong> — دورات تدريبية وورش عمل مجانية</li>
                    <li><i class="fa-solid fa-handshake" style="color:var(--neon-blue);"></i> <strong>شبكة علاقات</strong> — تواصل مع قادة التعليم والتقنية</li>
                </ul>
            </div>
        </div>

        <section class="form-section" data-aos="fade-up">
            <div class="join-card" style="max-width:600px;margin:0 auto;">
                <h3 style="text-align:center;border-bottom:1px solid var(--border-color);padding-bottom:15px;"><i class="fa-solid fa-pen"></i> قدم طلبك الآن</h3>
                <div id="joinMsg" style="display:none;text-align:center;margin-bottom:15px;font-weight:700;"></div>
                <form id="joinForm">
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">الاسم الكامل</label>
                        <input type="text" id="jName" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;">
                    </div>
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">البريد الإلكتروني</label>
                        <input type="email" id="jEmail" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;">
                    </div>
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">رقم الهاتف (واتساب)</label>
                        <input type="text" id="jPhone" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;">
                    </div>
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">مجال التعاون</label>
                        <select id="jField" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;">
                            <option value="">اختر مجالك...</option>
                            <option value="academic">🎓 معلم أكاديمي</option>
                            <option value="programmer">💻 مبرمج / مطور ويب</option>
                            <option value="ai">🧠 خبير ذكاء اصطناعي</option>
                            <option value="engineer">🏗️ مهندس</option>
                            <option value="designer">🎨 مصمم / رسام</option>
                            <option value="marketing">📈 تسويق وإدارة</option>
                            <option value="researcher">🔬 باحث / عالم</option>
                            <option value="other">🌟 أخرى</option>
                        </select>
                    </div>
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">نبذة عنك وخبراتك</label>
                        <textarea id="jBio" rows="4" required style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;resize:vertical;min-height:80px;"></textarea>
                    </div>
                    <div class="td-form-group" style="margin-bottom:14px;">
                        <label style="display:block;margin-bottom:5px;font-weight:600;font-size:0.8rem;color:var(--text-secondary);">رابط المحفظة الأعمال (اختياري)</label>
                        <input type="url" id="jPortfolio" placeholder="https://..." style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;font-family:inherit;font-size:0.9rem;outline:none;">
                    </div>
                    <button type="submit" class="btn" style="width:100%;padding:14px;border-radius:50px;background:linear-gradient(135deg,var(--neon-blue),var(--neon-violet));color:white;font-weight:700;border:none;cursor:pointer;font-size:1rem;margin-top:10px;">
                        <i class="fa-solid fa-paper-plane"></i> إرسال الطلب
                    </button>
                </form>
                <div style="text-align:center;margin-top:15px;color:var(--text-secondary);font-size:0.8rem;">
                    <i class="fa-solid fa-shield-halved" style="color:var(--neon-blue);"></i> معلوماتك آمنة ولن يتم مشاركتها
                </div>
            </div>
        </section>
    `;

    // Form handler
    document.getElementById('joinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('jName').value.trim(),
            email: document.getElementById('jEmail').value.trim(),
            phone: document.getElementById('jPhone').value.trim(),
            field: document.getElementById('jField').value,
            bio: document.getElementById('jBio').value.trim(),
            portfolio: document.getElementById('jPortfolio').value.trim()
        };
        window.db.addCollaboration(data);
        document.getElementById('joinForm').reset();
        showMessage('✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً.', 'success');
    });
});

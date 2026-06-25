document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('courseViewApp');
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const courseId = parseInt(params.get('id'));
    const course = window.db.getCourses().find(c => c.id === courseId);

    if (!course) {
        app.innerHTML = `
            <div style="text-align:center;padding:80px 20px;">
                <i class="fa-solid fa-circle-exclamation" style="font-size:3rem;color:var(--neon-pink);margin-bottom:20px;"></i>
                <h2>الكورس غير موجود</h2>
                <p style="color:var(--text-secondary);margin:15px 0;">رابط غير صحيح أو تم حذف الكورس</p>
                <a href="courses.html" class="btn btn-primary">العودة للكورسات</a>
            </div>
        `;
        return;
    }

    const user = window.auth.currentUser;
    const isEnrolled = user && (course.studentsEnrolled || []).includes(user.id);
    const teachers = window.db.getUsers().filter(u => u.type === 'teacher');
    const tNames = (course.teacherIds || []).map(tid => {
        const t = teachers.find(tt => tt.id === tid);
        return t ? t.name : null;
    }).filter(Boolean);
    const lessons = window.db.getCourseLessons(courseId);
    const modules = window.db.getCourseModules(courseId);
    const progress = user ? window.db.getCourseProgress(courseId, user.id) : { completed: 0, total: 0, percent: 0 };
    const stageText = course.stage === 'primary' ? 'ابتدائي' : course.stage === 'middle' ? 'إعدادي' : course.stage === 'high' ? 'ثانوي' : 'جميع المراحل';

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function getYouTubeEmbedUrl(url) {
        if (!url) return '';
        let videoId = '';
        const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match1) videoId = match1[1];
        const match2 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (match2) videoId = match2[1];
        if (!videoId) return url;
        return 'https://www.youtube-nocookie.com/embed/' + videoId + '?modestbranding=1&rel=0&controls=1&iv_load_policy=3&hl=ar';
    }

    function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('ar-EG'); } catch(e) { return d; } }

    function render() {
        let currentLesson = null;
        // Try to get from URL hash or first lesson
        const hashLesson = parseInt(window.location.hash.replace('#lesson-', ''));
        if (hashLesson) currentLesson = lessons.find(l => l.id === hashLesson);
        if (!currentLesson && lessons.length > 0) currentLesson = lessons[0];

        app.innerHTML = `
            <style>
                .cv-container { display:grid; grid-template-columns:1fr 380px; gap:30px; padding:20px 6% 60px; max-width:1300px; margin:0 auto; }
                .cv-video-wrap { background:#000; border-radius:16px; overflow:hidden; aspect-ratio:16/9; position:relative; border:1px solid var(--border-color); margin-bottom:20px; }
                .cv-video-wrap iframe { width:100%; height:100%; border:none; }
                .cv-yt-branding-hide { position:absolute; bottom:0; inset-inline-end:0; width:130px; height:30px; background:#000; z-index:10; pointer-events:none; }
                @media (max-width:768px) { .cv-yt-branding-hide { width:90px; height:24px; } }
                .cv-video-overlay { position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); cursor:pointer; }
                .cv-lesson-list { display:flex; flex-direction:column; gap:8px; }
                .cv-lesson-item { display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:12px; cursor:pointer; transition:0.3s; text-decoration:none; color:inherit; }
                .cv-lesson-item:hover { border-color:var(--neon-blue); background:rgba(0,212,255,0.04); }
                .cv-lesson-item.active { border-color:var(--neon-blue); background:rgba(0,212,255,0.08); }
                .cv-lesson-item .l-num { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0; background:rgba(255,255,255,0.05); }
                .cv-lesson-item.active .l-num { background:var(--neon-blue); color:#000; }
                .cv-lesson-item .l-info { flex:1; }
                .cv-lesson-item .l-info strong { font-size:0.85rem; display:block; }
                .cv-lesson-item .l-info small { color:var(--text-secondary); font-size:0.75rem; }
                .cv-lesson-item .l-check { width:20px; text-align:center; }
                .cv-progress-bar { width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden; margin:15px 0; }
                .cv-progress-bar div { height:100%; background:linear-gradient(90deg,var(--neon-blue),var(--neon-violet)); border-radius:10px; transition:width 0.5s; }
                .cv-info-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin:20px 0; }
                .cv-info-item { background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:12px; padding:14px; text-align:center; }
                .cv-info-item .num { font-size:1.1rem; font-weight:900; color:var(--neon-blue); }
                .cv-info-item .lbl { font-size:0.7rem; color:var(--text-secondary); margin-top:2px; }
                .cv-sidebar { position:sticky; top:100px; align-self:start; }
                @media (max-width:992px) { .cv-container { grid-template-columns:1fr; } .cv-sidebar { position:static; } }
            </style>

            <div class="cv-container">
                <!-- Main -->
                <div>
                    <a href="courses.html" style="color:var(--neon-blue);font-size:0.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:5px;margin-bottom:15px;">
                        <i class="fa-solid fa-arrow-right"></i> العودة للكورسات
                    </a>

                    <div class="cv-video-wrap" data-aos="fade-up">
                        ${currentLesson ? `
                            <iframe src="${currentLesson.videoEmbed || getYouTubeEmbedUrl(currentLesson.videoURL)}" allowfullscreen></iframe>
                            <div class="cv-yt-branding-hide"></div>
                        ` : `
                            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">
                                <i class="fa-solid fa-video-slash" style="font-size:2rem;"></i>
                            </div>
                        `}
                    </div>

                    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:8px;">${escHtml(course.title)}</h2>
                    <p style="color:var(--text-secondary);margin-bottom:15px;line-height:1.6;">${escHtml(course.description)}</p>

                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
                        <span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(0,212,255,0.1);color:var(--neon-blue);border:1px solid rgba(0,212,255,0.15);">${stageText}</span>
                        <span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(168,85,247,0.1);color:var(--neon-violet);border:1px solid rgba(168,85,247,0.15);">${escHtml(course.category)}</span>
                        ${course.price > 0 ? `<span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(0,255,170,0.1);color:var(--success);border:1px solid rgba(0,255,170,0.15);">${getCurrencySymbol(course.currency||'USD')}${course.price}</span>` : '<span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:rgba(251,191,36,0.1);color:var(--warning);border:1px solid rgba(251,191,36,0.15);">مجاني</span>'}
                    </div>

                    ${tNames.length > 0 ? `
                        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:15px;">
                            <i class="fa-solid fa-chalkboard-user" style="color:var(--neon-violet);"></i> المدرسون: ${escHtml(tNames.join('، '))}
                        </p>
                    ` : ''}

                    ${user && user.type === 'student' && lessons.length > 0 ? `
                        <div class="cv-progress-bar"><div style="width:${progress.percent}%;"></div></div>
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:20px;">
                            التقدم: ${progress.completed} / ${progress.total} درس (${progress.percent}%)
                        </p>
                    ` : ''}

                    <div class="cv-info-grid">
                        <div class="cv-info-item"><div class="num"><i class="fa-regular fa-clock"></i> ${course.duration}</div><div class="lbl">المدة</div></div>
                        <div class="cv-info-item"><div class="num">${lessons.length}</div><div class="lbl">عدد الدروس</div></div>
                        <div class="cv-info-item"><div class="num">${course.price > 0 ? getCurrencySymbol(course.currency||'USD')+course.price : 'مجاني'}</div><div class="lbl">السعر</div></div>
                        <div class="cv-info-item"><div class="num">${(course.studentsEnrolled || []).length || 0}</div><div class="lbl">طلاب مسجلون</div></div>
                    </div>

                    ${modules.length > 0 ? `
                        <h3 style="font-size:1.1rem;font-weight:800;margin:25px 0 15px;"><i class="fa-solid fa-layer-group"></i> محتوى الكورس</h3>
                        ${modules.map((mod, mi) => {
                            const modLessons = mod.lessons || [];
                            return `
                            <div style="margin-bottom:16px;background:rgba(255,255,255,0.015);border:1px solid var(--border-color);border-radius:14px;overflow:hidden;">
                                <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(0,212,255,0.03);border-bottom:1px solid var(--border-color);">
                                    <span style="background:var(--neon-violet);color:white;width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0;">${mi+1}</span>
                                    <strong style="flex:1;font-size:0.95rem;">${escHtml(mod.title)}</strong>
                                    <span style="font-size:0.75rem;color:var(--text-secondary);"><i class="fa-solid fa-video"></i> ${modLessons.length} درس</span>
                                </div>
                                <div style="padding:8px 12px;">
                                    ${modLessons.length > 0 ? `
                                        <div class="cv-lesson-list">
                                        ${modLessons.map((l) => {
                                            const isActive = currentLesson && currentLesson.id === l.id;
                                            const isCompleted = user && course.progress && course.progress[user.id] && course.progress[user.id][l.id];
                                            return `
                                            <a href="?id=${courseId}#lesson-${l.id}" class="cv-lesson-item ${isActive ? 'active' : ''}" data-lesson-id="${l.id}">
                                                <div class="l-num">${lessons.indexOf(l)+1}</div>
                                                <div class="l-info">
                                                    <strong>${escHtml(l.title)}</strong>
                                                    <small><i class="fa-regular fa-clock"></i> ${l.duration} ${l.isFree ? '| <span style="color:var(--success);">مجاني</span>' : ''}</small>
                                                </div>
                                                <div class="l-check">
                                                    ${user && user.type === 'student' ? `
                                                        <i class="fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-circle'}" style="color:${isCompleted ? 'var(--success)' : 'var(--text-secondary)'};font-size:1.1rem;cursor:pointer;" 
                                                           onclick="event.preventDefault(); event.stopPropagation(); toggleLesson(${courseId},${user.id},${l.id},${!isCompleted})"></i>
                                                    ` : ''}
                                                </div>
                                            </a>`;
                                        }).join('')}
                                        </div>
                                    ` : '<div style="padding:10px;color:var(--text-secondary);font-size:0.8rem;text-align:center;">لا توجد دروس في هذه الوحدة بعد</div>'}
                                </div>
                            </div>`;
                        }).join('')}
                    ` : lessons.length > 0 ? `
                        <h3 style="font-size:1.1rem;font-weight:800;margin:25px 0 15px;"><i class="fa-solid fa-list"></i> محتوى الكورس</h3>
                        <div class="cv-lesson-list">
                            ${lessons.map((l, i) => {
                                const isActive = currentLesson && currentLesson.id === l.id;
                                const isCompleted = user && course.progress && course.progress[user.id] && course.progress[user.id][l.id];
                                return `
                                <a href="?id=${courseId}#lesson-${l.id}" class="cv-lesson-item ${isActive ? 'active' : ''}" data-lesson-id="${l.id}">
                                    <div class="l-num">${i+1}</div>
                                    <div class="l-info">
                                        <strong>${escHtml(l.title)}</strong>
                                        <small><i class="fa-regular fa-clock"></i> ${l.duration} ${l.isFree ? '| <span style="color:var(--success);">مجاني</span>' : ''}</small>
                                    </div>
                                    <div class="l-check">
                                        ${user && user.type === 'student' ? `
                                            <i class="fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-circle'}" style="color:${isCompleted ? 'var(--success)' : 'var(--text-secondary)'};font-size:1.1rem;cursor:pointer;" 
                                               onclick="event.preventDefault(); event.stopPropagation(); toggleLesson(${courseId},${user.id},${l.id},${!isCompleted})"></i>
                                        ` : ''}
                                    </div>
                                </a>
                            `}).join('')}
                        </div>
                    ` : '<p style="color:var(--text-secondary);margin-top:20px;">لا توجد دروس مضافة بعد.</p>'}
                </div>

                <!-- Sidebar -->
                <div class="cv-sidebar">
                    <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:20px;padding:24px;">
                        <h4 style="font-weight:800;margin-bottom:15px;">${user ? 'مرحباً، ' + escHtml(user.name) : 'لست مسجلاً بعد؟'}</h4>
                        ${user ? `
                            ${user.type === 'student' ? `
                                ${isEnrolled ? `
                                    <p style="color:var(--success);font-size:0.85rem;margin-bottom:15px;"><i class="fa-solid fa-check-circle"></i> أنت مسجل في هذا الكورس</p>
                                    <button class="btn" onclick="doUnenroll(${courseId},${user.id})" style="width:100%;padding:12px;border-radius:50px;background:transparent;border:1px solid var(--neon-pink);color:var(--neon-pink);font-weight:700;cursor:pointer;">إلغاء التسجيل</button>
                                ` : `
                                    <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:15px;">سجل في الكورس لتتابع تقدمك</p>
                                    <button class="btn" onclick="doEnroll(${courseId},${user.id})" style="width:100%;padding:12px;border-radius:50px;background:linear-gradient(135deg,var(--neon-blue),var(--neon-violet));color:white;font-weight:700;border:none;cursor:pointer;">
                                        <i class="fa-solid fa-user-plus"></i> تسجيل في الكورس
                                    </button>
                                `}
                            ` : `
                                <p style="color:var(--text-secondary);font-size:0.85rem;">أنت مسجل كـ ${window.auth.getRoleAr(user.type)}. قم بزيارة <a href="dashboard-${user.type}.html" style="color:var(--neon-blue);">لوحة التحكم</a>.</p>
                            `}
                        ` : `
                            <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:15px;">أنشئ حساباً مجاناً لتتمكن من التسجيل في الكورسات ومتابعة تقدمك.</p>
                            <a href="register.html" class="btn" style="width:100%;padding:12px;border-radius:50px;background:linear-gradient(135deg,var(--neon-blue),var(--neon-violet));color:white;font-weight:700;border:none;cursor:pointer;text-align:center;justify-content:center;">
                                <i class="fa-solid fa-user-plus"></i> إنشاء حساب مجاني
                            </a>
                            <a href="login.html" style="display:block;text-align:center;margin-top:10px;color:var(--neon-blue);font-size:0.85rem;text-decoration:none;">لديك حساب؟ سجل دخول</a>
                        `}
                    </div>

                    ${currentLesson ? `
                        <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:20px;padding:24px;margin-top:20px;">
                            <h5 style="font-weight:800;margin-bottom:10px;font-size:0.9rem;">الدرس الحالي</h5>
                            <p style="font-size:0.85rem;color:var(--neon-blue);font-weight:700;">${escHtml(currentLesson.title)}</p>
                            <p style="font-size:0.75rem;color:var(--text-secondary);"><i class="fa-regular fa-clock"></i> ${currentLesson.duration}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    render();

    // Handle lesson clicks via hash change
    window.addEventListener('hashchange', render);

    // Global functions
    window.doEnroll = function(cid, uid) {
        window.db.enrollStudent(cid, uid);
        render();
        showToast('تم التسجيل في الكورس بنجاح ✅');
    };

    window.doUnenroll = function(cid, uid) {
        if (confirm('هل أنت متأكد من إلغاء التسجيل في هذا الكورس؟')) {
            window.db.unenrollStudent(cid, uid);
            render();
            showToast('تم إلغاء التسجيل');
        }
    };

    window.toggleLesson = function(cid, uid, lid, completed) {
        window.db.updateLessonProgress(cid, uid, lid, completed);
        render();
    };

    function showToast(msg, type) {
        let toast = document.getElementById('cvToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cvToast';
            toast.style.cssText = 'position:fixed;bottom:25px;left:50%;transform:translateX(-50%) translateY(80px);background:rgba(5,5,20,0.95);backdrop-filter:blur(20px);border:1px solid var(--border-color);border-radius:14px;padding:14px 24px;display:flex;align-items:center;gap:10px;z-index:2000;transition:0.4s cubic-bezier(0.175,0.885,0.32,1.275);opacity:0;pointer-events:none;font-weight:600;font-size:0.9rem;font-family:var(--font-main);';
            document.body.appendChild(toast);
        }
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.borderColor = type === 'error' ? 'var(--neon-pink)' : 'var(--success)';
        toast.innerHTML = `<i class="fa-solid ${type==='error'?'fa-exclamation-circle':'fa-check-circle'}" style="color:${type==='error'?'var(--neon-pink)':'var(--success)'};"></i><span>${msg}</span>`;
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(80px)'; }, 3000);
    }
});

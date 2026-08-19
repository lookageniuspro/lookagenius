/**
 * support.js — Support Center: Knowledge Base + Ticketing System
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('supportContainer');
    if (!container) return;

    const faqs = [
        { q: 'كيف أسجل في كورس؟', a: 'من صفحة الكورسات اضغط «عرض التفاصيل» ثم «تسجيل في الكورس». للكورسات المدفوعة، ادفع من محفظتك (لوحة تحكم الطالب ← المحفظة) أو طبّق كود خصم عند الدفع.' },
        { q: 'هل الشهادات معتمدة؟', a: 'نعم، جميع الشهادات تصدر برمز تحقق فريد (QR) يمكن لأي جهة التحقق منه عبر صفحة التحقق من الشهادات.' },
        { q: 'كيف أشحن رصيد محفظتي؟', a: 'من لوحة تحكم الطالب ← المحفظة: أدخل المبلغ ثم اضغط «شحن المحفظة». يمكنك أيضاً استخدام كود شحن (Voucher) من القسم المجاور.' },
        { q: 'كيف أحصل على كود خصم أو شحن؟', a: 'الأكواد تُباع وتُوزَّع عبر قنواتنا الرسمية. أدخل الكود في صفحة الكورس (خصم) أو في المحفظة (شحن رصيد).' },
        { q: 'هل يمكنني استرداد المبلغ؟', a: 'راسلنا عبر تذكرة دعم (نوع: مالي) وسنراجع طلبك خلال 48 ساعة عمل.' },
        { q: 'لا يعمل الفيديو لدي؟', a: 'تأكد من اتصال الإنترنت وتحديث المتصفح. بعض الدروس تستخدم يوتيوب أو فيميو — إذا استمرت المشكلة افتح تذكرة (نوع: فني) وسنمده بك الفضل.' }
    ];

    const user = window.auth ? window.auth.currentUser : null;
    const myTickets = window.db ? window.db.getTicketsForUser(user ? user.id : -1) : [];

    const statusMap = { open: ['مفتوحة', '#00D4FF'], in_progress: ['قيد المعالجة', '#FBBF24'], resolved: ['تم الحل', '#10b981'], closed: ['مغلقة', '#888'] };

    function esc(s) { if (s === null || s === undefined) return ''; return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    container.innerHTML = `
        <style>
            .sp-header { text-align:center; padding:30px 0 40px; }
            .sp-header h2 { font-size:1.8rem; font-weight:900; margin:0 0 10px; }
            .sp-header p { color:var(--text-secondary); margin:0; }
            .sp-grid { display:grid; grid-template-columns:1.1fr 1fr; gap:40px; }
            .sp-card { background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:16px; padding:22px; margin-bottom:16px; }
            .sp-card h3 { margin:0 0 15px; font-size:1rem; }
            .sp-faq { cursor:pointer; transition:0.3s; }
            .sp-faq:hover { border-color:var(--neon-blue); }
            .sp-faq-ans { display:none; color:var(--text-secondary); font-size:0.85rem; line-height:1.7; margin:12px 0 0; padding-top:12px; border-top:1px dashed rgba(255,255,255,0.08); }
            .sp-faq.open .sp-faq-ans { display:block; }
            .sp-faq .sp-faq-head { display:flex; justify-content:space-between; align-items:center; gap:10px; }
            .sp-faq .sp-faq-head i { transition:transform 0.3s; color:var(--neon-blue); }
            .sp-faq.open .sp-faq-head i { transform:rotate(180deg); }
            .sp-form label { display:block; font-size:0.8rem; font-weight:600; margin:0 0 5px; color:rgba(255,255,255,0.7); }
            .sp-form input, .sp-form select, .sp-form textarea { width:100%; padding:11px 14px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); color:white; outline:none; box-sizing:border-box; font-family:inherit; font-size:0.9rem; margin-bottom:14px; }
            .sp-form input:focus, .sp-form select:focus, .sp-form textarea:focus { border-color:var(--neon-blue); }
            .ticket-row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
            .ticket-row:last-child { border-bottom:none; }
            .ticket-replies { margin-top:6px; }
            .ticket-reply { background:rgba(0,212,255,0.05); border:1px solid rgba(0,212,255,0.12); border-radius:10px; padding:10px 12px; margin-top:8px; font-size:0.8rem; }
        </style>

        <div class="sp-header" data-aos="fade-up">
            <h2><i class="fa-solid fa-headset" style="color:var(--neon-blue);"></i> مركز الدعم</h2>
            <p>قاعدة معرفية + نظام تذاكر — نساعدك على الحل بسرعة</p>
        </div>

        <div class="sp-grid">
            <div data-aos="fade-right">
                <div class="sp-card">
                    <h3><i class="fa-solid fa-circle-question" style="color:var(--neon-blue);"></i> الأسئلة الشائعة</h3>
                    ${faqs.map((f, i) => `
                        <div class="sp-faq ${i === 0 ? 'open' : ''}">
                            <div class="sp-faq-head">
                                <strong style="font-size:0.9rem;">${esc(f.q)}</strong>
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>
                            <div class="sp-faq-ans">${esc(f.a)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="sp-card">
                    <h3><i class="fa-solid fa-book-open" style="color:var(--neon-violet);"></i> دليل سريع</h3>
                    <ul style="margin:0;padding-right:18px;color:var(--text-secondary);font-size:0.85rem;line-height:2;">
                        <li>لشراء كورس: المتجر ← تفاصيل ← ادفع من المحفظة أو اطبق كود خصم</li>
                        <li>لشحن المحفظة: لوحة تحكم الطالب ← المحفظة ← شحن (أو كود Voucher)</li>
                        <li>للاختبارات: افتح الكورس من «كورساتي» ثم اختر التقييم</li>
                        <li>للحصول على الشهادة: أكمل الكورس 100% واجتز الاختبار النهائي</li>
                        <li>لتتبع تقدمك: الإشعارات + شريط التقدم داخل الكورس</li>
                    </ul>
                </div>
                <div class="sp-card">
                    <h3><i class="fa-solid fa-ticket" style="color:var(--success);"></i> تذاكري (${myTickets.length})</h3>
                    ${myTickets.length ? myTickets.map(t => {
                        const st = statusMap[t.status] || statusMap.open;
                        return `
                        <div class="ticket-row">
                            <div style="min-width:0;">
                                <div style="font-weight:700;font-size:0.85rem;">#${t.id} — ${esc(t.subject)}</div>
                                <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">${new Date(t.createdAt).toLocaleString('ar-EG')}</div>
                                <div class="ticket-replies">${(t.replies || []).slice(-1).map(r => `<div class="ticket-reply" style="color:rgba(255,255,255,0.75);"><strong style="color:var(--neon-blue);">فريق الدعم:</strong> ${esc(r.text)}</div>`).join('')}</div>
                            </div>
                            <span style="color:${st[1]};font-weight:700;font-size:0.75rem;white-space:nowrap;">${st[0]}</span>
                        </div>`;
                    }).join('') : '<p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">لا توجد تذاكر بعد — أنشئ أول تذكرة من النموذج المجاور.</p>'}
                </div>
            </div>

            <div data-aos="fade-up">
                <div class="sp-card sp-form">
                    <h3><i class="fa-solid fa-envelope-open-text" style="color:var(--neon-pink);"></i> افتح تذكرة دعم</h3>
                    <form id="ticketForm">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <div><label>الاسم</label><input type="text" id="tName" value="${esc(user ? user.name : '')}" required></div>
                            <div><label>البريد الإلكتروني</label><input type="email" id="tEmail" value="${esc(user ? user.email : '')}" required></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            <div><label>نوع المشكلة</label><select id="tCategory"><option value="technical">فني</option><option value="financial">مالي</option><option value="academic">أكاديمي</option><option value="other">أخرى</option></select></div>
                            <div><label>الأولوية</label><select id="tPriority"><option value="low">منخفضة</option><option value="medium" selected>متوسطة</option><option value="high">عالية</option></select></div>
                        </div>
                        <div><label>موضوع التذكرة</label><input type="text" id="tSubject" placeholder="مثال: لا يظهر الفيديو في الدرس 3" required></div>
                        <div><label>وصف المشكلة</label><textarea id="tMessage" rows="4" placeholder="اشرح المشكلة بالتفصيل مع أي لقطات أو معلومات مساعدة..." required></textarea></div>
                        <button type="submit" style="width:100%;padding:13px;border-radius:50px;border:none;background:linear-gradient(135deg,var(--neon-blue),var(--neon-violet));color:white;font-weight:800;font-size:0.95rem;cursor:pointer;">
                            <i class="fa-solid fa-paper-plane"></i> إرسال التذكرة
                        </button>
                        <p style="font-size:0.7rem;color:var(--text-secondary);margin:10px 0 0;text-align:center;">متوسط زمن الرد: 24-48 ساعة عمل</p>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.sp-faq').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('open'));
    });

    document.getElementById('ticketForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!window.db) { alert('قاعدة البيانات غير متاحة'); return; }
        const ticket = window.db.addTicket({
            name: document.getElementById('tName').value.trim(),
            userName: document.getElementById('tName').value.trim(),
            email: document.getElementById('tEmail').value.trim(),
            category: document.getElementById('tCategory').value,
            priority: document.getElementById('tPriority').value,
            subject: document.getElementById('tSubject').value.trim(),
            message: document.getElementById('tMessage').value.trim(),
            userId: user ? user.id : null
        });
        if (ticket && user) {
            window.db.addNotification({ user_id: user.id, title: 'تم فتح تذكرة دعم', message: `تذكرتك #${ticket.id} تم استلامها — سنرد خلال 24-48 ساعة.`, type: 'support' });
        }
        document.getElementById('ticketForm').reset();
        const btn = e.target.querySelector('button[type=submit]');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم الإرسال بنجاح!';
        btn.style.background = 'linear-gradient(135deg,#10b981,#22c55e)';
        setTimeout(() => window.location.reload(), 1200);
    });
});
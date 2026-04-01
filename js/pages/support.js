/**
 * support.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('supportContainer');
    if (container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 40px;">
                <div data-aos="fade-right">
                    <h3 class="mb-4"><i class="fa-solid fa-circle-question" style="color: var(--neon-blue);"></i> الأسئلة الشائعة</h3>
                    <div class="glass-card mb-3 faq-item" style="cursor: pointer;" onclick="this.classList.toggle('active')">
                        <h4 style="display: flex; justify-content: space-between; margin: 0;">كيف أسجل في كورس؟ <i class="fa-solid fa-chevron-down"></i></h4>
                        <p class="faq-answer" style="margin-top: 15px; color: var(--text-secondary); display: none;">من خلال صفحة الكورسات.</p>
                    </div>
                    <div class="glass-card mb-3 faq-item" style="cursor: pointer;" onclick="this.classList.toggle('active')">
                        <h4 style="display: flex; justify-content: space-between; margin: 0;">هل الشهادات معتمدة؟ <i class="fa-solid fa-chevron-down"></i></h4>
                        <p class="faq-answer" style="margin-top: 15px; color: var(--text-secondary); display: none;">نعم، جميع الشهادات تصدر بتوثيق عالمي.</p>
                    </div>
                </div>

                <div data-aos="fade-up">
                    <div class="glass-card mb-4">
                        <h3 class="mb-4"><i class="fa-solid fa-headset" style="color: var(--neon-purple);"></i> تواصل معنا مباشرة</h3>
                        <form id="contactForm">
                            <div class="form-group"><label class="form-label">الاسم</label><input type="text" class="form-control" required></div>
                            <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input type="email" class="form-control" required></div>
                            <div class="form-group"><label class="form-label">الرسالة</label><textarea class="form-control" rows="4" required></textarea></div>
                            <button type="button" class="btn btn-neon btn-full" onclick="alert('تم إرسال رسالتك بنجاح!')">إرسال الرسالة</button>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                .faq-item.active .faq-answer { display: block !important; }
                .faq-item.active h4 i { transform: rotate(180deg); }
                h4 i { transition: transform 0.3s; }
            </style>
        `;
    }
});

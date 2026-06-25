(function(){
    function init() {
        const container = document.getElementById('supportContainer');
        if (!container) return;

        const lang = () => (localStorage.getItem('lookagenius_lang') || 'en');
        const t = (en, ar) => lang() === 'ar' ? ar : en;

        container.innerHTML = `
        <div style="max-width:1000px;margin:0 auto;">
            <!-- Hero -->
            <div style="text-align:center;padding:40px 20px 30px;" data-aos="fade-up">
                <h1 style="font-size:2.5rem;font-weight:900;margin-bottom:15px;background:linear-gradient(135deg,var(--neon-blue),var(--neon-violet));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">
                    ${t('LookaGenius Academy','أكاديمية LookaGenius')}
                </h1>
                <p style="color:var(--text-secondary);font-size:1.1rem;line-height:1.8;max-width:700px;margin:0 auto;">
                    ${t('A next-generation educational platform that merges global academic curricula, exact sciences, and the latest web & AI technologies into an integrated learning experience.',
                      'منصة تعليمية من الجيل الجديد تدمج المناهج الأكاديمية العالمية، العلوم الدقيقة، وأحدث تقنيات الويب والذكاء الاصطناعي في تجربة تعليمية متكاملة.')}
                </p>
            </div>

            <!-- Vision & Mission -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:40px;" data-aos="fade-up">
                <div class="glass-card" style="padding:30px;border-radius:20px;border-left:4px solid var(--neon-blue);">
                    <i class="fa-solid fa-eye" style="font-size:2rem;color:var(--neon-blue);margin-bottom:15px;display:block;"></i>
                    <h3 style="margin-bottom:12px;">${t('Our Vision','رؤيتنا')}</h3>
                    <p style="color:var(--text-secondary);line-height:1.8;">${t(
                        'To become the world\'s leading platform for smart education, making quality learning accessible to every student, teacher, and professional regardless of geography or economic background.',
                        'أن نكون المنصة الرائدة عالمياً في التعليم الذكي، متيحين التعلم عالي الجودة لكل طالب ومعلم ومحترف بغض النظر عن الموقع الجغرافي أو الخلفية الاقتصادية.'
                    )}</p>
                </div>
                <div class="glass-card" style="padding:30px;border-radius:20px;border-right:4px solid var(--neon-violet);">
                    <i class="fa-solid fa-bullseye" style="font-size:2rem;color:var(--neon-violet);margin-bottom:15px;display:block;"></i>
                    <h3 style="margin-bottom:12px;">${t('Our Mission','رسالتنا')}</h3>
                    <p style="color:var(--text-secondary);line-height:1.8;">${t(
                        'Empowering learners worldwide through innovative technology, expert instruction, and globally recognized curricula. We bridge the gap between traditional education and the digital future.',
                        'تمكين المتعلمين حول العالم من خلال التكنولوجيا المبتكرة، والتعليم الخبير، والمناهج المعترف بها عالمياً. نسد الفجوة بين التعليم التقليدي والمستقبل الرقمي.'
                    )}</p>
                </div>
            </div>

            <!-- Global Impact -->
            <div class="glass-card" style="padding:35px;border-radius:20px;margin-bottom:40px;" data-aos="fade-up">
                <h2 style="margin-bottom:20px;text-align:center;"><i class="fa-solid fa-globe" style="color:var(--neon-blue);"></i> ${t('Our Global Impact','تأثيرنا العالمي')}</h2>
                <p style="color:var(--text-secondary);line-height:1.9;margin-bottom:20px;text-align:center;">
                    ${t(
                        'At LookaGenius, we believe education has no borders. Our platform serves students and professionals across more than 20 countries, offering courses in multiple languages and curricula — from national programs to international standards like IGCSE, SAT, and IB. We collaborate with qualified educators worldwide to deliver content that is accurate, engaging, and up-to-date with the latest academic and technological advancements.',
                        'في LookaGenius، نؤمن بأن التعليم لا حدود له. منصتنا تخدم الطلاب والمحترفين في أكثر من 20 دولة، نقدم كورسات بلغات متعددة ومناهج متنوعة - من البرامج الوطنية إلى المعايير الدولية مثل IGCSE و SAT و IB. نتعاون مع معلمين مؤهلين حول العالم لتقديم محتوى دقيق وجذاب ومحدث بأحدث التطورات الأكاديمية والتكنولوجية.'
                    )}
                </p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px;text-align:center;">
                    <div><div style="font-size:2.5rem;font-weight:900;color:var(--neon-blue);">20+</div><div style="color:var(--text-secondary);">${t('Countries','دولة')}</div></div>
                    <div><div style="font-size:2.5rem;font-weight:900;color:var(--neon-violet);">100+</div><div style="color:var(--text-secondary);">${t('Courses','كورس')}</div></div>
                    <div><div style="font-size:2.5rem;font-weight:900;color:var(--success);">50+</div><div style="color:var(--text-secondary);">${t('Expert Teachers','مدرس خبير')}</div></div>
                    <div><div style="font-size:2.5rem;font-weight:900;color:var(--warning);">5000+</div><div style="color:var(--text-secondary);">${t('Students','طالب')}</div></div>
                </div>
            </div>

            <!-- Values -->
            <h2 style="text-align:center;margin-bottom:25px;" data-aos="fade-up"><i class="fa-solid fa-gem" style="color:var(--neon-violet);"></i> ${t('Our Core Values','قيمنا الأساسية')}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:40px;" data-aos="fade-up">
                ${[
                    {icon:'fa-star',title:t('Excellence','التميز'),desc:t('We pursue the highest standards in education and technology.','نسعى لأعلى المعايير في التعليم والتكنولوجيا.')},
                    {icon:'fa-hand-holding-heart',title:t('Accessibility','الوصول الشامل'),desc:t('Quality education should be available to everyone, everywhere.','التعليم الجيد يجب أن يكون متاحاً للجميع في كل مكان.')},
                    {icon:'fa-lightbulb',title:t('Innovation','الابتكار'),desc:t('We continuously evolve with emerging technologies and methods.','نتطور باستمرار مع التقنيات والأساليب الناشئة.')},
                    {icon:'fa-users',title:t('Community','المجتمع'),desc:t('Building a global community of learners and educators.','بناء مجتمع عالمي من المتعلمين والمعلمين.')}
                ].map(v => `
                    <div class="glass-card" style="padding:25px;border-radius:16px;text-align:center;">
                        <i class="fa-solid ${v.icon}" style="font-size:2rem;color:var(--neon-blue);margin-bottom:12px;display:block;"></i>
                        <h4 style="margin-bottom:8px;">${v.title}</h4>
                        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6;">${v.desc}</p>
                    </div>
                `).join('')}
            </div>

            <!-- FAQ + Contact -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:40px;" data-aos="fade-up">
                <div>
                    <h3 style="margin-bottom:20px;"><i class="fa-solid fa-circle-question" style="color:var(--neon-blue);"></i> ${t('FAQ','الأسئلة الشائعة')}</h3>
                    ${[
                        {q:t('How do I enroll in a course?','كيف أسجل في كورس؟'),a:t('Browse our courses page, select your preferred course, and click "Enroll Now".','تصفح صفحة الكورسات، اختر الكورس المناسب، ثم اضغط "سجل الآن".')},
                        {q:t('Are the certificates accredited?','هل الشهادات معتمدة؟'),a:t('Yes, all certificates are globally recognized and verifiable online.','نعم، جميع الشهادات معتمدة عالمياً ويمكن التحقق منها عبر الإنترنت.')},
                        {q:t('Can I get a refund?','هل يمكن استرداد المبلغ؟'),a:t('We offer a 14-day money-back guarantee if you are not satisfied.','نقدم ضمان استرداد الأموال لمدة 14 يوماً إذا لم تكن راضياً.')},
                        {q:t('How do I become a teacher?','كيف أصبح مدرساً؟'),a:t('Visit the "Join Us" page and submit your application through WhatsApp.','قم بزيارة صفحة "انضم إلينا" وأرسل طلبك عبر واتساب.')}
                    ].map(f => `
                        <div class="glass-card" style="padding:15px 20px;border-radius:12px;margin-bottom:10px;cursor:pointer;" onclick="this.querySelector('.faq-a').classList.toggle('hidden')">
                            <h4 style="display:flex;justify-content:space-between;align-items:center;margin:0;font-size:0.95rem;">${f.q} <i class="fa-solid fa-chevron-down" style="font-size:0.8rem;color:var(--text-secondary);"></i></h4>
                            <p class="faq-a hidden" style="margin-top:10px;color:var(--text-secondary);font-size:0.85rem;line-height:1.6;">${f.a}</p>
                        </div>
                    `).join('')}
                </div>
                <div>
                    <div class="glass-card" style="padding:25px;border-radius:16px;">
                        <h3 style="margin-bottom:15px;"><i class="fa-solid fa-headset" style="color:var(--neon-violet);"></i> ${t('Contact Us','تواصل معنا')}</h3>
                        <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px;">${t('Have a question? We\'d love to hear from you.','لديك سؤال؟ يسعدنا التواصل معك.')}</p>
                        <form id="contactForm">
                            <div class="form-group" style="margin-bottom:12px;"><input type="text" id="contactName" placeholder="${t('Your Name','الاسم')}" style="width:100%;padding:12px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;"></div>
                            <div class="form-group" style="margin-bottom:12px;"><input type="email" id="contactEmail" placeholder="${t('Your Email','البريد الإلكتروني')}" style="width:100%;padding:12px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;"></div>
                            <div class="form-group" style="margin-bottom:12px;"><textarea id="contactMsg" rows="4" placeholder="${t('Your Message','رسالتك')}" style="width:100%;padding:12px;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;color:white;resize:vertical;"></textarea></div>
                            <button type="button" class="ag-btn" style="width:100%;" onclick="document.getElementById('contactForm').querySelector('button').textContent='${t('✓ Sent!','✓ تم الإرسال!')}';">${t('Send Message','إرسال الرسالة')}</button>
                        </form>
                        <div style="margin-top:15px;display:flex;gap:10px;justify-content:center;">
                            <a href="https://wa.me/201098768356" target="_blank" class="ag-btn ag-btn-outline" style="font-size:12px;padding:8px 16px;"><i class="fa-brands fa-whatsapp" style="color:#25D366;"></i> WhatsApp</a>
                            <a href="mailto:info@lookagenius.com" class="ag-btn ag-btn-outline" style="font-size:12px;padding:8px 16px;"><i class="fa-solid fa-envelope"></i> ${t('Email','بريد')}</a>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .faq-a.hidden { display: none; }
            </style>
        </div>`;
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();

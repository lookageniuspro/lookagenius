const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

const headerHtmlTemplate = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LookaGenius Academy | منصة تعليمية متكاملة</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- AOS Animation CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/animations.css">
</head>
<body class="dark-theme">
    
    <!-- Particles Background -->
    <div id="particles-js"></div>
    <div class="glass-bg-overlay"></div>

    <!-- Main Navigation Bar -->
    <nav class="navbar glass-nav">
        <div class="container nav-content">
            <a href="index.html" class="logo">
                <span class="neon-text">Looka</span>Genius <i class="fa-solid fa-graduation-cap"></i>
            </a>
            
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <i class="fa-solid fa-bars"></i>
            </button>

            <div class="nav-links" id="navLinks">
                <a href="index.html" class="nav-link {nav_home}">الرئيسية</a>
                <a href="courses.html" class="nav-link {nav_courses}">الكورسات</a>
                <a href="scholarships.html" class="nav-link {nav_scholarships}">المنح الدراسية</a>
                <a href="support.html" class="nav-link {nav_support}">تواصل معنا</a>
                
                <div class="auth-buttons" id="authButtonsContainer">
                    <a href="login.html" class="btn btn-outline">تسجيل الدخول</a>
                    <a href="register.html" class="btn btn-neon">إنشاء حساب <i class="fa-solid fa-user-plus"></i></a>
                </div>
                <!-- Logged In User Nav Items (Hidden initially by CSS in auth.js) -->
                <div class="user-menu hidden" id="userMenuContainer">
                    <a href="#" class="btn btn-neon btn-dashboard" id="dashboardBtn">لوحة التحكم <i class="fa-solid fa-border-all"></i></a>
                    <button class="btn btn-outline btn-logout" id="logoutBtn"><i class="fa-solid fa-sign-out-alt"></i></button>
                    <a href="profile.html" class="btn btn-outline" title="الملف الشخصي"><i class="fa-solid fa-user"></i></a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
`;

const footerHtml = `
    <!-- Footer -->
    <footer class="glass-footer">
        <div class="container footer-content">
            <div class="footer-col" data-aos="fade-up">
                <h3><span class="neon-text">Looka</span>Genius</h3>
                <p>منصتك الأولى للتعلم الذكي، استكشف عالم المعرفة والتكنولوجيا بخطوات مبسطة وتصميم استثنائي.</p>
                <div class="social-links">
                    <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#"><i class="fa-brands fa-linkedin-in"></i></a>
                </div>
            </div>
            <div class="footer-col" data-aos="fade-up" data-aos-delay="100">
                <h4>روابط سريعة</h4>
                <ul>
                    <li><a href="index.html">الرئيسية</a></li>
                    <li><a href="courses.html">الكورسات</a></li>
                    <li><a href="scholarships.html">المنح الدراسية</a></li>
                </ul>
            </div>
            <div class="footer-col" data-aos="fade-up" data-aos-delay="200">
                <h4>الدعم والمساعدة</h4>
                <ul>
                    <li><a href="support.html">تواصل معنا</a></li>
                    <li><a href="support.html">الأسئلة الشائعة</a></li>
                </ul>
            </div>
            <div class="footer-col" data-aos="fade-up" data-aos-delay="300">
                <h4>تواصل مباشر</h4>
                <p><i class="fa-solid fa-envelope"></i> info@lookagenius.com</p>
                <p><i class="fa-solid fa-phone"></i> +1 234 567 8900</p>
                <button class="btn btn-neon btn-full mt-1">تحدث عبر واتساب <i class="fa-brands fa-whatsapp"></i></button>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 LookaGenius Academy. جميع الحقوق محفوظة.</p>
        </div>
    </footer>

    <!-- Libraries -->
    <!-- Chart.js for Dashboards -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- AOS Animation JS -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <!-- Particles.js for background effect -->
    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>

    <!-- App Scripts -->
    <script src="js/db.js" defer></script>
    <script src="js/auth.js" defer></script>
    <script src="js/app.js" defer></script>
    {page_script}
</body>
</html>
`;

const pages = {
    "index.html": {
        "nav": "nav_home",
        "script": '<script src="js/pages/home.js" defer></script>',
        "content": `
        <!-- Hero Section -->
        <main>
        <section class="hero-section" style="min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 60px 20px;">
            <div class="container" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <h1 data-aos="zoom-in" style="font-size: 3.5rem; margin-bottom: 20px;">مرحباً بك في <span class="neon-text animate-pulse-glow">LookaGenius</span></h1>
                <p data-aos="fade-up" data-aos-delay="100" style="font-size: 1.2rem; max-width: 600px; color: var(--text-secondary); margin-bottom: 40px;">
                    منصتك التعليمية المستقبلية. اكتشف مسارات ذكية لتعلم اللغات، العلوم، التكنولوجيا والهندسة بأسلوب مبتكر.
                </p>
                <div data-aos="fade-up" data-aos-delay="200" style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                    <a href="register.html" class="btn btn-neon" style="padding: 15px 40px; font-size: 1.2rem;">ابدأ رحلتك الآن <i class="fa-solid fa-rocket"></i></a>
                    <a href="courses.html" class="btn btn-outline" style="padding: 15px 40px; font-size: 1.2rem;">استكشف الكورسات <i class="fa-solid fa-compass"></i></a>
                </div>
            </div>
        </section>

        <!-- Features / Why US -->
        <section style="padding: 80px 0; background: rgba(5, 6, 8, 0.4);">
            <div class="container">
                <h2 class="text-center mb-4 neon-text" data-aos="fade-down">لماذا LookaGenius؟</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                    <div class="glass-card text-center" data-aos="fade-up" data-aos-delay="100">
                        <i class="fa-solid fa-laptop-code" style="font-size: 3rem; color: var(--neon-blue); margin-bottom: 20px;"></i>
                        <h3>تعلم بأحدث التقنيات</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">نقدم مناهج تفاعلية حديثة تواكب متطلبات العصر في كل المجالات.</p>
                    </div>
                    <div class="glass-card text-center" data-aos="fade-up" data-aos-delay="200">
                        <i class="fa-solid fa-users" style="font-size: 3rem; color: var(--neon-purple); margin-bottom: 20px;"></i>
                        <h3>لوحات تحكم مخصصة</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">نظام متكامل يربط الطالب بالمعلم وولي الأمر في بيئة واحدة.</p>
                    </div>
                    <div class="glass-card text-center" data-aos="fade-up" data-aos-delay="300">
                        <i class="fa-solid fa-award" style="font-size: 3rem; color: var(--neon-pink); margin-bottom: 20px;"></i>
                        <h3>شهادات ومنح عالمية</h3>
                        <p style="color: var(--text-secondary); margin-top: 10px;">نؤهلك للحصول على منح دراسية مجانية في كبرى الجامعات الأوروبية.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Courses (Preview) -->
        <section style="padding: 80px 0;">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;" data-aos="fade-right">
                    <h2 class="neon-text">أبرز الكورسات</h2>
                    <a href="courses.html" class="btn btn-outline">عرض الكل</a>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;" id="homeCourses">
                <!-- Injected via JS -->
                </div>
            </div>
        </section>
        
        <!-- CTA Section -->
        <section style="padding: 100px 0; text-align: center; background: linear-gradient(0deg, rgba(9, 10, 15, 1) 0%, rgba(188, 19, 254, 0.1) 100%);">
            <div class="container" data-aos="fade-up">
                <h2 style="font-size: 2.5rem; margin-bottom: 20px;">جاهز لصناعة مستقبلك؟</h2>
                <a href="register.html" class="btn btn-neon" style="padding: 15px 50px; font-size: 1.3rem;">سجل الآن مجاناً</a>
            </div>
        </section>
        </main>
        `
    },
    "login.html": {
        "nav": "",
        "script": '<script src="js/pages/authForms.js" defer></script>',
        "content": `
        <main class="container page-fade-in" style="min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 40px 20px; margin-top: 80px;">
            <div class="glass-card" style="width: 100%; max-width: 450px;">
                <h2 class="text-center mb-4 neon-text">تسجيل الدخول</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="أدخل بريدك الإلكتروني" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="كلمة المرور" required>
                    </div>
                    
                    <div id="loginErrorMsg" class="mb-3 text-center hidden" style="color: #ff4d4d;"></div>

                    <button type="submit" class="btn btn-neon btn-full mt-2">دخول <i class="fa-solid fa-right-to-bracket"></i></button>
                    
                    <div class="text-center mt-3" style="color: var(--text-secondary); font-size: 0.9rem;">
                        <p class="mb-2"><a href="#" style="color: var(--neon-blue);">نسيت كلمة المرور؟</a></p>
                        <p>ليس لديك حساب؟ <a href="register.html" style="color: var(--neon-purple); font-weight: bold;">إنشاء حساب</a></p>
                    </div>
                    
                    <!-- Mock Google Login -->
                    <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                        <button type="button" class="btn btn-outline btn-full" onclick="alert('Google Login Mock')"><i class="fa-brands fa-google"></i> تسجيل الدخول باستخدام جوجل</button>
                    </div>
                </form>
            </div>
        </main>
        `
    },
    "register.html": {
        "nav": "",
        "script": '<script src="js/pages/authForms.js" defer></script>',
        "content": `
        <main class="container page-fade-in" style="min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 40px 20px; margin-top: 80px;">
            <div class="glass-card" style="width: 100%; max-width: 600px;">
                <h2 class="text-center mb-4 neon-text">إنشاء حساب جديد</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label class="form-label">نوع الحساب</label>
                        <select id="regType" class="form-select" required>
                            <option value="" disabled selected>اختر نوع الحساب</option>
                            <option value="student">طالب (Student)</option>
                            <option value="parent">ولي أمر (Parent)</option>
                            <option value="teacher">معلم / دكتور (Teacher/Doctor)</option>
                            <option value="engineer">مهندس (Engineer)</option>
                            <option value="accountant">محاسب (Accountant)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">الاسم الكامل</label>
                        <input type="text" id="regName" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input type="email" id="regEmail" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input type="password" id="regPassword" class="form-control" required>
                    </div>

                    <!-- Dynamic Fields Container -->
                    <div id="dynamicFields" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    </div>

                    <div id="regErrorMsg" class="mb-3 text-center hidden" style="color: #ff4d4d; margin-top: 15px;"></div>

                    <button type="submit" class="btn btn-neon btn-full mt-3" id="regSubmitBtn" disabled>إنشاء حساب</button>
                    
                    <div class="text-center mt-3" style="color: var(--text-secondary); font-size: 0.9rem;">
                        <p>لديك حساب بالفعل؟ <a href="login.html" style="color: var(--neon-blue); font-weight: bold;">تسجيل الدخول</a></p>
                    </div>
                </form>
            </div>
        </main>
        `
    },
    "courses.html": {
        "nav": "nav_courses",
        "script": '<script src="js/pages/courses.js" defer></script>',
        "content": `
        <main style="padding-top: 100px; padding-bottom: 60px;">
            <div class="container page-fade-in">
                <h1 class="text-center neon-text mb-4" data-aos="fade-down">قائمة الكورسات</h1>
                
                <!-- Search & Filters -->
                <div class="glass-card mb-5" data-aos="fade-up" style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <input type="text" class="form-control" placeholder="ابحث عن كورس...">
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <select class="form-select">
                            <option value="">جميع التخصصات</option>
                            <option value="tech">تكنولوجيا وبرمجة</option>
                            <option value="science">علوم</option>
                            <option value="design">تصميم</option>
                        </select>
                    </div>
                    <button class="btn btn-neon">بحث <i class="fa-solid fa-search"></i></button>
                </div>

                <div id="coursesCatalog" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;">
                    <!-- JS Injected -->
                </div>
            </div>
        </main>
        
        <!-- Mock Payment Modal Overlay -->
        <div id="paymentModalOverlay" class="hidden" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div class="glass-card" style="width: 100%; max-width: 500px; padding: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 class="neon-text">إتمام الدفع</h3>
                    <button class="close-modal-btn" style="background: none; border: none; font-size: 1.5rem; color: white;"><i class="fa-solid fa-times"></i></button>
                </div>
                <div id="paymentDetails" style="margin-bottom: 20px;"></div>
                
                <div class="form-group">
                    <label class="form-label">طريقة الدفع</label>
                    <select class="form-select" id="payMethod">
                        <option value="visa">بطاقة ائتمان (Visa/Mastercard)</option>
                        <option value="bank">تحويل بنكي</option>
                    </select>
                </div>
                
                <div class="form-group credit-card-fields">
                    <label class="form-label">رقم البطاقة الوهمي</label>
                    <input type="text" class="form-control" placeholder="1234 5678 9101 1121" value="4000 0000 0000 0000">
                </div>
                
                <button class="btn btn-neon btn-full mt-3" id="confirmPaymentBtn">تأكيد ودفع</button>
            </div>
        </div>
        `
    },
    "scholarships.html": {
        "nav": "nav_scholarships",
        "script": '<script src="js/pages/scholarships.js" defer></script>',
        "content": `
        <main style="padding-top: 100px; padding-bottom: 60px;">
            <div class="container page-fade-in">
                <!-- Hero Section for Scholarships -->
                <div class="text-center mb-5" data-aos="fade-up">
                    <h1 class="neon-text mb-3" style="font-size: 3rem;">المنح الدراسية العالمية</h1>
                    <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto; font-size: 1.1rem;">
                        استكشف أفضل الفرص لمواصلة دراستك الجامعية أو العليا بتمويل كامل أو جزئي حول العالم.
                    </p>
                </div>

                <div class="glass-card mb-5" data-aos="fade-up" data-aos-delay="100" style="display: flex; justify-content: space-between; align-items: center; padding: 15px;">
                    <h3 style="margin:0;"><i class="fa-solid fa-globe" style="color: var(--neon-blue); margin-left: 10px;"></i> الوجهات المتاحة حالياً</h3>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px;">أوروبا <i class="fa-solid fa-flag"></i></span>
                        <span style="background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px;">ألمانيا <i class="fa-solid fa-flag"></i></span>
                    </div>
                </div>

                <div id="scholarshipsCatalog" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px;">
                    <!-- JS Injected -->
                </div>
            </div>
        </main>
        `
    },
    "support.html": {
        "nav": "nav_support",
        "script": '',
        "content": `
        <main style="padding-top: 100px; padding-bottom: 60px;">
            <div class="container page-fade-in">
                <h1 class="text-center neon-text mb-5" data-aos="fade-down">الدعم الفني والمساعدة</h1>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 40px;">
                    <!-- FAQ Section -->
                    <div data-aos="fade-right">
                        <h3 class="mb-4"><i class="fa-solid fa-circle-question" style="color: var(--neon-blue);"></i> الأسئلة الشائعة</h3>
                        
                        <div class="glass-card mb-3 faq-item" style="cursor: pointer;" onclick="this.classList.toggle('active')">
                            <h4 style="display: flex; justify-content: space-between; margin: 0;">كيف أسجل في كورس؟ <i class="fa-solid fa-chevron-down"></i></h4>
                            <p class="faq-answer" style="margin-top: 15px; color: var(--text-secondary); display: none;">يمكنك التسجيل في الكورسات من خلال صفحة 'الكورسات'، اضغط على 'سجل الآن' ثم اختر طريقة الدفع.</p>
                        </div>
                        
                        <div class="glass-card mb-3 faq-item" style="cursor: pointer;" onclick="this.classList.toggle('active')">
                            <h4 style="display: flex; justify-content: space-between; margin: 0;">كيف أتواصل مع المعلم؟ <i class="fa-solid fa-chevron-down"></i></h4>
                            <p class="faq-answer" style="margin-top: 15px; color: var(--text-secondary); display: none;">من خلال لوحة تحكم الطالب، اذهب إلى قسم الرسائل لاختيار المعلم وبدء محادثة مباشرة.</p>
                        </div>
                        
                        <div class="glass-card mb-3 faq-item" style="cursor: pointer;" onclick="this.classList.toggle('active')">
                            <h4 style="display: flex; justify-content: space-between; margin: 0;">هل الشهادات معتمدة؟ <i class="fa-solid fa-chevron-down"></i></h4>
                            <p class="faq-answer" style="margin-top: 15px; color: var(--text-secondary); display: none;">نعم، جميع الشهادات تصدر بتوثيق من المنصة وشركائنا التعليميين حول العالم.</p>
                        </div>
                    </div>

                    <!-- Contact Form & Mock Chat -->
                    <div data-aos="fade-up">
                        <div class="glass-card mb-4">
                            <h3 class="mb-4"><i class="fa-solid fa-headset" style="color: var(--neon-purple);"></i> تواصل معنا مباشرة</h3>
                            <form id="contactForm">
                                <div class="form-group">
                                    <label class="form-label">الاسم</label>
                                    <input type="text" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input type="email" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الموضوع</label>
                                    <select class="form-select" required>
                                        <option value="">اختر الموضوع</option>
                                        <option value="tech">مشكلة تقنية</option>
                                        <option value="payment">استفسار مالي</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الرسالة</label>
                                    <textarea class="form-control" rows="4" required placeholder="كيف يمكننا مساعدتك؟"></textarea>
                                </div>
                                <button type="button" class="btn btn-neon btn-full" onclick="alert('تم إرسال رسالتك بنجاح! سيتواصل معك فريق الدعم قريباً.')">إرسال الرسالة <i class="fa-solid fa-paper-plane"></i></button>
                            </form>
                        </div>
                        
                        <div style="text-align: center;">
                            <p class="mb-3" style="color: var(--text-secondary);">أو تواصل معنا فوراً عبر الذكاء الاصطناعي</p>
                            <button class="btn btn-outline btn-full" onclick="alert('Chatbot UI Mock: مرحباً، أنا المساعد الذكي، كيف أخدمك اليوم؟')"><i class="fa-solid fa-robot"></i> بدء المحادثة الذكية</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        
        <style>
            .faq-item.active .faq-answer { display: block !important; }
            .faq-item.active h4 i { transform: rotate(180deg); }
            h4 i { transition: transform 0.3s; }
        </style>
        `
    },
    "profile.html": {
        "nav": "",
        "script": '<script src="js/pages/profile.js" defer></script>',
        "content": `
        <main style="padding-top: 100px; padding-bottom: 60px;" id="profileContent">
            <!-- Injected via JS -->
        </main>
        `
    },
    "dashboard-student.html": {
        "nav": "",
        "script": '<script src="js/pages/dashboard-common.js" defer></script><script src="js/pages/dashboard-student.js" defer></script>',
        "content": `<main id="dashboardContent"></main>`
    },
    "dashboard-parent.html": {
        "nav": "",
        "script": '<script src="js/pages/dashboard-common.js" defer></script><script src="js/pages/dashboard-parent.js" defer></script>',
        "content": `<main id="dashboardContent"></main>`
    },
    "dashboard-teacher.html": {
        "nav": "",
        "script": '<script src="js/pages/dashboard-common.js" defer></script><script src="js/pages/dashboard-teacher.js" defer></script>',
        "content": `<main id="dashboardContent"></main>`
    },
    "dashboard-engineer.html": {
        "nav": "",
        "script": '<script src="js/pages/dashboard-common.js" defer></script><script src="js/pages/dashboard-engineer.js" defer></script>',
        "content": `<main id="dashboardContent"></main>`
    },
    "dashboard-accountant.html": {
        "nav": "",
        "script": '<script src="js/pages/dashboard-common.js" defer></script><script src="js/pages/dashboard-accountant.js" defer></script>',
        "content": `<main id="dashboardContent"></main>`
    }
};

for (const [filename, info] of Object.entries(pages)) {
    let finalHeader = headerHtmlTemplate
        .replace('{nav_home}', info.nav === 'nav_home' ? 'active' : '')
        .replace('{nav_courses}', info.nav === 'nav_courses' ? 'active' : '')
        .replace('{nav_scholarships}', info.nav === 'nav_scholarships' ? 'active' : '')
        .replace('{nav_support}', info.nav === 'nav_support' ? 'active' : '');
    
    let finalFooter = footerHtml.replace('{page_script}', info.script);
    
    let finalHtml = finalHeader + info.content + finalFooter;
    
    fs.writeFileSync(path.join(baseDir, filename), finalHtml, 'utf-8');
}

console.log("HTML files generated successfully!");

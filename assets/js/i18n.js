/**
 * LookaGenius i18n System
 * Handles English (LTR) and Arabic (RTL) switching
 */

const translations = {
    en: {
        dir: 'ltr',
        lang_btn: '<i class="fa-solid fa-globe"></i> العربية',
        site_title: 'LookaGenius | Comprehensive Educational Platform',
        site_desc: 'The leading platform merging global academic curricula, exact sciences, and the latest web & AI technologies.',
        nav_home: 'Home',
        nav_courses: 'Courses',
        nav_blog: 'Blog',
        nav_services: 'Services',
        nav_scholarships: 'Scholarships',
        btn_start: 'Start Now',
        hero_tagline: 'Smart Education Platform',
        hero_title_1: 'Empower Your Skills',
        hero_title_2: 'With',
        hero_desc: 'The leading platform merging global academic curricula, exact sciences, and the latest web & AI technologies.',
        hero_btn_start: 'Start Journey <i class="fa-solid fa-rocket"></i>',
        hero_btn_courses: 'Explore Courses',
        subjects_title: 'Available Subjects',
        subjects_desc: 'Comprehensive classification covering all stages and specialties',
        subj_lang: 'Global Languages',
        subj_lang_desc: 'Communication and language skills development',
        subj_sci: 'Core Sciences',
        subj_sci_desc: 'Exploring the world around us',
        subj_math: 'Mathematics',
        subj_math_desc: 'Logical thinking and mathematical analysis',
        subj_hist: 'History & Geography',
        subj_hist_desc: 'History, geography, and humanities',
        subj_eng: 'Engineering & Surveying',
        subj_eng_desc: 'Engineering design applications and software',
        subj_ict: 'Information Technology',
        subj_ict_desc: 'ICT and Digitization',
        subj_web: 'Web Development',
        subj_web_desc: 'Building and designing the web',
        subj_comp: 'Computer Science',
        subj_comp_desc: 'Programming and systems analysis',
        courses_title: 'Featured Courses',
        course_btn: 'View Details',
        continuing: 'Continuous',
        
        // Courses
        c1_t: 'Arabic: Foundations & Eloquence', c1_d: 'Discover the magic of Arabic and dive into the secrets of eloquence.', c1_b: 'Arabic',
        c2_t: 'English (A1-C1)', c2_d: 'Speak English with confidence in all academic and professional situations.', c2_b: 'English',
        c3_t: 'French for Beginners', c3_d: 'Learn the language of art and culture from scratch to conversation.', c3_b: 'French',
        c4_t: 'German: Your Step to Europe', c4_d: 'Learn German with an approved methodology for study preparation.', c4_b: 'German',
        c5_t: 'Fun Basic Science', c5_d: 'A journey into the world of science to explore how the universe works.', c5_b: 'Science (Ar)',
        c6_t: 'Science for Language Schools', c6_d: 'Understand the world through exciting science lessons.', c6_b: 'Science (En)',
        c7_t: 'Integrated Science', c7_d: 'Link chemistry, physics, and biology in an integrated curriculum.', c7_b: 'Integrated Science',
        c8_t: 'Math Without Complexity', c8_d: 'Simplified explanations and continuous training to ensure excellence.', c8_b: 'Math (Ar)',
        c9_t: 'Math: Numbers & Geometry', c9_d: 'Master numbers, algebra, and geometry step-by-step.', c9_b: 'Math (En)',
        c10_t: 'Mental Math (Abacus)', c10_d: 'Train your brain to be faster than a calculator.', c10_b: 'Mental Math',
        c11_t: 'Physics: Language of the Universe', c11_d: 'Understand the deepest laws of the universe simply.', c11_b: 'Physics',
        c12_t: 'Chemistry', c12_d: 'Discover the reactions that build our world.', c12_b: 'Chemistry',
        c13_t: 'Advanced Biology', c13_d: 'Journey inside the human body and the secrets of cells.', c13_b: 'Biology',
        c14_t: 'Geology', c14_d: 'Read the history of the Earth written in its rocks.', c14_b: 'Geology',
        c15_t: 'Social Studies', c15_d: 'History and geography explored with experts.', c15_b: 'Social Studies',
        c16_t: 'Quran Tajweed', c16_d: 'Beautify your voice with the Quran and learn Tajweed.', c16_b: 'Quran',
        
        // Scholarships
        schol_title: 'European University Scholarships <i class="fa-solid fa-star" style="color:#FBBF24;"></i>',
        schol_desc: 'Highlighting fully funded opportunities at top universities.',
        schol_apply: 'Apply Now',
        schol_1_t: 'Erasmus Mundus', schol_1_s: 'EU Joint Master', schol_1_f: 'Full Funding (Salary, Tickets)', schol_1_deadline: 'Deadline: Jan',
        schol_2_t: 'DAAD Scholarship', schol_2_s: 'Germany', schol_2_f: 'Full Funding + Stipend', schol_2_s2: 'Master & PhD (EPOS)', schol_2_deadline: 'Deadline: Varies',
        schol_3_t: 'Eiffel scholarship', schol_3_s: 'France', schol_3_f: 'Salary + Insurance', schol_3_s2: 'Master & PhD', schol_3_deadline: 'Deadline: Jan',
        schol_4_t: 'Politecnico di Milano', schol_4_s: 'Italy', schol_4_f: 'Fee Waiver + Gold Scholarship', schol_4_s2: 'Master in Engineering & Design', schol_4_deadline: 'Deadline: Feb',
        
        // Team
        team_title: 'Leadership Team',
        team_1_n: 'Dr. Ahmed Khalil', team_1_r: 'Academic Director',
        team_2_n: 'Sarah Mahmoud', team_2_r: 'Scholarship Consultant',
        team_3_n: 'Omar El Shamy', team_3_r: 'Tech Manager',
        team_4_n: 'Nada Tarek', team_4_r: 'Support Officer',
        
        // Services Page
        serv_hero_t: 'More Than Just Education',
        serv_hero_d: 'We are your strategic partner in the journey of digital transformation and professional excellence. Our solutions are designed to make you a global expert in your field.',
        serv_1_cat: 'Academic Guidance',
        serv_1_t: 'University Admission Consulting',
        serv_1_d: 'We pave the way for you to reach the best global universities through a strong and professional academic profile.',
        serv_1_f1: 'Motivation Letter Review',
        serv_1_f2: 'Choosing the Right Major',
        serv_1_f3: 'Scholarship Applications',
        serv_1_btn: 'Book Your Consultation',
        serv_2_cat: 'Professional Training',
        serv_2_t: 'Building Technical Talent',
        serv_2_d: 'Intensive programs for companies and teams to learn the latest web, programming, and AI technologies.',
        serv_2_f1: 'Full-Stack Development',
        serv_2_f2: 'Information Security',
        serv_2_f3: 'Prompt Engineering',
        serv_2_btn: 'Contact as Company',
        serv_3_cat: 'Innovation Lab',
        serv_3_t: 'Software Project Development',
        serv_3_d: 'We turn your innovative idea into a real product (MVP) that competes in the global market using the latest standards.',
        serv_3_f1: 'SaaS Platform Development',
        serv_3_f2: 'UI/UX Interface Design',
        serv_3_f3: 'AI Software',
        serv_3_btn: 'Start Your Project',
        
        // Workflow
        work_t: 'Our Methodology',
        work_d: 'Calculated steps to ensure you reach your goals with high efficiency and professionalism.',
        step_1_t: 'Needs Analysis', step_1_d: 'A deep understanding of your personal or corporate goals.',
        step_2_t: 'Mapping', step_2_d: 'Developing a customized action plan and a clear timeline for success.',
        step_3_t: 'Execution & Training', step_3_d: 'Practical application of the latest curricula and technologies with continuous follow-up.',
        step_4_t: 'Access & Empowerment', step_4_d: 'Achieving the set goal and ensuring continued excellence.',
        
        // Blog Page
        blog_hero_d: 'Daily articles to enrich your knowledge and guide you to the top.',
        blog_read_more: 'Read More <i class="fa-solid fa-arrow-right"></i>',
        post_1_t: 'Top 5 Tech Skills Needed in 2026',
        post_1_d: 'Discover the technical skills that make you an ideal candidate for major global companies...',
        post_1_date: 'March 22, 2026',
        post_2_t: 'How to Choose the Right Scholarship?',
        post_2_d: 'Your comprehensive guide to scholarship selection criteria in Europe and America...',
        post_2_date: 'March 21, 2026',
        post_3_t: 'Future of AI in Academic Education',
        post_3_d: 'Will AI change the traditional role of the teacher? Explore our predictions...',
        post_3_date: 'March 20, 2026',

        // Login Page
        login_title: 'Login',
        signup_title: 'Create Global Account',
        email_label: 'Email Address',
        pass_label: 'Password',
        name_label: 'Full Name',
        role_label: 'Account Type',
        login_btn: 'Login',
        signup_btn: 'Sign Up Now',
        no_account: 'Don\'t have an account?',
        have_account: 'Already have an account?',
        toggle_signup: 'Create new account',
        toggle_login: 'Login here',
        back_home: 'Back to Home',

        // Dashboard
        dash_title: 'Dashboard',
        dash_my_courses: 'My Courses',
        dash_certificates: 'Certificates',
        dash_settings: 'Settings',
        dash_logout: 'Logout',
        dash_welcome: 'Welcome,',
        dash_creative: 'Creative Scholar',
        dash_continue_journey: 'Continue your learning journey today.',
        dash_hours_done: 'Hours Completed',
        dash_active_courses: 'Active Courses',
        dash_most_active: 'Most Active',
        dash_explore_more: 'Explore More',
        dash_continue_learning: 'Continue Learning',
        dash_completed_pct: 'Completed',
        dash_lessons: 'Lessons',
        dash_student: 'Student',
        dash_teacher: 'Teacher',

        blog_title: 'LookaGenius Blog',
        footer_rights: '© 2026 LookaGenius Academy. All rights reserved.'
    },
    ar: {
        dir: 'rtl',
        lang_btn: '<i class="fa-solid fa-globe"></i> English',
        site_title: 'LookaGenius | المنصة التعليمية الشاملة',
        site_desc: 'المنصة الرائدة التي تجمع بين المناهج الأكاديمية العالمية، العلوم الدقيقية، وأحدث تقنيات الويب والذكاء الاصطناعي.',
        nav_home: 'الرئيسية',
        nav_courses: 'الكورسات',
        nav_blog: 'المدونة',
        nav_services: 'خدماتنا',
        nav_scholarships: 'المنح',
        btn_start: 'ابدأ الآن',
        hero_tagline: 'منصة تعليمية ذكية',
        hero_title_1: 'طور مهاراتك الخاصة',
        hero_title_2: 'مع',
        hero_desc: 'المنصة الرائدة التي تجمع بين المناهج الأكاديمية العالمية، العلوم الدقيقة، وأحدث تقنيات الويب والذكاء الاصطناعى.',
        hero_btn_start: 'ابدأ الرحلة الآن <i class="fa-solid fa-rocket"></i>',
        hero_btn_courses: 'استكشف الكورسات',
        subjects_title: 'المواد الدراسية المتاحة',
        subjects_desc: 'تصنيف شامل يغطي كافة المراحل والتخصصات',
        subj_lang: 'اللغات العالمية',
        subj_lang_desc: 'تطوير مهارات الاتصال واللغة',
        subj_sci: 'العلوم الأساسية',
        subj_sci_desc: 'استكشاف العالم من حولنا',
        subj_math: 'الرياضيات',
        subj_math_desc: 'التفكير المنطقي والتحليل الرياضي',
        subj_hist: 'الدراسات والتاريخ',
        subj_hist_desc: 'تاريخ، جغرافيا، وعلوم إنسانية',
        subj_eng: 'الهندسة والمساحة',
        subj_eng_desc: 'تطبيقات وبرامج التصميم الهندسي',
        subj_ict: 'تكنولوجيا المعلومات',
        subj_ict_desc: 'ICT والرقمنة',
        subj_web: 'إنشاء المواقع',
        subj_web_desc: 'بناء وتصميم الويب',
        subj_comp: 'كورسات الكمبيوتر',
        subj_comp_desc: 'برمجة وتحليل النظم',
        courses_title: 'الكورسات المميزة',
        course_btn: 'عرض التفاصيل',
        continuing: 'مستمر',

        c1_t: 'اللغة العربية: تأسيس وبلاغة', c1_d: 'اكتشف سحر لغة الضاد وتعمق في أسرار البلاغة والبيان.', c1_b: 'لغة عربية',
        c2_t: 'الإنجليزية الشاملة (A1-C1)', c2_d: 'تحدث الإنجليزية بثقة في جميع مواقف الحياة الأكاديمية والمهنية.', c2_b: 'لغة إنجليزية',
        c3_t: 'الفرنسية للمبتدئين', c3_d: 'تعلم لغة الفن والثقافة بخطوات بسيطة من الصفر حتى المحادثة.', c3_b: 'لغة فرنسية',
        c4_t: 'الألمانية: خطوتك نحو أوروبا', c4_d: 'تعلم الألمانية بمنهجية معتمدة للتحضير للدراسة بألمانيا.', c4_b: 'لغة ألمانية',
        c5_t: 'العلوم الأساسية الممتعة', c5_d: 'رحلة في عالم العلوم لنستكشف كيف يعمل الكون بالتجارب.', c5_b: 'العلوم',
        c6_t: 'Science for Language Schools', c6_d: 'Understand the world through exciting science lessons.', c6_b: 'Science',
        c7_t: 'العلوم المتكاملة (الثانوية)', c7_d: 'اربط بين الكيمياء، الفيزياء، والأحياء في منهج متكامل.', c7_b: 'العلوم المتكاملة',
        c8_t: 'الرياضيات بدون عقدة', c8_d: 'شروحات مبسطة وتدريبات مستمرة لضمان تفوقك وتميزك.', c8_b: 'رياضيات',
        c9_t: 'Math: Numbers & Geometry', c9_d: 'Master numbers, algebra, and geometry step-by-step.', c9_b: 'Math',
        c10_t: 'الحساب الذهني (Abacus)', c10_d: 'درب عقلك ليكون أسرع من الآلة الحاسبة لزيادة التركيز.', c10_b: 'حساب ذهني',
        c11_t: 'الفيزياء: لغة الكون', c11_d: 'افهم أعمق قوانين الكون ببساطة ودون تعقيد للثانوية العامة.', c11_b: 'فيزياء',
        c12_t: 'كيمياء', c12_d: 'اكتشف التفاعلات التي تبني العالم مادةً مادة بسهولة.', c12_b: 'كيمياء',
        c13_t: 'الأحياء المتقدمة', c13_d: 'رحلة داخل جسم الإنسان وأسرار الخلايا والكائنات الحية.', c13_b: 'أحياء',
        c14_t: 'جيولوجيا', c14_d: 'اقرأ تاريخ الأرض المكتوب في صخورها مع خبراء الجيولوجيا.', c14_b: 'جيولوجيا',
        c15_t: 'دراسات اجتماعية', c15_d: 'تاريخ وجغرافيا مع نخبة من الأساتذة المتميزين.', c15_b: 'دراسات اجتماعية',
        c16_t: 'قرآن كريم', c16_d: 'زيّن صوتك بالقرآن وتعلم أحكام التجويد بطريقة مبسطة.', c16_b: 'قرآن كريم',

        schol_title: 'المنح الدراسية للجامعات الأوروبية <i class="fa-solid fa-star" style="color:#FBBF24;"></i>',
        schol_desc: 'أبرز الفرص الممولة كلياً وجزئياً في أفضل الجامعات.',
        schol_apply: 'تقدم الآن',
        schol_1_t: 'منحة إيراسموس موندوس', schol_1_s: 'الاتحاد الأوروبي', schol_1_f: 'تمويل كامل (راتب، تذاكر)', schol_1_deadline: 'الموعد: يناير',
        schol_2_t: 'منحة DAAD الألمانية', schol_2_s: 'ألمانيا', schol_2_f: 'تمويل كامل + راتب شهري', schol_2_s2: 'الماجستير والدكتوراه (EPOS)', schol_2_deadline: 'الموعد: يختلف',
        schol_3_t: 'منحة إيفل الفرنسية', schol_3_s: 'فرنسا', schol_3_f: 'راتب ممتاز + تأمين + سفر', schol_3_s2: 'الماجستير والدكتوراه', schol_3_deadline: 'الموعد: يناير',
        schol_4_t: 'بوليتكنو ميلانو', schol_4_s: 'إيطاليا', schol_4_f: 'إعفاء رسوم + منحة ذهبية/فضية', schol_4_s2: 'الماجستير في الهندسة والتصميم', schol_4_deadline: 'الموعد: فبراير',

        team_title: 'القيادة الأكاديمية والإدارية',
        team_1_n: 'د. أحمد خليل', team_1_r: 'المدير الأكاديمي',
        team_2_n: 'م. سارة محمود', team_2_r: 'مستشار المنح الدراسية',
        team_3_n: 'عمر الشامي', team_3_r: 'مدير التكنولوجيا',
        team_4_n: 'ندى طارق', team_4_r: 'مسؤولة الدعم',

        // Services Page
        serv_hero_t: 'أكثر من مجرد تعليم',
        serv_hero_d: 'نحن شريكك الإستراتيجي في رحلة التحول الرقمي والتفوق المهني. حلولنا مصممة لتجعل منك خبيراً عالمياً في مجالك.',
        serv_1_cat: 'توجيه أكاديمي',
        serv_1_t: 'استشارات القبول الجامعي',
        serv_1_d: 'نمهد لك الطريق للوصول إلى أفضل الجامعات العالمية من خلال ملف أكاديمي قوي واحترافي.',
        serv_1_f1: 'مراجعة رسائل الدافع',
        serv_1_f2: 'اختيار التخصص المناسب',
        serv_1_f3: 'التقديم على المنح',
        serv_1_btn: 'احجز استشارتك',
        serv_2_cat: 'تدريب احترافي',
        serv_2_t: 'بناء الكوادر التقنية',
        serv_2_d: 'برامج مكثفة للشركات والفرق لتعلم أحدث تقنيات الويب والبرمجة والذكاء الاصطناعي.',
        serv_2_f1: 'تطوير Full-Stack',
        serv_2_f2: 'أمن المعلومات',
        serv_2_f3: 'هندسة الأوامر الذكية',
        serv_2_btn: 'تواصل كشركة',
        serv_3_cat: 'مختبر الابتكار',
        serv_3_t: 'تطوير المشاريع البرمجية',
        serv_3_d: 'نحول فكرتك المبتكرة إلى منتج حقيقي (MVP) ينافس في السوق العالمي باستخدام أحدث المعايير.',
        serv_3_f1: 'تطوير منصات SaaS',
        serv_3_f2: 'تصميم واجهات UI/UX',
        serv_3_f3: 'برمجيات الذكاء الاصطناعي',
        serv_3_btn: 'ابدأ مشروعك',
        
        // Workflow
        work_t: 'منهجية العمل لدينا',
        work_d: 'خطوات مدروسة تضمن لك الوصول إلى أهدافك بكفاءة عالية واحترافية.',
        step_1_t: 'تحليل الاحتياجات', step_1_d: 'فهم دقيق لأهدافك وطموحاتك الشخصية أو المؤسسية.',
        step_2_t: 'رسم الخارطة', step_2_d: 'وضع خطة عمل مخصصة وجدول زمني واضح لتحقيق النجاح.',
        step_3_t: 'التنفيذ والتدريب', step_3_d: 'تطبيق عملي لأحدث المناهج والتقنيات مع متابعة مستمرة.',
        step_4_t: 'الوصول والتمكين', step_4_d: 'تحقيق الهدف المرسوم وضمان استمرارية التميز.',

        // Blog Page
        blog_hero_d: 'مقالات يومية لإثراء معرفتك وتوجيهك نحو القمة.',
        blog_read_more: 'اقرأ المزيد <i class="fa-solid fa-arrow-left"></i>',
        post_1_t: 'أهم 5 مهارات تقنية يحتاجها سوق العمل في 2026',
        post_1_d: 'اكتشف المهارات التقنية التي تجعلك مرشحاً مثالياً لكبرى الشركات العالمية...',
        post_1_date: '22 مارس 2026',
        post_2_t: 'كيف تختار المنحة الدراسية المناسبة لمستقبلك؟',
        post_2_d: 'دليلك الشامل لمعايير اختيار المنح الدراسية في أوروبا وأمريكا...',
        post_2_date: '21 مارس 2026',
        post_3_t: 'مستقبل الذكاء الاصطناعي في التعليم الأكاديمي',
        post_3_d: 'هل سيغير الذكاء الاصطناعي الدور التقليدي للمعلم؟ استكشف التوقعات...',
        post_3_date: '20 مارس 2026',

        // Login Page
        login_title: 'تسجيل الدخول',
        signup_title: 'إنشاء حساب عالمي',
        email_label: 'البريد الإلكتروني',
        pass_label: 'كلمة المرور',
        name_label: 'الاسم الكامل',
        role_label: 'نوع الحساب',
        login_btn: 'دخول',
        signup_btn: 'تسجيل الآن',
        no_account: 'ليس لديك حساب؟',
        have_account: 'لديك حساب بالفعل؟',
        toggle_signup: 'إنشاء حساب جديد',
        toggle_login: 'تسجيل الدخول',
        back_home: 'العودة للرئيسية',

        // Dashboard
        dash_title: 'لوحة التحكم',
        dash_my_courses: 'كورساتي',
        dash_certificates: 'الشهادات',
        dash_settings: 'الإعدادات',
        dash_logout: 'تسجيل الخروج',
        dash_welcome: 'مرحباً بك،',
        dash_creative: 'أيها المبدع',
        dash_continue_journey: 'استكمل رحلتك التعليمية اليوم.',
        dash_hours_done: 'الساعات المنجزة',
        dash_active_courses: 'الكورسات النشطة',
        dash_most_active: 'الأكثر نشاطاً',
        dash_explore_more: 'اكتشف المزيد',
        dash_continue_learning: 'متابعة التعلم',
        dash_completed_pct: 'تم إكمال',
        dash_lessons: 'درساً',
        dash_student: 'طالب',
        dash_teacher: 'مدرس',

        blog_title: 'مدونة LookaGenius',
        footer_rights: '© 2026 أكاديمية LookaGenius. جميع الحقوق محفوظة.'
    }
};

let currentLang = localStorage.getItem('lookagenius_lang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lookagenius_lang', lang);
    
    document.documentElement.dir = translations[lang].dir;
    document.documentElement.lang = lang;
    
    // Update Title & Meta Description for SEO
    if (translations[lang].site_title) document.title = translations[lang].site_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && translations[lang].site_desc) metaDesc.setAttribute('content', translations[lang].site_desc);
    
    // Update Open Graph for social sharing
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && translations[lang].site_title) ogTitle.setAttribute('content', translations[lang].site_title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && translations[lang].site_desc) ogDesc.setAttribute('content', translations[lang].site_desc);

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update Language Button
    const langBtn = document.getElementById('langSwitcher');
    if (langBtn) {
        langBtn.innerHTML = translations[lang].lang_btn;
    }

    // Custom updates for specialized pages (like Login)
    if (typeof updatePageSpecificI18n === 'function') {
        updatePageSpecificI18n(lang);
    }
    // Dispatch global event for other scripts to react
    window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { lang: lang } 
    }));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    
    const langBtn = document.getElementById('langSwitcher');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'en' ? 'ar' : 'en';
            setLanguage(nextLang);
        });
    }
});

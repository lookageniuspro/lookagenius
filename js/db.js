/**
 * db.js
 * Central Database - localStorage Mock
 */

const DB_KEY = 'lookagenius_db';

const defaultData = {
    users: [
        { id: 1, name: 'Ahmed Mahmoud', firstName: 'Ahmed', fatherName: '', grandfatherName: '', familyName: 'Mahmoud', email: 'student@test.com', password: '123', type: 'student', avatar: '', phone: '', country: '', address: '', whatsapp: '', countryCode: '+20', parentPhone: '', educationStage: '', registeredAt: new Date().toISOString() },
        { id: 2, name: 'Dr. Mohamed Tarek', firstName: 'Mohamed', fatherName: '', grandfatherName: '', familyName: 'Tarek', email: 'teacher@test.com', password: '123', type: 'teacher', avatar: '', phone: '', country: '', address: '', whatsapp: '', countryCode: '+20', parentPhone: '', educationStage: '', registeredAt: new Date().toISOString() },
        { id: 3, name: 'Admin User', firstName: 'Admin', fatherName: '', grandfatherName: '', familyName: 'User', email: 'admin@lookagenius.com', password: 'password123', type: 'admin', avatar: '', phone: '', country: '', address: '', whatsapp: '', countryCode: '+20', parentPhone: '', educationStage: '', registeredAt: new Date().toISOString() }
    ],
    courses: [
        { id: 101, title: "Arabic: Foundation & Eloquence", description: "Discover the magic of the Arabic language and master grammar and rhetoric.", category: "languages", stage: "all", price: 25, currency: 'USD', duration: "36 hours", badge: "Arabic", image: "https://picsum.photos/seed/arabic/400/250", teacherIds: [], studentsEnrolled: [], lessons: [], modules: [
            { id: 10001, title: "المحتوى الرئيسي", order: 0, lessons: [
                { id: 1001, title: "مقدمة في اللغة العربية", videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "15:30", isFree: true },
                { id: 1002, title: "أساسيات النحو والإعراب", videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "20:00", isFree: false },
                { id: 1003, title: "الصرف وأوزان الكلمات", videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18:45", isFree: false },
                { id: 1004, title: "البلاغة والبيان", videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22:10", isFree: false },
                { id: 1005, title: "تطبيقات عملية واختبارات", videoURL: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "25:00", isFree: false }
            ]}
        ] },
        { id: 102, title: "Comprehensive English (A1-C1)", description: "Speak English confidently with certified international curricula.", category: "languages", stage: "all", price: 40, currency: 'USD', duration: "48 hours", badge: "English", image: "https://picsum.photos/seed/english/400/250", teacherIds: [] },
        { id: 103, title: "French for Beginners", description: "Learn the language of art and culture from scratch.", category: "languages", stage: "all", price: 25, currency: 'USD', duration: "24 hours", badge: "French", image: "https://picsum.photos/seed/french/400/250", teacherIds: [] },
        { id: 104, title: "German: Your Step to Europe", description: "Certified methodology to prepare for Goethe exams.", category: "languages", stage: "all", price: 40, currency: 'USD', duration: "30 hours", badge: "German", image: "https://picsum.photos/seed/german/400/250", teacherIds: [] },
        { id: 105, title: "Fun Basic Science", description: "An interactive journey into the world of science for foundational stages.", category: "science", stage: "primary", price: 20, currency: 'USD', duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/science/400/250", teacherIds: [] },
        { id: 106, title: "Science for Language Schools", description: "International curriculum for global students.", category: "science", stage: "middle", price: 25, currency: 'USD', duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/biology/400/250", teacherIds: [] },
        { id: 107, title: "Integrated Science (High School)", description: "Intensive explanation of Chemistry, Physics, and Biology.", category: "science", stage: "high", price: 30, currency: 'USD', duration: "32 hours", badge: "Integrated Science", image: "https://picsum.photos/seed/integratedsci/400/250", teacherIds: [] },
        { id: 108, title: "Mathematics Without Fears", description: "Simplifying complex mathematical concepts.", category: "math", stage: "primary", price: 500, currency: 'EGP', duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matharab/400/250", teacherIds: [] },
        { id: 109, title: "Math: Numbers & Geometry", description: "Mastering competitive mathematics.", category: "math", stage: "middle", price: 650, currency: 'EGP', duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matheng/400/250", teacherIds: [] },
        { id: 110, title: "Mental Math (Abacus)", description: "Developing mental abilities and speed in calculation.", category: "math", stage: "all", price: 100, currency: 'SAR', duration: "20 hours", badge: "Mental Math", image: "https://picsum.photos/seed/mentalmath/400/250", teacherIds: [] },
        { id: 111, title: "Physics: Power of the Universe", description: "Understanding the laws of mechanics and electricity simply.", category: "physics", stage: "high", price: 150, currency: 'AED', duration: "40 hours", badge: "Physics", image: "https://picsum.photos/seed/physics/400/250", teacherIds: [] },
        { id: 112, title: "Analytical & Organic Chemistry", description: "Experiments and reactions that build the future.", category: "chemistry", stage: "high", price: 30, currency: 'EUR', duration: "35 hours", badge: "Chemistry", image: "https://picsum.photos/seed/chemistry/400/250", teacherIds: [] },
        { id: 113, title: "Advanced Biology", description: "Exploring the secrets of the cell and genetics.", category: "science", stage: "high", price: 30, currency: 'USD', duration: "30 hours", badge: "Biology", image: "https://picsum.photos/seed/biologyhs/400/250", teacherIds: [] },
        { id: 114, title: "Geology & Environmental Science", description: "Studying Earth's layers and the planet's history.", category: "science", stage: "high", price: 25, currency: 'USD', duration: "25 hours", badge: "Geology", image: "https://picsum.photos/seed/geology/400/250", teacherIds: [] },
        { id: 115, title: "Social Studies: History & Geography", description: "Stories of the past and geography of the present.", category: "social", stage: "middle", price: 15, currency: 'USD', duration: "24 hours", badge: "Social Studies", image: "https://picsum.photos/seed/history/400/250", teacherIds: [] },
        { id: 116, title: "ICT & Future Tech", description: "Mastering the tools of the digital age.", category: "tech", stage: "all", price: 15, currency: 'USD', duration: "30 hours", badge: "ICT", image: "https://picsum.photos/seed/ict/400/250", teacherIds: [] }
    ],
    scholarships: [
        { id: 201, title: 'Erasmus Mundus', country: 'Europe', funding: 'Full Funding (Salary, Tickets, Fees)', university: 'Multiple', deadline: 'January', description: 'Joint Master programs funded by the EU. Covers tuition, travel, and living expenses.', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c6f9?auto=format&fit=crop&w=400&q=80', link: '#' },
        { id: 202, title: 'DAAD Scholarship', country: 'Germany', funding: 'Full Funding + Monthly Stipend', university: 'Multiple (Germany)', deadline: 'Varies', description: 'German government scholarship for Master & PhD (EPOS program).', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', link: '#' },
        { id: 203, title: 'Eiffel Excellence Scholarship', country: 'France', funding: 'Excellent Salary + Insurance + Travel', university: 'Multiple (France)', deadline: 'Early January', description: 'French government scholarship for outstanding international students.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', link: '#' },
        { id: 204, title: 'Politecnico di Milano', country: 'Italy', funding: 'Fee Waiver + Gold/Silver Scholarship', university: 'Politecnico di Milano', deadline: 'February', description: 'Merit-based scholarships for Master in Engineering & Design.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80', link: '#' },
        { id: 205, title: 'Amsterdam Excellence Scholarship', country: 'Netherlands', funding: '€25,000 Budget', university: 'University of Amsterdam', deadline: 'Mid January', description: 'For non-EU students pursuing a Master degree at UvA.', image: 'https://images.unsplash.com/photo-1534260158919-ac48eb4ecb5e?auto=format&fit=crop&w=400&q=80', link: '#' },
        { id: 206, title: 'Chevening Scholarship', country: 'UK', funding: 'Full Funding', university: 'Multiple (UK)', deadline: 'November', description: 'UK government scholarship for future leaders and influencers.', image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?auto=format&fit=crop&w=400&q=80', link: '#' }
    ],
    articles: [
        { id: 301, title: 'كيف تتقدم للمنح الأوروبية 2026؟', excerpt: 'دليل خطوة بخطوة للتقديم على المنح الدراسية الممولة بالكامل في أوروبا.', content: '<h2>الخطوة الأولى: البحث عن المنحة المناسبة</h2><p>قبل أن تبدأ رحلة التقديم، عليك أولاً تحديد المنحة التي تناسب مؤهلاتك واهتماماتك. المنح الأوروبية متنوعة وتشمل منح إيراسموس موندوس المشتركة، منح DAAD الألمانية، منح إيفل الفرنسية، وغيرها الكثير.</p><p>ابدأ بزيارة المواقع الرسمية للبرامج الدراسية التي تهمك، وتأكد من متطلبات القبول لكل منها. انتبه جيداً للمواعيد النهائية، فمعظم المنح الأوروبية لها مواعيد مبكرة بين نوفمبر وفبراير.</p><h2>الخطوة الثانية: تجهيز المستندات المطلوبة</h2><p>المستندات الأساسية تشمل: السيرة الذاتية (CV) بصيغة Europass، رسالة الدافع (Motivation Letter)، خطابات التوصية (Recommendation Letters)، كشف الدرجات (Transcripts)، وشهادات اللغة (IELTS/TOEFL).</p><p>نصيحة مهمة: ابدأ بتجهيز مستنداتك قبل 3 أشهر على الأقل من الموعد النهائي. هذا يمنحك وقتاً كافياً لمراجعة وتحسين كل مستند.</p><h2>الخطوة الثالثة: كتابة رسالة دافع قوية</h2><p>رسالة الدافع هي أهم عنصر في طلبك. اشرح فيها لماذا اخترت هذا البرنامج تحديداً، وكيف يتناسب مع مسارك المهني، وما الذي يميزك عن المتقدمين الآخرين.</p><p>احرص على أن تكون الرسالة: شخصية (تجنب القوالب الجاهزة)، محددة (اذكر أسماء أساتذة ومواد دراسية)، ومقنعة (اربط خبراتك السابقة بأهدافك المستقبلية).</p><h2>الخطوة الرابعة: التقديم والمتابعة</h2><p>بعد تجهيز جميع المستندات، قدم طلبك عبر البوابة الإلكترونية للبرنامج. تأكد من مراجعة جميع الحقول قبل الضغط على زر الإرسال.</p><p>بعد التقديم، تابع بريدك الإلكتروني بانتظام. قد تطلب منك بعض البرامج إجراء مقابلة شخصية (عبر Skype أو Zoom). استعد لها جيداً بمراجعة أهدافك البحثية ومعرفة المزيد عن البرنامج والأساتذة.</p><p>أخيراً، لا تيأس إذا لم يتم قبولك من المرة الأولى. المنح الأوروبية تنافسية جداً، والعديد من الطلاب ينجحون بعد محاولتين أو ثلاث. استمر في تحسين طلبك وبناء خبراتك.</p>', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', category: 'education', date: '2026-06-01', author: 'LookaGenius Team' },
        { id: 302, title: 'أفضل لغات البرمجة لتعلمها في 2026', excerpt: 'اكتشف لغات البرمجة الأكثر طلباً في سوق العمل هذا العام.', content: '<h2>1. Python: لغة المستقبل</h2><p>تواصل Python تصدرها لقائمة أكثر لغات البرمجة طلباً في 2026. بفضل سهولة تعلمها وتعدد استخداماتها في الذكاء الاصطناعي، تحليل البيانات، وتطوير الويب، أصبحت Python مهارة أساسية لكل مبرمج.</p><p>مجالات استخدام Python: الذكاء الاصطناعي وتعلم الآلة (TensorFlow, PyTorch)، تحليل البيانات (Pandas, NumPy)، تطوير الويب (Django, Flask)، وأتمتة المهام.</p><h2>2. JavaScript: لغة الويب الأولى</h2><p>لا يزال JavaScript يحتفظ بمكانته كلغة الويب رقم 1. مع ظهور أطر عمل مثل React و Next.js و Vue.js، أصبح بإمكانك بناء تطبيقات ويب كاملة باستخدام لغة واحدة.</p><p>نصيحة: تعلم TypeScript أيضاً فهو يضيف نوعية قوية للغة ويستخدم على نطاق واسع في المشاريع الكبيرة.</p><h2>3. Go: لغة الأداء العالي</h2><p>طورت Google لغة Go (Golang) لتصبح من أسرع اللغات نمواً. تتميز بسرعتها الفائقة وبساطتها، مما يجعلها مثالية لبناء الخدمات المصغرة (Microservices) وتطبيقات السحابة.</p><h2>4. Rust: الأمان والأداء</h2><p>Rust هي لغة أنظمة حديثة تركز على الأمان والأداء. تُستخدم في تطوير أنظمة التشغيل، قواعد البيانات، وتطبيقات الويب عالية الأداء. تم اختيارها كلغة الأكثر حباً بين المطورين لعدة سنوات متتالية.</p><h2>5. Kotlin: لتطوير الأندرويد</h2><p>أصبحت Kotlin اللغة الرسمية لتطوير تطبيقات أندرويد من Google. تتميز بكونها أكثر إيجازاً وأماناً من Java، وتتوافق معها بشكل كامل.</p><p>خلاصة: اختر لغة بناءً على أهدافك. إذا كنت مبتدئاً، ابدأ بـ Python. إذا كنت مهتماً بتطوير الويب، ابدأ بـ JavaScript. وإذا كنت تطمح للعمل في الأنظمة عالية الأداء، تعلم Go أو Rust.</p>', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80', category: 'tech', date: '2026-05-15', author: 'LookaGenius Team' },
        { id: 303, title: 'نصائح لاجتياز اختبار IELTS بنتيجة 7.5+', excerpt: 'استراتيجيات مجربة لتحقيق درجة عالية في اختبار IELTS الأكاديمي.', content: '<h2>فهم بنية الاختبار</h2><p>اختبار IELTS يتكون من 4 أقسام: الاستماع (30 دقيقة)، القراءة (60 دقيقة)، الكتابة (60 دقيقة)، والمحادثة (11-14 دقيقة). كل قسم يتطلب استراتيجية مختلفة للتحضير.</p><h2>قسم الاستماع</h2><p>الاستماع يتكون من 4 مقاطع، كل مقطع أصعب من الذي قبله. نصيحة مهمة: اقرأ الأسئلة قبل بدء كل مقطع، وركز على الكلمات المفتاحية. تدرب على الاستماع لهجات مختلفة (بريطانية، أمريكية، أسترالية).</p><h2>قسم القراءة</h2><p>القراءة هي تحدي الوقت. لديك 60 دقيقة لقراءة 3 نصوص والإجابة على 40 سؤالاً. استراتيجية فعالة: ابدأ بقراءة الأسئلة أولاً، ثم ابحث عن الإجابات في النص. لا تحاول فهم كل كلمة، ركز على المعلومات المطلوبة.</p><h2>قسم الكتابة</h2><p>المهمة 1: كتابة تقرير عن رسم بياني (150 كلمة على الأقل). المهمة 2: كتابة مقال رأي (250 كلمة على الأقل). النصيحة الذهبية: خطط لمقالك قبل الكتابة، استخدم هيكل واضح (مقدمة - جسم - خاتمة)، وتنوع في المفردات والقواعد.</p><h2>قسم المحادثة</h2><p>المحادثة هي الفرصة لإظهار طلاقتك. تحدث بثقة، استخدم مفردات متنوعة، وقدم إجابات مفصلة (لا تكتفي بـ Yes/No). تدرب مع صديق أو سجل نفسك على هاتفك.</p><h2>موارد مفيدة للتحضير</h2><p>استخدم: Cambridge IELTS series، تطبيق IELTS Prep من British Council، قناة IELTS Liz على يوتيوب، وموقع IELTS Advantage. خصص ساعتين يومياً للتحضير لمدة 6-8 أسابيع قبل الاختبار.</p>', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', category: 'education', date: '2026-05-20', author: 'LookaGenius Team' },
        { id: 304, title: 'الذكاء الاصطناعي في التعليم: ثورة قادمة', excerpt: 'كيف يغير الذكاء الاصطناعي وجه التعليم التقليدي؟', content: '<h2>التعلم المخصص (Personalized Learning)</h2><p>أكبر ثورة سيحدثها الذكاء الاصطناعي في التعليم هي التعلم المخصص. بدلاً من منهج موحد للجميع، يمكن للأنظمة الذكية تحليل أداء كل طالب وتقديم محتوى يناسب مستواه وسرعته في التعلم.</p><p>منصات مثل Khan Academy و Duolingo تستخدم بالفعل خوارزميات ذكاء اصطناعي لتخصيص تجربة التعلم لكل مستخدم.</p><h2>التصحيح التلقائي والتقييم</h2><p>أنظمة الذكاء الاصطناعي يمكنها الآن تصحيح المقالات والإجابات الكتابية بدقة تقترب من دقة المعلم البشري. هذا يوفر وقت المعلمين ليركزوا على التدريس الفعلي بدلاً من التصحيح.</p><h2>المساعد الافتراضي للطلاب</h2><p>تخيل أن يكون لكل طالب مساعد ذكي يجيب على أسئلته في أي وقت. روبوتات المحادثة التعليمية (Educational Chatbots) يمكنها تقديم شرح إضافي، حل تمارين، والإجابة على استفسارات الطلاب على مدار الساعة.</p><h2>تحليل البيانات للتنبؤ بالأداء</h2><p>يمكن لأنظمة الذكاء الاصطناعي تحليل بيانات أداء الطلاب للتنبؤ بالطلاب المعرضين لخطر الرسوب أو التسرب الدراسي، مما يتيح للمؤسسات التعليمية التدخل المبكر لمساعدتهم.</p><h2>التحديات والمخاوف</h2><p>رغم الفوائد الكبيرة، هناك تحديات: الخصوصية وأمان بيانات الطلاب، الفجوة الرقمية بين الطلاب، وضرورة تدريب المعلمين على استخدام التقنيات الجديدة. لكن مع التخطيط السليم، يمكن تجاوز هذه التحديات.</p>', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', category: 'tech', date: '2026-04-10', author: 'LookaGenius Team' }
    ],
    services: [
        { id: 401, title: 'Academics & Teachers', category: 'academic', description: 'Turn your academic expertise into passive income. We build your platform in 48 hours.', icon: 'fa-chalkboard-user', price: '1500 - 2500', features: ['LMS integrated with Zoom/Teams', 'CRM & Student Communication System', 'Course Store (Shopify/Woo)'] },
        { id: 402, title: 'Engineers & Construction', category: 'engineering', description: 'Every project deserves a professional showcase. Build a site that reflects your quality.', icon: 'fa-helmet-safety', price: '1000 - 3000', features: ['Professional Portfolio (Webflow)', 'Project Management (Asana/ClickUp)', 'Cloud System for Quantities & Reports'] },
        { id: 403, title: 'Accounting Offices', category: 'accounting', description: 'Automate your invoicing and client management. Focus on consulting while we handle the admin.', icon: 'fa-calculator', price: '800 - 2500', features: ['Specialized CRM for Accountants', 'Secure Client Portal for Documents', 'SEO Optimized Site & Lead Gen'] },
        { id: 404, title: 'Law Firms', category: 'legal', description: 'Get found first on Google with a professional booking system and legal blog.', icon: 'fa-scale-balanced', price: '1000 - 2500', features: ['Automated Consultation Booking', 'Case Management & File Tracking', 'Professional Legal Site (SEO)'] },
        { id: 405, title: 'Content Creators', category: 'creative', description: 'Convert your followers into customers with a unified platform for your content and products.', icon: 'fa-clapperboard', price: '800 - 2500', features: ['Portfolio & Digital Store', 'Sponsor & Deal Management', 'Exclusive Subscription (Patreon-style)'] },
        { id: 406, title: 'Doctors & Clinics', category: 'medical', description: 'Improve patient experience with one-click bookings and automated reminders.', icon: 'fa-user-doctor', price: '1200 - 4000', features: ['Appointment System & Reminders', 'Patient File Management (HIPAA)', 'Tele-consultation Platform'] },
        { id: 407, title: 'University Professors', category: 'academic', description: 'Build an academic site to display your research and manage student assignments.', icon: 'fa-graduation-cap', price: '1000 - 2500', features: ['LMS with Attendance & Assignments', 'Academic Site for Research DB', 'E-Testing with Auto-Grading'] },
        { id: 408, title: 'Retail Stores', category: 'retail', description: 'Your competitors are online. Build your store to work 24/7 with delivery solutions.', icon: 'fa-basket-shopping', price: '800 - 2000', features: ['Shopify Store with Delivery Integration', 'ERP & Inventory Management', 'Client Loyalty & Rewards System'] },
        { id: 409, title: 'Pharmacies', category: 'medical', description: 'Be the first in your area to offer digital services and prescription tracking.', icon: 'fa-prescription-bottle-medical', price: '1000 - 2500', features: ['Online Store & Prescription Booking', 'Expiry Tracking & Stock MGMT', 'Medicine Reminders for Patients'] },
        { id: 410, title: 'Gyms & Fitness', category: 'fitness', description: 'Transform your gym into an integrated digital platform for memberships and bookings.', icon: 'fa-dumbbell', price: '1000 - 2500', features: ['Class Booking & Trainer Schedules', 'Membership MGMT with Auto-Renewal', 'Digital Supplement & Gear Store'] }
    ],
    team: [
        { id: 501, name: 'Dr. Ahmed Khalil', role: 'Academic Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Khalil&background=0D8ABC&color=fff&size=150', userId: null },
        { id: 502, name: 'Mr. Mohamed Mahran', role: 'Academic Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Mohamed+Mahran&background=4f46e5&color=fff&size=150', userId: null },
        { id: 503, name: 'Mahmoud Abo-Taleb', role: 'Financial Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Mahmoud+Taleb&background=020617&color=fff&size=150', userId: null },
        { id: 504, name: 'Mr. Ahmed Atef', role: 'Legal Manager', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Atef&background=1e293b&color=fff&size=150', userId: null },
        { id: 505, name: 'Ahmed Farouk', role: 'Business Development', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Farouk&background=334155&color=fff&size=150', userId: null },
        { id: 506, name: 'Sarah Mahmoud', role: 'Scholarship Consultant', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Sarah+Mahmoud&background=ec4899&color=fff&size=150', userId: null },
        { id: 507, name: 'Omar El Shamy', role: 'Tech Manager', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Omar+Shamy&background=06b6d4&color=fff&size=150', userId: null },
        { id: 508, name: 'Nada Tarek', role: 'Support Officer', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Nada+Tarek&background=a855f7&color=fff&size=150', userId: null },
        { id: 509, name: 'Mr. Saad El-Din', role: 'English', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Saad+Eldin&background=0D8ABC&color=fff&size=150', userId: null },
        { id: 510, name: 'Miss Somaya Mohamed', role: 'English', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Somaya+Mohamed&background=8b5cf6&color=fff&size=150', userId: null },
        { id: 511, name: 'Miss Hadeer El-Sayed', role: 'English', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Hadeer+Sayed&background=c026d3&color=fff&size=150', userId: null },
        { id: 512, name: 'Miss Marwa Hamdy', role: 'Arabic', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Marwa+Hamdy&background=10b981&color=fff&size=150', userId: null },
        { id: 513, name: 'Mr. Farag El-Senoussi', role: 'French', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Farag+Senoussi&background=4f46e5&color=fff&size=150', userId: null },
        { id: 514, name: 'Miss Iman Omar', role: 'Physics', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Iman+Omar&background=a855f7&color=fff&size=150', userId: null },
        { id: 515, name: 'Miss Ashraqat Hassan', role: 'Chemistry', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Ashraqat+Hassan&background=FF3366&color=fff&size=150', userId: null },
        { id: 516, name: 'Mr. Islam Mohamed', role: 'Biology', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Islam+Mohamed&background=22c55e&color=fff&size=150', userId: null },
        { id: 517, name: 'Mr. Ahmed Magdy', role: 'History & Social Studies', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Ahmed+Magdy&background=eab308&color=fff&size=150', userId: null },
        { id: 518, name: 'Mrs. Sally Youssef', role: 'Mental Math', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Sally+Youssef&background=06b6d4&color=fff&size=150', userId: null }
    ],
    courseCategories: [
        { id: 'languages', name: 'لغات', icon: 'fa-language' },
        { id: 'science', name: 'علوم', icon: 'fa-flask' },
        { id: 'math', name: 'رياضيات', icon: 'fa-calculator' },
        { id: 'physics', name: 'فيزياء', icon: 'fa-atom' },
        { id: 'chemistry', name: 'كيمياء', icon: 'fa-vial' },
        { id: 'social', name: 'اجتماعيات', icon: 'fa-earth-americas' },
        { id: 'tech', name: 'تكنولوجيا', icon: 'fa-laptop-code' },
        { id: 'secondary', name: 'ثانوي عام', icon: 'fa-school' },
        { id: 'university', name: 'جامعي', icon: 'fa-university' },
        { id: 'career', name: 'تطويري', icon: 'fa-briefcase' }
    ],
    currencies: [
        { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
        { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' },
        { code: 'SAR', symbol: '﷼', name: 'ريال سعودي' },
        { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
        { code: 'EUR', symbol: '€', name: 'يورو' }
    ],
    settings: {
        siteName: 'LookaGenius',
        siteDescription: 'Comprehensive Educational Platform',
        whatsapp: '201098768356',
        email: 'info@lookagenius.com',
        currency: 'USD',
        currencySymbol: '$',
        language: 'auto'
    },
    notifications: [],
    financials: [
        { id: 601, teacherId: 2, totalEarned: 0, paid: 0, pending: 0, lastUpdated: new Date().toISOString() }
    ],
    settlementRequests: [],
    collaborations: []
};

function sanitize(str) {
    return String(str).replace(/[<>]/g, '').replace(/javascript:/gi, '').trim();
}

function initDB() {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    } else {
        const data = JSON.parse(existing);
        let needsUpdate = false;
        Object.keys(defaultData).forEach(key => {
            if (data[key] === undefined) {
                data[key] = JSON.parse(JSON.stringify(defaultData[key]));
                needsUpdate = true;
            }
        });
        // Migration: add currency to courses that don't have it
        if (data.courses) {
            data.courses.forEach(c => {
                if (!c.currency) {
                    c.currency = 'USD';
                    needsUpdate = true;
                }
            });
        }
        // Migration: add new user fields
        if (data.users) {
            data.users.forEach(u => {
                const newFields = { firstName: '', fatherName: '', grandfatherName: '', familyName: '', country: '', address: '', whatsapp: '', countryCode: '+20', parentPhone: '', educationStage: '' };
                Object.keys(newFields).forEach(k => {
                    if (u[k] === undefined) {
                        u[k] = newFields[k];
                        needsUpdate = true;
                    }
                });
                // Auto-set part names from full name if empty
                if (!u.firstName && u.name) {
                    const parts = u.name.trim().split(' ');
                    u.firstName = parts[0] || u.name;
                    u.familyName = parts.length > 1 ? parts[parts.length-1] : '';
                    needsUpdate = true;
                }
            });
        }
        // Migration: fix courseCategories that use 'label' instead of 'name'
        if (data.courseCategories) {
            data.courseCategories.forEach(c => {
                if (c.label && !c.name) {
                    c.name = c.label;
                    delete c.label;
                    needsUpdate = true;
                }
            });
        }
        // Migration: add modules to courses
        if (data.courses) {
            data.courses.forEach(c => {
                if (!c.modules) {
                    c.modules = [];
                    if (c.lessons && c.lessons.length > 0) {
                        c.modules.push({ id: Date.now() + Math.floor(Math.random() * 9999), title: 'المحتوى الرئيسي', order: 0, lessons: JSON.parse(JSON.stringify(c.lessons)) });
                    }
                    if (!c.lessons) c.lessons = [];
                    needsUpdate = true;
                }
            });
        }
        if (needsUpdate) {
            localStorage.setItem(DB_KEY, JSON.stringify(data));
        }
    }
}

function getCurrencySymbol(code) {
    const map = { USD: '$', EGP: 'ج.م', SAR: '﷼', AED: 'د.إ', EUR: '€' };
    return map[code] || '$';
}

window.db = {
    getData: () => {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return JSON.parse(JSON.stringify(defaultData));
        const data = JSON.parse(raw);
        Object.keys(defaultData).forEach(key => {
            if (data[key] === undefined) {
                data[key] = JSON.parse(JSON.stringify(defaultData[key]));
            }
        });
        return data;
    },
    saveData: (data) => localStorage.setItem(DB_KEY, JSON.stringify(data)),

    getUsers: () => window.db.getData().users,
    getCourses: () => window.db.getData().courses,
    getCourseCategories: () => window.db.getData().courseCategories || [],
    addCourseCategory: (cat) => {
        const data = window.db.getData();
        data.courseCategories.push(cat);
        window.db.saveData(data);
        return true;
    },
    deleteCourseCategory: (id) => {
        const data = window.db.getData();
        data.courseCategories = data.courseCategories.filter(c => c.id !== id);
        window.db.saveData(data);
        return true;
    },
    getCurrencies: () => window.db.getData().currencies || [],
    getCurrencySymbol: getCurrencySymbol,
    getScholarships: () => window.db.getData().scholarships,
    getArticles: () => window.db.getData().articles,
    getServices: () => window.db.getData().services,
    getTeam: () => window.db.getData().team,
    getSettings: () => window.db.getData().settings,
    getNotifications: () => window.db.getData().notifications,
    getFinancials: () => window.db.getData().financials,
    getSettlementRequests: () => window.db.getData().settlementRequests,
    getCollaborations: () => window.db.getData().collaborations,

    addUser: (user) => {
        const data = window.db.getData();
        user.id = Date.now();
        user.name = sanitize(user.name);
        user.firstName = user.firstName || '';
        user.fatherName = user.fatherName || '';
        user.grandfatherName = user.grandfatherName || '';
        user.familyName = user.familyName || '';
        user.email = sanitize(user.email);
        user.avatar = user.avatar || '';
        user.phone = user.phone || '';
        user.country = user.country || '';
        user.address = user.address || '';
        user.whatsapp = user.whatsapp || '';
        user.countryCode = user.countryCode || '+20';
        user.parentPhone = user.parentPhone || '';
        user.educationStage = user.educationStage || '';
        user.registeredAt = new Date().toISOString();
        data.users.push(user);
        window.db.saveData(data);
        window.db.addNotification({
            message: `مستخدم جديد: ${user.name} (${user.type})`,
            type: 'new_user',
            link: 'users',
            userEmail: user.email
        });
        return user;
    },

    addCourse: (course) => {
        const data = window.db.getData();
        course.id = Date.now();
        data.courses.push(course);
        window.db.saveData(data);
        return course;
    },

    updateCourse: (id, updatedCourse) => {
        const data = window.db.getData();
        const index = data.courses.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            data.courses[index] = { ...data.courses[index], ...updatedCourse };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteCourse: (id) => {
        const data = window.db.getData();
        data.courses = data.courses.filter(c => c.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    addScholarship: (item) => {
        const data = window.db.getData();
        item.id = Date.now();
        data.scholarships.push(item);
        window.db.saveData(data);
        return item;
    },

    updateScholarship: (id, updated) => {
        const data = window.db.getData();
        const index = data.scholarships.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            data.scholarships[index] = { ...data.scholarships[index], ...updated };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteScholarship: (id) => {
        const data = window.db.getData();
        data.scholarships = data.scholarships.filter(s => s.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    addArticle: (item) => {
        const data = window.db.getData();
        item.id = Date.now();
        item.date = item.date || new Date().toISOString().split('T')[0];
        data.articles.push(item);
        window.db.saveData(data);
        return item;
    },

    updateArticle: (id, updated) => {
        const data = window.db.getData();
        const index = data.articles.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            data.articles[index] = { ...data.articles[index], ...updated };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteArticle: (id) => {
        const data = window.db.getData();
        data.articles = data.articles.filter(a => a.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    addService: (item) => {
        const data = window.db.getData();
        item.id = Date.now();
        data.services.push(item);
        window.db.saveData(data);
        return item;
    },

    updateService: (id, updated) => {
        const data = window.db.getData();
        const index = data.services.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            data.services[index] = { ...data.services[index], ...updated };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteService: (id) => {
        const data = window.db.getData();
        data.services = data.services.filter(s => s.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    addTeamMember: (item) => {
        const data = window.db.getData();
        item.id = Date.now();
        data.team.push(item);
        window.db.saveData(data);
        return item;
    },

    updateTeamMember: (id, updated) => {
        const data = window.db.getData();
        const index = data.team.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            data.team[index] = { ...data.team[index], ...updated };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteTeamMember: (id) => {
        const data = window.db.getData();
        data.team = data.team.filter(t => t.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    updateUser: (id, updates) => {
        const data = window.db.getData();
        const index = data.users.findIndex(u => u.id === parseInt(id));
        if (index === -1) return false;
        data.users[index] = { ...data.users[index], ...updates };
        window.db.saveData(data);
        return true;
    },

    addSettlementRequest: (req) => {
        const data = window.db.getData();
        req.id = Date.now();
        req.status = 'pending';
        req.createdAt = new Date().toISOString();
        data.settlementRequests.push(req);
        window.db.saveData(data);
        window.db.addNotification({
            message: `طلب تصفية حساب من: ${req.teacherName} (${req.amount}$)`,
            type: 'settlement',
            link: 'settlements'
        });
        return req;
    },

    approveSettlementRequest: (id) => {
        const data = window.db.getData();
        const req = data.settlementRequests.find(r => r.id === parseInt(id));
        if (!req) return false;
        req.status = 'approved';
        req.approvedAt = new Date().toISOString();
        const fin = data.financials.find(f => f.teacherId === req.teacherId);
        if (fin) {
            fin.paid = (fin.paid || 0) + req.amount;
            fin.pending = Math.max(0, (fin.pending || 0) - req.amount);
            fin.lastUpdated = new Date().toISOString();
        }
        window.db.saveData(data);
        return true;
    },

    addCollaboration: (data) => {
        const db = window.db.getData();
        data.id = Date.now();
        data.createdAt = new Date().toISOString();
        data.status = 'pending';
        db.collaborations.push(data);
        window.db.saveData(db);
        window.db.addNotification({
            message: `طلب تعاون جديد من: ${data.name} (${data.field})`,
            type: 'new_user',
            link: 'collaborations'
        });
        return data;
    },

    deleteCollaboration: (id) => {
        const db = window.db.getData();
        db.collaborations = db.collaborations.filter(c => c.id !== parseInt(id));
        window.db.saveData(db);
        return true;
    },

    updateCollaboration: (id, updates) => {
        const db = window.db.getData();
        const idx = db.collaborations.findIndex(c => c.id === parseInt(id));
        if (idx === -1) return false;
        db.collaborations[idx] = { ...db.collaborations[idx], ...updates };
        window.db.saveData(db);
        return true;
    },

    rejectSettlementRequest: (id) => {
        const data = window.db.getData();
        const req = data.settlementRequests.find(r => r.id === parseInt(id));
        if (!req) return false;
        req.status = 'rejected';
        req.rejectedAt = new Date().toISOString();
        window.db.saveData(data);
        return true;
    },

    getTeacherCourses: (teacherId) => {
        return window.db.getCourses().filter(c => (c.teacherIds || []).includes(parseInt(teacherId)));
    },

    enrollStudent: (courseId, userId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (!course.studentsEnrolled) course.studentsEnrolled = [];
        if (!course.studentsEnrolled.includes(parseInt(userId))) {
            course.studentsEnrolled.push(parseInt(userId));
        }
        window.db.saveData(data);
        return true;
    },

    unenrollStudent: (courseId, userId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course || !course.studentsEnrolled) return false;
        course.studentsEnrolled = course.studentsEnrolled.filter(id => id !== parseInt(userId));
        window.db.saveData(data);
        return true;
    },

    updateLessonProgress: (courseId, userId, lessonId, completed) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (!course.progress) course.progress = {};
        if (!course.progress[userId]) course.progress[userId] = {};
        course.progress[userId][lessonId] = completed;
        window.db.saveData(data);
        return true;
    },

    getCourseProgress: (courseId, userId) => {
        const course = window.db.getCourses().find(c => c.id === parseInt(courseId));
        if (!course || !course.progress || !course.progress[userId]) return { completed: 0, total: 0, percent: 0 };
        const prog = course.progress[userId];
        const lessons = window.db.getCourseLessons(courseId);
        const completed = Object.values(prog).filter(v => v).length;
        const total = lessons.length;
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },

    getUserEnrolledCourses: (userId) => {
        return window.db.getCourses().filter(c => (c.studentsEnrolled || []).includes(parseInt(userId)));
    },

    assignCourseToTeacher: (courseId, teacherId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (!course.teacherIds) course.teacherIds = [];
        if (!course.teacherIds.includes(parseInt(teacherId))) {
            course.teacherIds.push(parseInt(teacherId));
        }
        window.db.saveData(data);
        return true;
    },

    removeCourseFromTeacher: (courseId, teacherId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course || !course.teacherIds) return false;
        course.teacherIds = course.teacherIds.filter(t => t !== parseInt(teacherId));
        window.db.saveData(data);
        return true;
    },

    updateSettings: (newSettings) => {
        const data = window.db.getData();
        data.settings = { ...data.settings, ...newSettings };
        window.db.saveData(data);
        return true;
    },

    addNotification: (notif) => {
        const data = window.db.getData();
        notif.id = Date.now();
        notif.read = false;
        notif.createdAt = new Date().toISOString();
        data.notifications.unshift(notif);
        if (data.notifications.length > 100) data.notifications = data.notifications.slice(0, 100);
        window.db.saveData(data);
        return notif;
    },

    markNotificationRead: (id) => {
        const data = window.db.getData();
        const notif = data.notifications.find(n => n.id === parseInt(id));
        if (notif) notif.read = true;
        window.db.saveData(data);
    },

    markAllNotificationsRead: () => {
        const data = window.db.getData();
        data.notifications.forEach(n => n.read = true);
        window.db.saveData(data);
    },

    getUnreadNotificationsCount: () => {
        return window.db.getNotifications().filter(n => !n.read).length;
    },

    deleteNotification: (id) => {
        const data = window.db.getData();
        data.notifications = data.notifications.filter(n => n.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    },

    clearAllNotifications: () => {
        const data = window.db.getData();
        data.notifications = [];
        window.db.saveData(data);
    },

    // ربط عضو فريق العمل بحساب مستخدم
    linkTeamMemberToUser: (teamMemberId, userId) => {
        const data = window.db.getData();
        const member = data.team.find(t => t.id === parseInt(teamMemberId));
        if (!member) return false;
        member.userId = userId ? parseInt(userId) : null;
        window.db.saveData(data);
        return true;
    },

    // الحصول على أعضاء الفريق من نوع مدرس مع حساباتهم المرتبطة
    getLinkedTeachers: () => {
        const data = window.db.getData();
        const teachers = data.team.filter(t => t.category === 'teacher');
        return teachers.map(t => {
            const user = data.users.find(u => u.id === t.userId);
            return { ...t, linkedUser: user || null };
        });
    },

    // إنشاء حساب مستخدم مدرس وربطه تلقائياً بعضو الفريق
    addTeacherWithAccount: (teamMemberData, password) => {
        const data = window.db.getData();
        const now = Date.now();
        const memberId = now;
        const userId = now + 1;
        // إنشاء عضو الفريق
        const member = { ...teamMemberData, id: memberId, userId: userId };
        data.team.push(member);
        // إنشاء حساب مستخدم من نوع مدرس
        const email = (teamMemberData.name || 'teacher').replace(/\s+/g, '.').toLowerCase() + '@lookagenius.com';
        const user = {
            id: userId,
            name: teamMemberData.name,
            email: email,
            password: password || '123456',
            type: 'teacher',
            avatar: teamMemberData.image || '',
            phone: '',
            registeredAt: new Date().toISOString()
        };
        data.users.push(user);
        window.db.saveData(data);
        window.db.addNotification({
            message: `تم إنشاء حساب مدرس: ${user.name} (${user.email})`,
            type: 'system',
            link: 'users'
        });
        return { member, user };
    },

    // إضافة درس إلى كورس (يدعم modules)
    addLesson: (courseId, lesson, moduleId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (course.modules && course.modules.length > 0) {
            let mod;
            if (moduleId) {
                mod = course.modules.find(m => m.id === parseInt(moduleId));
            }
            if (!mod) mod = course.modules[0];
            if (!mod.lessons) mod.lessons = [];
            lesson.id = Date.now();
            mod.lessons.push(lesson);
            window.db.saveData(data);
            return lesson;
        }
        if (!course.lessons) course.lessons = [];
        lesson.id = Date.now();
        course.lessons.push(lesson);
        window.db.saveData(data);
        return lesson;
    },

    // تعديل درس (يدعم modules)
    updateLesson: (courseId, lessonId, updates, moduleId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        // Try modules first
        if (course.modules && course.modules.length > 0) {
            const mods = moduleId ? course.modules.filter(m => m.id === parseInt(moduleId)) : course.modules;
            for (const mod of mods) {
                if (mod.lessons) {
                    const idx = mod.lessons.findIndex(l => l.id === parseInt(lessonId));
                    if (idx !== -1) {
                        mod.lessons[idx] = { ...mod.lessons[idx], ...updates };
                        window.db.saveData(data);
                        return true;
                    }
                }
            }
            return false;
        }
        if (!course.lessons) return false;
        const idx = course.lessons.findIndex(l => l.id === parseInt(lessonId));
        if (idx === -1) return false;
        course.lessons[idx] = { ...course.lessons[idx], ...updates };
        window.db.saveData(data);
        return true;
    },

    // حذف درس
    deleteLesson: (courseId, lessonId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (course.modules && course.modules.length > 0) {
            for (const mod of course.modules) {
                if (mod.lessons) {
                    const idx = mod.lessons.findIndex(l => l.id === parseInt(lessonId));
                    if (idx !== -1) {
                        mod.lessons.splice(idx, 1);
                        window.db.saveData(data);
                        return true;
                    }
                }
            }
            return false;
        }
        if (!course.lessons) return false;
        course.lessons = course.lessons.filter(l => l.id !== parseInt(lessonId));
        window.db.saveData(data);
        return true;
    },

    // الحصول على كل الدروس من جميع الموديولات (مسطحة)
    getCourseLessons: (courseId) => {
        const course = window.db.getCourses().find(c => c.id === parseInt(courseId));
        if (!course) return [];
        if (course.modules && course.modules.length > 0) {
            return course.modules.reduce((acc, m) => [...acc, ...(m.lessons || [])], []);
        }
        return course.lessons || [];
    },

    // الحصول على الموديولات
    getCourseModules: (courseId) => {
        const course = window.db.getCourses().find(c => c.id === parseInt(courseId));
        if (!course) return [];
        if (!course.modules) course.modules = [];
        return course.modules;
    },

    // إضافة موديول
    addModule: (courseId, moduleData) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (!course.modules) course.modules = [];
        const newModule = {
            id: Date.now(),
            title: moduleData.title || 'وحدة جديدة',
            order: course.modules.length,
            lessons: []
        };
        course.modules.push(newModule);
        window.db.saveData(data);
        return newModule;
    },

    // تعديل موديول
    updateModule: (courseId, moduleId, updates) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course || !course.modules) return false;
        const idx = course.modules.findIndex(m => m.id === parseInt(moduleId));
        if (idx === -1) return false;
        course.modules[idx] = { ...course.modules[idx], ...updates };
        window.db.saveData(data);
        return true;
    },

    // حذف موديول
    deleteModule: (courseId, moduleId) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course || !course.modules) return false;
        course.modules = course.modules.filter(m => m.id !== parseInt(moduleId));
        window.db.saveData(data);
        return true;
    },

    // إعادة ترتيب الموديولات
    reorderModules: (courseId, moduleIds) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course || !course.modules) return false;
        const ordered = [];
        moduleIds.forEach((mid, idx) => {
            const mod = course.modules.find(m => m.id === parseInt(mid));
            if (mod) {
                mod.order = idx;
                ordered.push(mod);
            }
        });
        const remaining = course.modules.filter(m => !moduleIds.includes(m.id));
        course.modules = [...ordered, ...remaining];
        window.db.saveData(data);
        return true;
    },

    // إضافة درس داخل موديول
    addModuleLesson: (courseId, moduleId, lessonData) => {
        const data = window.db.getData();
        const course = data.courses.find(c => c.id === parseInt(courseId));
        if (!course) return false;
        if (!course.modules) course.modules = [];
        let mod;
        if (moduleId) {
            mod = course.modules.find(m => m.id === parseInt(moduleId));
        }
        if (!mod) mod = course.modules[0];
        if (!mod) {
            mod = { id: Date.now(), title: 'المحتوى الرئيسي', order: 0, lessons: [] };
            course.modules.push(mod);
        }
        if (!mod.lessons) mod.lessons = [];
        lessonData.id = Date.now();
        mod.lessons.push(lessonData);
        window.db.saveData(data);
        return lessonData;
    }
};

initDB();

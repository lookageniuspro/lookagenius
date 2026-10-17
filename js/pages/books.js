/**
 * books.js — Digital Books & Study Curricula Platform for LookaGenius Academy
 * Covers: Egypt 🇪🇬, Saudi Arabia 🇸🇦, UAE 🇦🇪, Qatar 🇶🇦, Kuwait 🇰🇼, Jordan 🇯🇴, and International Curricula 🌐
 * Features: Hierarchical Cascading Filters, Live Search, PDF Online Reader Modal, Direct Downloads, Deep Link URL Sync.
 */

(() => {
    'use strict';

    // Comprehensive Digital Library Catalog (30+ High-Demand Curricula & Textbooks)
    const BOOKS_CATALOG = [
        // ======================= EGYPT (مصر) =======================
        {
            id: 'eg-sec3-phys',
            title: 'كتاب الوزارة الرسمي في الفيزياء — الصف الثالث الثانوي 2026',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'secondary',
            stageName: 'الثانوية العامة',
            grade: 'sec3',
            gradeName: 'الصف الثالث الثانوي',
            subject: 'physics',
            subjectName: 'الفيزياء',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التربية والتعليم والتعليم الفني المصرية',
            size: '28.4 MB',
            pages: 312,
            year: '2026',
            downloads: 48920,
            rating: 4.9,
            icon: 'fa-atom',
            description: 'النسخة الأصلية المعتمدة لكتاب الوزارة في مادة الفيزياء للثانوية العامة متضمناً الكهربية والتيار المتردد والفيزياء الحديثة وفق أحدث التعديلات.'
        },
        {
            id: 'eg-sec3-chem-bank',
            title: 'بنك أسئلة الكيمياء الشامل والامتحانات الوزارية السابقة',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'secondary',
            stageName: 'الثانوية العامة',
            grade: 'sec3',
            gradeName: 'الصف الثالث الثانوي',
            subject: 'chemistry',
            subjectName: 'الكيمياء',
            type: 'questions',
            typeName: 'بنك أسئلة',
            author: 'سلسلة عباقرة الكيمياء — LookaGenius',
            size: '19.2 MB',
            pages: 240,
            year: '2026',
            downloads: 35110,
            rating: 4.95,
            icon: 'fa-flask-vial',
            description: 'أقوى بنك أسئلة يضم أكثر من 1800 سؤال بنظام البابل شيت مع نماذج الإجابات التفصيلية وتفسير الأسئلة المقالية في الكيمياء العضوية والتحليلية.'
        },
        {
            id: 'eg-sec3-math-pure',
            title: 'مذكرة التفوق الذهبية في التفاضل والتكامل والجبر والهندسة الفراغية',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'secondary',
            stageName: 'الثانوية العامة',
            grade: 'sec3',
            gradeName: 'الصف الثالث الثانوي',
            subject: 'math',
            subjectName: 'الرياضيات البحتة',
            type: 'notes',
            typeName: 'مذكرة شرح',
            author: 'نخبة معلمي الرياضيات بأكاديمية LookaGenius',
            size: '22.8 MB',
            pages: 275,
            year: '2026',
            downloads: 41200,
            rating: 4.88,
            icon: 'fa-calculator',
            description: 'شرح مبسط مع خرائط ذهنية وقوانين الرياضيات البحتة محلولة بالخطوات لطلاب شعبة علمي رياضة 2026.'
        },
        {
            id: 'eg-sec3-ar-revision',
            title: 'مراجعة ليلة الامتحان النهائية في اللغة العربية والنحو الشامل',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'secondary',
            stageName: 'الثانوية العامة',
            grade: 'sec3',
            gradeName: 'الصف الثالث الثانوي',
            subject: 'arabic',
            subjectName: 'اللغة العربية',
            type: 'revision',
            typeName: 'مراجعة نهائية',
            author: 'قسم اللغة العربية — LookaGenius',
            size: '14.6 MB',
            pages: 130,
            year: '2026',
            downloads: 62400,
            rating: 4.97,
            icon: 'fa-book-open',
            description: 'تجميعة ثوابت الإعراب، البلاغة، القراءة المتحررة، والنصوص والأدب مع ملخص قصة الأيام وأهم تكات الامتحان.'
        },
        {
            id: 'eg-sec1-integrated-sci',
            title: 'كتاب العلوم المتكاملة الجديد — الصف الأول الثانوي 2026',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية',
            grade: 'sec1',
            gradeName: 'الصف الأول الثانوي',
            subject: 'science',
            subjectName: 'العلوم المتكاملة',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التربية والتعليم المصرية',
            size: '24.1 MB',
            pages: 210,
            year: '2026',
            downloads: 29500,
            rating: 4.85,
            icon: 'fa-microscope',
            description: 'كتاب منهج العلوم المتكاملة المطور حديثاً للصف الأول الثانوي الذي يدمج الفيزياء والكيمياء والأحياء والبيئة.'
        },
        {
            id: 'eg-prep3-math',
            title: 'كتاب ومذكرة الجبر والهندسة التحليلية وحساب المثلثات — الشهادة الإعدادية',
            country: 'egypt',
            countryName: 'مصر',
            flag: '🇪🇬',
            stage: 'prep',
            stageName: 'المرحلة الإعدادية',
            grade: 'prep3',
            gradeName: 'الصف الثالث الإعدادي',
            subject: 'math',
            subjectName: 'الرياضيات',
            type: 'notes',
            typeName: 'مذكرة شرح',
            author: 'أكاديمية LookaGenius',
            size: '16.5 MB',
            pages: 180,
            year: '2026',
            downloads: 38700,
            rating: 4.89,
            icon: 'fa-shapes',
            description: 'مذكرة الإعدادية المتكاملة للجبر والهندسة وحساب المثلثات مع بنك أسئلة المحافظات ونماذج الوزارة الاسترشادية.'
        },

        // ======================= SAUDI ARABIA (المملكة العربية السعودية) =======================
        {
            id: 'sa-sec-math-3',
            title: 'كتاب الرياضيات 3 — مسارات الثانوية العامة السعودية 2026',
            country: 'saudi',
            countryName: 'المملكة العربية السعودية',
            flag: '🇸🇦',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية (المسارات)',
            grade: 'secondary3',
            gradeName: 'السنة الثالثة الثانوية',
            subject: 'math',
            subjectName: 'الرياضيات',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التعليم بالمملكة العربية السعودية',
            size: '32.1 MB',
            pages: 288,
            year: '2026',
            downloads: 39800,
            rating: 4.92,
            icon: 'fa-square-root-variable',
            description: 'منهج الرياضيات المعتمد لمسار علوم الحاسب والهندسة ومسار الصحة والحياة والمسار العام للثانوي السعودي الطبعة الحديثة.'
        },
        {
            id: 'sa-qudrat-gold',
            title: 'التجميعات الذهبية للقدرات العامة (القسم الكمي واللفظي) 2026',
            country: 'saudi',
            countryName: 'المملكة العربية السعودية',
            flag: '🇸🇦',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية والقدرات',
            grade: 'secondary2',
            gradeName: 'اختبارات القدرات والتحصيلي',
            subject: 'math',
            subjectName: 'القدرات العامة (قياس)',
            type: 'questions',
            typeName: 'تجميعات وبنوك أسئلة',
            author: 'فريق عباقرة قياس — LookaGenius',
            size: '26.4 MB',
            pages: 360,
            year: '2026',
            downloads: 71200,
            rating: 4.98,
            icon: 'fa-brain',
            description: 'أشمل تجميعة لنماذج المحوسب 120 نموذج المحدثة مع الحلول التكتيكية السريعة وأسرار الحصول على +95%.'
        },
        {
            id: 'sa-tahsili-sci',
            title: 'دليل التحصيلي العلمي الشامل (رياضيات - فيزياء - كيمياء - أحياء)',
            country: 'saudi',
            countryName: 'المملكة العربية السعودية',
            flag: '🇸🇦',
            stage: 'secondary',
            stageName: 'التحصيلي العلمي',
            grade: 'secondary3',
            gradeName: 'الثالث الثانوي / خريجون',
            subject: 'physics',
            subjectName: 'التحصيلي العلمي (قياس)',
            type: 'revision',
            typeName: 'مراجعة نهائية',
            author: 'منصة LookaGenius السعودية',
            size: '34.8 MB',
            pages: 410,
            year: '2026',
            downloads: 55400,
            rating: 4.96,
            icon: 'fa-graduation-cap',
            description: 'تغطية كاملة لجميع تجميعات أسئلة هيئة تقويم التعليم والتدريب (قياس) مع خرائط المفاهيم والاختبارات المحاكية.'
        },
        {
            id: 'sa-sec-ai-data',
            title: 'كتاب علم البيانات والذكاء الاصطناعي — مسار علوم الحاسب والهندسة',
            country: 'saudi',
            countryName: 'المملكة العربية السعودية',
            flag: '🇸🇦',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية (المسارات)',
            grade: 'secondary2',
            gradeName: 'السنة الثانية الثانوية',
            subject: 'cs',
            subjectName: 'الذكاء الاصطناعي والبيانات',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التعليم السعودية',
            size: '25.0 MB',
            pages: 230,
            year: '2026',
            downloads: 24600,
            rating: 4.87,
            icon: 'fa-robot',
            description: 'المنهج الوزاري السعودي الحديث في أسس تعلم الآلة، لغة بايثون، ومعالجة وتحليل البيانات الضخمة.'
        },
        {
            id: 'sa-mid3-science',
            title: 'كتاب العلوم — الصف الثالث متوسط (الفصول الدراسية الثلاثة)',
            country: 'saudi',
            countryName: 'المملكة العربية السعودية',
            flag: '🇸🇦',
            stage: 'prep',
            stageName: 'المرحلة المتوسطة',
            grade: 'mid3',
            gradeName: 'الصف الثالث المتوسط',
            subject: 'science',
            subjectName: 'العلوم',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التعليم السعودية',
            size: '29.7 MB',
            pages: 260,
            year: '2026',
            downloads: 19800,
            rating: 4.82,
            icon: 'fa-flask',
            description: 'كتاب علوم الصف الثالث متوسط كاملاً بجميع فصوله وتجاربه المعملية وأنشطة التفكير الناقد.'
        },

        // ======================= UAE (دولة الإمارات العربية المتحدة) =======================
        {
            id: 'uae-g12-adv-phys',
            title: 'Physics Advanced Curriculum — Grade 12 (MOE UAE 2026)',
            country: 'uae',
            countryName: 'دولة الإمارات',
            flag: '🇦🇪',
            stage: 'secondary',
            stageName: 'المسار المتقدم والنخبة',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر (Grade 12)',
            subject: 'physics',
            subjectName: 'الفيزياء المتقدمة',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'Ministry of Education — United Arab Emirates',
            size: '38.2 MB',
            pages: 350,
            year: '2026',
            downloads: 28400,
            rating: 4.91,
            icon: 'fa-bolt-lightning',
            description: 'The official physics student coursebook for UAE Advanced Stream covering electromagnetism, optics, quantum theory, and nuclear physics.'
        },
        {
            id: 'uae-emsat-math-guide',
            title: 'دليل اختبار الإمارات القياسي الشامل إمسات رياضيات (EmSAT Achieve Math)',
            country: 'uae',
            countryName: 'دولة الإمارات',
            flag: '🇦🇪',
            stage: 'secondary',
            stageName: 'اختبارات EmSAT الوطنية',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر / خريجون',
            subject: 'math',
            subjectName: 'رياضيات EmSAT',
            type: 'questions',
            typeName: 'بنوك أسئلة واختبارات',
            author: 'LookaGenius UAE Assessment Team',
            size: '21.5 MB',
            pages: 290,
            year: '2026',
            downloads: 36700,
            rating: 4.96,
            icon: 'fa-chart-line',
            description: 'أقوى تدريبات لاختبار إمسات الرياضيات القياسي مع بنك الأسئلة المعتمد ونماذج المحاكاة للحصول على علامة 1500+.'
        },
        {
            id: 'uae-g11-pure-math',
            title: 'كتاب الرياضيات البحتة — الصف الحادي عشر المتقدم 2026',
            country: 'uae',
            countryName: 'دولة الإمارات',
            flag: '🇦🇪',
            stage: 'secondary',
            stageName: 'المسار المتقدم',
            grade: 'grade11',
            gradeName: 'الصف الحادي عشر (Grade 11)',
            subject: 'math',
            subjectName: 'الرياضيات',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التربية والتعليم الإماراتية',
            size: '30.1 MB',
            pages: 310,
            year: '2026',
            downloads: 22100,
            rating: 4.88,
            icon: 'fa-subscript',
            description: 'منهج الرياضيات البحتة المطور للصف 11 متقدم متضمناً الدوال واللوغاريتمات وحساب المثلثات والمتجهات.'
        },

        // ======================= QATAR (دولة قطر) =======================
        {
            id: 'qa-g12-adv-math',
            title: 'كتاب الرياضيات المتقدمة — الصف الثاني عشر (المسار العلمي والتكنولوجي)',
            country: 'qatar',
            countryName: 'دولة قطر',
            flag: '🇶🇦',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر (الثانوية العامة)',
            subject: 'math',
            subjectName: 'الرياضيات المتقدمة',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التربية والتعليم والتعليم العالي — دولة قطر',
            size: '33.4 MB',
            pages: 320,
            year: '2026',
            downloads: 18700,
            rating: 4.9,
            icon: 'fa-infinity',
            description: 'كتاب الوزارة القطري الرسمي المعتمد للرياضيات المتقدمة للفصلين الأول والثاني لطلبة المسار العلمي والتكنولوجي.'
        },
        {
            id: 'qa-g12-chem-notes',
            title: 'مذكرة الوافي في الكيمياء ونماذج الاختبارات الوطنية القطرية',
            country: 'qatar',
            countryName: 'دولة قطر',
            flag: '🇶🇦',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر',
            subject: 'chemistry',
            subjectName: 'الكيمياء',
            type: 'notes',
            typeName: 'مذكرة شرح',
            author: 'أكاديمية LookaGenius — فرع الخليج',
            size: '17.8 MB',
            pages: 195,
            year: '2026',
            downloads: 14200,
            rating: 4.87,
            icon: 'fa-vial-circle-check',
            description: 'شرح مبسط لمنهج الكيمياء للشهادة الثانوية القطرية مع بنك أسئلة الوزارة ونماذج اختبار نهاية الفصل الدراسي.'
        },

        // ======================= KUWAIT (دولة الكويت) =======================
        {
            id: 'kw-g12-phys-book',
            title: 'كتاب الفيزياء — الصف الثاني عشر العلمي (وزارة التربية الكويتية 2026)',
            country: 'kuwait',
            countryName: 'دولة الكويت',
            flag: '🇰🇼',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر علمي',
            subject: 'physics',
            subjectName: 'الفيزياء',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'قطاع البحوث التربوية والمناهج — وزارة التربية بدولة الكويت',
            size: '27.9 MB',
            pages: 280,
            year: '2026',
            downloads: 23400,
            rating: 4.93,
            icon: 'fa-magnet',
            description: 'النسخة الأصلية المعتمدة لمنهج الفيزياء للصف 12 علمي كويت مع الأنشطة المعملية وأسئلة التقويم لكل وحدة.'
        },
        {
            id: 'kw-g12-bank-math',
            title: 'بنك أسئلة التوجيه الفني العام للرياضيات ونماذج امتحانات الفترة',
            country: 'kuwait',
            countryName: 'دولة الكويت',
            flag: '🇰🇼',
            stage: 'secondary',
            stageName: 'المرحلة الثانوية',
            grade: 'grade12',
            gradeName: 'الصف الثاني عشر علمي',
            subject: 'math',
            subjectName: 'الرياضيات',
            type: 'questions',
            typeName: 'بنوك أسئلة',
            author: 'التوجيه الفني العام للرياضيات — الكويت',
            size: '18.9 MB',
            pages: 220,
            year: '2026',
            downloads: 31500,
            rating: 4.95,
            icon: 'fa-file-lines',
            description: 'كافة نماذج امتحانات الثانوية العامة في الكويت للسنوات السابقة مع نماذج الإجابة الرسمية المعتمدة وتوزيع الدرجات.'
        },

        // ======================= JORDAN (المملكة الأردنية الهاشمية) =======================
        {
            id: 'jo-tawjihi-math-sci',
            title: 'كتاب الرياضيات العلمي التوجيهي — منهاج كولينز المطور الأردن 2026',
            country: 'jordan',
            countryName: 'المملكة الأردنية',
            flag: '🇯🇴',
            stage: 'secondary',
            stageName: 'مرحلة التوجيهي',
            grade: 'tawjihi',
            gradeName: 'التوجيهي الأردني (الثانوية العامة)',
            subject: 'math',
            subjectName: 'الرياضيات العلمي',
            type: 'textbook',
            typeName: 'كتاب الوزارة',
            author: 'وزارة التربية والتعليم الأردنية بالتعاون مع كولينز',
            size: '35.6 MB',
            pages: 360,
            year: '2026',
            downloads: 32100,
            rating: 4.94,
            icon: 'fa-square-root-alt',
            description: 'كتاب الرياضيات العلمي التوجيهي ف1 وف2 وفق منهاج كولينز العالمي المطور مع حلول تمارين الكتاب والأسئلة الوزارية.'
        },
        {
            id: 'jo-tawjihi-phys-past',
            title: 'أسئلة السنوات السابقة الوزارية للفيزياء التوجيهي مع الإجابة النموذجية',
            country: 'jordan',
            countryName: 'المملكة الأردنية',
            flag: '🇯🇴',
            stage: 'secondary',
            stageName: 'مرحلة التوجيهي',
            grade: 'tawjihi',
            gradeName: 'التوجيهي الأردني',
            subject: 'physics',
            subjectName: 'الفيزياء',
            type: 'questions',
            typeName: 'أسئلة وزارية',
            author: 'فريق أساتذة التوجيهي — LookaGenius',
            size: '23.4 MB',
            pages: 260,
            year: '2026',
            downloads: 29800,
            rating: 4.91,
            icon: 'fa-lightbulb',
            description: 'تجميعة شاملة لكل دورات امتحانات التوجيهي الأردني السابقة الصيفية والشتوية والتكميلية مع سلالم التصحيح.'
        },

        // ======================= INTERNATIONAL (المناهج الدولية) =======================
        {
            id: 'int-cambridge-igcse-phys',
            title: 'Cambridge IGCSE™ Physics Coursebook (0625 / 0972) — 2024-2026 Syllabus',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'British Curriculum (IGCSE)',
            grade: 'igcse',
            gradeName: 'IGCSE / O-Level (Grade 9-10)',
            subject: 'physics',
            subjectName: 'Physics (0625)',
            type: 'textbook',
            typeName: 'International Textbook',
            author: 'Cambridge Assessment International Education',
            size: '46.5 MB',
            pages: 480,
            year: '2026',
            downloads: 54300,
            rating: 4.97,
            icon: 'fa-globe',
            description: 'The authoritative Cambridge IGCSE Physics coursebook fully tailored for the updated syllabus with comprehensive exam preparation exercises.'
        },
        {
            id: 'int-cambridge-math-classified',
            title: 'Cambridge IGCSE Mathematics (0580) Extended Classified Past Papers',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'British Curriculum (IGCSE)',
            grade: 'igcse',
            gradeName: 'IGCSE / Extended',
            subject: 'math',
            subjectName: 'Mathematics (0580)',
            type: 'questions',
            typeName: 'Classified Past Papers',
            author: 'LookaGenius International Department',
            size: '39.8 MB',
            pages: 512,
            year: '2026',
            downloads: 48200,
            rating: 4.96,
            icon: 'fa-compass-drafting',
            description: 'Topic-by-topic classified past papers from 2018 to 2025 with official mark schemes and step-by-step model workings for A* aspirants.'
        },
        {
            id: 'int-digital-sat-official',
            title: 'The Official Digital SAT® Study Guide & Practice Tests (College Board)',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'American Diploma',
            grade: 'sat_ap',
            gradeName: 'American Diploma / SAT & AP',
            subject: 'math',
            subjectName: 'SAT Math & Reading',
            type: 'textbook',
            typeName: 'Official Prep Guide',
            author: 'The College Board & LookaGenius SAT Mentors',
            size: '31.2 MB',
            pages: 420,
            year: '2026',
            downloads: 64100,
            rating: 4.98,
            icon: 'fa-award',
            description: 'Comprehensive preparation for the adaptive Digital SAT test covering module strategies, Desmos calculator shortcuts, and real practice tests.'
        },
        {
            id: 'int-ap-calculus-ab-bc',
            title: 'AP Calculus AB & BC Elite Prep Book: Limits, Derivatives & Integrals',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'Advanced Placement (AP)',
            grade: 'sat_ap',
            gradeName: 'Grade 11-12 / AP',
            subject: 'math',
            subjectName: 'AP Calculus AB/BC',
            type: 'notes',
            typeName: 'AP Prep Notes',
            author: 'Advanced STEM Faculty — LookaGenius',
            size: '27.4 MB',
            pages: 340,
            year: '2026',
            downloads: 27900,
            rating: 4.92,
            icon: 'fa-chart-area',
            description: 'In-depth AP Calculus study guide with free-response question (FRQ) grading rubrics, series tests, and scoring tips to achieve a 5.'
        },
        {
            id: 'int-ib-math-aa-hl',
            title: 'IB Diploma Mathematics: Analysis and Approaches (AA) HL Course Companion',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'International Baccalaureate (IB)',
            grade: 'ib_diploma',
            gradeName: 'IB Diploma Programme (DP 1-2)',
            subject: 'math',
            subjectName: 'Math AA HL',
            type: 'textbook',
            typeName: 'IB Course Companion',
            author: 'Oxford University Press / IB Organization',
            size: '52.1 MB',
            pages: 620,
            year: '2026',
            downloads: 21500,
            rating: 4.94,
            icon: 'fa-certificate',
            description: 'Full coverage of the rigorous IB Math Analysis & Approaches HL curriculum with Internal Assessment (IA) guidance and past paper analysis.'
        },
        {
            id: 'int-edexcel-igcse-chem',
            title: 'Pearson Edexcel International GCSE (9-1) Chemistry Revision Guide',
            country: 'international',
            countryName: 'المناهج الدولية',
            flag: '🎓',
            stage: 'international',
            stageName: 'Edexcel Curriculum',
            grade: 'igcse',
            gradeName: 'Edexcel IGCSE',
            subject: 'chemistry',
            subjectName: 'Chemistry (4CH1)',
            type: 'revision',
            typeName: 'Revision Guide',
            author: 'Pearson Edexcel Education',
            size: '23.9 MB',
            pages: 230,
            year: '2026',
            downloads: 31200,
            rating: 4.89,
            icon: 'fa-vials',
            description: 'Concise, high-yield summary notes with full-colour diagrams, equations, and practice questions for Pearson Edexcel 4CH1 examinations.'
        }
    ];

    // State machine for cascading filters
    const filterState = {
        country: 'all',
        stage: 'all',
        grade: 'all',
        subject: 'all',
        type: 'all',
        searchQuery: ''
    };

    // Grade options dictionary mapped by stage and country
    const GRADE_CONFIG = {
        all: [
            { value: 'all', label: 'جميع الصفوف الدراسية' },
            { value: 'sec3', label: 'الصف الثالث الثانوي / الثانوية العامة' },
            { value: 'sec2', label: 'الصف الثاني الثانوي / 11' },
            { value: 'sec1', label: 'الصف الأول الثانوي / 10' },
            { value: 'prep3', label: 'الصف الثالث الإعدادي / المتوسط' },
            { value: 'tawjihi', label: 'التوجيهي الأردني' },
            { value: 'grade12', label: 'Grade 12 (الثاني عشر)' },
            { value: 'grade11', label: 'Grade 11 (الحادي عشر)' },
            { value: 'igcse', label: 'IGCSE / O-Level' },
            { value: 'sat_ap', label: 'Digital SAT & AP' },
            { value: 'ib_diploma', label: 'IB Diploma Programme' }
        ],
        primary: [
            { value: 'all', label: 'جميع صفوف المرحلة الابتدائية' },
            { value: 'grade1', label: 'الصف الأول الابتدائي (Grade 1)' },
            { value: 'grade2', label: 'الصف الثاني الابتدائي (Grade 2)' },
            { value: 'grade3', label: 'الصف الثالث الابتدائي (Grade 3)' },
            { value: 'grade4', label: 'الصف الرابع الابتدائي (Grade 4)' },
            { value: 'grade5', label: 'الصف الخامس الابتدائي (Grade 5)' },
            { value: 'grade6', label: 'الصف السادس الابتدائي (Grade 6)' }
        ],
        prep: [
            { value: 'all', label: 'جميع صفوف الإعدادي / المتوسط' },
            { value: 'prep1', label: 'الصف الأول الإعدادي / المتوسط (G7)' },
            { value: 'prep2', label: 'الصف الثاني الإعدادي / المتوسط (G8)' },
            { value: 'prep3', label: 'الصف الثالث الإعدادي / المتوسط (G9 / الشهادة)' }
        ],
        secondary: [
            { value: 'all', label: 'جميع صفوف المرحلة الثانوية' },
            { value: 'sec1', label: 'الصف الأول الثانوي (عاشر / السنة الأولى)' },
            { value: 'sec2', label: 'الصف الثاني الثانوي (11 / مسارات)' },
            { value: 'sec3', label: 'الصف الثالث الثانوي (12 / الثانوية العامة)' },
            { value: 'tawjihi', label: 'التوجيهي الأردني (علمي وأدبي)' },
            { value: 'grade12', label: 'الصف الثاني عشر الإماراتي / القطري / الكويتي' }
        ],
        international: [
            { value: 'all', label: 'جميع البرامج الدولية' },
            { value: 'igcse', label: 'Cambridge & Edexcel IGCSE / O-Level' },
            { value: 'as_level', label: 'Cambridge AS-Level (Grade 11)' },
            { value: 'a_level', label: 'Cambridge / Edexcel A-Level (Grade 12)' },
            { value: 'sat_ap', label: 'American Diploma / Digital SAT & AP' },
            { value: 'ib_diploma', label: 'IB Diploma (International Baccalaureate DP)' }
        ]
    };

    // DOM Elements
    let booksGrid = null;
    let booksResultCount = null;
    let booksSearchInput = null;
    let searchClearBtn = null;
    let stageSelect = null;
    let gradeSelect = null;
    let subjectSelect = null;
    let countryTabsContainer = null;
    let resetAllFiltersBtn = null;
    let activeFilterTagsList = null;

    // Modal elements
    let bookReaderModal = null;
    let closeReaderModalBtn = null;
    let readerModalTitle = null;
    let readerPageContainer = null;
    let readerPageContent = null;
    let readerPageCounter = null;
    let footerPageNumber = null;
    let prevPageBtn = null;
    let nextPageBtn = null;
    let modalInstantDownloadBtn = null;
    let readerZoomInBtn = null;
    let readerZoomOutBtn = null;

    // Request modal elements
    let requestBookModal = null;
    let openRequestBookBtn = null;
    let closeRequestModalBtn = null;
    let requestBookForm = null;

    // Toast
    let booksToast = null;
    let booksToastMsg = null;

    // Current open book in reader
    let currentReaderBook = null;
    let currentReaderPage = 1;
    let currentReaderZoom = 1;

    // Initialize Page
    const init = () => {
        // Cache DOM elements
        booksGrid = document.getElementById('booksGrid');
        booksResultCount = document.getElementById('booksResultCount');
        booksSearchInput = document.getElementById('booksSearchInput');
        searchClearBtn = document.getElementById('searchClearBtn');
        stageSelect = document.getElementById('stageSelect');
        gradeSelect = document.getElementById('gradeSelect');
        subjectSelect = document.getElementById('subjectSelect');
        countryTabsContainer = document.getElementById('countryTabsContainer');
        resetAllFiltersBtn = document.getElementById('resetAllFiltersBtn');
        activeFilterTagsList = document.getElementById('activeFilterTagsList');

        // Reader Modal
        bookReaderModal = document.getElementById('bookReaderModal');
        closeReaderModalBtn = document.getElementById('closeReaderModalBtn');
        readerModalTitle = document.getElementById('readerModalTitle');
        readerPageContainer = document.getElementById('readerPageContainer');
        readerPageContent = document.getElementById('readerPageContent');
        readerPageCounter = document.getElementById('readerPageCounter');
        footerPageNumber = document.getElementById('footerPageNumber');
        prevPageBtn = document.getElementById('prevPageBtn');
        nextPageBtn = document.getElementById('nextPageBtn');
        modalInstantDownloadBtn = document.getElementById('modalInstantDownloadBtn');
        readerZoomInBtn = document.getElementById('readerZoomInBtn');
        readerZoomOutBtn = document.getElementById('readerZoomOutBtn');

        // Request Modal
        requestBookModal = document.getElementById('requestBookModal');
        openRequestBookBtn = document.getElementById('openRequestBookBtn');
        closeRequestModalBtn = document.getElementById('closeRequestModalBtn');
        requestBookForm = document.getElementById('requestBookForm');

        // Toast
        booksToast = document.getElementById('booksToast');
        booksToastMsg = document.getElementById('booksToastMsg');

        // Read query params from URL on initial load for deep-linking
        loadFiltersFromUrl();

        // Populate grade select dropdown based on stage
        updateGradeDropdown();

        // Attach Event Listeners
        attachEventListeners();

        // Initial render
        renderBooks();
    };

    // Load filters from URL
    const loadFiltersFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('country')) filterState.country = urlParams.get('country');
        if (urlParams.has('stage')) filterState.stage = urlParams.get('stage');
        if (urlParams.has('grade')) filterState.grade = urlParams.get('grade');
        if (urlParams.has('subject')) filterState.subject = urlParams.get('subject');
        if (urlParams.has('type')) filterState.type = urlParams.get('type');
        if (urlParams.has('q')) filterState.searchQuery = urlParams.get('q');

        // Sync inputs with URL state
        if (stageSelect && filterState.stage) stageSelect.value = filterState.stage;
        if (subjectSelect && filterState.subject) subjectSelect.value = filterState.subject;
        if (booksSearchInput && filterState.searchQuery) {
            booksSearchInput.value = filterState.searchQuery;
            if (searchClearBtn) searchClearBtn.style.display = 'block';
        }

        // Sync country tabs
        if (countryTabsContainer) {
            const tabs = countryTabsContainer.querySelectorAll('.country-tab-btn');
            tabs.forEach(t => {
                if (t.dataset.country === filterState.country) t.classList.add('active');
                else t.classList.remove('active');
            });
        }

        // Sync content type pills
        const typePills = document.querySelectorAll('.type-pill-btn');
        typePills.forEach(p => {
            if (p.dataset.type === filterState.type) p.classList.add('active');
            else p.classList.remove('active');
        });

        // Direct book opener if bookId is present in URL
        if (urlParams.has('bookId')) {
            const targetBook = BOOKS_CATALOG.find(b => b.id === urlParams.get('bookId'));
            if (targetBook) {
                setTimeout(() => openReader(targetBook), 350);
            }
        }
    };

    // Update URL Query String seamlessly for SEO and bookmarking
    const syncUrlState = () => {
        const url = new URL(window.location);
        const params = url.searchParams;

        if (filterState.country !== 'all') params.set('country', filterState.country);
        else params.delete('country');

        if (filterState.stage !== 'all') params.set('stage', filterState.stage);
        else params.delete('stage');

        if (filterState.grade !== 'all') params.set('grade', filterState.grade);
        else params.delete('grade');

        if (filterState.subject !== 'all') params.set('subject', filterState.subject);
        else params.delete('subject');

        if (filterState.type !== 'all') params.set('type', filterState.type);
        else params.delete('type');

        if (filterState.searchQuery.trim()) params.set('q', filterState.searchQuery.trim());
        else params.delete('q');

        window.history.replaceState({}, '', `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`);
    };

    // Dynamically update Grade Dropdown when Stage or Country changes
    const updateGradeDropdown = () => {
        if (!gradeSelect) return;
        const currentStage = filterState.stage || 'all';
        const optionsList = GRADE_CONFIG[currentStage] || GRADE_CONFIG['all'];

        gradeSelect.innerHTML = '';
        optionsList.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.value;
            el.textContent = opt.label;
            if (opt.value === filterState.grade) el.selected = true;
            gradeSelect.appendChild(el);
        });

        // If the previously selected grade is not in this new list, revert to 'all'
        const hasValue = optionsList.some(o => o.value === filterState.grade);
        if (!hasValue) {
            filterState.grade = 'all';
            gradeSelect.value = 'all';
        }
    };

    // Attach UI Event Listeners
    const attachEventListeners = () => {
        // Country tabs click
        if (countryTabsContainer) {
            countryTabsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.country-tab-btn');
                if (!btn) return;
                countryTabsContainer.querySelectorAll('.country-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterState.country = btn.dataset.country;

                // If international selected, suggest international stage
                if (filterState.country === 'international' && filterState.stage === 'all') {
                    filterState.stage = 'international';
                    if (stageSelect) stageSelect.value = 'international';
                    updateGradeDropdown();
                }

                syncUrlState();
                renderBooks();
            });
        }

        // Stage select change
        if (stageSelect) {
            stageSelect.addEventListener('change', () => {
                filterState.stage = stageSelect.value;
                updateGradeDropdown();
                syncUrlState();
                renderBooks();
            });
        }

        // Grade select change
        if (gradeSelect) {
            gradeSelect.addEventListener('change', () => {
                filterState.grade = gradeSelect.value;
                syncUrlState();
                renderBooks();
            });
        }

        // Subject select change
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => {
                filterState.subject = subjectSelect.value;
                syncUrlState();
                renderBooks();
            });
        }

        // Content type pills click
        document.querySelectorAll('.type-pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterState.type = btn.dataset.type;
                syncUrlState();
                renderBooks();
            });
        });

        // Search input handling
        if (booksSearchInput) {
            booksSearchInput.addEventListener('input', () => {
                filterState.searchQuery = booksSearchInput.value.trim().toLowerCase();
                if (searchClearBtn) {
                    searchClearBtn.style.display = filterState.searchQuery ? 'block' : 'none';
                }
                syncUrlState();
                renderBooks();
            });
        }

        // Search clear button
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                booksSearchInput.value = '';
                filterState.searchQuery = '';
                searchClearBtn.style.display = 'none';
                syncUrlState();
                renderBooks();
            });
        }

        // Quick search hot tag buttons
        document.querySelectorAll('.quick-tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const term = btn.dataset.search;
                if (booksSearchInput) {
                    booksSearchInput.value = term;
                    filterState.searchQuery = term.toLowerCase();
                    if (searchClearBtn) searchClearBtn.style.display = 'block';
                    syncUrlState();
                    renderBooks();
                }
            });
        });

        // Reset all filters button
        if (resetAllFiltersBtn) {
            resetAllFiltersBtn.addEventListener('click', () => {
                filterState.country = 'all';
                filterState.stage = 'all';
                filterState.grade = 'all';
                filterState.subject = 'all';
                filterState.type = 'all';
                filterState.searchQuery = '';

                if (stageSelect) stageSelect.value = 'all';
                if (subjectSelect) subjectSelect.value = 'all';
                if (booksSearchInput) booksSearchInput.value = '';
                if (searchClearBtn) searchClearBtn.style.display = 'none';

                if (countryTabsContainer) {
                    countryTabsContainer.querySelectorAll('.country-tab-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.country === 'all');
                    });
                }

                document.querySelectorAll('.type-pill-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.type === 'all');
                });

                updateGradeDropdown();
                syncUrlState();
                renderBooks();
                showToast('تمت إعادة ضبط جميع الفلاتر');
            });
        }

        // FAQ Accordion
        document.querySelectorAll('.faq-question-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.faq-item-card');
                if (card) card.classList.toggle('open');
            });
        });

        // Reader Modal Controls
        if (closeReaderModalBtn) closeReaderModalBtn.addEventListener('click', closeReader);
        if (bookReaderModal) {
            bookReaderModal.addEventListener('click', (e) => {
                if (e.target === bookReaderModal) closeReader();
            });
        }

        if (prevPageBtn) prevPageBtn.addEventListener('click', () => stepReaderPage(-1));
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => stepReaderPage(1));

        if (readerZoomInBtn) {
            readerZoomInBtn.addEventListener('click', () => {
                if (currentReaderZoom < 1.4) {
                    currentReaderZoom += 0.1;
                    if (readerPageContainer) readerPageContainer.style.transform = `scale(${currentReaderZoom})`;
                }
            });
        }

        if (readerZoomOutBtn) {
            readerZoomOutBtn.addEventListener('click', () => {
                if (currentReaderZoom > 0.8) {
                    currentReaderZoom -= 0.1;
                    if (readerPageContainer) readerPageContainer.style.transform = `scale(${currentReaderZoom})`;
                }
            });
        }

        if (modalInstantDownloadBtn) {
            modalInstantDownloadBtn.addEventListener('click', () => {
                if (currentReaderBook) handleDownload(currentReaderBook.id);
            });
        }

        const readerDownloadTrigger = document.getElementById('readerDownloadTrigger');
        if (readerDownloadTrigger) {
            readerDownloadTrigger.addEventListener('click', () => {
                if (currentReaderBook) handleDownload(currentReaderBook.id);
            });
        }

        // Request Book Modal
        if (openRequestBookBtn && requestBookModal) {
            openRequestBookBtn.addEventListener('click', () => {
                requestBookModal.style.display = 'flex';
            });
        }

        if (closeRequestModalBtn && requestBookModal) {
            closeRequestModalBtn.addEventListener('click', () => {
                requestBookModal.style.display = 'none';
            });
        }

        if (requestBookModal) {
            requestBookModal.addEventListener('click', (e) => {
                if (e.target === requestBookModal) requestBookModal.style.display = 'none';
            });
        }

        if (requestBookForm) {
            requestBookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('reqBookTitle').value;
                requestBookModal.style.display = 'none';
                requestBookForm.reset();
                showToast(`تم استلام طلبك لـ "${title}" بنجاح! سنوفره خلال 24 ساعة.`);
            });
        }

        // Keyboard ESC to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeReader();
                if (requestBookModal) requestBookModal.style.display = 'none';
            }
        });
    };

    // Filter books matching current state
    const getFilteredBooks = () => {
        return BOOKS_CATALOG.filter(book => {
            // Country filter
            if (filterState.country !== 'all' && book.country !== filterState.country) {
                return false;
            }

            // Stage filter
            if (filterState.stage !== 'all' && book.stage !== filterState.stage) {
                return false;
            }

            // Grade filter
            if (filterState.grade !== 'all') {
                if (book.grade !== filterState.grade) {
                    // Check partial match for secondary general vs specific
                    const isSecMatch = (filterState.grade === 'sec3' && (book.grade === 'sec3' || book.grade === 'secondary3' || book.grade === 'grade12' || book.grade === 'tawjihi'));
                    if (!isSecMatch) return false;
                }
            }

            // Subject filter
            if (filterState.subject !== 'all' && book.subject !== filterState.subject) {
                return false;
            }

            // Content type filter
            if (filterState.type !== 'all' && book.type !== filterState.type) {
                return false;
            }

            // Search query filter
            if (filterState.searchQuery) {
                const q = filterState.searchQuery;
                const matchTitle = book.title.toLowerCase().includes(q);
                const matchDesc = book.description.toLowerCase().includes(q);
                const matchAuthor = book.author.toLowerCase().includes(q);
                const matchSubject = book.subjectName.toLowerCase().includes(q);
                const matchCountry = book.countryName.toLowerCase().includes(q);
                const matchGrade = book.gradeName.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchAuthor && !matchSubject && !matchCountry && !matchGrade) {
                    return false;
                }
            }

            return true;
        });
    };

    // Render active filter badges
    const renderActiveFilterBadges = () => {
        if (!activeFilterTagsList) return;
        activeFilterTagsList.innerHTML = '';

        const badges = [];

        if (filterState.country !== 'all') {
            const countryNames = {
                egypt: 'مصر 🇪🇬',
                saudi: 'السعودية 🇸🇦',
                uae: 'الإمارات 🇦🇪',
                qatar: 'قطر 🇶🇦',
                kuwait: 'الكويت 🇰🇼',
                jordan: 'الأردن 🇯🇴',
                international: 'المناهج الدولية 🎓'
            };
            badges.push({
                type: 'country',
                label: countryNames[filterState.country] || filterState.country
            });
        }

        if (filterState.stage !== 'all') {
            const stageLabels = {
                primary: 'ابتدائي',
                prep: 'إعدادي / متوسط',
                secondary: 'ثانوي / توجيهي',
                international: 'دولي'
            };
            badges.push({
                type: 'stage',
                label: `المرحلة: ${stageLabels[filterState.stage] || filterState.stage}`
            });
        }

        if (filterState.grade !== 'all' && gradeSelect) {
            const selectedOpt = gradeSelect.options[gradeSelect.selectedIndex];
            if (selectedOpt) {
                badges.push({
                    type: 'grade',
                    label: selectedOpt.textContent
                });
            }
        }

        if (filterState.subject !== 'all' && subjectSelect) {
            const selectedOpt = subjectSelect.options[subjectSelect.selectedIndex];
            if (selectedOpt) {
                badges.push({
                    type: 'subject',
                    label: selectedOpt.textContent
                });
            }
        }

        if (filterState.type !== 'all') {
            const typeLabels = {
                textbook: 'كتب الوزارة',
                notes: 'مذكرات شرح',
                questions: 'بنوك أسئلة',
                revision: 'مراجعة نهائية'
            };
            badges.push({
                type: 'type',
                label: typeLabels[filterState.type] || filterState.type
            });
        }

        if (filterState.searchQuery) {
            badges.push({
                type: 'query',
                label: `بحث: "${filterState.searchQuery}"`
            });
        }

        badges.forEach(b => {
            const tag = document.createElement('div');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `
                <span>${b.label}</span>
                <span class="tag-remove-btn" data-filter-type="${b.type}">&times;</span>
            `;
            activeFilterTagsList.appendChild(tag);
        });

        // Bind remove triggers
        activeFilterTagsList.querySelectorAll('.tag-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filterType;
                if (filterType === 'country') {
                    filterState.country = 'all';
                    if (countryTabsContainer) {
                        countryTabsContainer.querySelectorAll('.country-tab-btn').forEach(b => {
                            b.classList.toggle('active', b.dataset.country === 'all');
                        });
                    }
                } else if (filterType === 'stage') {
                    filterState.stage = 'all';
                    if (stageSelect) stageSelect.value = 'all';
                    updateGradeDropdown();
                } else if (filterType === 'grade') {
                    filterState.grade = 'all';
                    if (gradeSelect) gradeSelect.value = 'all';
                } else if (filterType === 'subject') {
                    filterState.subject = 'all';
                    if (subjectSelect) subjectSelect.value = 'all';
                } else if (filterType === 'type') {
                    filterState.type = 'all';
                    document.querySelectorAll('.type-pill-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.type === 'all');
                    });
                } else if (filterType === 'query') {
                    filterState.searchQuery = '';
                    if (booksSearchInput) booksSearchInput.value = '';
                    if (searchClearBtn) searchClearBtn.style.display = 'none';
                }

                syncUrlState();
                renderBooks();
            });
        });
    };

    // Render Books Grid
    const renderBooks = () => {
        if (!booksGrid) return;

        const filtered = getFilteredBooks();

        // Update count
        if (booksResultCount) {
            booksResultCount.textContent = filtered.length;
        }

        renderActiveFilterBadges();

        if (filtered.length === 0) {
            booksGrid.innerHTML = `
                <div class="empty-books-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <h3>لم يتم العثور على كتب تطابق هذا التصنيف</h3>
                    <p>جرّب تعديل خيارات الفلتر، أو تصفح كل المناهج، أو اطلب المذكرة التي تبحث عنها مجاناً عبر الزر أدناه.</p>
                    <button class="btn btn-outline" onclick="document.getElementById('resetAllFiltersBtn').click();" style="padding: 10px 24px; border-radius: 30px; border: 1px solid #00D4FF; color: #00D4FF; cursor: pointer; font-weight: 700; background: transparent;">
                        <i class="fa-solid fa-rotate-left"></i> عرض جميع الكتب
                    </button>
                </div>
            `;
            return;
        }

        booksGrid.innerHTML = filtered.map(book => {
            const badgeTypeClass = book.type === 'textbook' ? 'badge-type-textbook' : (book.type === 'notes' ? 'badge-type-notes' : 'badge-type-questions');

            return `
                <div class="book-card-item ag-glass" data-book-id="${book.id}">
                    <div>
                        <div class="book-card-top-badges">
                            <span class="badge-country-tag">
                                <span>${book.flag}</span>
                                <span>${book.countryName}</span>
                            </span>
                            <span class="badge-type-tag ${badgeTypeClass}">
                                ${book.typeName}
                            </span>
                        </div>

                        <div class="book-visual-box">
                            <i class="fa-solid ${book.icon} subject-icon-bg"></i>
                            <span class="book-grade-chip">${book.gradeName}</span>
                        </div>

                        <h3 class="book-title" title="${book.title}">${book.title}</h3>

                        <div class="book-author-meta">
                            <i class="fa-solid fa-award"></i>
                            <span>${book.author}</span>
                        </div>

                        <div class="book-specs-strip">
                            <div class="book-spec-item" title="حجم الملف">
                                <i class="fa-solid fa-file-pdf"></i>
                                <span>${book.size}</span>
                            </div>
                            <div class="book-spec-item" title="عدد الصفحات">
                                <i class="fa-solid fa-file-lines"></i>
                                <span>${book.pages} ص</span>
                            </div>
                            <div class="book-spec-item" title="إجمالي التحميلات">
                                <i class="fa-solid fa-cloud-arrow-down"></i>
                                <span>${book.downloads.toLocaleString()}</span>
                            </div>
                            <div class="book-spec-item" title="التقييم">
                                <i class="fa-solid fa-star" style="color: #ffaa00;"></i>
                                <span>${book.rating}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="book-action-buttons">
                            <button class="btn-card-read" data-action="read" data-book-id="${book.id}">
                                <i class="fa-solid fa-eye"></i> معاينة وقراءة
                            </button>
                            <button class="btn-card-download" data-action="download" data-book-id="${book.id}">
                                <i class="fa-solid fa-download"></i> تحميل PDF
                            </button>
                            <button class="btn-card-share" data-action="share" data-book-id="${book.id}">
                                <i class="fa-solid fa-share-nodes"></i> مشاركة رابط المذكرة
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach action handlers on rendered cards
        booksGrid.querySelectorAll('[data-action="read"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = btn.dataset.bookId;
                const book = BOOKS_CATALOG.find(b => b.id === bId);
                if (book) openReader(book);
            });
        });

        booksGrid.querySelectorAll('[data-action="download"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = btn.dataset.bookId;
                handleDownload(bId);
            });
        });

        booksGrid.querySelectorAll('[data-action="share"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bId = btn.dataset.bookId;
                handleShare(bId);
            });
        });
    };

    // Open Online Reader Modal
    const openReader = (book) => {
        if (!bookReaderModal) return;
        currentReaderBook = book;
        currentReaderPage = 1;
        currentReaderZoom = 1;

        if (readerModalTitle) readerModalTitle.textContent = `${book.title}`;
        if (readerPageContainer) readerPageContainer.style.transform = 'scale(1)';

        renderReaderPage();
        bookReaderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // Close Online Reader Modal
    const closeReader = () => {
        if (!bookReaderModal) return;
        bookReaderModal.style.display = 'none';
        document.body.style.overflow = '';
        currentReaderBook = null;
    };

    // Render single page simulation inside the reader
    const renderReaderPage = () => {
        if (!currentReaderBook || !readerPageContent) return;

        const totalPages = Math.min(currentReaderBook.pages, 45); // simulated preview pages
        if (readerPageCounter) readerPageCounter.textContent = `صفحة ${currentReaderPage} من ${totalPages}`;
        if (footerPageNumber) footerPageNumber.textContent = `${currentReaderPage} / ${totalPages}`;

        if (prevPageBtn) prevPageBtn.disabled = (currentReaderPage <= 1);
        if (nextPageBtn) nextPageBtn.disabled = (currentReaderPage >= totalPages);

        if (currentReaderPage === 1) {
            readerPageContent.innerHTML = `
                <div style="text-align: center; padding: 30px 10px;">
                    <div style="display: inline-block; padding: 12px 24px; border-radius: 50px; background: rgba(0, 212, 255, 0.1); border: 1px solid #00D4FF; color: #0284c7; font-weight: 800; font-size: 0.9rem; margin-bottom: 20px;">
                        ${currentReaderBook.flag} ${currentReaderBook.countryName} — ${currentReaderBook.stageName}
                    </div>
                    <h2 style="font-size: 1.8rem; font-weight: 900; color: #0f172a; margin-bottom: 12px; line-height: 1.4;">
                        ${currentReaderBook.title}
                    </h2>
                    <p style="color: #64748b; font-size: 1.05rem; margin-bottom: 25px;">
                        إصدار معتمد للعام الدراسي ${currentReaderBook.year} — ${currentReaderBook.author}
                    </p>
                    <div style="margin: 30px auto; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #A855F7); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);">
                        <i class="fa-solid ${currentReaderBook.icon}" style="font-size: 3rem; color: #fff;"></i>
                    </div>
                    <p style="color: #475569; font-size: 0.95rem; line-height: 1.8; max-width: 520px; margin: 0 auto;">
                        ${currentReaderBook.description}
                    </p>
                    <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; font-size: 0.88rem; color: #64748b;">
                        📖 تم تجهيز وتدقيق هذا المصدر التعليمي برعاية منصة <strong>LookaGenius Academy</strong> لخدمة الطلاب العرب والدوليين مجاناً.
                    </div>
                </div>
            `;
        } else {
            readerPageContent.innerHTML = `
                <div>
                    <h3 style="color: #0f172a; font-size: 1.35rem; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 18px;">
                        الوحدة الدراسية — الفصل ${currentReaderPage - 1}: المفاهيم والأهداف التطبيقية
                    </h3>
                    <p style="line-height: 2; color: #334155; font-size: 0.98rem; text-align: justify;">
                        تتضمن هذه الصفحة دراسة تفصيلية للقوانين الرياضية والنماذج العلمية المرتبطة بمادة <strong>${currentReaderBook.subjectName}</strong>. يجب على الطالب التركيز على التطبيقات المباشرة وحل مسائل الامتحانات الوزارية الاسترشادية لفهم آليات تقويم نواتج التعلم المستهدفة للعام 2026.
                    </p>
                    <div style="margin: 20px 0; padding: 20px; background: #f1f5f9; border-right: 4px solid #00D4FF; border-radius: 8px;">
                        <h4 style="margin: 0 0 8px; color: #0284c7; font-size: 1rem;"><i class="fa-solid fa-lightbulb"></i> إضاءة تعليمية هامة:</h4>
                        <p style="margin: 0; color: #475569; font-size: 0.9rem; line-height: 1.8;">
                            تأكد من مراجعة ملخص القوانين ونماذج الأسئلة المقالية الخاصة بهذا الدرس عبر منصة LookaGenius التفاعلية للحصول على أعلى الدرجات.
                        </p>
                    </div>
                    <p style="line-height: 2; color: #334155; font-size: 0.98rem;">
                        المعادلات الحاكمة والتمارين الملحقة متوفرة في ملحق الإجابات المعتمد في نهاية هذا الكتاب، مع أسئلة التفكير الناقد وبنوك الأسئلة المحدثة.
                    </p>
                </div>
            `;
        }
    };

    // Step page in reader
    const stepReaderPage = (delta) => {
        if (!currentReaderBook) return;
        const totalPages = Math.min(currentReaderBook.pages, 45);
        const newPage = currentReaderPage + delta;
        if (newPage >= 1 && newPage <= totalPages) {
            currentReaderPage = newPage;
            renderReaderPage();
        }
    };

    // Handle Direct Download Simulation
    const handleDownload = (bookId) => {
        const book = BOOKS_CATALOG.find(b => b.id === bookId);
        if (!book) return;

        book.downloads += 1;
        renderBooks();

        showToast(`بدأ تحميل "${book.title}" بصيغة PDF عالية الجودة (${book.size})`);

        // Simulating immediate file download trigger via data link
        const dummyContent = `%PDF-1.4\n%LookaGenius Academy Curriculum Platform\n%Title: ${book.title}\n%Country: ${book.countryName}\n%Year: 2026`;
        const blob = new Blob([dummyContent], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.download = `${book.id}-LookaGenius-2026.pdf`;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(downloadUrl);
    };

    // Handle Share Deep Link
    const handleShare = (bookId) => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?bookId=${bookId}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('تم نسخ رابط الكتاب المباشر إلى الحافظة!');
            }).catch(() => {
                showToast(`الرابط: ${shareUrl}`);
            });
        } else {
            showToast(`الرابط: ${shareUrl}`);
        }
    };

    // Toast notification display
    const showToast = (message) => {
        if (!booksToast) return;
        if (booksToastMsg) booksToastMsg.textContent = message;
        booksToast.classList.add('show');
        setTimeout(() => {
            booksToast.classList.remove('show');
        }, 3600);
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

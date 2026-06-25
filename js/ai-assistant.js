/**
 * ai-assistant.js
 * LookaGenius AI Assistant Engine
 * يدعم: Transformers.js (متصفح) + Gemini API + قوالب ذكية
 */

const AI_ASSISTANT = (() => {
    const AI_KEY = 'lookagenius_ai_settings';

    // النظام الأساسي (System Prompt) - شخصية احترافية متكاملة
    const SYSTEM_PROMPT = `أنت "مساعد LookaGenius الذكي" 🤖 - الذكاء الاصطناعي الرسمي لمنصة "LookaGenius" التعليمية العالمية.

🎯 هويتك:
- اسمك: "مساعد LookaGenius الذكي"
- أنت خبير في جميع المجالات التعليمية والأكاديمية والمهنية
- لديك خبرة واسعة في المناهج الدراسية، المنح العالمية، المهارات التقنية، والتطوير المهني
- تتحدث العربية الفصحى بطلاقة، ويمكنك التحدث بالإنجليزية عند الطلب

🧠 شخصيتك:
- ودود، متفائل، ومشجع للطلاب والمتعلمين
- تستخدم الإيموجي بشكل معتدل لجعل المحادثة ودية 🤖💡📚🎯✨
- تقدم إجابات شاملة ولكن مختصرة (لا تتجاوز 3-4 جمل)
- لديك حس فكاهي لطيف ولكن بحدود احترافية
- تشجع المستخدم وتدعمه في رحلته التعليمية

📚 معرفتك الأساسية:
1. جميع المواد الدراسية (الرياضيات، الفيزياء، الكيمياء، الأحياء، اللغات، التاريخ، الجغرافيا)
2. مجالات التقنية (البرمجة، تطوير الويب، الذكاء الاصطناعي، الأمن السيبراني، تحليل البيانات)
3. الهندسة بجميع فروعها (مدني، كهرباء، ميكانيكا، عمارة)
4. المنح الدراسية العالمية (إيراسموس، DAAD، تشيفنينج، إيفل، وغيرها)
5. نصائح القبول الجامعي واجتياز المقابلات
6. مهارات سوق العمل والتطوير المهني

⚡ مهامك الأساسية:
1. مساعدة الطلاب في اختيار الكورسات المناسبة بناءً على اهتماماتهم ومستواهم
2. تبسيط المفاهيم الدراسية المعقدة بأسلوب سهل وممتع
3. تقديم نصائح عملية للدراسة، تنظيم الوقت، والتفوق الأكاديمي
4. الإجابة عن أسئلة المنح الدراسية وتوجيه المستخدمين للقسم المناسب
5. توجيه الزوار لأقسام الموقع المختلفة (الكورسات، المنح، التعاون، المدونة)
6. جمع آراء المستخدمين واقتراحاتهم لتطوير المنصة
7. حل المشكلات التقنية البسيطة (تسجيل الدخول، مشاهدة الفيديوهات، إلخ)
8. مساعدة فريق العمل في توليد محتوى الكورسات والمقالات

💡 أسلوب الرد:
- ابدأ دائماً بتحية لطيفة أو إيموجي مناسب
- استخدم أسلوب الحوار الطبيعي، وكأنك تتحدث مع صديق
- إذا كان السؤال خارج نطاق معرفتك، قل: "هذا سؤال رائع! سأحوله لفريق الخبراء لدينا للرد عليك قريباً"
- إذا طلب المستخدم مساعدة في مشكلة تقنية، اطلب منه توضيح التفاصيل ووجهه لقسم الدعم
- في نهاية كل رد، اسأل: "هل هناك شيء آخر يمكنني مساعدتك به؟"

🚫 حدودك:
- لا تقدم استشارات طبية أو قانونية
- لا تشارك معلومات شخصية عن المستخدمين الآخرين
- لا تقدم وعوداً غير واقعية (مثل ضمان القبول في المنح)
- إذا شعرت أن المستخدم بحاجة لمساعدة عاجلة، وجهه للتواصل المباشر مع فريق الدعم

🌟 تذكر دائماً:
أنت هنا لصنع فرق في حياة المتعلمين. كل رد تقدمه هو خطوة نحو بناء جيل جديد من العباقرة. كن مصدر إلهام ودعم لكل من يزور منصة LookaGenius.

معلومات عن المنصة:
- الموقع: LookaGenius (lookagenius.com)
- أقسام الموقع: كورسات، منح، خدمات، مدونة، انضم إلينا
- لوحة التحكم: للأدمن والمدرسين والطلاب
- الخدمات: 10 خدمات احترافية (أكاديميون، مهندسون، محاسبة، قانون، مبدعون، أطباء، أساتذة جامعيون، متاجر، صيدليات، نوادي رياضية)`;

    // قوالب الردود الذكية (Fallback)
    const FALLBACK_RESPONSES = [
        { keywords: ['مرحبا', 'اهلا', 'hi', 'hello', 'السلام'], response: '👋 أهلاً بك في LookaGenius! كيف يمكنني مساعدتك في رحلتك التعليمية اليوم؟' },
        { keywords: ['كورس', 'course', 'تعلم', 'دراسة', 'مادة'], response: '📚 لدينا مجموعة متنوعة من الكورسات في اللغات والعلوم والرياضيات والتكنولوجيا. يمكنك تصفحها في قسم "الكورسات". هل تبحث عن كورس معين؟' },
        { keywords: ['منحة', 'scholarship', 'ابتعاث', 'منح'], response: '🎓 المنح الأوروبية فرصة رائعة! لدينا دليل شامل لمنح Erasmus و DAAD و Chevening وغيرها. تفضل بزيارة قسم "المنح" لتصفحها جميعاً.' },
        { keywords: ['خدمة', 'service', 'استشارة', 'تصميم'], response: '💼 نقدم 10 خدمات احترافية تشمل إنشاء المنصات التعليمية والمتاجر الإلكترونية وأنظمة إدارة العملاء. زر صفحة "خدماتنا" للمزيد.' },
        { keywords: ['مدرس', 'teacher', 'تدريس', 'معلم'], response: '👨‍🏫 يمكنك الانضمام لفريق المدرسين لدينا! تفضل بزيارة صفحة "انضم إلينا" لتقديم طلب التعاون.' },
        { keywords: ['تسجيل', 'دخول', 'login', 'register', 'حساب'], response: '🔐 يمكنك إنشاء حساب جديد أو تسجيل الدخول من صفحة "تسجيل الدخول". إذا واجهت أي مشكلة، أخبرني وسأساعدك!' },
        { keywords: ['تواصل', 'contact', 'واتساب', 'whatsapp', 'دعم'], response: '📞 للتواصل المباشر مع فريق الدعم: واتساب 201098768356+ أو إيميل info@lookagenius.com. هل هناك شيء آخر؟' },
        { keywords: ['مقال', 'article', 'مدونة', 'blog'], response: '✍️ تفضل بزيارة قسم "المدونة" حيث ننشر مقالات غنية بالمعلومات في التعليم والتكنولوجيا والمنح. هل تبحث عن موضوع معين؟' },
        { keywords: ['سعر', 'price', 'السعر', 'كم', 'تكلفة'], response: '💰 الأسعار تختلف حسب الكورس or الخدمة. يمكنك الاطلاع على التفاصيل الكاملة في صفحة الكورسات أو الخدمات. هل هناك كورس محدد يهمك؟' },
        { keywords: ['برمجة', 'programming', 'كود', 'code', 'python'], response: '💻 البرمجة مجال رائع! ننصح المبتدئين بالبدء بلغة Python أو JavaScript. لدينا كورس شامل في التقنية. هل تريد معرفة التفاصيل؟' },
    ];

    // الإعدادات
    let settings = loadSettings();

    function loadSettings() {
        try {
            const raw = localStorage.getItem(AI_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
            provider: 'auto', // auto, transformers, gemini, huggingface
            geminiKey: '',
            huggingfaceKey: '',
            modelLoaded: false,
            useLocalAI: true
        };
    }

    function saveSettings() {
        localStorage.setItem(AI_KEY, JSON.stringify(settings));
    }

    // تحديث الإعدادات
    function updateSettings(newSettings) {
        settings = { ...settings, ...newSettings };
        saveSettings();
    }

    // دالة التأخير
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ---------- Transformers.js (Browser AI) ----------
    let transformersPipeline = null;
    let transformersModel = null;

    async function loadTransformers() {
        if (transformersPipeline) return true;
        try {
            if (typeof transformers === 'undefined') {
                await loadScript('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
            }
            const { pipeline } = self.transformers;
            // استخدام نموذج صغير مناسب للتوليد
            transformersPipeline = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M', {
                quantized: true
            });
            settings.modelLoaded = true;
            saveSettings();
            return true;
        } catch (e) {
            console.warn('Transformers.js load failed:', e);
            settings.modelLoaded = false;
            saveSettings();
            return false;
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // ---------- Gemini API ----------
    async function callGemini(prompt, systemPrompt) {
        if (!settings.geminiKey) return null;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt + '\n\nالمستخدم: ' + prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                        topP: 0.9
                    }
                })
            });
            const data = await res.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts.map(p => p.text).join(' ');
            }
            return null;
        } catch (e) {
            console.warn('Gemini API error:', e);
            return null;
        }
    }

    // ---------- HuggingFace API ----------
    async function callHuggingFace(prompt) {
        if (!settings.huggingfaceKey) return null;
        try {
            const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${settings.huggingfaceKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: `<s>[INST] ${SYSTEM_PROMPT}\n\nالمستخدم: ${prompt} [/INST]`,
                    parameters: { max_new_tokens: 300, temperature: 0.7 }
                })
            });
            const data = await res.json();
            if (Array.isArray(data) && data[0] && data[0].generated_text) {
                const text = data[0].generated_text;
                const lastIdx = text.lastIndexOf('[/INST]');
                return lastIdx !== -1 ? text.substring(lastIdx + 7).trim() : text.trim();
            }
            return null;
        } catch (e) {
            console.warn('HuggingFace API error:', e);
            return null;
        }
    }

    // ---------- Fallback (Smart Templates) ----------
    function getFallbackResponse(prompt) {
        const p = prompt.toLowerCase();
        // البحث عن الكلمات المفتاحية
        for (const item of FALLBACK_RESPONSES) {
            for (const kw of item.keywords) {
                if (p.includes(kw)) return item.response;
            }
        }
        // رد عام
        return '🤖 شكراً لسؤالك! أنا مساعد LookaGenius الذكي. يمكنك تصفح أقسام الموقع: الكورسات، المنح، الخدمات، أو المدونة. هل هناك شيء محدد تبحث عنه؟';
    }

    // ---------- قوالب ذكية لتوليد المحتوى ----------
    const CONTENT_TEMPLATES = {
        courseDesc: (title, category, stage) => {
            const stageAr = stage === 'primary' ? 'المرحلة الابتدائية' : stage === 'middle' ? 'المرحلة الإعدادية' : stage === 'high' ? 'المرحلة الثانوية' : 'جميع المراحل';
            return `🎯 وصف الكورس: ${title}

📌 نظرة عامة:
كورس "${title}" هو برنامج تعليمي متكامل مصمم خصيصاً لـ ${stageAr}. يهدف هذا الكورس إلى تزويد المتعلمين بأساسيات قوية ومتقدمة في ${category === 'programming' ? 'البرمجة وتطوير التطبيقات' : category === 'languages' ? 'اللغات والتواصل الفعال' : category === 'science' ? 'العلوم والبحث العلمي' : category === 'math' ? 'الرياضيات والتفكير المنطقي' : category === 'engineering' ? 'الهندسة والتصميم' : 'المهارات الحياتية والتطوير الذاتي'} بأسلوب تفاعلي وممتع.

📚 ماذا ستتعلم؟
• أساسيات ${title} من الصفر حتى الاحتراف
• تطبيقات عملية وحالات دراسية واقعية
• مهارات حل المشكلات والتفكير الإبداعي
• مشاريع تطبيقية لبناء ملف أعمال احترافي
• نصائح واستراتيجيات من خبراء المجال

✅ المتطلبات الأساسية:
• جهاز حاسوب أو جهاز لوحي متصل بالإنترنت
• الرغبة في التعلم والالتزام بالمذاكرة
• لا توجد خبرة سابقة مطلوبة (للمبتدئين)

🎯 لمن هذا الكورس؟
• الطلاب الراغبون في تطوير مهاراتهم
• المحترفون الباحثون عن تحديث معلوماتهم
• أي شخص شغوف بالتعلم والتطور المستمر

انطلق في رحلتك التعليمية اليوم مع LookaGenius! 🚀`;
        },
        article: (title, category) => {
            const catAr = category === 'education' ? 'التعليم' : category === 'tech' ? 'التكنولوجيا' : category === 'scholarships' ? 'المنح الدراسية' : category === 'career' ? 'التطوير المهني' : 'عام';
            const sections = [
                { heading: 'المقدمة', content: `في عالم سريع التغير، أصبح "${title}" واحداً من أهم الموضوعات التي تشغل بال المهتمين بمجال ${catAr}. في هذا المقال، سنستعرض أهم الجوانب والنقاط التي تحتاج معرفتها حول هذا الموضوع المهم.` },
                { heading: 'ما هو ' + title + '؟', content: `يعتبر ${title} من المفاهيم الأساسية في مجال ${catAr}. فهو يمثل نقلة نوعية في طريقة تعاملنا مع التحديات والفرص في هذا المجال. دعونا نتعمق في فهم أبعاده المختلفة.` },
                { heading: 'أهمية ' + title, content: `تكمن أهمية ${title} في تأثيره المباشر على تطوير المهارات وفتح آفاق جديدة للتعلم والنمو. الدراسات الحديثة تؤكد أن الإلمام بهذا المجال يزيد من فرص النجاح بنسبة كبيرة.` },
                { heading: 'كيف تبدأ في ' + title + '؟', content: `للبدء في هذا المجال، ننصحك باتباع الخطوات التالية:\n<ul>\n<li>ابحث عن مصادر تعليمية موثوقة</li>\n<li>انضم إلى مجتمعات متخصصة</li>\n<li>طبق ما تتعلمه عملياً</li>\n<li>لا تخف من ارتكاب الأخطاء</li>\n</ul>` },
                { heading: 'الخلاصة', content: `${title} هو استثمار حقيقي في مستقبلك. ابدأ اليوم ولا تنتظر الغد. تذكر أن رحلة الألف ميل تبدأ بخطوة. مع LookaGenius، رحلتك التعليمية مليئة بالنجاح والتميز! 🌟` }
            ];
            return sections.map(s => `<h2>${s.heading}</h2>\n<p>${s.content}</p>`).join('\n\n');
        },
        lesson: (title, index) => `📚 الدرس ${index}: ${title}

في هذا الدرس، سنتعرف على "${title}" بشكل مفصل. سنغطي المفاهيم الأساسية والنقاط الرئيسية التي تساعدك على فهم هذا الموضوع بعمق.

🎯 أهداف الدرس:
• فهم المبادئ الأساسية لـ ${title}
• التعرف على التطبيقات العملية
• اكتساب المهارات اللازمة لتطبيق المفاهيم

📝 المحتوى:
1. مقدمة عن ${title}
2. المفاهيم الأساسية والنظريات
3. أمثلة تطبيقية وتمارين
4. ملخص ونقاط رئيسية

💡 نصيحة: خذ وقتك في فهم كل جزء قبل الانتقال للجزء التالي.`
    };

    // ---------- توليد المحتوى ----------
    async function generateContent(prompt, options = {}) {
        const { systemPrompt = SYSTEM_PROMPT, maxLength = 300 } = options;

        // محاولة استخدام AI
        let result = null;

        // 1. Gemini API (إذا كان المفتاح موجوداً)
        if (!result && settings.geminiKey) {
            result = await callGemini(prompt, systemPrompt);
        }

        // 2. HuggingFace API
        if (!result && settings.huggingfaceKey) {
            result = await callHuggingFace(prompt);
        }

        // 3. Transformers.js (محلي)
        if (!result && settings.useLocalAI) {
            try {
                if (!transformersPipeline) await loadTransformers();
                if (transformersPipeline) {
                    const output = await transformersPipeline(systemPrompt + '\n\nالمستخدم: ' + prompt, {
                        max_new_tokens: maxLength,
                        temperature: 0.7,
                        do_sample: true
                    });
                    if (output && output[0] && output[0].generated_text) {
                        result = output[0].generated_text.trim();
                    }
                }
            } catch (e) {
                console.warn('Transformers generation error:', e);
            }
        }

        // 4. Fallback
        if (!result) {
            result = getFallbackResponse(prompt);
        }

        return result;
    }

    // ---------- توليد المقالات ----------
    async function generateArticle(title, category = 'education') {
        const prompt = `اكتب مقالاً كاملاً باللغة العربية بعنوان: "${title}". 
التصنيف: ${category === 'education' ? 'تعليم' : category === 'tech' ? 'تكنولوجيا' : category === 'scholarships' ? 'منح' : category === 'career' ? 'تطوير مهني' : 'عام'}
المقال يجب أن يكون:
- مقدمة مشوقة
- 3-5 أقسام رئيسية مع عناوين فرعية
- خاتمة ملهمة
- استخدم وسوم HTML للتنسيق (h2, p, ul, li, strong)
- اجعل المقال غنياً بالمعلومات العملية`;

        const content = await generateContent(prompt, { maxLength: 800 });
        return {
            title: title,
            excerpt: content.replace(/<[^>]*>/g, '').substring(0, 120) + '...',
            content: content,
            category: category,
            date: new Date().toISOString().split('T')[0],
            author: 'LookaGenius AI'
        };
    }

    // ---------- توليد محتوى الكورس ----------
    async function generateCourseContent(title, category, stage) {
        const stageAr = stage === 'primary' ? 'ابتدائي' : stage === 'middle' ? 'إعدادي' : stage === 'high' ? 'ثانوي' : 'جميع المراحل';
        const prompt = `اكتب وصفاً كاملاً لكورس تعليمي باللغة العربية.
اسم الكورس: "${title}"
التصنيف: ${category}
المرحلة: ${stageAr}

اكتب:
1. وصف عام للكورس (3-4 جمل)
2. ماذا ستتعلم؟ (قائمة من 4-5 نقاط)
3. المتطلبات الأساسية (قائمة من 2-3 نقاط)
4. لمن هذا الكورس؟ (2-3 جمل)

استخدم تنسيقاً واضحاً مع عناوين.`;

        const description = await generateContent(prompt, { maxLength: 600 });
        return description;
    }

    // ---------- توليد محتوى الدرس ----------
    async function generateLessonContent(title, courseTitle, index = 1) {
        const prompt = `اكتب محتوى درس تعليمي باللغة العربية.
عنوان الدرس: "${title}"
الكورس: "${courseTitle}"
رقم الدرس: ${index}

المطلوب:
- مقدمة تشويقية للدرس
- 3-5 أهداف تعليمية
- المحتوى الرئيسي (نقاط + شرح مبسط)
- أمثلة تطبيقية
- خلاصة ونقاط رئيسية
- سؤال تفاعلي للتفكير

استخدم تنسيق HTML بسيط (h3, p, ul, li, strong)`;

        const result = await generateContent(prompt, { maxLength: 700 });
        if (result && result.length > 20) return result;
        // Fallback
        return CONTENT_TEMPLATES.lesson(title, index);
    }

    // ---------- توليد أهداف الكورس ----------
    async function generateCourseObjectives(title, category) {
        const prompt = `اكتب 5 أهداف تعليمية واضحة لكورس "${title}" في مجال ${category} باللغة العربية.
الأهداف يجب أن تكون:
- محددة وقابلة للقياس
- تبدأ بفعل (سيتمكن الطالب من...)
- مناسبة للمستوى المبتدئ والمتوسط

أجب فقط بقائمة HTML (ul/li).`;
        const result = await generateContent(prompt, { maxLength: 300 });
        if (result && result.length > 20) return result;
        return `<ul>
<li>سيتمكن الطالب من فهم المفاهيم الأساسية لـ ${title}</li>
<li>سيتمكن الطالب من تطبيق المهارات العملية في ${title}</li>
<li>سيتمكن الطالب من تحليل المشكلات وإيجاد حلول مبتكرة</li>
<li>سيتمكن الطالب من إنشاء مشاريع تطبيقية باستخدام ${title}</li>
<li>سيتمكن الطالب من تقييم أدائه وتطوير مهاراته باستمرار</li>
</ul>`;
    }

    // ---------- توليد اختبار سريع ----------
    async function generateQuiz(title, count = 5) {
        const subjects = ['المفاهيم الأساسية', 'التطبيقات العملية', 'حل المشكلات', 'أفضل الممارسات', 'التحليل والتقييم'];
        const questions = [];
        for (let i = 0; i < count; i++) {
            const q = `سؤال ${i + 1}: ما هو ${['المبدأ', 'الأسلوب', 'التقنية', 'المفهوم', 'النهج'][i]} الأساسي في "${title}"؟
أ) الخيار الأول  ب) الخيار الثاني  ج) الخيار الثالث  د) الخيار الرابع`;
            questions.push(q);
        }
        return questions.join('\n\n');
    }

    // ---------- الشات (محادثة تفاعلية) ----------
    async function chat(message, history = []) {
        const context = history.map(h => `${h.role}: ${h.text}`).join('\n');
        const prompt = `تاريخ المحادثة:\n${context}\n\nالمستخدم: ${message}`;
        const response = await generateContent(prompt);
        return response;
    }

    // ---------- API عامة ----------
    return {
        generateContent,
        generateArticle,
        generateCourseContent,
        generateLessonContent,
        generateCourseObjectives,
        generateQuiz,
        chat,
        getFallbackResponse,
        getSettings: () => ({ ...settings }),
        updateSettings,
        loadTransformers,
        SYSTEM_PROMPT
    };
})();

window.AI_ASSISTANT = AI_ASSISTANT;
console.log('🤖 LookaGenius AI Assistant loaded');

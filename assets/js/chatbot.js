(function(){
    'use strict';

    // Prevent double init
    if (document.getElementById('ag-chatbot')) return;

    // Chat log key for admin
    const CHAT_LOG_KEY = 'lookagenius_chat_log';

    function getChatLog() {
        try { return JSON.parse(localStorage.getItem(CHAT_LOG_KEY)) || []; } catch(e) { return []; }
    }

    function addChatLog(entry) {
        const log = getChatLog();
        log.push({ timestamp: new Date().toISOString(), ...entry });
        if (log.length > 500) log.splice(0, log.length - 500); // keep last 500
        localStorage.setItem(CHAT_LOG_KEY, JSON.stringify(log));
    }

    function getCurrentUser() {
        try {
            const s = localStorage.getItem('lookagenius_session');
            return s ? JSON.parse(s) : null;
        } catch(e) { return null; }
    }

    function init() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'ag-chatbot';
        chatContainer.innerHTML = `
            <style>
                @media (max-width: 768px) {
                    #ag-chatbot-window { width: 92vw !important; height: 70vh !important; right: 4vw !important; bottom: 100px !important; }
                    #ag-chatbot-close { font-size: 24px !important; padding: 8px !important; }
                    #ag-chatbot-bubble { width: 52px !important; height: 52px !important; bottom: 20px !important; right: 20px !important; font-size: 20px !important; }
                }
            </style>
            <div id="ag-chatbot-bubble" class="hover-trigger ag-glow-pulse" style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(130deg, var(--ag-primary, #00D4FF), var(--ag-accent, #A855F7)); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 24px; cursor: pointer; z-index: 9999; box-shadow: 0 10px 25px rgba(0, 212, 255, 0.4);">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div id="ag-chatbot-window" style="display: none; position: fixed; bottom: 100px; right: 30px; width: 350px; height: 450px; background: rgba(10, 10, 25, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; z-index: 9998; box-shadow: 0 20px 40px rgba(0,0,0,0.5); flex-direction: column; overflow: hidden; font-family: 'Cairo', sans-serif;">
                <div style="background: linear-gradient(130deg, var(--ag-primary, #00D4FF), var(--ag-accent, #A855F7)); padding: 15px 20px; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-solid fa-headset" style="margin-left: 8px;"></i> <span data-i18n="chat_title">LookaGenius Assistant</span></span>
                    <span id="ag-chatbot-close" style="cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px; background: rgba(255,255,255,0.15);" class="hover-trigger"><span class="ag-close-label" style="font-size: 13px; font-weight: 400;" data-i18n="close">Close</span><i class="fa-solid fa-xmark" style="font-size: 18px;"></i></span>
                </div>
                <div id="ag-chatbot-messages" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                    <div style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: white; max-width: 80%; font-size: 14px;">
                        <span data-i18n="chat_welcome">Welcome to LookaGenius! I am your academic assistant. Ask me about courses, teachers, or anything else!</span>
                    </div>
                </div>
                <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
                    <input type="text" id="ag-chatbot-input" placeholder="اكتب استفسارك هنا..." style="flex: 1; min-width: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 10px 15px; color: white; outline: none; font-family: 'Cairo', sans-serif;">
                    <button id="ag-chatbot-send" class="ag-btn" style="padding: 10px 20px; border-radius: 20px; border: none; cursor: pointer; min-width: max-content;">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);

        const bubble = document.getElementById('ag-chatbot-bubble');
        const chatWindow = document.getElementById('ag-chatbot-window');
        const closeBtn = document.getElementById('ag-chatbot-close');
        const inputField = document.getElementById('ag-chatbot-input');
        const sendBtn = document.getElementById('ag-chatbot-send');
        const messagesBox = document.getElementById('ag-chatbot-messages');

        bubble.addEventListener('click', () => {
            const isOpen = chatWindow.style.display !== 'none';
            chatWindow.style.display = isOpen ? 'none' : 'flex';
            if (!isOpen && window.innerWidth < 768) {
                chatWindow.style.width = '90%';
                chatWindow.style.right = '5%';
                chatWindow.style.bottom = '90px';
            }
        });

        closeBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        // Teacher/subject database
        const teacherDb = {
            'انجليزي': { ar: 'استاذ سعد الدين، ميس هدير السيد، ميس سمية محمد', en: 'Mr. Saad Eldin, Miss Hadeer El-Sayed, Miss Somaya Mohamed' },
            'english': { ar: 'استاذ سعد الدين، ميس هدير السيد، ميس سمية محمد', en: 'Mr. Saad Eldin, Miss Hadeer El-Sayed, Miss Somaya Mohamed' },
            'فرنسي': { ar: 'مسيو فرج السنوسى', en: 'M. Farag El-Sanousi' },
            'french': { ar: 'مسيو فرج السنوسى', en: 'M. Farag El-Sanousi' },
            'فيزياء': { ar: 'ميس ايمان عمر', en: 'Miss Eman Omar' },
            'physics': { ar: 'ميس ايمان عمر', en: 'Miss Eman Omar' },
            'كيمياء': { ar: 'ميس اشرقت حسن', en: 'Miss Ashraqat Hassan' },
            'chemistry': { ar: 'ميس اشرقت حسن', en: 'Miss Ashraqat Hassan' },
            'احياء': { ar: 'استاذ اسلام محمد', en: 'Mr. Islam Mohamed' },
            'biology': { ar: 'استاذ اسلام محمد', en: 'Mr. Islam Mohamed' },
            'حساب ذهني': { ar: 'استاذة سالى يوسف', en: 'Ms. Sali Youssef' },
            'mental math': { ar: 'استاذة سالى يوسف', en: 'Ms. Sali Youssef' },
            'mental': { ar: 'استاذة سالى يوسف', en: 'Ms. Sali Youssef' },
            'تاريخ': { ar: 'استاذ احمد مجدي', en: 'Mr. Ahmed Magdy' },
            'دراسات': { ar: 'استاذ احمد مجدي', en: 'Mr. Ahmed Magdy' },
            'history': { ar: 'استاذ احمد مجدي', en: 'Mr. Ahmed Magdy' },
            'اجتماعيات': { ar: 'استاذ احمد مجدي', en: 'Mr. Ahmed Magdy' },
            'عربي': { ar: 'ميس مروة حمدي', en: 'Miss Marwa Hamdy' },
            'arabic': { ar: 'ميس مروة حمدي', en: 'Miss Marwa Hamdy' }
        };

        const lang = () => (localStorage.getItem('lookagenius_lang') || 'en');
        const t = (en, ar) => lang() === 'ar' ? ar : en;

        async function generateSmartReply(userText) {
            const txt = userText.toLowerCase().trim();

            // Check subjects/teachers first
            for (const [subj, names] of Object.entries(teacherDb)) {
                if (txt.includes(subj)) {
                    const name = names[lang()] || names.ar;
                    return t(
                        `For ${subj}, we have excellent teachers including ${name}. You can book a session via WhatsApp!`,
                        `بالنسبة لـ ${subj}، لدينا نخبة من المعلمين المتميزين وعلى رأسهم ${name}. يمكنك حجز حصة الآن عبر واتساب!`
                    );
                }
            }

            if (txt.includes('سعر') || txt.includes('بكم') || txt.includes('price') || txt.includes('cost')) {
                return t(
                    'Our course prices start from $25 and go up depending on the subject and level. Visit the Courses page for details!',
                    'أسعار كورساتنا تبدأ من 25 دولاراً وتختلف حسب المادة والمستوى. زر صفحة الكورسات للتفاصيل!'
                );
            }
            if (txt.includes('تسجيل') || txt.includes('دخول') || txt.includes('login') || txt.includes('register') || txt.includes('انشاء حساب')) {
                return t(
                    'Click "Start Now" in the header to access the dashboard and register as a student, teacher, or parent.',
                    'اضغط على "Start Now" في الهيدر للوصول إلى لوحة التحكم والتسجيل كطالب أو مدرس أو ولي أمر.'
                );
            }
            if (txt.includes('مدرس') || txt.includes('معلم') || txt.includes('استاذ') || txt.includes('teacher')) {
                return t(
                    'We have top teachers in all subjects! Tell me which subject you are looking for.',
                    'لدينا نخبة من أفضل المعلمين في جميع التخصصات! أخبرني عن المادة التي تبحث عنها.'
                );
            }
            if (txt.includes('شغل') || txt.includes('تقديم') || txt.includes('انضمام') || txt.includes('وظيفة') || txt.includes('job') || txt.includes('join')) {
                return t(
                    'We are always looking for passionate teachers! Apply via the "Join Us" page or contact us on WhatsApp.',
                    'نحن نبحث دائماً عن مدرسين شغوفين! تقدم عبر صفحة "انضم إلينا" أو تواصل معنا عبر واتساب.'
                );
            }
            if (txt.includes('موقع اخر') || txt.includes('اكاديمية اخرى') || txt.includes('منافس') || txt.includes('other') || txt.includes('competitor')) {
                return t(
                    'I\'m here to help with LookaGenius Academy only. I cannot provide info about other platforms.',
                    'أنا هنا لمساعدة في أكاديمية LookaGenius فقط. لا يمكنني تقديم معلومات عن منصات أخرى.'
                );
            }
            if (txt.includes('منحة') || txt.includes('scholarship')) {
                return t(
                    'We have scholarship opportunities! Visit the Scholarships page for details on fully and partially funded programs.',
                    'لدينا فرص منح دراسية! زر صفحة المنح للاطلاع على التفاصيل.'
                );
            }
            if (txt.includes('خدمة') || txt.includes('service') || txt.includes('باقة')) {
                return t(
                    'Our services include platform creation, AI solutions, curriculum design, and more. Check the Services page!',
                    'خدماتنا تشمل إنشاء المنصات، حلول الذكاء الاصطناعي، تصميم المناهج، والمزيد. زر صفحة الخدمات!'
                );
            }

            // Try Pollinations AI
            try {
                const sp = "أنت المساعد الذكي الرسمي لأكاديمية (LookaGenius). أجب دائماً بصيغة الأكاديمية وكن ودوداً. المعلمون: إنجليزي: سعد الدين، هدير السيد، سمية محمد. عربي: مروة حمدي. فيزياء: إيمان عمر. كيمياء: أشرقت حسن. فرنسي: فرج السنوسي. أحياء: إسلام محمد. تاريخ ودراسات: أحمد مجدي. حساب ذهني: سالى يوسف. السؤال: ";
                const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(sp + txt)}`);
                if (res.ok) {
                    const aiText = await res.text();
                    if (aiText && aiText.length > 5) return aiText;
                }
            } catch(e) {}

            const fallbacks = [
                t('The servers are a bit busy! Contact us on WhatsApp for a quick reply.', 'الخوادم مضغوطة قليلاً! تواصل معنا عبر واتساب لرد سريع.'),
                t('I\'m here for your educational questions. Can you clarify more?', 'أنا هنا لأسئلتك التعليمية. هل يمكنك توضيح أكثر؟'),
                t('I\'m having trouble connecting. Please try again or message us.', 'أواجه صعوبة في الاتصال. حاول مرة أخرى أو راسلنا.')
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        async function sendMessage() {
            const text = inputField.value.trim();
            if (!text) return;

            const user = getCurrentUser();

            // User message UI
            const userMsg = document.createElement('div');
            userMsg.style.cssText = "align-self: flex-end; background: var(--ag-primary, #00D4FF); padding: 10px 15px; border-radius: 15px 15px 0 15px; color: white; max-width: 80%; font-size: 14px;";
            userMsg.innerText = text;
            messagesBox.appendChild(userMsg);

            inputField.value = '';
            inputField.disabled = true;
            sendBtn.disabled = true;
            messagesBox.scrollTop = messagesBox.scrollHeight;

            // Log user message
            addChatLog({
                type: 'user',
                message: text,
                userId: user ? user.id : null,
                userName: user ? user.name : 'Guest',
                userEmail: user ? user.email : null,
                page: window.location.pathname
            });

            const replyText = await generateSmartReply(text);

            // Log bot reply
            addChatLog({
                type: 'bot',
                message: replyText
            });

            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.style.cssText = "align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: white; max-width: 80%; font-size: 14px; border-left: 2px solid var(--ag-secondary, #A855F7); white-space: pre-wrap;";
                botMsg.innerText = replyText;
                messagesBox.appendChild(botMsg);
                messagesBox.scrollTop = messagesBox.scrollHeight;
                inputField.disabled = false;
                sendBtn.disabled = false;
                inputField.focus();
            }, 800);
        }

        sendBtn.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

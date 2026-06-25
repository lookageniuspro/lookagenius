/**
 * LookaGenius Chatbot Widget
 * Smart FAQ System (Free NLP Simulation)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create UI
    const chatContainer = document.createElement('div');
    chatContainer.id = 'ag-chatbot';
    chatContainer.innerHTML = `
        <div id="ag-chatbot-bubble" class="hover-trigger ag-glow-pulse" style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(130deg, var(--ag-primary), var(--ag-accent)); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 24px; cursor: pointer; z-index: 9999; box-shadow: 0 10px 25px rgba(0, 212, 255, 0.4);">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div id="ag-chatbot-window" style="display: none; position: fixed; bottom: 100px; right: 30px; width: 350px; height: 450px; background: rgba(10, 10, 25, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; z-index: 9998; box-shadow: 0 20px 40px rgba(0,0,0,0.5); flex-direction: column; overflow: hidden; font-family: 'Cairo', sans-serif;">
            <div style="background: linear-gradient(130deg, var(--ag-primary), var(--ag-accent)); padding: 15px 20px; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fa-solid fa-headset" style="margin-left: 8px;"></i> مساعد أكاديمية LookaGenius</span>
                <i id="ag-chatbot-close" class="fa-solid fa-xmark hover-trigger" style="cursor: pointer;"></i>
            </div>
            <div id="ag-chatbot-messages" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                <div style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: white; max-width: 80%; font-size: 14px;">
                    أهلاً بك في أكاديمية LookaGenius. أنا مساعدك الأكاديمي، كيف يمكنني مساعدتك في رحلتك التعليمية اليوم؟ (اسألني عن الكورسات، المناهج، أو حجز الحصص)
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
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        if (window.innerWidth < 768) {
            chatWindow.style.width = '90%';
            chatWindow.style.right = '5%';
            chatWindow.style.bottom = '90px';
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Smart AI Generator (Using Free text.pollinations.ai endpoint)
    async function generateSmartReply(userText) {
        const txt = userText.toLowerCase().trim();
        
        // 1. Core Platform Quick Answers
        if (txt.includes('سعر') || txt.includes('بكم') || txt.includes('باقة')) {
            return "باقاتنا لإنشاء المنصات والخدمات المتقدمة تبدأ من 800 دولار وتصل إلى 4000 دولار وفقاً للتخصص والاحتياج. يرجى زيارة صفحة الخدمات للتفاصيل والاتصال المباشر.";
        }
        if (txt.includes('تسجيل') || txt.includes('دخول') || txt.includes('انشاء حساب')) {
            return "يمكنك النقر على زر 'Start Now' في الهيدر للوصول إلى لوحة التحكم والتسجيل في حسابات الطلاب، المدرسين، أولياء الأمور أو المهندسين.";
        }

        // 3. Teachers & Subjects Info
        const teachers = {
            'انجليزي': 'استاذ سعد الدين، ميس هدير السيد، ميس سمية محمد',
            'english': 'Mr. Saad Eldin, Miss Hadeer El-Sayed, Miss Somaya Mohamed',
            'فرنسي': 'مسيو فرج السنوسى',
            'french': 'مسيو فرج السنوسى',
            'فيزياء': 'ميس ايمان عمر',
            'physics': 'ميس ايمان عمر',
            'كيمياء': 'ميس اشرقت حسن',
            'chemistry': 'ميس اشرقت حسن',
            'احياء': 'استاذ اسلام محمد',
            'biology': 'استاذ اسلام محمد',
            'حساب ذهني': 'استاذة سالى يوسف',
            'mental math': 'استاذة سالى يوسف',
            'تاريخ': 'استاذ احمد مجدي',
            'دراسات': 'استاذ احمد مجدي',
            'history': 'استاذ احمد مجدي',
            'عربي': 'ميس مروة حمدي',
            'arabic': 'Miss Marwa Hamdy'
        };

        for (const [subj, name] of Object.entries(teachers)) {
            if (txt.includes(subj)) {
                return `بالنسبة لـ ${subj}، لدينا نخبة من المعلمين المتميزين وعلى رأسهم ${name}. يمكنك حجز حصة الآن عبر واتساب!`;
            }
        }

        if (txt.includes('موقع اخر') || txt.includes('اكاديمية اخرى') || txt.includes('منافس')) {
            return "عذراً، أنا هنا للمساعدة في كل ما يخص أكاديمية LookaGenius فقط. لا يمكنني تقديم معلومات عن منصات أو أكاديميات أخرى.";
        }

        if (txt.includes('مدرس') || txt.includes('معلم') || txt.includes('استاذ')) {
            return "لدينا نخبة من أفضل المعلمين في جميع التخصصات (سعد الدين، ميس هدير، ميس سمية، ميس مروة، ميس إيمان، وغيرهم). عن أي مادة تبحث تحديداً؟";
        }

        // 4. Recruitment Logic
        if (txt.includes('شغل') || txt.includes('تقديم') || txt.includes('انضمام') || txt.includes('وظيفة')) {
            return "نحن نبحث دائماً عن مدرسين شغوفين! يمكنك التقديم عبر الانتقال لقسم 'انضم إلى فريقنا' أسفل الصفحة أو التواصل مباشرة عبر الواتساب لإرسال سيرتك الذاتية.";
        }
        
        // 5. Fetch from Free LLM Backend for general/scientific questions
        try {
            // Include System Prompt in the message context
            const systemPrompt = "أنت المساعد الذكي الرسمي لأكاديمية (LookaGenius). مهمتك هي الرد على استفسارات الطلاب حول المناهج والكورسات الخاصة بنا فقط. يمنع منعاً باتاً ذكر أو شرح أي مواقع أو أكاديميات أخرى أو منافسين. إذا سُئلت عن أكاديمية أخرى، اعتذر ووجه المستخدم لخدمات LookaGenius. المعلمون المتاحون: (انجليزي: سعد الدين وهدير السيد وسمية محمد، عربي: مروة حمدي، فيزياء: إيمان عمر، كيمياء: أشرقت حسن، فرنسي: فرج السنوسي، أحياء: إسلام محمد، جغرافيا وتاريخ: أحمد مجدي). أجب دائماً بصيغة الأكاديمية وكن ودوداً. السؤال: ";
            const fullQuery = systemPrompt + txt;
            
            // Pollinations offers a free AI text endpoint without API keys
            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullQuery)}`);
            if (res.ok) {
                const aiText = await res.text();
                // Ensure response isn't extremely long and is clean
                if (aiText && aiText.length > 5) {
                    return aiText;
                }
            }
        } catch (e) {
            console.error("AI Error:", e);
        }
        
        // 3. Dynamic Fallback if AI server is overloaded
        const fallbacks = [
            "عذراً، الخوادم مضغوطة قليلاً! يمكنك التواصل معنا مباشرة عبر واتساب الأكاديمية للحصول على رد سريع.",
            "أنا هنا لمساعدتك في كل ما يخص العلوم والكورسات في الأكاديمية. هل يمكنك توضيح سؤالك أكثر؟",
            "كمساعد أكاديمية LookaGenius، أواجه صعوبة مؤقتة في الاتصال. يرجى محاولة السؤال مرة أخرى أو مراسلتنا."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const sendMessage = async () => {
        const text = inputField.value.trim();
        if (!text) return;

        // User message UI
        const userMsg = document.createElement('div');
        userMsg.style = "align-self: flex-end; background: var(--ag-primary); padding: 10px 15px; border-radius: 15px 15px 0 15px; color: white; max-width: 80%; font-size: 14px;";
        userMsg.innerText = text;
        messagesBox.appendChild(userMsg);
        
        inputField.value = '';
        inputField.disabled = true;
        sendBtn.disabled = true;
        
        messagesBox.scrollTop = messagesBox.scrollHeight;

        // Send to Supabase if loaded for admin logs
        if (typeof supabase !== 'undefined') {
            try {
                // Get Session if available
                const { data: { session } } = await supabase.auth.getSession();
                const user_id = session?.user?.id || null;
                const email = session?.user?.email || 'Guest';

                await supabase.from('chats').insert([
                    { message: text, user_email: email, user_id: user_id, status: 'unread' }
                ]);
            } catch (err) {
                console.error("Chat error:", err);
            }
        }

        // Generate Reply Locally (Async for Wikipedia API)
        const replyText = await generateSmartReply(text);

        // Auto-reply simulation delay to feel natural
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.style = "align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 15px 15px 15px 0; color: white; max-width: 80%; font-size: 14px; border-left: 2px solid var(--ag-secondary); white-space: pre-wrap;";
            botMsg.innerText = replyText;
            messagesBox.appendChild(botMsg);
            messagesBox.scrollTop = messagesBox.scrollHeight;
            
            inputField.disabled = false;
            sendBtn.disabled = false;
            inputField.focus();
        }, 800);
    };

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});

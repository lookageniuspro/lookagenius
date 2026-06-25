/**
 * ai-chat.js
 * واجهة المساعد الذكي - قابلة للدمج في أي صفحة
 */

const AI_CHAT = (() => {
    let chatInitialized = false;
    let chatHistory = [];
    let isOpen = false;

    // CSS خاص بالشات
    const CHAT_CSS = `
        .lkg-chat-toggle {
            position: fixed; bottom: 100px; inset-inline-end: 20px; z-index: 9999;
            width: 56px; height: 56px; border-radius: 50%;
            background: linear-gradient(135deg, #00D4FF, #A855F7);
            border: none; color: white; font-size: 24px; cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
            transition: 0.3s; display: flex; align-items: center; justify-content: center;
        }
        .lkg-chat-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(0, 212, 255, 0.6); }
        .lkg-chat-toggle .badge {
            position: absolute; top: -4px; inset-inline-end: -4px;
            background: #FF3366; color: white; font-size: 10px; padding: 2px 6px;
            border-radius: 10px; font-weight: 700; min-width: 18px; text-align: center;
        }
        .lkg-chat-window {
            position: fixed; bottom: 170px; inset-inline-end: 20px; z-index: 9998;
            width: 380px; height: 520px; background: rgba(10, 10, 25, 0.97);
            backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px; overflow: hidden; display: none; flex-direction: column;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
            font-family: 'Tajawal', 'Cairo', sans-serif;
        }
        .lkg-chat-window.open { display: flex; }
        .lkg-chat-header {
            padding: 16px 20px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.1));
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex; align-items: center; gap: 12px;
        }
        .lkg-chat-header .avatar {
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg, #00D4FF, #A855F7);
            display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .lkg-chat-header .info { flex: 1; }
        .lkg-chat-header .info strong { display: block; font-size: 14px; color: white; }
        .lkg-chat-header .info small { font-size: 11px; color: #0f0; }
        .lkg-chat-header .close-btn {
            background: none; border: none; color: #aaa; font-size: 20px; cursor: pointer; padding: 4px;
        }
        .lkg-chat-header .close-btn:hover { color: #FF3366; }
        .lkg-chat-messages {
            flex: 1; overflow-y: auto; padding: 16px 20px;
            display: flex; flex-direction: column; gap: 12px;
        }
        .lkg-chat-messages::-webkit-scrollbar { width: 4px; }
        .lkg-chat-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .lkg-msg { max-width: 85%; padding: 10px 16px; border-radius: 16px; font-size: 13px; line-height: 1.6; }
        .lkg-msg.bot {
            align-self: flex-start; background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.06); color: #ddd;
            border-bottom-start-radius: 4px;
        }
        .lkg-msg.user {
            align-self: flex-end; background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.15); color: white;
            border-bottom-end-radius: 4px;
        }
        .lkg-msg .time { font-size: 10px; color: #666; margin-top: 4px; display: block; }
        .lkg-msg.typing { background: transparent; border: none; display: flex; gap: 4px; align-items: center; padding: 8px; }
        .lkg-msg.typing span { width: 8px; height: 8px; border-radius: 50%; background: #00D4FF; animation: lkgBounce 1.4s infinite; }
        .lkg-msg.typing span:nth-child(2) { animation-delay: 0.2s; }
        .lkg-msg.typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes lkgBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        .lkg-chat-input {
            padding: 12px 16px; border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex; gap: 10px; align-items: center;
        }
        .lkg-chat-input input {
            flex: 1; padding: 10px 16px; border-radius: 25px; border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.04); color: white; outline: none; font-size: 13px;
            font-family: inherit;
        }
        .lkg-chat-input input:focus { border-color: #00D4FF; }
        .lkg-chat-input input::placeholder { color: #666; }
        .lkg-chat-input .send-btn {
            width: 42px; height: 42px; border-radius: 50%; border: none;
            background: linear-gradient(135deg, #00D4FF, #A855F7);
            color: white; font-size: 16px; cursor: pointer; transition: 0.3s; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
        }
        .lkg-chat-input .send-btn:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(0, 212, 255, 0.3); }
        .lkg-chat-actions {
            display: flex; gap: 6px; padding: 0 16px 12px; flex-wrap: wrap;
        }
        .lkg-chat-actions .quick-btn {
            padding: 4px 12px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03); color: #aaa; font-size: 11px; cursor: pointer;
            transition: 0.3s; font-family: inherit; white-space: nowrap;
        }
        .lkg-chat-actions .quick-btn:hover { border-color: #00D4FF; color: #00D4FF; background: rgba(0, 212, 255, 0.05); }
        .lkg-chat-footer {
            text-align: center; padding: 6px; font-size: 10px; color: #444;
            border-top: 1px solid rgba(255, 255, 255, 0.03);
        }
        @media (max-width: 480px) {
            .lkg-chat-window { width: calc(100% - 20px); inset-inline-end: 10px; bottom: 160px; height: 60vh; }
            .lkg-chat-toggle { inset-inline-end: 10px; }
        }
    `;

    // رسالة الترحيب
    const WELCOME_MSG = '👋 مرحباً بك في مساعد LookaGenius الذكي!\nأنا هنا لمساعدتك في اختيار الكورسات، معلومات المنح، أو أي استفسار تعليمي. كيف يمكنني مساعدتك اليوم؟';

    // زر الأسئلة السريعة
    const QUICK_ACTIONS = [
        '📚 كورسات', '🎓 منح', '💰 الأسعار', '💻 برمجة', '📞 التواصل'
    ];

    function injectCSS() {
        if (document.getElementById('lkg-chat-style')) return;
        const style = document.createElement('style');
        style.id = 'lkg-chat-style';
        style.textContent = CHAT_CSS;
        document.head.appendChild(style);
    }

    function createChatUI() {
        const container = document.createElement('div');
        container.id = 'lkg-chat-container';
        container.innerHTML = `
            <button class="lkg-chat-toggle" id="lkgChatToggle" title="المساعد الذكي">
                <i class="fa-solid fa-robot"></i>
                <span class="badge" id="lkgChatBadge" style="display:none;">1</span>
            </button>
            <div class="lkg-chat-window" id="lkgChatWindow">
                <div class="lkg-chat-header">
                    <div class="avatar">🤖</div>
                    <div class="info">
                        <strong>مساعد LookaGenius</strong>
                        <small>🟢 متصل</small>
                    </div>
                    <button class="close-btn" id="lkgChatClose"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="lkg-chat-messages" id="lkgChatMessages"></div>
                <div class="lkg-chat-actions" id="lkgChatActions"></div>
                <div class="lkg-chat-input">
                    <input type="text" id="lkgChatInput" placeholder="اكتب سؤالك هنا..." dir="auto">
                    <button class="send-btn" id="lkgChatSend"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
                <div class="lkg-chat-footer">🤖 مدعوم بـ LookaGenius AI</div>
            </div>
        `;
        document.body.appendChild(container);
    }

    function addMessage(text, role) {
        const msgs = document.getElementById('lkgChatMessages');
        const div = document.createElement('div');
        div.className = `lkg-msg ${role}`;
        const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = text.replace(/\n/g, '<br>') + `<span class="time">${time}</span>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        const msgs = document.getElementById('lkgChatMessages');
        const div = document.createElement('div');
        div.className = 'lkg-msg bot typing';
        div.id = 'lkgTypingIndicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('lkgTypingIndicator');
        if (el) el.remove();
    }

    async function handleSend(message) {
        if (!message.trim()) return;
        const input = document.getElementById('lkgChatInput');
        input.value = '';

        addMessage(message, 'user');
        chatHistory.push({ role: 'user', text: message });
        showTyping();

        try {
            const response = await window.AI_ASSISTANT.chat(message, chatHistory);
            hideTyping();
            addMessage(response, 'bot');
            chatHistory.push({ role: 'assistant', text: response });
        } catch (e) {
            hideTyping();
            const fallback = window.AI_ASSISTANT.getFallbackResponse(message);
            addMessage(fallback, 'bot');
            chatHistory.push({ role: 'assistant', text: fallback });
        }
    }

    function initQuickActions() {
        const container = document.getElementById('lkgChatActions');
        container.innerHTML = QUICK_ACTIONS.map(a =>
            `<button class="quick-btn" data-action="${a}">${a}</button>`
        ).join('');
        container.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => handleSend(btn.dataset.action));
        });
    }

    function init() {
        if (chatInitialized) return;
        injectCSS();
        createChatUI();

        const toggle = document.getElementById('lkgChatToggle');
        const window_ = document.getElementById('lkgChatWindow');
        const close = document.getElementById('lkgChatClose');
        const input = document.getElementById('lkgChatInput');
        const send = document.getElementById('lkgChatSend');

        toggle.addEventListener('click', () => {
            isOpen = !isOpen;
            window_.classList.toggle('open', isOpen);
            toggle.style.display = isOpen ? 'none' : 'flex';
            if (isOpen && document.getElementById('lkgChatMessages').children.length === 0) {
                addMessage(WELCOME_MSG, 'bot');
                initQuickActions();
            }
            if (isOpen) setTimeout(() => input.focus(), 300);
        });

        close.addEventListener('click', () => {
            isOpen = false;
            window_.classList.remove('open');
            toggle.style.display = 'flex';
        });

        send.addEventListener('click', () => handleSend(input.value));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend(input.value);
        });

        chatInitialized = true;
    }

    // استدعاء يدوي للتهيئة
    return { init, handleSend, addMessage };
})();

window.AI_CHAT = AI_CHAT;

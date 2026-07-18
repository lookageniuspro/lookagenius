/**
 * nextgen-loader.js — Master Loader for All Next-Gen Platform Modules
 * Include this single script to load all features
 */

;(function() {
    const scripts = [
        'js/nextgen-core.js',
        'js/nextgen-paymob.js',
        'js/nextgen-communication.js',
        'js/nextgen-assignments.js',
        'js/nextgen-gamification.js',
        'js/nextgen-live.js',
        'js/nextgen-analytics.js',
        'js/nextgen-paths.js'
    ]

    let loaded = 0
    const total = scripts.length

    function loadNext() {
        if (loaded >= total) {
            console.log('[NextGen] All modules loaded successfully')
            window.dispatchEvent(new CustomEvent('nextgen_ready'))
            // Initialize all modules
            if (NextGen.Communication) NextGen.Communication.init()
            if (NextGen.Assignments) NextGen.Assignments.init()
            if (NextGen.Gamification) NextGen.Gamification.init()
            if (NextGen.Live) NextGen.Live.init()
            if (NextGen.Analytics) NextGen.Analytics.init()
            if (NextGen.Paths) NextGen.Paths.init()
            return
        }

        const src = scripts[loaded]
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
            loaded++
            loadNext()
            return
        }

        const script = document.createElement('script')
        script.src = src
        script.onload = () => { loaded++; loadNext() }
        script.onerror = () => {
            console.warn(`[NextGen] Failed to load: ${src}`)
            loaded++
            loadNext()
        }
        document.body.appendChild(script)
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNext)
    } else {
        loadNext()
    }
})()

// ===== Global Integration Helpers =====
window.NextGenIntegration = {
    // Inject NextGen tabs into existing dashboard sidebar
    injectSidebarTab(sidebarId, tabId, label, icon, sectionId) {
        const sidebar = document.getElementById(sidebarId)
        if (!sidebar) return
        const existing = document.getElementById(tabId)
        if (existing) return
        const li = document.createElement('li')
        li.id = tabId
        li.dataset.section = sectionId
        li.style.cssText = 'padding:12px 16px;border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:10px;color:#888;transition:all 0.3s;margin-bottom:4px'
        li.innerHTML = `<i class="fa-solid ${icon}" style="width:20px;text-align:center"></i><span>${label}</span>`
        li.onmouseover = () => { if (!li.classList.contains('active')) li.style.background = 'rgba(255,255,255,0.05)' }
        li.onmouseout = () => { if (!li.classList.contains('active')) li.style.background = '' }
        li.onclick = () => {
            sidebar.querySelectorAll('li').forEach(l => {
                l.style.background = ''
                l.style.color = '#888'
                l.classList.remove('active')
            })
            li.style.background = 'rgba(0,212,255,0.1)'
            li.style.color = '#00D4FF'
            li.classList.add('active')
            document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none')
            const section = document.getElementById(sectionId)
            if (section) section.style.display = 'block'
        }
        sidebar.appendChild(li)
    },

    // Initialize payment system on course buttons
    initCourseBuyButtons(containerSelector) {
        document.querySelectorAll(containerSelector).forEach(container => {
            container.querySelectorAll('[data-buy-course]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const courseId = btn.dataset.buyCourse
                    const price = parseFloat(btn.dataset.price) || 0
                    const title = btn.dataset.title || 'Course'
                    const user = window.auth?.currentUser
                    if (!user) { window.location.href = 'login.html'; return }

                    if (price === 0) {
                        // Free enrollment
                        NextGen.DB.addInvoice({ userId: user.id, courseId, amount: 0, currency: 'EGP', status: 'paid', description: title })
                        NextGen.UI.showToast('Enrolled successfully!', 'success')
                        return
                    }

                    // Pay with Paymob
                    const result = await NextGen.Paymob.pay({
                        amount: price,
                        description: title,
                        userId: user.id?.toString(),
                        userEmail: user.email,
                        userName: user.name,
                        method: 'card',
                        onSuccess: () => {
                            NextGen.DB.addInvoice({ userId: user.id, courseId, amount: price, currency: 'EGP', status: 'paid', description: title })
                            NextGen.UI.showToast('Enrolled successfully!', 'success')
                        }
                    })
                })
            })
        })
    },

    // Add floating AI assistant button
    addFloatingAIAssistant() {
        if (document.getElementById('ngAIFab')) return
        const fab = document.createElement('div')
        fab.id = 'ngAIFab'
        fab.style.cssText = 'position:fixed;bottom:100px;left:20px;z-index:9999;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#A855F7);border:none;color:#fff;font-size:28px;cursor:pointer;box-shadow:0 0 30px rgba(0,212,255,0.4);display:flex;align-items:center;justify-content:center;transition:all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)'
        fab.innerHTML = '<i class="fa-solid fa-robot"></i>'
        fab.onmouseover = () => { fab.style.transform = 'scale(1.1)'; fab.style.boxShadow = '0 0 50px rgba(0,212,255,0.6)' }
        fab.onmouseout = () => { fab.style.transform = 'scale(1)'; fab.style.boxShadow = '0 0 30px rgba(0,212,255,0.4)' }
        fab.onclick = () => {
            // Open AI assistant modal
            NextGen.UI.showModal({
                title: '<i class="fa-solid fa-robot" style="color:#00D4FF"></i> AI Assistant',
                content: `
                    <div style="display:flex;flex-direction:column;height:400px">
                        <div id="ngAIMessages" style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:10px">
                            <div style="display:flex;gap:10px;align-items:start">
                                <div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#A855F7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px"><i class="fa-solid fa-robot"></i></div>
                                <div style="padding:10px 16px;border-radius:16px 16px 16px 4px;background:rgba(0,212,255,0.1);color:#ccc;font-size:14px;max-width:80%">Hello! I'm your AI learning assistant. How can I help you today?</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;padding:10px;border-top:1px solid rgba(255,255,255,0.1)">
                            <input type="text" id="ngAIInput" placeholder="Ask me anything..." style="flex:1;padding:12px 16px;border-radius:25px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-size:14px">
                            <button id="ngAISendBtn" style="width:45px;height:45px;border-radius:50%;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:18px"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                `,
                size: 'medium',
                buttons: [{ label: 'Close', primary: false }]
            })
            setTimeout(() => {
                const input = document.getElementById('ngAIInput')
                const btn = document.getElementById('ngAISendBtn')
                const msgs = document.getElementById('ngAIMessages')
                const sendMsg = () => {
                    const text = input?.value.trim()
                    if (!text) return
                    input.value = ''
                    msgs.innerHTML += `<div style="display:flex;gap:10px;justify-content:flex-end;align-items:start">
                        <div style="padding:10px 16px;border-radius:16px 16px 4px 16px;background:rgba(0,212,255,0.2);color:#fff;font-size:14px;max-width:80%">${NextGen.UI.escHtml(text)}</div>
                        <div style="width:35px;height:35px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px"><i class="fa-solid fa-user"></i></div>
                    </div>`
                    msgs.innerHTML += `<div style="display:flex;gap:10px;align-items:start;opacity:0.6" class="ng-pulse">
                        <div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#A855F7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px"><i class="fa-solid fa-robot"></i></div>
                        <div style="padding:10px 16px;border-radius:16px 16px 16px 4px;background:rgba(0,212,255,0.05);color:#888;font-size:14px">Thinking...</div>
                    </div>`
                    msgs.scrollTop = msgs.scrollHeight
                    setTimeout(() => {
                        msgs.querySelector('.ng-pulse')?.remove()
                        const responses = [
                            'Great question! I recommend checking our course catalog for more details.',
                            'That\'s a topic we cover extensively. Let me suggest some relevant courses.',
                            'I can help you with that! Our platform has excellent resources on this subject.',
                            'Interesting! You might want to explore our scholarship opportunities related to this.',
                            'Let me connect you with the right learning path for this topic.'
                        ]
                        msgs.querySelector('.ng-pulse')?.remove()
                        msgs.innerHTML += `<div style="display:flex;gap:10px;align-items:start">
                            <div style="width:35px;height:35px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#A855F7);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px"><i class="fa-solid fa-robot"></i></div>
                            <div style="padding:10px 16px;border-radius:16px 16px 16px 4px;background:rgba(0,212,255,0.1);color:#ccc;font-size:14px;max-width:80%">${responses[Math.floor(Math.random() * responses.length)]}</div>
                        </div>`
                        msgs.scrollTop = msgs.scrollHeight
                    }, 1500)
                }
                if (btn) btn.onclick = sendMsg
                if (input) input.onkeydown = (e) => { if (e.key === 'Enter') sendMsg() }
            }, 100)
        }
        document.body.appendChild(fab)
    }
}

console.log('[NextGen] Loader ready')

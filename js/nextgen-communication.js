/**
 * nextgen-communication.js — Real-time Chat, Forums, Notifications, Live Activity
 */

window.NextGen = window.NextGen || {}
if (!window.NextGen.DB) console.error('[Comm] Core DB not loaded')

NextGen.Communication = {
    _activeChat: null,
    _chatPollInterval: null,

    init() {
        console.log('[Comm] Communication module initialized')
        NextGen.EventBus.on('message_sent', (msg) => {
            this._updateChatUI(msg)
        })
    },

    // ===== CHAT SYSTEM =====

    openChat(userId, userName, userAvatar = '') {
        this._activeChat = userId
        const messages = NextGen.DB.getConversation(this._getCurrentUserId(), userId)

        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-comments" style="color:#00D4FF"></i> ${NextGen.I18n.t('chat')} — ${NextGen.UI.escHtml(userName)}`,
            content: this._renderChatWindow(messages, userId),
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('close'), action: () => { this._stopPolling(); document.querySelector('.modal-close-btn')?.click() }, primary: false }
            ],
            onClose: () => this._stopPolling()
        })

        NextGen.DB.markConversationRead(this._getCurrentUserId(), userId)
        this._startPolling(userId)
        this._scrollChatToBottom()
    },

    _renderChatWindow(messages, otherUserId) {
        const currentUserId = this._getCurrentUserId()
        const chatStyle = 'display:flex;flex-direction:column;height:450px'
        const msgContainer = messages.map(m => {
            const isMine = m.from === currentUserId
            return `<div style="display:flex;${isMine ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin-bottom:10px">
                <div style="max-width:75%;padding:10px 16px;border-radius:${isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:${isMine ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isMine ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}">
                    <div style="color:#fff;font-size:14px;line-height:1.5;word-break:break-word">${NextGen.UI.escHtml(m.text)}</div>
                    <div style="font-size:11px;color:#666;margin-top:5px;text-align:${isMine ? 'left' : 'right'}">${NextGen.UI.formatDate(m.createdAt)}</div>
                </div>
            </div>`
        }).join('')

        return `<div id="chatContainer" style="${chatStyle}">
            <div id="chatMessages" style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column">${msgContainer || '<div style="text-align:center;color:#666;margin:auto">Start a conversation</div>'}</div>
            <div style="display:flex;gap:10px;padding:10px;border-top:1px solid rgba(255,255,255,0.1)">
                <input type="text" id="chatInput" placeholder="${NextGen.I18n.t('send')}..." style="flex:1;padding:12px 16px;border-radius:25px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-size:14px">
                <button id="chatSendBtn" style="width:45px;height:45px;border-radius:50%;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:18px;transition:all 0.3s"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>`
    },

    _startPolling(otherUserId) {
        this._stopPolling()
        this._chatPollInterval = setInterval(() => {
            const container = document.getElementById('chatMessages')
            if (!container) { this._stopPolling(); return }
            const msgs = NextGen.DB.getConversation(this._getCurrentUserId(), otherUserId)
            const currentUserId = this._getCurrentUserId()
            container.innerHTML = msgs.map(m => {
                const isMine = m.from === currentUserId
                return `<div style="display:flex;${isMine ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin-bottom:10px">
                    <div style="max-width:75%;padding:10px 16px;border-radius:${isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:${isMine ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isMine ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}">
                        <div style="color:#fff;font-size:14px;line-height:1.5;word-break:break-word">${NextGen.UI.escHtml(m.text)}</div>
                        <div style="font-size:11px;color:#666;margin-top:5px;text-align:${isMine ? 'left' : 'right'}">${NextGen.UI.formatDate(m.createdAt)}</div>
                    </div>
                </div>`
            }).join('')
            this._scrollChatToBottom()
            NextGen.DB.markConversationRead(currentUserId, otherUserId)
        }, 2000)

        // Send message handler
        setTimeout(() => {
            const input = document.getElementById('chatInput')
            const btn = document.getElementById('chatSendBtn')
            if (input && btn) {
                const send = () => {
                    const text = input.value.trim()
                    if (!text) return
                    NextGen.DB.sendMessage({ from: this._getCurrentUserId(), to: otherUserId, text })
                    input.value = ''
                    input.focus()
                }
                btn.onclick = send
                input.onkeydown = (e) => { if (e.key === 'Enter') send() }
            }
        }, 100)
    },

    _stopPolling() {
        if (this._chatPollInterval) { clearInterval(this._chatPollInterval); this._chatPollInterval = null }
    },

    _scrollChatToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chatMessages')
            if (container) container.scrollTop = container.scrollHeight
        }, 50)
    },

    _updateChatUI(msg) {
        const container = document.getElementById('chatMessages')
        if (!container) return
        const isMine = msg.from === this._getCurrentUserId()
        const el = document.createElement('div')
        el.style.cssText = `display:flex;${isMine ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin-bottom:10px;animation:slideUp 0.3s`
        el.innerHTML = `<div style="max-width:75%;padding:10px 16px;border-radius:${isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};background:${isMine ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'};border:1px solid ${isMine ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}">
            <div style="color:#fff;font-size:14px;line-height:1.5;word-break:break-word">${NextGen.UI.escHtml(msg.text)}</div>
            <div style="font-size:11px;color:#666;margin-top:5px;text-align:${isMine ? 'left' : 'right'}">${NextGen.UI.formatDate(msg.createdAt)}</div>
        </div>`
        container.appendChild(el)
        container.scrollTop = container.scrollHeight
    },

    getUnreadCount() {
        return NextGen.DB.getUnreadCount(this._getCurrentUserId())
    },

    // ===== FORUM / DISCUSSION SYSTEM =====

    renderForum(courseId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const threads = NextGen.DB.getThreadsByCourse(courseId)
        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="color:#fff;margin:0"><i class="fa-solid fa-comments" style="color:#00D4FF"></i> ${NextGen.I18n.t('forum')}</h3>
                <button id="newThreadBtn" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:13px;transition:all 0.3s"><i class="fa-solid fa-plus"></i> ${NextGen.I18n.t('startThread')}</button>
            </div>
            <div id="threadsList">
                ${threads.length ? threads.map(t => `
                    <div class="thread-item" data-thread-id="${t.id}" style="padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.3s" onmouseover="this.style.background='rgba(0,212,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                        <div style="display:flex;justify-content:space-between;align-items:start">
                            <div>
                                <div style="color:#fff;font-weight:600;margin-bottom:5px">${NextGen.UI.escHtml(t.title)}</div>
                                <div style="font-size:13px;color:#888">${NextGen.UI.escHtml(t.author)} · ${NextGen.UI.formatDate(t.createdAt)}</div>
                            </div>
                            <div style="text-align:left">
                                <div style="font-size:13px;color:#00D4FF">${t.replies || 0} replies</div>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p style="text-align:center;color:#666;padding:40px">No discussions yet. Start the first thread!</p>'}
            </div>
            <div id="threadDetail" style="display:none"></div>
        `

        document.getElementById('newThreadBtn')?.addEventListener('click', () => this._showNewThreadForm(courseId))

        container.querySelectorAll('.thread-item').forEach(el => {
            el.addEventListener('click', () => this._showThreadDetail(el.dataset.threadId, containerId))
        })
    },

    _showNewThreadForm(courseId) {
        NextGen.UI.showModal({
            title: NextGen.I18n.t('startThread'),
            content: `
                <input type="text" id="threadTitle" placeholder="Thread title" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;margin-bottom:15px;outline:none">
                <textarea id="threadBody" placeholder="Write your question or discussion..." rows="5" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;resize:vertical;outline:none;font-family:inherit"></textarea>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), action: () => {}, primary: false },
                { label: NextGen.I18n.t('create'), action: () => {
                    const title = document.getElementById('threadTitle')?.value.trim()
                    const body = document.getElementById('threadBody')?.value.trim()
                    if (!title) { NextGen.UI.showToast('Please enter a title', 'error'); return }
                    const thread = NextGen.DB.addThread({
                        courseId,
                        title,
                        body,
                        author: this._getCurrentUserName(),
                        authorId: this._getCurrentUserId(),
                        repliesList: []
                    })
                    NextGen.UI.showToast('Thread created!', 'success')
                    NextGen.EventBus.emit('thread_created', thread)
                }, primary: true }
            ]
        })
    },

    _showThreadDetail(threadId, containerId) {
        const d = NextGen.DB.getData()
        const thread = (d.threads || []).find(t => t.id === threadId)
        if (!thread) return

        const list = document.getElementById('threadsList')
        const detail = document.getElementById('threadDetail')
        if (list) list.style.display = 'none'
        if (detail) {
            detail.style.display = 'block'
            detail.innerHTML = `
                <button id="backToThreads" style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#fff;cursor:pointer;margin-bottom:20px;font-size:13px"><i class="fa-solid fa-arrow-right"></i> Back</button>
                <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(0,212,255,0.2);margin-bottom:20px">
                    <h4 style="color:#fff;margin:0 0 10px">${NextGen.UI.escHtml(thread.title)}</h4>
                    <p style="color:#aaa;line-height:1.7;margin:0">${NextGen.UI.escHtml(thread.body)}</p>
                    <div style="font-size:12px;color:#666;margin-top:10px">${NextGen.UI.escHtml(thread.author)} · ${NextGen.UI.formatDate(thread.createdAt)}</div>
                </div>
                <div id="repliesContainer">
                    ${(thread.repliesList || []).map(r => `
                        <div style="padding:15px;background:rgba(255,255,255,0.02);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.05)">
                            <div style="color:#ddd;line-height:1.6;margin-bottom:8px">${NextGen.UI.escHtml(r.text)}</div>
                            <div style="font-size:12px;color:#666">${NextGen.UI.escHtml(r.author)} · ${NextGen.UI.formatDate(r.createdAt)}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex;gap:10px;margin-top:15px">
                    <textarea id="replyInput" placeholder="${NextGen.I18n.t('reply')}..." rows="2" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;resize:vertical;outline:none;font-family:inherit"></textarea>
                    <button id="postReplyBtn" style="padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-weight:600;transition:all 0.3s">${NextGen.I18n.t('postReply')}</button>
                </div>
            `

            document.getElementById('backToThreads')?.addEventListener('click', () => {
                if (list) list.style.display = 'block'
                if (detail) detail.style.display = 'none'
            })

            document.getElementById('postReplyBtn')?.addEventListener('click', () => {
                const input = document.getElementById('replyInput')
                const text = input?.value.trim()
                if (!text) return
                NextGen.DB.addReply(threadId, { text, author: this._getCurrentUserName(), authorId: this._getCurrentUserId() })
                input.value = ''
                NextGen.UI.showToast('Reply posted!', 'success')
                this._showThreadDetail(threadId, containerId)
            })
        }
    },

    // ===== NOTIFICATION CENTER =====

    renderNotificationBell(containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const count = NextGen.DB.getUnreadNotificationsCount()
        container.innerHTML = `
            <button id="notificationBell" style="position:relative;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:8px 12px;color:#fff;cursor:pointer;transition:all 0.3s">
                <i class="fa-solid fa-bell" style="font-size:18px"></i>
                ${count > 0 ? `<span id="notifBadge" style="position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;font-size:11px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${count > 9 ? '9+' : count}</span>` : ''}
            </button>
        `
        document.getElementById('notificationBell')?.addEventListener('click', () => this._showNotificationPanel())
    },

    _showNotificationPanel() {
        const notifications = NextGen.DB.getNotifications()
        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-bell" style="color:#FBBF24"></i> ${NextGen.I18n.t('notifications')}`,
            content: `
                <div style="display:flex;gap:10px;margin-bottom:15px">
                    <button id="markAllReadBtn" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#00D4FF;cursor:pointer;font-size:12px">${NextGen.I18n.t('markRead')}</button>
                    <button id="clearNotifBtn" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#ef4444;cursor:pointer;font-size:12px">Clear All</button>
                </div>
                <div style="max-height:400px;overflow-y:auto">
                    ${notifications.length ? notifications.map(n => `
                        <div style="padding:12px 15px;border-radius:12px;margin-bottom:8px;background:${n.read ? 'rgba(255,255,255,0.02)' : 'rgba(0,212,255,0.08)'};border:1px solid ${n.read ? 'rgba(255,255,255,0.05)' : 'rgba(0,212,255,0.2)'};cursor:pointer;transition:all 0.3s" data-notif-id="${n.id}">
                            <div style="color:#fff;font-size:14px;margin-bottom:4px">${NextGen.UI.escHtml(n.message)}</div>
                            <div style="font-size:12px;color:#666">${NextGen.UI.formatDate(n.createdAt)}</div>
                        </div>
                    `).join('') : '<p style="text-align:center;color:#666;padding:30px">No notifications</p>'}
                </div>
            `,
            size: 'medium',
            buttons: [{ label: NextGen.I18n.t('close'), primary: false }],
            onClose: () => this.renderNotificationBell('notificationContainer')
        })

        document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
            NextGen.DB.markAllNotificationsRead()
            NextGen.UI.showToast('All marked as read', 'success')
            this.renderNotificationBell('notificationContainer')
            document.querySelectorAll('[data-notif-id]').forEach(el => el.style.background = 'rgba(255,255,255,0.02)')
        })

        document.getElementById('clearNotifBtn')?.addEventListener('click', () => {
            NextGen.DB.clearAllNotifications()
            NextGen.UI.showToast('Notifications cleared', 'info')
            this.renderNotificationBell('notificationContainer')
            const panel = document.querySelector('[data-notif-id]')?.closest('div')
            if (panel) panel.remove()
        })

        document.querySelectorAll('[data-notif-id]').forEach(el => {
            el.addEventListener('click', function () {
                NextGen.DB.markNotificationRead(this.dataset.notifId)
                this.style.background = 'rgba(255,255,255,0.02)'
                this.style.borderColor = 'rgba(255,255,255,0.05)'
            })
        })
    },

    // ===== ACTIVITY FEED =====

    renderActivityFeed(containerId, activities = []) {
        const container = document.getElementById(containerId)
        if (!container) return
        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-clock-rotate-left" style="color:#00D4FF"></i> ${NextGen.I18n.t('recentActivity')}</h4>
            ${activities.length ? activities.slice(0, 10).map(a => `
                <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                    <div style="width:36px;height:36px;border-radius:50%;background:${a.color || 'rgba(0,212,255,0.2)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                        <i class="fa-solid ${a.icon || 'fa-circle'}" style="color:${a.color || '#00D4FF'};font-size:14px"></i>
                    </div>
                    <div style="flex:1">
                        <div style="color:#ccc;font-size:13px">${NextGen.UI.escHtml(a.text)}</div>
                        <div style="font-size:11px;color:#666;margin-top:2px">${NextGen.UI.escHtml(a.time || NextGen.UI.formatDate(new Date()))}</div>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center;color:#666;padding:20px">No recent activity</p>'}
        `
    },

    _getCurrentUserId() {
        const user = window.auth?.currentUser
        return user?.id?.toString() || user?.email || 'guest'
    },

    _getCurrentUserName() {
        return window.auth?.currentUser?.name || window.auth?.currentUser?.email || 'Guest'
    }
}

console.log('[NextGen] Communication module loaded')

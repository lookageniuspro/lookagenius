/**
 * nextgen-live.js — Live Classes, Calendar, Scheduling, WebRTC Integration
 */

window.NextGen = window.NextGen || {}
if (!NextGen.DB) console.error('[Live] Core DB not loaded')

NextGen.Live = {
    init() {
        console.log('[Live] Module initialized')
    },

    // ===== SCHEDULE LIVE CLASS =====
    showScheduleForm(courseId, containerId) {
        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-video" style="color:#22c55e"></i> Schedule Live Class`,
            content: `
                <div style="display:grid;gap:15px">
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Title</label>
                        <input type="text" id="liveTitle" placeholder="e.g. Algebra Chapter 5 Review" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px">
                        <div>
                            <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Date</label>
                            <input type="date" id="liveDate" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                        <div>
                            <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Time</label>
                            <input type="time" id="liveTime" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Duration (minutes)</label>
                        <input type="number" id="liveDuration" value="60" min="15" max="180" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Platform</label>
                        <select id="livePlatform" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="zoom">Zoom</option>
                            <option value="google_meet">Google Meet</option>
                            <option value="teams">Microsoft Teams</option>
                            <option value="webex">Webex</option>
                            <option value="custom">Custom Link</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Meeting Link / ID</label>
                        <input type="text" id="liveLink" placeholder="https://zoom.us/j/..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Description (optional)</label>
                        <textarea id="liveDesc" rows="3" placeholder="What will this class cover?" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-family:inherit;resize:vertical"></textarea>
                    </div>
                    <div>
                        <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
                            <input type="checkbox" id="liveRecord" checked> 
                            <span style="color:#aaa;font-size:13px">Record this session</span>
                        </label>
                    </div>
                </div>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), primary: false },
                { label: NextGen.I18n.t('scheduleClass'), action: () => {
                    const title = document.getElementById('liveTitle')?.value.trim()
                    const date = document.getElementById('liveDate')?.value
                    const time = document.getElementById('liveTime')?.value
                    const duration = parseInt(document.getElementById('liveDuration')?.value) || 60
                    const platform = document.getElementById('livePlatform')?.value
                    const link = document.getElementById('liveLink')?.value.trim()
                    if (!title || !date || !time) { NextGen.UI.showToast('Please fill in title, date, and time', 'error'); return }
                    const startTime = new Date(`${date}T${time}`)
                    const endTime = new Date(startTime.getTime() + duration * 60000)
                    NextGen.DB.addLiveClass({
                        courseId,
                        title,
                        description: document.getElementById('liveDesc')?.value.trim() || '',
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                        duration,
                        platform,
                        meetingLink: link,
                        record: document.getElementById('liveRecord')?.checked || false,
                        createdBy: this._getCurrentUserId(),
                        status: 'scheduled'
                    })
                    // Add to calendar
                    NextGen.DB.addEvent({
                        title: `📺 ${title}`,
                        date: startTime.toISOString().slice(0, 10),
                        startTime: time,
                        endTime: endTime.toTimeString().slice(0, 5),
                        type: 'live_class',
                        courseId,
                        userId: this._getCurrentUserId()
                    })
                    NextGen.UI.showToast('Live class scheduled!', 'success')
                    if (containerId) this.renderSchedule(courseId, containerId)
                }, primary: true }
            ]
        })
    },

    // ===== RENDER SCHEDULE =====
    renderSchedule(courseId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const d = NextGen.DB.getData()
        const classes = (d.liveClasses || []).filter(lc => lc.courseId === courseId)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        const now = new Date()

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="color:#fff;margin:0"><i class="fa-solid fa-video" style="color:#22c55e"></i> ${NextGen.I18n.t('live')}</h3>
                <button id="scheduleLiveBtn" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#22c55e,#00D4FF);color:#fff;cursor:pointer;font-size:13px;transition:all 0.3s"><i class="fa-solid fa-plus"></i> ${NextGen.I18n.t('scheduleClass')}</button>
            </div>
            ${classes.length ? classes.map(lc => {
                const start = new Date(lc.startTime)
                const end = new Date(lc.endTime)
                const isLive = now >= start && now <= end
                const isPast = now > end
                const isUpcoming = now < start
                let statusHtml = ''
                if (isLive) statusHtml = NextGen.UI.renderBadge('🔴 LIVE NOW', '#22c55e')
                else if (isPast) statusHtml = NextGen.UI.renderBadge(lc.record ? '📹 Recorded' : '✅ Completed', '#888')
                else statusHtml = NextGen.UI.renderBadge('📅 Upcoming', '#00D4FF')
                return `
                    <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:10px;border:1px solid ${isLive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'};${isLive ? 'box-shadow:0 0 20px rgba(34,197,94,0.2)' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                            <div>
                                <div style="color:#fff;font-weight:600">${NextGen.UI.escHtml(lc.title)}</div>
                                <div style="color:#888;font-size:13px">${NextGen.UI.escHtml(lc.description || '')}</div>
                            </div>
                            ${statusHtml}
                        </div>
                        <div style="display:flex;gap:20px;font-size:13px;color:#666;margin:10px 0;flex-wrap:wrap">
                            <span><i class="fa-regular fa-calendar"></i> ${NextGen.UI.formatDate(start)}</span>
                            <span><i class="fa-regular fa-clock"></i> ${start.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                            <span><i class="fa-regular fa-hourglass"></i> ${lc.duration} min</span>
                            <span><i class="fa-solid fa-globe"></i> ${lc.platform || 'Custom'}</span>
                        </div>
                        <div style="margin-top:10px;display:flex;gap:8px">
                            ${isLive ? `<a href="${lc.meetingLink || '#'}" target="_blank" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#22c55e,#00D4FF);color:#fff;cursor:pointer;font-size:13px;text-decoration:none;display:inline-block"><i class="fa-solid fa-video"></i> ${NextGen.I18n.t('joinClass')}</a>` : ''}
                            ${isUpcoming ? `<span style="padding:8px 16px;border-radius:8px;background:rgba(0,212,255,0.1);color:#00D4FF;font-size:12px">🚀 Starts ${NextGen.UI.formatDate(start)}</span>` : ''}
                            ${lc.meetingLink && !isLive ? `<a href="${lc.meetingLink}" target="_blank" style="padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);color:#aaa;font-size:12px;text-decoration:none"><i class="fa-solid fa-external-link"></i> Open Link</a>` : ''}
                        </div>
                    </div>
                `
            }).join('') : '<p style="text-align:center;color:#666;padding:40px">No classes scheduled yet</p>'}
        `
        document.getElementById('scheduleLiveBtn')?.addEventListener('click', () => this.showScheduleForm(courseId, containerId))
    },

    // ===== CALENDAR =====
    renderCalendar(containerId, userId = null) {
        const container = document.getElementById(containerId)
        if (!container) return
        const uid = userId || this._getCurrentUserId()
        const events = NextGen.DB.getEventsForUser(uid)
        const now = new Date()
        const today = now.toISOString().slice(0, 10)
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="color:#fff;margin:0"><i class="fa-solid fa-calendar-days" style="color:#00D4FF"></i> ${NextGen.I18n.t('calendar')}</h3>
                <button id="addEventBtn" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:13px;transition:all 0.3s"><i class="fa-solid fa-plus"></i> ${NextGen.I18n.t('addEvent')}</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:20px">
                ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => `<div style="text-align:center;color:#888;font-size:12px;font-weight:600;padding:8px 0">${day}</div>`).join('')}
                ${Array.from({length: weekStart.getDay()}, (_, i) => `<div></div>`).join('')}
                ${Array.from({length: 7}, (_, i) => {
                    const d = new Date(weekStart)
                    d.setDate(weekStart.getDate() + i)
                    const dateStr = d.toISOString().slice(0, 10)
                    const dayEvents = events.filter(e => e.date === dateStr)
                    const isToday = dateStr === today
                    return `
                        <div style="padding:8px;border-radius:12px;background:${isToday ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.02)'};border:1px solid ${isToday ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'};min-height:80px">
                            <div style="color:${isToday ? '#00D4FF' : '#888'};font-size:13px;font-weight:${isToday ? '700' : '400'};margin-bottom:4px">${d.getDate()}</div>
                            ${dayEvents.slice(0, 2).map(e => `<div style="padding:3px 6px;border-radius:4px;background:rgba(0,212,255,0.1);font-size:10px;color:#00D4FF;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.title}">${e.title.slice(0, 15)}</div>`).join('')}
                            ${dayEvents.length > 2 ? `<div style="font-size:9px;color:#666">+${dayEvents.length - 2} more</div>` : ''}
                        </div>
                    `
                }).join('')}
            </div>
            <h4 style="color:#fff;margin:15px 0 10px">${NextGen.I18n.t('upcoming')}</h4>
            ${events.filter(e => e.date >= today).slice(0, 5).map(e => `
                <div style="display:flex;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:10px;margin-bottom:8px;border-left:3px solid ${e.type === 'live_class' ? '#22c55e' : '#00D4FF'}">
                    <div style="text-align:center;min-width:40px">
                        <div style="color:#00D4FF;font-size:20px;font-weight:700">${new Date(e.date).getDate()}</div>
                        <div style="color:#888;font-size:11px">${new Date(e.date).toLocaleString('default',{month:'short'})}</div>
                    </div>
                    <div style="flex:1">
                        <div style="color:#fff;font-weight:500;font-size:14px">${NextGen.UI.escHtml(e.title)}</div>
                        <div style="color:#888;font-size:12px">${e.startTime || ''} ${e.endTime ? `- ${e.endTime}` : ''}</div>
                    </div>
                    <div style="font-size:11px;color:#666">${e.type === 'live_class' ? '📺' : '📌'}</div>
                </div>
            `).join('') || '<p style="color:#666;padding:15px;text-align:center">No upcoming events</p>'}
        `
        document.getElementById('addEventBtn')?.addEventListener('click', () => this._showAddEventForm(containerId))
    },

    _showAddEventForm(containerId) {
        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-calendar-plus" style="color:#00D4FF"></i> ${NextGen.I18n.t('addEvent')}`,
            content: `
                <div style="display:grid;gap:15px">
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Title</label>
                        <input type="text" id="eventTitle" placeholder="Event title" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Date</label>
                        <input type="date" id="eventDate" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px">
                        <div>
                            <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Start Time</label>
                            <input type="time" id="eventStart" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                        <div>
                            <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">End Time</label>
                            <input type="time" id="eventEnd" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Type</label>
                        <select id="eventType" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="study">📚 Study Session</option>
                            <option value="exam">📝 Exam</option>
                            <option value="assignment">📋 Assignment Due</option>
                            <option value="meeting">🤝 Meeting</option>
                            <option value="other">📌 Other</option>
                        </select>
                    </div>
                </div>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), primary: false },
                { label: NextGen.I18n.t('save'), action: () => {
                    const title = document.getElementById('eventTitle')?.value.trim()
                    const date = document.getElementById('eventDate')?.value
                    if (!title || !date) { NextGen.UI.showToast('Title and date required', 'error'); return }
                    NextGen.DB.addEvent({
                        title,
                        date,
                        startTime: document.getElementById('eventStart')?.value || '',
                        endTime: document.getElementById('eventEnd')?.value || '',
                        type: document.getElementById('eventType')?.value || 'other',
                        userId: this._getCurrentUserId(),
                        participants: [this._getCurrentUserId()]
                    })
                    NextGen.UI.showToast('Event added!', 'success')
                    if (containerId) this.renderCalendar(containerId)
                }, primary: true }
            ]
        })
    },

    _getCurrentUserId() {
        return window.auth?.currentUser?.id?.toString() || window.auth?.currentUser?.email || 'guest'
    }
}

console.log('[NextGen] Live/Calendar module loaded')

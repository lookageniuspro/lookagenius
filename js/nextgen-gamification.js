/**
 * nextgen-gamification.js — XP, Badges, Leaderboards, Achievements, Streaks
 */

window.NextGen = window.NextGen || {}
if (!NextGen.DB) console.error('[Gamification] Core DB not loaded')

NextGen.Gamification = {
    // Achievement definitions
    BADGES: {
        first_course: { id: 'first_course', name: 'First Steps', icon: 'fa-graduation-cap', color: '#00D4FF', desc: 'Enrolled in your first course', xp: 50 },
        fast_learner: { id: 'fast_learner', name: 'Fast Learner', icon: 'fa-bolt', color: '#FBBF24', desc: 'Completed 5 lessons in one day', xp: 100 },
        streak_7: { id: 'streak_7', name: 'Weekly Warrior', icon: 'fa-fire', color: '#FF6432', desc: '7-day learning streak', xp: 200 },
        streak_30: { id: 'streak_30', name: 'Unstoppable', icon: 'fa-fire', color: '#ef4444', desc: '30-day learning streak', xp: 500 },
        quiz_master: { id: 'quiz_master', name: 'Quiz Master', icon: 'fa-brain', color: '#A855F7', desc: 'Passed 10 quizzes with 90%+', xp: 300 },
        top_performer: { id: 'top_performer', name: 'Top Performer', icon: 'fa-trophy', color: '#FBBF24', desc: 'Reached top 10 on leaderboard', xp: 400 },
        course_complete: { id: 'course_complete', name: 'Course Graduate', icon: 'fa-certificate', color: '#22c55e', desc: 'Completed your first course', xp: 300 },
        social_butterfly: { id: 'social_butterfly', name: 'Social Butterfly', icon: 'fa-comments', color: '#ec4899', desc: 'Participated in 20 discussions', xp: 150 },
        helper: { id: 'helper', name: 'Helping Hand', icon: 'fa-hand-holding-heart', color: '#22c55e', desc: 'Answered 5 student questions', xp: 200 },
        perfect_score: { id: 'perfect_score', name: 'Perfect Score', icon: 'fa-star', color: '#FBBF24', desc: 'Got 100% on an assignment', xp: 250 },
        early_bird: { id: 'early_bird', name: 'Early Bird', icon: 'fa-sun', color: '#eab308', desc: 'Completed a lesson before 7 AM', xp: 50 },
        night_owl: { id: 'night_owl', name: 'Night Owl', icon: 'fa-moon', color: '#6366f1', desc: 'Completed a lesson after 11 PM', xp: 50 },
        level_5: { id: 'level_5', name: 'Dedicated Scholar', icon: 'fa-crown', color: '#FF6432', desc: 'Reached level 5', xp: 100 },
        level_10: { id: 'level_10', name: 'Elite Scholar', icon: 'fa-crown', color: '#A855F7', desc: 'Reached level 10', xp: 500 },
        level_25: { id: 'level_25', name: 'Legendary Scholar', icon: 'fa-crown', color: '#FBBF24', desc: 'Reached level 25', xp: 1000 },
        first_upload: { id: 'first_upload', name: 'Content Creator', icon: 'fa-upload', color: '#00D4FF', desc: 'Uploaded your first file', xp: 50 },
        reviewer: { id: 'reviewer', name: 'Critic', icon: 'fa-star', color: '#FBBF24', desc: 'Reviewed 5 courses', xp: 100 },
        wallet_topup: { id: 'wallet_topup', name: 'Investor', icon: 'fa-wallet', color: '#22c55e', desc: 'Deposited into wallet', xp: 50 },
        subscription: { id: 'subscription', name: 'Premium Member', icon: 'fa-gem', color: '#00D4FF', desc: 'Subscribed to a premium plan', xp: 200 },
        forum_starter: { id: 'forum_starter', name: 'Conversation Starter', icon: 'fa-comment-dots', color: '#ec4899', desc: 'Started 5 forum threads', xp: 100 }
    },

    LEVEL_TITLES: [
        { minLevel: 1, title: 'Novice', icon: 'fa-seedling', color: '#22c55e' },
        { minLevel: 3, title: 'Apprentice', icon: 'fa-book', color: '#00D4FF' },
        { minLevel: 5, title: 'Scholar', icon: 'fa-graduation-cap', color: '#6366f1' },
        { minLevel: 10, title: 'Expert', icon: 'fa-flask', color: '#A855F7' },
        { minLevel: 15, title: 'Master', icon: 'fa-crown', color: '#FBBF24' },
        { minLevel: 20, title: 'Grandmaster', icon: 'fa-crown', color: '#FF6432' },
        { minLevel: 30, title: 'Legend', icon: 'fa-dragon', color: '#ef4444' }
    ],

    init() {
        console.log('[Gamification] Module initialized')
        NextGen.EventBus.on('level_up', ({ userId, level }) => {
            NextGen.UI.showToast(`🎉 Level Up! You reached level ${level}!`, 'success', 5000)
            // Check for level-based badges
            const levelBadges = { 5: 'level_5', 10: 'level_10', 25: 'level_25' }
            if (levelBadges[level]) this.awardBadge(userId, levelBadges[level])
        })
        NextGen.EventBus.on('badge_earned', ({ userId, badge }) => {
            NextGen.UI.showToast(`🏆 Badge Earned: ${badge.name}!`, 'success', 5000)
        })
    },

    getPlayer(userId) {
        return NextGen.DB.getPlayer(userId || this._getUserId())
    },

    getLevelTitle(level) {
        let title = this.LEVEL_TITLES[0]
        for (const t of this.LEVEL_TITLES) { if (level >= t.minLevel) title = t }
        return title
    },

    awardBadge(userId, badgeId) {
        const badge = this.BADGES[badgeId]
        if (!badge) return
        const player = NextGen.DB.getPlayer(userId)
        if (player.badges.find(b => b.id === badgeId)) return // Already has it
        NextGen.DB.addBadge(userId, { id: badge.id, name: badge.name, icon: badge.icon, color: badge.color, desc: badge.desc })
        NextGen.DB.addXP(userId, badge.xp)
    },

    logActivity(userId, action) {
        const xpAwards = {
            'lesson_complete': 10,
            'quiz_pass': 25,
            'assignment_submit': 15,
            'forum_post': 5,
            'forum_reply': 3,
            'course_enroll': 20,
            'course_complete': 100,
            'review_write': 10,
            'daily_login': 5
        }
        const xp = xpAwards[action] || 5
        NextGen.DB.addXP(userId, xp)
        NextGen.DB.updateStreak(userId)
    },

    checkAndAward(userId) {
        const player = NextGen.DB.getPlayer(userId)
        const d = NextGen.DB.getData()
        const userIdStr = userId

        // Check streak badges
        if (player.streak >= 7 && !player.badges.find(b => b.id === 'streak_7')) this.awardBadge(userId, 'streak_7')
        if (player.streak >= 30 && !player.badges.find(b => b.id === 'streak_30')) this.awardBadge(userId, 'streak_30')

        // Check course badges
        const submissions = (d.submissions || []).filter(s => s.studentId === userIdStr)
        const perfectScores = submissions.filter(s => {
            const assign = (d.assignments || []).find(a => a.id === s.assignmentId)
            return assign && s.grade === assign.maxScore
        })
        if (perfectScores.length >= 1 && !player.badges.find(b => b.id === 'perfect_score')) this.awardBadge(userId, 'perfect_score')

        // Check forum activity
        const threads = (d.threads || []).filter(t => t.authorId === userIdStr)
        const totalReplies = threads.reduce((s, t) => s + (t.repliesList?.length || 0), 0)
        if (threads.length >= 5 && !player.badges.find(b => b.id === 'forum_starter')) this.awardBadge(userId, 'forum_starter')
        if (totalReplies >= 20 && !player.badges.find(b => b.id === 'social_butterfly')) this.awardBadge(userId, 'social_butterfly')
    },

    renderPlayerProfile(userId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const player = this.getPlayer(userId)
        const levelTitle = this.getLevelTitle(player.level)
        const nextLevelXp = player.level * 100
        const progress = Math.min(100, (player.xp % 100) || 0)

        container.innerHTML = `
            <div style="text-align:center;padding:30px;background:rgba(255,255,255,0.02);border-radius:20px;border:1px solid rgba(255,255,255,0.08)">
                <div style="font-size:48px;margin-bottom:10px;color:${levelTitle.color}"><i class="fa-solid ${levelTitle.icon}"></i></div>
                <h3 style="color:#fff;margin:5px 0">Level ${player.level}</h3>
                <div style="color:${levelTitle.color};font-size:1.1rem;font-weight:600">${levelTitle.title}</div>
                <div style="margin:15px 0">
                    ${NextGen.UI.renderProgressBar(progress, '#00D4FF')}
                    <div style="font-size:12px;color:#888;margin-top:5px">${player.xp} XP · ${nextLevelXp} to next level</div>
                </div>
                <div style="display:flex;justify-content:center;gap:30px;margin:15px 0">
                    <div style="text-align:center">
                        <div style="color:#FBBF24;font-size:24px;font-weight:700">${player.streak}</div>
                        <div style="color:#888;font-size:12px">🔥 Streak</div>
                    </div>
                    <div style="text-align:center">
                        <div style="color:#00D4FF;font-size:24px;font-weight:700">${player.points}</div>
                        <div style="color:#888;font-size:12px">⭐ Points</div>
                    </div>
                    <div style="text-align:center">
                        <div style="color:#A855F7;font-size:24px;font-weight:700">${player.badges.length}</div>
                        <div style="color:#888;font-size:12px">🏆 Badges</div>
                    </div>
                </div>
            </div>
        `
    },

    renderBadges(userId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const player = this.getPlayer(userId)

        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-trophy" style="color:#FBBF24"></i> ${NextGen.I18n.t('myBadges')} (${player.badges.length}/${Object.keys(this.BADGES).length})</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
                ${Object.values(this.BADGES).map(badge => {
                    const earned = player.badges.find(b => b.id === badge.id)
                    return `
                        <div style="padding:15px;border-radius:16px;text-align:center;background:${earned ? `${badge.color}15` : 'rgba(255,255,255,0.02)'};border:1px solid ${earned ? `${badge.color}44` : 'rgba(255,255,255,0.05)'};opacity:${earned ? 1 : 0.4};transition:all 0.3s" ${earned ? `title="Earned: ${NextGen.UI.formatDate(earned.earnedAt)}"` : ''}>
                            <div style="font-size:32px;color:${badge.color};margin-bottom:8px"><i class="fa-solid ${badge.icon}"></i></div>
                            <div style="color:#fff;font-size:13px;font-weight:600;margin-bottom:4px">${badge.name}</div>
                            <div style="color:#888;font-size:11px">${badge.desc}</div>
                            ${earned ? `<div style="margin-top:6px;font-size:10px;color:${badge.color}">✓ Earned</div>` : `<div style="margin-top:6px;font-size:10px;color:#666">🔒 ${badge.xp} XP</div>`}
                        </div>
                    `
                }).join('')}
            </div>
        `
    },

    renderLeaderboard(containerId, limit = 20) {
        const container = document.getElementById(containerId)
        if (!container) return
        const leaderboard = NextGen.DB.getLeaderboard(limit)
        const currentUserId = this._getUserId()

        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-ranking-star" style="color:#FBBF24"></i> ${NextGen.I18n.t('leaderboard')}</h4>
            <div style="display:grid;gap:8px">
                ${leaderboard.map((p, i) => {
                    const isMe = p.userId === currentUserId
                    const levelTitle = this.getLevelTitle(p.level)
                    const medals = ['🥇', '🥈', '🥉']
                    const rankDisplay = i < 3 ? medals[i] : `#${i + 1}`
                    return `
                        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;background:${isMe ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)'};border:1px solid ${isMe ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}">
                            <div style="font-size:20px;width:40px;text-align:center">${rankDisplay}</div>
                            <div style="flex:1;display:flex;align-items:center;gap:12px">
                                <div style="width:36px;height:36px;border-radius:50%;background:${levelTitle.color}22;display:flex;align-items:center;justify-content:center;color:${levelTitle.color}">
                                    <i class="fa-solid ${levelTitle.icon}"></i>
                                </div>
                                <div>
                                    <div style="color:#fff;font-weight:600;font-size:14px">${NextGen.UI.escHtml(p.name || p.userId)}</div>
                                    <div style="color:#888;font-size:12px">Lv.${p.level} ${levelTitle.title}</div>
                                </div>
                            </div>
                            <div style="text-align:right">
                                <div style="color:#FBBF24;font-weight:700">${p.xp} XP</div>
                                <div style="color:#888;font-size:12px">${p.badges?.length || 0} badges</div>
                            </div>
                            ${isMe ? NextGen.UI.renderBadge('You', '#00D4FF') : ''}
                        </div>
                    `
                }).join('')}
            </div>
        `
    },

    renderXPNotification(userId) {
        const player = this.getPlayer(userId)
        const levelTitle = this.getLevelTitle(player.level)
        return `
            <div style="position:fixed;bottom:100px;right:20px;z-index:9999;background:rgba(5,5,20,0.95);border:1px solid #00D4FF44;border-radius:16px;padding:16px 24px;backdrop-filter:blur(20px);box-shadow:0 0 30px rgba(0,212,255,0.2);display:flex;align-items:center;gap:15px;animation:slideUp 0.5s cubic-bezier(0.175,0.885,0.32,1.275)">
                <div style="width:45px;height:45px;border-radius:50%;background:${levelTitle.color}22;display:flex;align-items:center;justify-content:center;color:${levelTitle.color};font-size:22px"><i class="fa-solid ${levelTitle.icon}"></i></div>
                <div>
                    <div style="color:#fff;font-weight:600;font-size:14px">+XP Earned!</div>
                    <div style="color:#888;font-size:12px">Level ${player.level} · ${player.xp} Total XP</div>
                </div>
            </div>
        `
    },

    _getUserId() {
        return window.auth?.currentUser?.id?.toString() || window.auth?.currentUser?.email || 'guest'
    }
}

console.log('[NextGen] Gamification module loaded')

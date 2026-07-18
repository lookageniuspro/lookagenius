/**
 * nextgen-paths.js — Learning Paths, AI Recommendations, Skill Trees
 */

window.NextGen = window.NextGen || {}
if (!NextGen.DB) console.error('[Paths] Core DB not loaded')

NextGen.Paths = {
    init() {
        console.log('[Paths] Module initialized')
        NextGen.EventBus.on('course_completed', ({ userId, courseId }) => {
            this.checkPathProgress(userId, courseId)
        })
    },

    // ===== LEARNING PATH CRUD =====
    showCreatePathForm(containerId) {
        const d = NextGen.DB.getData()
        const courses = d.courses || []

        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-map" style="color:#00D4FF"></i> Create Learning Path`,
            content: `
                <div style="display:grid;gap:15px">
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Path Title</label>
                        <input type="text" id="pathTitle" placeholder="e.g. Full-Stack Web Development" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Description</label>
                        <textarea id="pathDesc" rows="3" placeholder="What will students learn in this path?" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-family:inherit;resize:vertical"></textarea>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Category</label>
                        <select id="pathCategory" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="web">Web Development</option>
                            <option value="data">Data Science</option>
                            <option value="mobile">Mobile Development</option>
                            <option value="ai">AI & Machine Learning</option>
                            <option value="devops">DevOps</option>
                            <option value="design">UI/UX Design</option>
                            <option value="business">Business</option>
                            <option value="languages">Languages</option>
                            <option value="science">Science</option>
                            <option value="math">Mathematics</option>
                            <option value="engineering">Engineering</option>
                            <option value="medicine">Medicine</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Difficulty</label>
                        <select id="pathDifficulty" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="all">All Levels</option>
                        </select>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Estimated Duration</label>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                            <input type="number" id="pathDuration" placeholder="Duration value" min="1" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                            <select id="pathDurationUnit" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Courses in this Path</label>
                        <div style="max-height:200px;overflow-y:auto;display:grid;gap:8px;padding:10px;background:rgba(255,255,255,0.02);border-radius:12px">
                            ${courses.map(c => `
                                <label style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;transition:all 0.3s" onmouseover="this.style.background='rgba(0,212,255,0.05)'" onmouseout="this.style.background=''">
                                    <input type="checkbox" class="path-course-select" value="${c.id}" style="accent-color:#00D4FF">
                                    <span style="color:#ccc;font-size:13px">${NextGen.UI.escHtml(c.title)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            size: 'large',
            buttons: [
                { label: NextGen.I18n.t('cancel'), primary: false },
                { label: NextGen.I18n.t('create'), action: () => {
                    const title = document.getElementById('pathTitle')?.value.trim()
                    if (!title) { NextGen.UI.showToast('Please enter a path title', 'error'); return }
                    const selectedCourses = Array.from(document.querySelectorAll('.path-course-select:checked')).map(cb => cb.value)
                    const path = NextGen.DB.addLearningPath({
                        title,
                        description: document.getElementById('pathDesc')?.value.trim() || '',
                        category: document.getElementById('pathCategory')?.value || 'custom',
                        difficulty: document.getElementById('pathDifficulty')?.value || 'all',
                        duration: parseInt(document.getElementById('pathDuration')?.value) || 0,
                        durationUnit: document.getElementById('pathDurationUnit')?.value || 'hours',
                        courseIds: selectedCourses,
                        createdBy: this._getCurrentUserId(),
                        enrolledCount: 0,
                        status: 'active'
                    })
                    NextGen.UI.showToast('Learning path created!', 'success')
                    if (containerId) this.renderPathList(containerId)
                }, primary: true }
            ]
        })
    },

    // ===== RENDER LEARNING PATHS =====
    renderPathList(containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const paths = NextGen.DB.getLearningPaths()
        const d = NextGen.DB.getData()
        const courses = d.courses || []

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="color:#fff;margin:0"><i class="fa-solid fa-map" style="color:#00D4FF"></i> ${NextGen.I18n.t('paths')}</h3>
                <button id="createPathBtn" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;cursor:pointer;font-size:13px;transition:all 0.3s"><i class="fa-solid fa-plus"></i> Create Path</button>
            </div>
            ${paths.length ? paths.map(p => {
                const pathCourses = p.courseIds?.map(cId => courses.find(c => c.id == cId)).filter(Boolean) || []
                return `
                    <div style="padding:20px;background:rgba(255,255,255,0.03);border-radius:16px;margin-bottom:15px;border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.3s" onmouseover="this.style.borderColor='rgba(0,212,255,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
                            <div>
                                <div style="color:#fff;font-size:18px;font-weight:700">${NextGen.UI.escHtml(p.title)}</div>
                                <div style="color:#888;font-size:14px;margin-top:5px">${NextGen.UI.escHtml(p.description || '')}</div>
                            </div>
                            ${NextGen.UI.renderBadge(p.difficulty || 'all', '#A855F7')}
                        </div>
                        <div style="display:flex;gap:15px;font-size:13px;color:#666;flex-wrap:wrap;margin-bottom:12px">
                            <span><i class="fa-solid fa-layer-group"></i> ${pathCourses.length} courses</span>
                            <span><i class="fa-regular fa-clock"></i> ${p.duration || '?'} ${p.durationUnit || 'hours'}</span>
                            <span><i class="fa-solid fa-tag"></i> ${p.category || 'General'}</span>
                            <span><i class="fa-solid fa-users"></i> ${p.enrolledCount || 0} enrolled</span>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap">
                            ${pathCourses.map(c => `
                                <span style="padding:4px 12px;border-radius:20px;background:rgba(0,212,255,0.1);color:#00D4FF;font-size:12px;border:1px solid rgba(0,212,255,0.2)">${NextGen.UI.escHtml(c.title)}</span>
                            `).join('')}
                        </div>
                    </div>
                `
            }).join('') : '<p style="text-align:center;color:#666;padding:60px">No learning paths yet. Create your first path!</p>'}
        `
        document.getElementById('createPathBtn')?.addEventListener('click', () => this.showCreatePathForm(containerId))
    },

    // ===== AI RECOMMENDATIONS =====
    getRecommendations(userId, limit = 6) {
        const d = NextGen.DB.getData()
        const user = (d.users || []).find(u => u.id == userId)
        const courses = d.courses || []
        const player = NextGen.DB.getPlayer(userId)
        const enrolledIds = new Set((courses).filter(c => (c.studentsEnrolled || []).some(e => e == userId)).map(c => c.id))

        // Score each course
        const scored = courses.filter(c => !enrolledIds.has(c.id)).map(c => {
            let score = 0
            // Match category with user interests
            if (user?.details?.interests) {
                const interests = user.details.interests.toLowerCase()
                if (c.category && interests.includes(c.category.toLowerCase())) score += 30
                if (c.title && interests.split(',').some(i => c.title.toLowerCase().includes(i.trim().toLowerCase()))) score += 20
            }
            // Level-based matching
            if (user?.type === 'student' && user?.details?.level) {
                if (c.stage === user.details.level) score += 15
            }
            // Popularity
            score += (c.studentsEnrolled?.length || 0) * 2
            // Price (prefer free/cheaper)
            if (!c.price || c.price === 0) score += 10
            score += Math.random() * 5 // Random factor for variety
            return { course: c, score }
        })

        return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.course)
    },

    renderRecommendations(userId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const recommendations = this.getRecommendations(userId)

        container.innerHTML = `
            <h4 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-wand-magic-sparkles" style="color:#A855F7"></i> ${NextGen.I18n.t('smartRecommend')}</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px">
                ${recommendations.length ? recommendations.map(c => `
                    <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);transition:all 0.3s" onmouseover="this.style.borderColor='rgba(0,212,255,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div style="color:#fff;font-weight:600;margin-bottom:8px;font-size:14px">${NextGen.UI.escHtml(c.title)}</div>
                        <div style="color:#888;font-size:12px;margin-bottom:8px">${NextGen.UI.escHtml((c.description || '').slice(0, 80))}${c.description?.length > 80 ? '...' : ''}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <span style="color:${c.price ? '#FBBF24' : '#22c55e'};font-weight:600;font-size:14px">${c.price ? `${c.price} ${c.currency || 'EGP'}` : 'Free'}</span>
                            <a href="course-view.html?id=${c.id}" style="padding:6px 16px;border-radius:20px;border:none;background:linear-gradient(135deg,#00D4FF,#A855F7);color:#fff;font-size:12px;text-decoration:none">View</a>
                        </div>
                    </div>
                `).join('') : '<p style="color:#666;padding:20px;text-align:center">No recommendations yet. Enroll in courses to get personalized suggestions.</p>'}
            </div>
        `
    },

    // ===== PATH PROGRESS =====
    checkPathProgress(userId, completedCourseId) {
        const d = NextGen.DB.getData()
        const paths = (d.learningPaths || []).filter(p => (p.courseIds || []).includes(completedCourseId))
        paths.forEach(path => {
            const completed = (path.courseIds || []).filter(cId => {
                const course = (d.courses || []).find(c => c.id == cId)
                return course && (course.studentsEnrolled || []).includes(userId) && course.completionPercentage === 100
            })
            const progress = Math.round((completed.length / (path.courseIds?.length || 1)) * 100)
            NextGen.DB.updateLearningPath(path.id, { progress: { ...(path.progress || {}), [userId]: progress } })
            if (progress === 100) {
                NextGen.UI.showToast(`🎉 You completed the "${path.title}" learning path!`, 'success', 6000)
                NextGen.DB.addXP(userId, 500)
                NextGen.EventBus.emit('path_completed', { userId, pathId: path.id })
            }
        })
    },

    _getCurrentUserId() {
        return window.auth?.currentUser?.id?.toString() || window.auth?.currentUser?.email || 'guest'
    }
}

console.log('[NextGen] Learning Paths module loaded')

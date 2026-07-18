/**
 * nextgen-assignments.js — Homework, Assignments, Grading & Submission System
 */

window.NextGen = window.NextGen || {}
if (!window.NextGen.DB) console.error('[Assignments] Core DB not loaded')

NextGen.Assignments = {
    init() {
        console.log('[Assignments] Module initialized')
    },

    // ===== TEACHER: Create Assignment =====
    showCreateForm(courseId, containerId) {
        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-file-pen" style="color:#A855F7"></i> Create Assignment`,
            content: `
                <div style="display:grid;gap:15px">
                    <div>
                        <label style="color:#aaa;font-size:13px;margin-bottom:5px;display:block">Title</label>
                        <input type="text" id="assignTitle" placeholder="Assignment title" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;margin-bottom:5px;display:block">Description</label>
                        <textarea id="assignDesc" rows="4" placeholder="Describe the assignment..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-family:inherit;resize:vertical"></textarea>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px">
                        <div>
                            <label style="color:#aaa;font-size:13px;margin-bottom:5px;display:block">Max Score</label>
                            <input type="number" id="assignMaxScore" value="100" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                        <div>
                            <label style="color:#aaa;font-size:13px;margin-bottom:5px;display:block">Due Date</label>
                            <input type="date" id="assignDueDate" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                        </div>
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;margin-bottom:5px;display:block">Assignment Type</label>
                        <select id="assignType" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="homework">Homework</option>
                            <option value="quiz">Quiz</option>
                            <option value="project">Project</option>
                            <option value="essay">Essay</option>
                            <option value="code">Code Exercise</option>
                        </select>
                    </div>
                </div>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), action: () => {}, primary: false },
                { label: NextGen.I18n.t('create'), action: () => {
                    const title = document.getElementById('assignTitle')?.value.trim()
                    const desc = document.getElementById('assignDesc')?.value.trim()
                    const maxScore = parseInt(document.getElementById('assignMaxScore')?.value) || 100
                    const dueDate = document.getElementById('assignDueDate')?.value
                    const type = document.getElementById('assignType')?.value || 'homework'
                    if (!title) { NextGen.UI.showToast('Please enter a title', 'error'); return }
                    NextGen.DB.addAssignment({
                        courseId,
                        title,
                        description: desc,
                        maxScore,
                        dueDate,
                        type,
                        createdBy: this._getCurrentUserId(),
                        status: 'open'
                    })
                    NextGen.UI.showToast('Assignment created!', 'success')
                    NextGen.EventBus.emit('assignment_created', { courseId })
                    if (containerId) this.renderAssignmentList(courseId, containerId)
                }, primary: true }
            ]
        })
    },

    // ===== STUDENT: Submit Assignment =====
    showSubmitForm(assignmentId, containerId) {
        const d = NextGen.DB.getData()
        const assign = (d.assignments || []).find(a => a.id === assignmentId)
        if (!assign) return

        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-upload" style="color:#22c55e"></i> Submit: ${NextGen.UI.escHtml(assign.title)}`,
            content: `
                <div style="display:grid;gap:15px">
                    <textarea id="submitContent" rows="6" placeholder="Write your answer / upload description..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-family:inherit;resize:vertical"></textarea>
                    <div id="fileDropZone" style="border:2px dashed rgba(0,212,255,0.3);border-radius:16px;padding:30px;text-align:center;cursor:pointer;transition:all 0.3s" onmouseover="this.style.borderColor='#00D4FF'" onmouseout="this.style.borderColor='rgba(0,212,255,0.3)'">
                        <i class="fa-solid fa-cloud-arrow-up" style="font-size:40px;color:#00D4FF;margin-bottom:10px;display:block"></i>
                        <div style="color:#888;font-size:14px">Drag & drop files here or <span style="color:#00D4FF;cursor:pointer">browse</span></div>
                        <input type="file" id="fileInput" style="display:none" multiple>
                    </div>
                    <div id="selectedFiles" style="display:flex;flex-wrap:wrap;gap:8px"></div>
                </div>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), action: () => {}, primary: false },
                { label: NextGen.I18n.t('submit'), action: () => {
                    const content = document.getElementById('submitContent')?.value.trim()
                    if (!content) { NextGen.UI.showToast('Please provide your answer', 'error'); return }
                    const submission = NextGen.DB.addSubmission({
                        assignmentId,
                        courseId: assign.courseId,
                        studentId: this._getCurrentUserId(),
                        studentName: this._getCurrentUserName(),
                        content,
                        files: []  // File upload would need a file storage service
                    })
                    NextGen.EventBus.emit('submission_created', submission)
                    NextGen.UI.showToast('Assignment submitted!', 'success')
                    if (containerId) this.renderAssignmentsForStudent(assign.courseId, containerId)
                }, primary: true }
            ]
        })

        // File upload handling
        setTimeout(() => {
            const dropZone = document.getElementById('fileDropZone')
            const fileInput = document.getElementById('fileInput')
            const filesContainer = document.getElementById('selectedFiles')
            if (dropZone && fileInput) {
                dropZone.onclick = () => fileInput.click()
                dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = '#22c55e' }
                dropZone.ondragleave = () => { dropZone.style.borderColor = 'rgba(0,212,255,0.3)' }
                dropZone.ondrop = (e) => { e.preventDefault(); this._handleFiles(e.dataTransfer.files, filesContainer) }
                fileInput.onchange = () => this._handleFiles(fileInput.files, filesContainer)
            }
        }, 100)
    },

    _handleFiles(files, container) {
        if (!container || !files.length) return
        container.innerHTML = ''
        Array.from(files).forEach(f => {
            container.innerHTML += `<span style="padding:6px 14px;border-radius:8px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);color:#00D4FF;font-size:12px"><i class="fa-solid fa-paperclip"></i> ${f.name}</span>`
        })
    },

    // ===== TEACHER: Grade Submission =====
    showGradeForm(submissionId, containerId) {
        const d = NextGen.DB.getData()
        const sub = (d.submissions || []).find(s => s.id === submissionId)
        if (!sub) return
        const assign = (d.assignments || []).find(a => a.id === sub.assignmentId)

        NextGen.UI.showModal({
            title: `<i class="fa-solid fa-graduation-cap" style="color:#FBBF24"></i> Grade: ${NextGen.UI.escHtml(assign?.title || '')}`,
            content: `
                <div style="margin-bottom:20px;padding:15px;background:rgba(255,255,255,0.03);border-radius:12px">
                    <div style="color:#aaa;margin-bottom:10px"><strong>Student:</strong> ${NextGen.UI.escHtml(sub.studentName)}</div>
                    <div style="color:#ccc;line-height:1.7;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px">${NextGen.UI.escHtml(sub.content)}</div>
                    <div style="font-size:12px;color:#666">Submitted: ${NextGen.UI.formatDate(sub.submittedAt)}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px">
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Score / ${assign?.maxScore || 100}</label>
                        <input type="number" id="gradeScore" min="0" max="${assign?.maxScore || 100}" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none">
                    </div>
                    <div>
                        <label style="color:#aaa;font-size:13px;display:block;margin-bottom:5px">Status</label>
                        <select id="gradeStatus" style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(20,20,40,0.95);color:#fff;outline:none">
                            <option value="graded">Graded</option>
                            <option value="needs_revision">Needs Revision</option>
                        </select>
                    </div>
                </div>
                <textarea id="gradeFeedback" rows="3" placeholder="Feedback for student..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;outline:none;font-family:inherit;resize:vertical"></textarea>
            `,
            size: 'medium',
            buttons: [
                { label: NextGen.I18n.t('cancel'), action: () => {}, primary: false },
                { label: NextGen.I18n.t('assignGrade'), action: () => {
                    const score = parseInt(document.getElementById('gradeScore')?.value)
                    const feedback = document.getElementById('gradeFeedback')?.value.trim()
                    if (isNaN(score)) { NextGen.UI.showToast('Please enter a score', 'error'); return }
                    NextGen.DB.gradeSubmission(submissionId, score, feedback)
                    // Add XP for completing assignment
                    NextGen.DB.addXP(sub.studentId, Math.round(score / 10) + 5)
                    NextGen.UI.showToast('Submission graded!', 'success')
                    if (containerId) this.renderSubmissionsForAssignment(sub.assignmentId, containerId)
                }, primary: true }
            ]
        })
    },

    // ===== RENDER: Assignment List (Teacher view) =====
    renderAssignmentList(courseId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const d = NextGen.DB.getData()
        const assignments = (d.assignments || []).filter(a => a.courseId === courseId)

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="color:#fff;margin:0"><i class="fa-solid fa-file-pen" style="color:#A855F7"></i> ${NextGen.I18n.t('assignments')}</h3>
                <button id="createAssignBtn" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#A855F7,#ec4899);color:#fff;cursor:pointer;font-size:13px;transition:all 0.3s"><i class="fa-solid fa-plus"></i> Create Assignment</button>
            </div>
            ${assignments.length ? assignments.map(a => {
                const subs = (d.submissions || []).filter(s => s.assignmentId === a.id)
                const graded = subs.filter(s => s.status === 'graded').length
                return `
                    <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08)">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                            <div>
                                <div style="color:#fff;font-weight:600">${NextGen.UI.escHtml(a.title)}</div>
                                <div style="color:#888;font-size:13px">${NextGen.UI.escHtml(a.description || '')}</div>
                            </div>
                            ${NextGen.UI.renderBadge(a.type, '#A855F7')}
                        </div>
                        <div style="display:flex;gap:20px;font-size:13px;color:#666;margin-top:10px">
                            <span><i class="fa-solid fa-star"></i> Max: ${a.maxScore || 100}</span>
                            <span><i class="fa-regular fa-calendar"></i> Due: ${a.dueDate ? NextGen.UI.formatDate(a.dueDate) : 'No deadline'}</span>
                            <span><i class="fa-solid fa-users"></i> Submissions: ${graded}/${subs.length}</span>
                        </div>
                        <div style="margin-top:10px;display:flex;gap:8px">
                            <button class="view-subs-btn" data-assign-id="${a.id}" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(0,212,255,0.3);background:transparent;color:#00D4FF;cursor:pointer;font-size:12px">View Submissions (${subs.length})</button>
                            <button class="delete-assign-btn" data-assign-id="${a.id}" style="padding:6px 16px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:transparent;color:#ef4444;cursor:pointer;font-size:12px"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `
            }).join('') : '<p style="text-align:center;color:#666;padding:40px">No assignments yet</p>'}
        `

        document.getElementById('createAssignBtn')?.addEventListener('click', () => this.showCreateForm(courseId, containerId))
        container.querySelectorAll('.view-subs-btn').forEach(btn => {
            btn.addEventListener('click', () => this.renderSubmissionsForAssignment(btn.dataset.assignId, containerId))
        })
        container.querySelectorAll('.delete-assign-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (await NextGen.UI.showConfirm('Delete this assignment?')) {
                    NextGen.DB.deleteAssignment(btn.dataset.assignId)
                    this.renderAssignmentList(courseId, containerId)
                    NextGen.UI.showToast('Assignment deleted', 'info')
                }
            })
        })
    },

    // ===== RENDER: Submissions for Assignment (Teacher) =====
    renderSubmissionsForAssignment(assignmentId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const d = NextGen.DB.getData()
        const submissions = (d.submissions || []).filter(s => s.assignmentId === assignmentId)

        container.innerHTML = `
            <button class="back-to-assignments" style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#fff;cursor:pointer;margin-bottom:20px;font-size:13px"><i class="fa-solid fa-arrow-right"></i> Back to Assignments</button>
            <h3 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-users" style="color:#00D4FF"></i> Submissions (${submissions.length})</h3>
            ${submissions.length ? submissions.map(s => `
                <div style="padding:15px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08)">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <div>
                            <div style="color:#fff;font-weight:600">${NextGen.UI.escHtml(s.studentName)}</div>
                            <div style="font-size:12px;color:#666">${NextGen.UI.formatDate(s.submittedAt)}</div>
                        </div>
                        ${s.status === 'graded' ? NextGen.UI.renderBadge(`${s.grade}/${(d.assignments||[]).find(a=>a.id===assignmentId)?.maxScore || 100}`, '#22c55e') : NextGen.UI.renderBadge(s.status, '#eab308')}
                    </div>
                    ${s.status === 'submitted' ? `<button class="grade-sub-btn" data-sub-id="${s.id}" style="margin-top:10px;padding:6px 16px;border-radius:8px;border:none;background:linear-gradient(135deg,#FBBF24,#ec4899);color:#fff;cursor:pointer;font-size:12px"><i class="fa-solid fa-graduation-cap"></i> Grade</button>` : ''}
                    ${s.feedback ? `<div style="margin-top:8px;padding:8px;background:rgba(0,212,255,0.05);border-radius:8px;font-size:13px;color:#aaa">📝 ${NextGen.UI.escHtml(s.feedback)}</div>` : ''}
                </div>
            `).join('') : '<p style="text-align:center;color:#666;padding:40px">No submissions yet</p>'}
        `

        container.querySelector('.back-to-assignments')?.addEventListener('click', () => {
            const d2 = NextGen.DB.getData()
            const assign = (d2.assignments || []).find(a => a.id === assignmentId)
            if (assign) this.renderAssignmentList(assign.courseId, containerId)
        })
        container.querySelectorAll('.grade-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showGradeForm(btn.dataset.subId, containerId))
        })
    },

    // ===== RENDER: Student's Assignments =====
    renderAssignmentsForStudent(courseId, containerId) {
        const container = document.getElementById(containerId)
        if (!container) return
        const d = NextGen.DB.getData()
        const assignments = (d.assignments || []).filter(a => a.courseId === courseId && a.status === 'open')
        const userId = this._getCurrentUserId()
        const submissions = (d.submissions || []).filter(s => s.studentId === userId)

        container.innerHTML = `
            <h3 style="color:#fff;margin:0 0 15px"><i class="fa-solid fa-file-pen" style="color:#A855F7"></i> ${NextGen.I18n.t('assignments')}</h3>
            ${assignments.length ? assignments.map(a => {
                const mySub = submissions.find(s => s.assignmentId === a.id)
                return `
                    <div style="padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.08)">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                            <div>
                                <div style="color:#fff;font-weight:600">${NextGen.UI.escHtml(a.title)}</div>
                                <div style="color:#888;font-size:13px">${NextGen.UI.escHtml(a.description || '')}</div>
                            </div>
                            ${NextGen.UI.renderBadge(a.type, '#A855F7')}
                        </div>
                        <div style="display:flex;gap:20px;font-size:13px;color:#666;margin-top:10px;margin-bottom:10px">
                            <span><i class="fa-regular fa-calendar"></i> Due: ${a.dueDate ? NextGen.UI.formatDate(a.dueDate) : 'No deadline'}</span>
                            <span><i class="fa-solid fa-star"></i> ${a.maxScore || 100} pts</span>
                        </div>
                        ${mySub ? `
                            <div style="padding:10px;background:rgba(0,212,255,0.05);border-radius:8px;border:1px solid rgba(0,212,255,0.15)">
                                <div style="color:#00D4FF;font-size:13px"><i class="fa-solid fa-check-circle"></i> Submitted ${NextGen.UI.formatDate(mySub.submittedAt)}</div>
                                ${mySub.status === 'graded' ? `<div style="color:#fff;font-size:18px;font-weight:700;margin-top:5px">Score: ${mySub.grade}/${a.maxScore || 100}</div>` : `<div style="color:#eab308;font-size:13px">⏳ Awaiting grade</div>`}
                                ${mySub.feedback ? `<div style="margin-top:5px;color:#aaa;font-size:13px">📝 ${NextGen.UI.escHtml(mySub.feedback)}</div>` : ''}
                            </div>
                        ` : `
                            <button class="submit-assign-btn" data-assign-id="${a.id}" style="padding:8px 20px;border-radius:25px;border:none;background:linear-gradient(135deg,#22c55e,#00D4FF);color:#fff;cursor:pointer;font-size:13px"><i class="fa-solid fa-upload"></i> Submit</button>
                        `}
                    </div>
                `
            }).join('') : '<p style="text-align:center;color:#666;padding:40px">No assignments yet</p>'}
        `

        container.querySelectorAll('.submit-assign-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showSubmitForm(btn.dataset.assignId, containerId))
        })
    },

    _getCurrentUserId() {
        return window.auth?.currentUser?.id?.toString() || window.auth?.currentUser?.email || 'guest'
    },

    _getCurrentUserName() {
        return window.auth?.currentUser?.name || window.auth?.currentUser?.email || 'Guest'
    }
}

console.log('[NextGen] Assignments module loaded')

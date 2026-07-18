/**
 * db.js
 * Central Database with full CRUD for all entities
 */

const DB_KEY = 'lookagenius_db';

const defaultData = {
    users: [
        { id: 1, name: 'أحمد محمود', email: 'student@test.com', password: '123', type: 'student', active: true, details: { level: 'high', interests: 'لغات, برمجة' } },
        { id: 2, name: 'د. محمد طارق', email: 'teacher@test.com', password: '123', type: 'teacher', active: true, details: { specialty: 'فيزياء', experience: '10' } },
        { id: 3, name: 'مدير النظام', email: 'admin@lookagenius.com', password: 'password123', type: 'admin', active: true, details: {} },
        { id: 4, name: 'سارة أحمد', email: 'sara@test.com', password: '123', type: 'student', active: true, details: { level: 'university', interests: 'علوم, طب' } },
        { id: 5, name: 'أحمد علي', email: 'parent@test.com', password: '123', type: 'parent', active: true, details: { studentEmail: 'sara@test.com' } }
    ],
    courses: [
        { id: 101, title: "Arabic: Foundation & Eloquence", description: "Discover the magic of the Arabic language and master grammar and rhetoric.", category: "languages", price: 25, duration: "36 hours", badge: "Arabic", image: "https://picsum.photos/seed/arabic/400/250", stage: "all", currency: "USD", studentsEnrolled: [1, 4] },
        { id: 102, title: "Comprehensive English (A1-C1)", description: "Speak English confidently with certified international curricula.", category: "languages", price: 40, duration: "48 hours", badge: "English", image: "https://picsum.photos/seed/english/400/250", stage: "all", currency: "USD", studentsEnrolled: [1] },
        { id: 103, title: "French for Beginners", description: "Learn the language of art and culture from scratch.", category: "languages", price: 25, duration: "24 hours", badge: "French", image: "https://picsum.photos/seed/french/400/250", stage: "all", currency: "USD" },
        { id: 104, title: "German: Your Step to Europe", description: "Certified methodology to prepare for Goethe exams.", category: "languages", price: 40, duration: "30 hours", badge: "German", image: "https://picsum.photos/seed/german/400/250", stage: "all", currency: "USD" },
        { id: 105, title: "Fun Basic Science", description: "An interactive journey into the world of science for foundational stages.", category: "science", price: 20, duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/science/400/250", stage: "primary", currency: "USD" },
        { id: 106, title: "Science for Language Schools", description: "International curriculum for global students.", category: "science", price: 25, duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/biology/400/250", stage: "primary", currency: "USD" },
        { id: 107, title: "Integrated Science (High School)", description: "Intensive explanation of Chemistry, Physics, and Biology.", category: "science", price: 30, duration: "32 hours", badge: "Integrated Science", image: "https://picsum.photos/seed/integratedsci/400/250", stage: "high", currency: "USD" },
        { id: 108, title: "Mathematics Without Fears", description: "Simplifying complex mathematical concepts.", category: "math", price: 20, duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matharab/400/250", stage: "primary", currency: "USD" },
        { id: 109, title: "Math: Numbers & Geometry", description: "Mastering competitive mathematics.", category: "math", price: 25, duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matheng/400/250", stage: "middle", currency: "USD" },
        { id: 110, title: "Mental Math (Abacus)", description: "Developing mental abilities and speed in calculation.", category: "math", price: 45, duration: "20 hours", badge: "Mental Math", image: "https://picsum.photos/seed/mentalmath/400/250", stage: "all", currency: "USD" },
        { id: 111, title: "Physics: Power of the Universe", description: "Understanding the laws of mechanics and electricity simply.", category: "physics", price: 35, duration: "40 hours", badge: "Physics", image: "https://picsum.photos/seed/physics/400/250", stage: "high", currency: "USD" },
        { id: 112, title: "Analytical & Organic Chemistry", description: "Experiments and reactions that build the future.", category: "chemistry", price: 35, duration: "35 hours", badge: "Chemistry", image: "https://picsum.photos/seed/chemistry/400/250", stage: "high", currency: "USD" },
        { id: 113, title: "Advanced Biology", description: "Exploring the secrets of the cell and genetics.", category: "science", price: 30, duration: "30 hours", badge: "Biology", image: "https://picsum.photos/seed/biologyhs/400/250", stage: "high", currency: "USD" },
        { id: 114, title: "Geology & Environmental Science", description: "Studying Earth's layers and the planet's history.", category: "science", price: 25, duration: "25 hours", badge: "Geology", image: "https://picsum.photos/seed/geology/400/250", stage: "high", currency: "USD" },
        { id: 115, title: "Social Studies: History & Geography", description: "Stories of the past and geography of the present.", category: "social", price: 15, duration: "24 hours", badge: "Social Studies", image: "https://picsum.photos/seed/history/400/250", stage: "middle", currency: "USD" },
        { id: 116, title: "ICT & Future Tech", description: "Mastering the tools of the digital age.", category: "tech", price: 15, duration: "30 hours", badge: "ICT", image: "https://picsum.photos/seed/ict/400/250", stage: "all", currency: "USD" },
        { id: 117, title: "Engineering (Civil, Elec, Mech, Arch)", description: "University engineering specialties by top experts.", category: "engineering", price: 50, duration: "48 hours", badge: "Engineering", image: "https://picsum.photos/seed/engineering/400/250", stage: "university", currency: "USD" },
        { id: 118, title: "Medicine, Dentistry & Pharmacy", description: "Explaining complex medical curricula in a simple way.", category: "science", price: 60, duration: "60 hours", badge: "Medicine", image: "https://picsum.photos/seed/medicine/400/250", stage: "university", currency: "USD" },
        { id: 119, title: "Python from Scratch to Pro", description: "Learn Python and its applications in AI and Data Science.", category: "tech", price: 45, duration: "40 hours", badge: "Python", image: "https://picsum.photos/seed/python/400/250", stage: "career", currency: "USD" },
        { id: 120, title: "Data Analysis", description: "Mastering data analysis tools to make smart business decisions.", category: "tech", price: 40, duration: "35 hours", badge: "Data Analysis", image: "https://picsum.photos/seed/data/400/250", stage: "career", currency: "USD" },
        { id: 121, title: "Physics: 3rd Secondary", description: "Comprehensive coverage with smart simulations for modern physics.", category: "physics", price: 35, duration: "40 hours", badge: "Physics", image: "https://picsum.photos/seed/physics3/400/250", stage: "high", currency: "USD" },
        { id: 122, title: "Physics: 2nd Secondary", description: "Basics of mechanical and light physics with simplicity.", category: "physics", price: 30, duration: "35 hours", badge: "Physics", image: "https://picsum.photos/seed/physics2/400/250", stage: "high", currency: "USD" },
        { id: 123, title: "Chemistry: 3rd Secondary", description: "Organic and inorganic chemistry through understanding, not memorization.", category: "chemistry", price: 35, duration: "40 hours", badge: "Chemistry", image: "https://picsum.photos/seed/chem3/400/250", stage: "high", currency: "USD" }
    ],
    scholarships: [
        { id: 201, title: 'Erasmus Mundus', country: 'Europe', funding: 'Full Funding', university: 'Multiple', deadline: 'January', image: 'https://picsum.photos/seed/erasmus/400/250' },
        { id: 202, title: 'DAAD Scholarship', country: 'Germany', funding: 'Full Funding + Stipend', university: 'Multiple', deadline: 'Varies', image: 'https://picsum.photos/seed/daad/400/250' },
        { id: 203, title: 'Eiffel Scholarship', country: 'France', funding: 'Salary + Insurance', university: 'Multiple', deadline: 'January', image: 'https://picsum.photos/seed/eiffel/400/250' },
        { id: 204, title: 'Politecnico di Milano', country: 'Italy', funding: 'Fee Waiver + Gold Scholarship', university: 'Politecnico di Milano', deadline: 'February', image: 'https://picsum.photos/seed/politecnico/400/250' }
    ],
    articles: [
        { id: 301, title: 'Top 5 Tech Skills Needed in 2026', description: 'Discover the technical skills that make you an ideal candidate for major global companies.', category: 'tech', image: 'https://picsum.photos/seed/techskills/400/250', date: '2026-03-22', author: 'LookaGenius Team' },
        { id: 302, title: 'How to Choose the Right Scholarship', description: 'Your comprehensive guide to scholarship selection criteria in Europe and America.', category: 'scholarships', image: 'https://picsum.photos/seed/scholarship/400/250', date: '2026-03-21', author: 'Sarah Mahmoud' },
        { id: 303, title: 'Future of AI in Academic Education', description: 'Will AI change the traditional role of the teacher? Explore our predictions.', category: 'tech', image: 'https://picsum.photos/seed/ai-edu/400/250', date: '2026-03-20', author: 'Omar El Shamy' }
    ],
    services: [
        { id: 401, title: 'Academic Guidance', description: 'We pave the way for you to reach the best global universities through a strong professional academic file.', icon: 'graduation-cap', price: 1500, category: 'academic' },
        { id: 402, title: 'Professional Training', description: 'Intensive programs for companies and teams to learn the latest web technologies, programming, and AI.', icon: 'laptop-code', price: 2000, category: 'tech' },
        { id: 403, title: 'Innovation Lab', description: 'Transform your innovative idea into a real product (MVP) that competes in the global market.', icon: 'flask', price: 2500, category: 'tech' },
        { id: 404, title: 'University Admission Consulting', description: 'Comprehensive guidance for university applications, personal statements, and interview preparation.', icon: 'school', price: 800, category: 'academic' }
    ],
    team: [
        { id: 501, name: 'Dr. Ahmed Khalil', role: 'Academic Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Khalil&background=0D8ABC&color=fff&size=150' },
        { id: 502, name: 'Mr. Mohamed Mahran', role: 'Academic Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Mohamed+Mahran&background=4f46e5&color=fff&size=150' },
        { id: 503, name: 'Mahmoud Abo-Taleb', role: 'Financial Director', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Mahmoud+Taleb&background=020617&color=fff&size=150' },
        { id: 504, name: 'Mr. Ahmed Atef', role: 'Legal Manager', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Atef&background=1e293b&color=fff&size=150' },
        { id: 505, name: 'Ahmed Farouk', role: 'Business Development', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Ahmed+Farouk&background=334155&color=fff&size=150' },
        { id: 506, name: 'Sarah Mahmoud', role: 'Scholarship Consultant', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Sarah+Mahmoud&background=ec4899&color=fff&size=150' },
        { id: 507, name: 'Omar El Shamy', role: 'Tech Manager', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Omar+Shamy&background=06b6d4&color=fff&size=150' },
        { id: 508, name: 'Nada Tarek', role: 'Support Officer', category: 'leadership', image: 'https://ui-avatars.com/api/?name=Nada+Tarek&background=a855f7&color=fff&size=150' },
        { id: 509, name: 'Mr. Saad El-Din', role: 'English Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Saad+Eldin&background=0D8ABC&color=fff&size=150' },
        { id: 510, name: 'Miss Somaya Mohamed', role: 'English Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Somaya+Mohamed&background=8b5cf6&color=fff&size=150' },
        { id: 511, name: 'Miss Hadeer El-Sayed', role: 'English Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Hadeer+Sayed&background=c026d3&color=fff&size=150' },
        { id: 512, name: 'Miss Marwa Hamdy', role: 'Arabic Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Marwa+Hamdy&background=10b981&color=fff&size=150' },
        { id: 513, name: 'Mr. Farag El-Senoussi', role: 'French Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Farag+Senoussi&background=4f46e5&color=fff&size=150' },
        { id: 514, name: 'Miss Iman Omar', role: 'Physics Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Iman+Omar&background=a855f7&color=fff&size=150' },
        { id: 515, name: 'Miss Ashraqat Hassan', role: 'Chemistry Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Ashraqat+Hassan&background=FF3366&color=fff&size=150' },
        { id: 516, name: 'Mr. Islam Mohamed', role: 'Biology Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Islam+Mohamed&background=22c55e&color=fff&size=150' },
        { id: 517, name: 'Mr. Ahmed Magdy', role: 'History & Social Studies Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Ahmed+Magdy&background=eab308&color=fff&size=150' },
        { id: 518, name: 'Mrs. Sally Youssef', role: 'Mental Math Teacher', category: 'teacher', image: 'https://ui-avatars.com/api/?name=Sally+Youssef&background=06b6d4&color=fff&size=150' }
    ],
    courseCategories: [],
    currencies: [],
    settings: {
        siteName: 'LookaGenius',
        siteDescription: 'Educational Platform',
        whatsapp: '',
        email: '',
        currency: '$'
    },
    notifications: [],
    financials: [],
    settlementRequests: [],
    collaborations: [],
    invoices: [
        { id: 6001, userId: 1, courseId: 101, amount: 25, currency: 'USD', status: 'paid', issuedAt: '2026-01-15', dueAt: '2026-02-15', paidAt: '2026-01-20', description: 'Arabic: Foundation & Eloquence' },
        { id: 6002, userId: 1, courseId: 102, amount: 40, currency: 'USD', status: 'pending', issuedAt: '2026-03-01', dueAt: '2026-04-01', description: 'Comprehensive English (A1-C1)' }
    ],
    attendance: [
        { id: 7001, courseId: 101, date: '2026-01-10', records: [{ userId: 1, status: 'present' }] },
        { id: 7002, courseId: 101, date: '2026-01-17', records: [{ userId: 1, status: 'absent' }] },
        { id: 7003, courseId: 102, date: '2026-03-05', records: [{ userId: 1, status: 'present' }] }
    ],

    // NextGen Platform Collections
    assignments: [],
    submissions: [],
    messages: [],
    threads: [],
    gamification: {},
    liveClasses: [],
    events: [],
    learningPaths: [],
    payments: [],
    subscriptions: [],
    wallets: {},
    coupons: [],
    reviews: [],

    _version: 1
};

function initDB() {
    const existing = localStorage.getItem(DB_KEY)
    if (!existing) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData))
        return
    }
    try {
        const data = JSON.parse(existing)
        let changed = false
        const arrayKeys = ['courses', 'scholarships', 'articles', 'services', 'team', 'invoices', 'attendance', 'assignments', 'submissions', 'messages', 'threads', 'liveClasses', 'events', 'learningPaths', 'payments', 'subscriptions', 'coupons', 'reviews']
        for (const key of arrayKeys) {
            if (!data[key]) {
                data[key] = JSON.parse(JSON.stringify(defaultData[key] || []))
                changed = true
            }
        }
        const objectKeys = ['courseCategories', 'currencies', 'settings', 'notifications', 'financials', 'settlementRequests', 'collaborations', 'gamification', 'wallets']
        for (const key of objectKeys) {
            if (!data[key]) {
                data[key] = JSON.parse(JSON.stringify(defaultData[key] || (key === 'settings' ? defaultData.settings : {})))
                changed = true
            }
        }
        if (changed) saveData(data)
    } catch(e) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData))
    }
}

function getData() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || defaultData;
}

function saveData(data) {
    data._version = (data._version || 0) + 1;
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    if (window.__supabase && window.__supabase.isReady) {
        window.__supabase.pushAll(data)
    }
}

function makeId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function crudFor(key) {
    return {
        getAll: () => getData()[key] || [],
        getById: (id) => (getData()[key] || []).find(x => x.id === parseInt(id)),
        add: (item) => {
            const data = getData()
            item.id = makeId()
            data[key].push(item)
            saveData(data)
            return item
        },
        update: (id, updates) => {
            const data = getData()
            const arr = data[key]
            const idx = arr.findIndex(x => x.id === parseInt(id))
            if (idx !== -1) {
                arr[idx] = { ...arr[idx], ...updates }
                saveData(data)
                return true
            }
            return false
        },
        delete: (id) => {
            const data = getData()
            data[key] = (data[key] || []).filter(x => x.id !== parseInt(id))
            saveData(data)
            return true
        }
    }
}

window.db = {
    getData,
    saveData,

    // Users
    getUsers: () => getData().users,
    addUser: (user) => {
        const data = getData()
        user.id = makeId()
        user.active = true
        data.users.push(user)
        saveData(data)
        return user
    },
    updateUser: (id, updates) => {
        const data = getData()
        const idx = data.users.findIndex(u => u.id === parseInt(id))
        if (idx !== -1) {
            data.users[idx] = { ...data.users[idx], ...updates }
            saveData(data)
            return true
        }
        return false
    },
    deleteUser: (id) => {
        const data = getData()
        data.users = data.users.filter(u => u.id !== parseInt(id))
        saveData(data)
        return true
    },
    getUser: (id) => getData().users.find(u => u.id === parseInt(id)),

    // Courses
    getCourses: () => getData().courses,
    addCourse: (course) => {
        const data = getData()
        course.id = makeId()
        data.courses.push(course)
        saveData(data)
        return course
    },
    updateCourse: (id, updates) => {
        const data = getData()
        const idx = data.courses.findIndex(c => c.id === parseInt(id))
        if (idx !== -1) {
            data.courses[idx] = { ...data.courses[idx], ...updates }
            saveData(data)
            return true
        }
        return false
    },
    deleteCourse: (id) => {
        const data = getData()
        data.courses = data.courses.filter(c => c.id !== parseInt(id))
        saveData(data)
        return true
    },

    // Scholarships
    getScholarships: () => getData().scholarships,
    addScholarship: (item) => crudFor('scholarships').add(item),
    updateScholarship: (id, updates) => crudFor('scholarships').update(id, updates),
    deleteScholarship: (id) => crudFor('scholarships').delete(id),

    // Articles
    getArticles: () => getData().articles,
    addArticle: (item) => crudFor('articles').add(item),
    updateArticle: (id, updates) => crudFor('articles').update(id, updates),
    deleteArticle: (id) => crudFor('articles').delete(id),

    // Services
    getServices: () => getData().services,
    addService: (item) => crudFor('services').add(item),
    updateService: (id, updates) => crudFor('services').update(id, updates),
    deleteService: (id) => crudFor('services').delete(id),

    // Team
    getTeam: () => getData().team,
    addTeamMember: (item) => crudFor('team').add(item),
    updateTeamMember: (id, updates) => crudFor('team').update(id, updates),
    deleteTeamMember: (id) => crudFor('team').delete(id),

    addTeacherWithAccount: (data, password) => {
        const teacher = window.db.addUser({ name: data.name, email: data.email, password, type: 'teacher' })
        window.db.addTeamMember({ ...data, userId: teacher.id })
        return teacher
    },

    // Course Categories
    getCourseById: (id) => getData().courses.find(c => c.id === parseInt(id)),

    getPayments: () => (getData().invoices || []).filter(i => i.status === 'paid'),

    getCourseCategories: () => getData().courseCategories || [],
    addCourseCategory: (item) => crudFor('courseCategories').add(item),
    deleteCourseCategory: (id) => crudFor('courseCategories').delete(id),

    getLinkedTeachers: () => {
        const users = getData().users.filter(u => u.type === 'teacher' && u.active !== false)
        const team = getData().team
        return users.map(u => {
            const t = team.find(m => m.userId === u.id)
            return { ...u, specialty: t ? t.specialty : '' }
        })
    },

    // Notifications
    getNotifications: () => getData().notifications || [],
    addNotification: (item) => {
        const data = getData()
        item.id = makeId()
        item.read = false
        item.createdAt = new Date().toISOString()
        data.notifications.unshift(item)
        saveData(data)
        return item
    },
    markNotificationRead: (id) => crudFor('notifications').update(id, { read: true }),
    markAllNotificationsRead: () => {
        const data = getData()
        data.notifications.forEach(n => n.read = true)
        saveData(data)
    },
    deleteNotification: (id) => crudFor('notifications').delete(id),
    clearAllNotifications: () => {
        const data = getData()
        data.notifications = []
        saveData(data)
    },
    getUnreadNotificationsCount: () => (getData().notifications || []).filter(n => !n.read).length,

    // Settings
    getSettings: () => getData().settings || defaultData.settings,
    updateSettings: (updates) => {
        const data = getData()
        data.settings = { ...data.settings, ...updates }
        saveData(data)
    },

    // Financials
    getFinancials: () => getData().financials || [],

    // Settlement Requests
    getSettlementRequests: () => getData().settlementRequests || [],
    approveSettlementRequest: (id) => crudFor('settlementRequests').update(id, { status: 'approved' }),
    rejectSettlementRequest: (id) => crudFor('settlementRequests').update(id, { status: 'rejected' }),

    // Collaborations
    getCollaborations: () => getData().collaborations || [],
    addCollaboration: (item) => crudFor('collaborations').add(item),
    updateCollaboration: (id, updates) => crudFor('collaborations').update(id, updates),
    deleteCollaboration: (id) => crudFor('collaborations').delete(id),

    // Invoices
    getInvoices: () => getData().invoices || [],
    getInvoicesForUser: (userId) => (getData().invoices || []).filter(inv => inv.userId === parseInt(userId)),
    getInvoicesForCourse: (courseId) => (getData().invoices || []).filter(inv => inv.courseId === parseInt(courseId)),
    addInvoice: (item) => {
        const data = getData()
        item.id = makeId()
        item.issuedAt = new Date().toISOString().slice(0, 10)
        item.status = item.status || 'pending'
        if (!data.invoices) data.invoices = []
        data.invoices.push(item)
        saveData(data)
        return item
    },
    updateInvoice: (id, updates) => crudFor('invoices').update(id, updates),
    deleteInvoice: (id) => crudFor('invoices').delete(id),
    payInvoice: (id) => {
        const data = getData()
        const inv = (data.invoices || []).find(i => i.id === parseInt(id))
        if (inv) {
            inv.status = 'paid'
            inv.paidAt = new Date().toISOString().slice(0, 10)
            saveData(data)
            return true
        }
        return false
    },

    // Attendance
    getAttendance: () => getData().attendance || [],
    getAttendanceForCourse: (courseId) => (getData().attendance || []).filter(a => a.courseId === parseInt(courseId)),
    getAttendanceForStudent: (userId) => {
        const att = getData().attendance || []
        return att.filter(session => session.records.some(r => r.userId === parseInt(userId)))
    },
    getStudentAttendanceStats: (userId) => {
        const sessions = getData().attendance || []
        let present = 0, absent = 0
        sessions.forEach(s => {
            const rec = s.records.find(r => r.userId === parseInt(userId))
            if (rec) {
                if (rec.status === 'present') present++
                else if (rec.status === 'absent') absent++
            }
        })
        const total = present + absent
        return { present, absent, total, rate: total ? Math.round((present / total) * 100) : 0 }
    },
    addAttendanceSession: (session) => {
        const data = getData()
        session.id = makeId()
        if (!data.attendance) data.attendance = []
        data.attendance.push(session)
        saveData(data)
        return session
    },
    markAttendance: (sessionId, userId, status) => {
        const data = getData()
        const session = (data.attendance || []).find(s => s.id === parseInt(sessionId))
        if (!session) return false
        const rec = session.records.find(r => r.userId === parseInt(userId))
        if (rec) {
            rec.status = status
        } else {
            session.records.push({ userId: parseInt(userId), status })
        }
        saveData(data)
        return true
    },
    deleteAttendanceSession: (id) => crudFor('attendance').delete(id),

    /* ========= Supabase Adapter (async, used when Supabase is available) ========= */
    supabase: {
        async getCourses() {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getCourses()
            return sb.getPublishedCourses()
        },
        async getAllCourses() {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getCourses()
            return sb.getAllCourses()
        },
        async getCourseById(id) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getCourseById(id)
            return sb.getCourseById(id)
        },
        async getTeacherCourses(teacherId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getCourses().filter(c => c.instructor_id === teacherId)
            return sb.getTeacherCourses(teacherId)
        },
        async getEnrollments(studentId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getStudentEnrollments(studentId)
        },
        async getModules(courseId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getCourseModules(courseId)
        },
        async getLessons(moduleId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getModuleLessons(moduleId)
        },
        async getAssessments(courseId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getCourseAssessments(courseId)
        },
        async getQuestions(assessmentId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getAssessmentQuestions(assessmentId)
        },
        async getAttempts(studentId, assessmentId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getStudentAttempts(studentId, assessmentId)
        },
        async getCertificates(studentId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return []
            return sb.getStudentCertificates(studentId)
        },
        async getNotifications(userId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getNotifications()
            return sb.getNotifications(userId)
        },
        async getSettings() {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return window.db.getSettings()
            return sb.getSettings()
        },
        async enrollStudent(studentId, courseId, amount, status) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return null
            return sb.enrollStudent(studentId, courseId, amount, status)
        },
        async markComplete(studentId, lessonId, courseId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return null
            return sb.markLessonComplete(studentId, lessonId, courseId)
        },
        async issueCert(studentId, courseId) {
            const sb = window.supabaseApp; if (!sb || !sb.isReady()) return null
            return sb.issueCertificate(studentId, courseId)
        }
    }
}

initDB()

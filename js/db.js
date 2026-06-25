/**
 * db.js
 * Central Database with full CRUD for all entities
 */

const DB_KEY = 'lookagenius_db';

const defaultData = {
    users: [
        { id: 1, name: 'Ahmed Mahmoud', email: 'student@test.com', password: '123', type: 'student', active: true },
        { id: 2, name: 'Dr. Mohamed Tarek', email: 'teacher@test.com', password: '123', type: 'teacher', active: true },
        { id: 3, name: 'Admin User', email: 'admin@lookagenius.com', password: 'password123', type: 'admin', active: true }
    ],
    courses: [
        { id: 101, title: "Arabic: Foundation & Eloquence", description: "Discover the magic of the Arabic language and master grammar and rhetoric.", category: "languages", price: 25, duration: "36 hours", badge: "Arabic", image: "https://picsum.photos/seed/arabic/400/250" },
        { id: 102, title: "Comprehensive English (A1-C1)", description: "Speak English confidently with certified international curricula.", category: "languages", price: 40, duration: "48 hours", badge: "English", image: "https://picsum.photos/seed/english/400/250" },
        { id: 103, title: "French for Beginners", description: "Learn the language of art and culture from scratch.", category: "languages", price: 25, duration: "24 hours", badge: "French", image: "https://picsum.photos/seed/french/400/250" },
        { id: 104, title: "German: Your Step to Europe", description: "Certified methodology to prepare for Goethe exams.", category: "languages", price: 40, duration: "30 hours", badge: "German", image: "https://picsum.photos/seed/german/400/250" },
        { id: 105, title: "Fun Basic Science", description: "An interactive journey into the world of science for foundational stages.", category: "science", price: 20, duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/science/400/250" },
        { id: 106, title: "Science for Language Schools", description: "International curriculum for global students.", category: "science", price: 25, duration: "20 hours", badge: "Science", image: "https://picsum.photos/seed/biology/400/250" },
        { id: 107, title: "Integrated Science (High School)", description: "Intensive explanation of Chemistry, Physics, and Biology.", category: "science", price: 30, duration: "32 hours", badge: "Integrated Science", image: "https://picsum.photos/seed/integratedsci/400/250" },
        { id: 108, title: "Mathematics Without Fears", description: "Simplifying complex mathematical concepts.", category: "math", price: 20, duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matharab/400/250" },
        { id: 109, title: "Math: Numbers & Geometry", description: "Mastering competitive mathematics.", category: "math", price: 25, duration: "30 hours", badge: "Math", image: "https://picsum.photos/seed/matheng/400/250" },
        { id: 110, title: "Mental Math (Abacus)", description: "Developing mental abilities and speed in calculation.", category: "math", price: 45, duration: "20 hours", badge: "Mental Math", image: "https://picsum.photos/seed/mentalmath/400/250" },
        { id: 111, title: "Physics: Power of the Universe", description: "Understanding the laws of mechanics and electricity simply.", category: "physics", price: 35, duration: "40 hours", badge: "Physics", image: "https://picsum.photos/seed/physics/400/250" },
        { id: 112, title: "Analytical & Organic Chemistry", description: "Experiments and reactions that build the future.", category: "chemistry", price: 35, duration: "35 hours", badge: "Chemistry", image: "https://picsum.photos/seed/chemistry/400/250" },
        { id: 113, title: "Advanced Biology", description: "Exploring the secrets of the cell and genetics.", category: "science", price: 30, duration: "30 hours", badge: "Biology", image: "https://picsum.photos/seed/biologyhs/400/250" },
        { id: 114, title: "Geology & Environmental Science", description: "Studying Earth's layers and the planet's history.", category: "science", price: 25, duration: "25 hours", badge: "Geology", image: "https://picsum.photos/seed/geology/400/250" },
        { id: 115, title: "Social Studies: History & Geography", description: "Stories of the past and geography of the present.", category: "social", price: 15, duration: "24 hours", badge: "Social Studies", image: "https://picsum.photos/seed/history/400/250" },
        { id: 116, title: "ICT & Future Tech", description: "Mastering the tools of the digital age.", category: "tech", price: 15, duration: "30 hours", badge: "ICT", image: "https://picsum.photos/seed/ict/400/250" }
    ],
    scholarships: [
        { id: 201, title: 'Erasmus Mundus', country: 'Europe', funding: 'Full Funding', university: 'Multiple' },
        { id: 202, title: 'DAAD Scholarship', country: 'Germany', funding: 'Full Funding', university: 'Multiple' }
    ],
    articles: [],
    services: [],
    team: [],
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
    _version: 1
};

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    }
}

function getData() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || defaultData;
}

function saveData(data) {
    data._version = (data._version || 0) + 1;
    localStorage.setItem(DB_KEY, JSON.stringify(data));
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
    deleteCollaboration: (id) => crudFor('collaborations').delete(id)
}

initDB()

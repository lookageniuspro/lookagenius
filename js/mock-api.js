/**
 * mock-api.js
 * Mock REST API layer over localStorage.
 * Replace the base URL with a real backend to go live.
 */

const API = (() => {
    const BASE = '/api'; // unused in mock mode, for real backend swap

    // Simulate network delay
    function delay(ms = 200) {
        return new Promise(r => setTimeout(r, ms));
    }

    // Generic CRUD helpers
    function getAll(collection) {
        const data = window.db.getData();
        return data[collection] || [];
    }

    function getById(collection, id) {
        const items = getAll(collection);
        return items.find(item => item.id === parseInt(id)) || null;
    }

    function create(collection, item) {
        const data = window.db.getData();
        item.id = Date.now();
        if (!data[collection]) data[collection] = [];
        data[collection].push(item);
        window.db.saveData(data);
        return item;
    }

    function update(collection, id, updates) {
        const data = window.db.getData();
        const idx = (data[collection] || []).findIndex(item => item.id === parseInt(id));
        if (idx === -1) return null;
        data[collection][idx] = { ...data[collection][idx], ...updates };
        window.db.saveData(data);
        return data[collection][idx];
    }

    function remove(collection, id) {
        const data = window.db.getData();
        const before = (data[collection] || []).length;
        data[collection] = (data[collection] || []).filter(item => item.id !== parseInt(id));
        if (data[collection].length === before) return false;
        window.db.saveData(data);
        return true;
    }

    // Public API
    return {
        // ---- Courses ----
        courses: {
            list: async (filters = {}) => {
                await delay();
                let items = getAll('courses');
                if (filters.category && filters.category !== 'all') items = items.filter(c => c.category === filters.category);
                if (filters.stage && filters.stage !== 'all') items = items.filter(c => c.stage === filters.stage || c.stage === 'all');
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    items = items.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
                }
                if (filters.teacherId) items = items.filter(c => (c.teacherIds || []).includes(parseInt(filters.teacherId)));
                return items;
            },
            get: async (id) => { await delay(); return getById('courses', id); },
            create: async (data) => { await delay(); return create('courses', data); },
            update: async (id, data) => { await delay(); return update('courses', id, data); },
            delete: async (id) => { await delay(); return remove('courses', id); },
            enroll: async (courseId, userId) => { await delay(); return window.db.enrollStudent(courseId, userId); },
            unenroll: async (courseId, userId) => { await delay(); return window.db.unenrollStudent(courseId, userId); },
            progress: async (courseId, userId) => { await delay(); return window.db.getCourseProgress(courseId, userId); },
            updateLessonProgress: async (courseId, userId, lessonId, completed) => {
                await delay();
                return window.db.updateLessonProgress(courseId, userId, lessonId, completed);
            },
            getUserEnrolled: async (userId) => { await delay(); return window.db.getUserEnrolledCourses(userId); }
        },

        // ---- Users ----
        users: {
            list: async (filters = {}) => {
                await delay();
                let items = getAll('users');
                if (filters.type) items = items.filter(u => u.type === filters.type);
                if (filters.active !== undefined) items = items.filter(u => (u.active !== false) === filters.active);
                if (filters.search) {
                    const q = filters.search.toLowerCase();
                    items = items.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
                }
                return items;
            },
            get: async (id) => { await delay(); return getById('users', id); },
            create: async (data) => { await delay(); return window.db.addUser(data); },
            update: async (id, data) => { await delay(); return window.db.updateUser(id, data); },
            delete: async (id) => { await delay(); return window.db.updateUser(id, { active: false }); },
            login: async (email, password) => { await delay(); return window.auth.login(email, password); },
            register: async (data) => { await delay(); return window.auth.register(data); }
        },

        // ---- Scholarships ----
        scholarships: {
            list: async () => { await delay(); return getAll('scholarships'); },
            get: async (id) => { await delay(); return getById('scholarships', id); },
            create: async (data) => { await delay(); return create('scholarships', data); },
            update: async (id, data) => { await delay(); return update('scholarships', id, data); },
            delete: async (id) => { await delay(); return remove('scholarships', id); }
        },

        // ---- Articles ----
        articles: {
            list: async () => { await delay(); return getAll('articles'); },
            get: async (id) => { await delay(); return getById('articles', id); },
            create: async (data) => { await delay(); return create('articles', data); },
            update: async (id, data) => { await delay(); return update('articles', id, data); },
            delete: async (id) => { await delay(); return remove('articles', id); }
        },

        // ---- Services ----
        services: {
            list: async () => { await delay(); return getAll('services'); },
            get: async (id) => { await delay(); return getById('services', id); },
            create: async (data) => { await delay(); return create('services', data); },
            update: async (id, data) => { await delay(); return update('services', id, data); },
            delete: async (id) => { await delay(); return remove('services', id); }
        },

        // ---- Team ----
        team: {
            list: async () => { await delay(); return getAll('team'); },
            get: async (id) => { await delay(); return getById('team', id); },
            create: async (data) => { await delay(); return create('team', data); },
            update: async (id, data) => { await delay(); return update('team', id, data); },
            delete: async (id) => { await delay(); return remove('team', id); }
        },

        // ---- Collaborations ----
        collaborations: {
            list: async () => { await delay(); return getAll('collaborations'); },
            get: async (id) => { await delay(); return getById('collaborations', id); },
            create: async (data) => { await delay(); return create('collaborations', data); },
            update: async (id, data) => { await delay(); return update('collaborations', id, data); },
            delete: async (id) => { await delay(); return remove('collaborations', id); }
        },

        // ---- Financials ----
        financials: {
            list: async () => { await delay(); return getAll('financials'); },
            getByTeacher: async (teacherId) => { await delay(); return getAll('financials').find(f => f.teacherId === parseInt(teacherId)) || null; }
        },

        // ---- Settlement Requests ----
        settlements: {
            list: async () => { await delay(); return getAll('settlementRequests'); },
            create: async (data) => { await delay(); return window.db.addSettlementRequest(data); },
            approve: async (id) => { await delay(); return window.db.approveSettlementRequest(id); },
            reject: async (id) => { await delay(); return window.db.rejectSettlementRequest(id); }
        },

        // ---- Notifications ----
        notifications: {
            list: async () => { await delay(); return getAll('notifications'); },
            markRead: async (id) => { await delay(); window.db.markNotificationRead(id); },
            markAllRead: async () => { await delay(); window.db.markAllNotificationsRead(); },
            delete: async (id) => { await delay(); window.db.deleteNotification(id); },
            clearAll: async () => { await delay(); window.db.clearAllNotifications(); },
            unreadCount: async () => { await delay(); return window.db.getUnreadNotificationsCount(); },
            create: async (data) => { await delay(); return window.db.addNotification(data); }
        },

        // ---- Settings ----
        settings: {
            get: async () => { await delay(); return window.db.getSettings(); },
            update: async (data) => { await delay(); return window.db.updateSettings(data); }
        },

        // ---- Stats ----
        stats: {
            get: async () => {
                await delay();
                const users = getAll('users').filter(u => u.active !== false);
                const courses = getAll('courses');
                const scholarships = getAll('scholarships');
                const articles = getAll('articles');
                const services = getAll('services');
                const team = getAll('team');
                const notifs = getAll('notifications');
                return {
                    users: users.length,
                    usersByType: users.reduce((acc, u) => { acc[u.type] = (acc[u.type] || 0) + 1; return acc; }, {}),
                    courses: courses.length,
                    coursesByStage: courses.reduce((acc, c) => { acc[c.stage || 'all'] = (acc[c.stage || 'all'] || 0) + 1; return acc; }, {}),
                    coursesByCategory: courses.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {}),
                    scholarships: scholarships.length,
                    articles: articles.length,
                    services: services.length,
                    team: team.length,
                    unreadNotifications: notifs.filter(n => !n.read).length
                };
            }
        }
    };
})();

// Make available globally
window.API = API;

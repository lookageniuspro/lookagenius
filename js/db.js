/**
 * db.js
 * Mock Database with 16 Initial Courses (Restored from User Brief)
 */

const DB_KEY = 'lookagenius_db';

const defaultData = {
    users: [
        { id: 1, name: 'Ahmed Mahmoud', email: 'student@test.com', password: '123', type: 'student' },
        { id: 2, name: 'Dr. Mohamed Tarek', email: 'teacher@test.com', password: '123', type: 'teacher' },
        { id: 3, name: 'Admin User', email: 'admin@lookagenius.com', password: 'password123', type: 'admin' }
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
    ]
};

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    }
}

window.db = {
    getData: () => JSON.parse(localStorage.getItem(DB_KEY)) || defaultData,
    saveData: (data) => localStorage.setItem(DB_KEY, JSON.stringify(data)),
    getUsers: () => window.db.getData().users,
    getCourses: () => window.db.getData().courses,
    
    addUser: (user) => {
        const data = window.db.getData();
        user.id = Date.now();
        data.users.push(user);
        window.db.saveData(data);
        return user;
    },

    addCourse: (course) => {
        const data = window.db.getData();
        course.id = Date.now();
        data.courses.push(course);
        window.db.saveData(data);
        return course;
    },

    updateCourse: (id, updatedCourse) => {
        const data = window.db.getData();
        const index = data.courses.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            data.courses[index] = { ...data.courses[index], ...updatedCourse };
            window.db.saveData(data);
            return true;
        }
        return false;
    },

    deleteCourse: (id) => {
        const data = window.db.getData();
        data.courses = data.courses.filter(c => c.id !== parseInt(id));
        window.db.saveData(data);
        return true;
    }
};

initDB();

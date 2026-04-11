/**
 * LookaGenius - Supabase Authentication & Logic
 * -------------------------------------------
 * This file handles user sessions, registration, and login.
 * Integration with Supabase (Low-Code Backend).
 */

// IMPORTANT: Replace these with your own Supabase project details
const SUPABASE_URL = 'https://ofnzazrtgpmaekqtcejf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_UDT1nwvbwivUijDYcGMImQ_WHn4L-Q_';

// Initialize Supabase Client (Using CDN script in HTML)
let supabase;

document.addEventListener('DOMContentLoaded', async () => {
    // Check for both 'supabase' and 'supabasejs' globals depending on CDN version
    const lib = window.supabase || window.supabasejs;
    
    if (lib) {
        supabase = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
        checkSession();
    } else {
        console.error("Supabase library not loaded. Ensure the CDN script is included in the HTML.");
    }
});

/**
 * Check if a user is already logged in
 */
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        console.log("User logged in:", session.user);
        const role = session.user?.user_metadata?.role || 'student';
        const dashboardUrl = `dashboard-${role}.html`;
        
        // If on login/index page, redirect to dashboard if needed or update UI
        if (window.location.pathname.includes('login.html')) {
            window.location.href = dashboardUrl;
        }
        
        // Update Home Page CTA if logged in
        const mainCTA = document.querySelector('.ag-btn[href="login.html"]');
        if (mainCTA) {
            mainCTA.innerHTML = 'قـم بزيارة لوحة التحكم <i class="fa-solid fa-gauge"></i>';
            mainCTA.href = dashboardUrl;
        }
    } else {
        console.log("No active session.");
    }
}

/**
 * Sign Up Logic
 */
async function signUp(email, password, fullName, role = 'student') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role
            }
        }
    });

    if (error) {
        showToast(error.message, 'error');
    } else {
        showToast("تـم إنشاء الحساب! جاري التحويل للوحة التحكم...", 'success');
        setTimeout(() => {
            window.location.href = `dashboard-${role}.html`;
        }, 1500);
    }
}

/**
 * Login Logic
 */
async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showToast(error.message, 'error');
    } else {
        const role = data.user?.user_metadata?.role || 'student';
        window.location.href = `dashboard-${role}.html`;
    }
}

/**
 * Logout Logic
 */
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = 'index.html';
}

/**
 * UI Helper: Toast Notifications
 */
function showToast(message, type = 'info') {
    // Basic alert for now, can be upgraded to custom UI toast
    alert(`${type.toUpperCase()}: ${message}`);
}

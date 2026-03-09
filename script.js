const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const issuesContainer = document.getElementById('issues-container');
const searchInput = document.getElementById('search-input');
const issueCount = document.getElementById('issue-count');

let allIssues = []; 
let currentFilter = 'all';

// --- login function ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        showDashboard();
    } else {
        alert("Invalid credentials!");
    }
});

// dashbord function//
function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    fetchIssues();
}
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
// Logout function//
function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}


// --- data fetching ---
async function fetchIssues(query = '') {
    const url = query
        ? `${API_BASE}/issues/search?q=${query}`
        : `${API_BASE}/issues`;

    try {
        const res = await fetch(url);
        const result = await res.json();
        allIssues = result.data || result; 
        filterIssues(currentFilter); 
    } catch (err) {
        console.error("Error fetching issues:", err);
    }
}


//   FILTER LOGIC  //
function filterIssues(status) {
    currentFilter = status;
    
    // Update Tab UI //
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('tab-active', 'bg-indigo-600', 'text-white');
        tab.classList.add('bg-white', 'border');
        if (tab.innerText.toLowerCase() === status) {
            tab.classList.add('tab-active', 'bg-indigo-600', 'text-white');
            tab.classList.remove('bg-white', 'border');
        }
    });

    // Filter data //
    let filtered = allIssues;
    if (status !== 'all') {
        filtered = allIssues.filter(issue => issue.status?.toLowerCase() === status);
    }
    
    renderIssues(filtered);
}

//    render function //
function renderIssues(issues) {
    issueCount.innerText = issues.length;
    if (issues.length === 0) {
        issuesContainer.innerHTML = `<p class="col-span-full text-center py-10 text-gray-400">No ${currentFilter} issues found.</p>`;
        return;
    }

    issuesContainer.innerHTML = issues.map(issue => `
        <div onclick="viewDetails('${issue.id}')" class="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative border-t-4 ${getPriorityBorder(issue.priority)}">
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityBadge(issue.priority)}">
                    ${issue.priority}
                </span>
                <span class="w-2 h-2 rounded-full ${issue.status === 'open' ? 'bg-green-500' : 'bg-purple-500'}"></span>
            </div>
            <h4 class="font-bold text-sm mb-1 line-clamp-2">${issue.title}</h4>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${issue.description}</p>
            
            <div class="flex gap-2 mb-4">
                <span class="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded font-bold">🐞 BUG</span>
                <span class="text-[10px] bg-orange-50 text-orange-500 px-2 py-1 rounded font-bold">🙋 HELP WANTED</span>
            </div>

            <div class="flex justify-between items-center text-[10px] text-gray-400 pt-3 border-t">
                <span>#${issue.id} by ${issue.author || 'admin'}</span>
                <span>${issue.date || '1/15/2026'}</span>
            </div>
        </div>
    `).join('');
}

async function viewDetails(id) {
    const modal = document.getElementById('issue_modal');
    const content = document.getElementById('modal-content');
    content.innerHTML = `<div class="flex justify-center p-10"><span class="loading loading-spinner loading-lg text-indigo-600"></span></div>`;
    modal.showModal();

    try {
        const res = await fetch(`${API_BASE}/issue/${id}`);
        const result = await res.json();
        const issue = result.data || result;

        content.innerHTML = `
            <h2 class="text-2xl font-bold mb-2">${issue.title}</h2>
            <div class="flex items-center gap-2 mb-6">
                <span class="badge ${issue.status === 'open' ? 'badge-success' : 'badge-secondary'} text-white gap-1 px-3 py-3 capitalize">● ${issue.status}</span>
                <span class="text-sm text-gray-500">• Opened by Fahim Ahmed • 22/02/2026</span>
            </div>
            
            <div class="flex gap-2 mb-6">
                <span class="badge badge-outline text-red-400 border-red-100 bg-red-50 text-xs font-bold px-3">🐞 BUG</span>
                <span class="badge badge-outline text-orange-400 border-orange-100 bg-orange-50 text-xs font-bold px-3">🙋 HELP WANTED</span>
            </div>

            <p class="text-gray-600 mb-8">${issue.description}</p>

            <div class="bg-gray-50 rounded-xl p-6 flex justify-between">
                <div>
                    <p class="text-gray-400 text-sm mb-1">Assignee:</p>
                    <p class="font-bold text-gray-800">Fahim Ahmed</p>
                </div>
                <div class="text-right">
                    <p class="text-gray-400 text-sm mb-1">Priority:</p>
                    <span class="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                        ${issue.priority}
                    </span>
                </div>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<p class="text-red-500">Failed to load issue details.</p>`;
    }
}
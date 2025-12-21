let libraryData = [];

// 1. NAVIGATION & VIEW SWITCHING
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        switchView(target);
    });
});

function switchView(target) {
    // Toggle Active Class on Sidebar
    navItems.forEach(i => {
        i.classList.remove('active');
        if(i.getAttribute('data-target') === target) i.classList.add('active');
    });

    // Toggle Visibility of Views
    views.forEach(v => {
        v.classList.remove('active');
        if(v.id === `${target}-view`) v.classList.add('active');
    });

    // If switching to Catalog, generate the modules
    if (target === 'catalog') renderCatalog();
}

// 2. DATA INITIALIZATION
async function init() {
    // To refresh data from books.json, clear storage once if needed:
    // localStorage.removeItem('binary_shelf_db'); 

    const saved = localStorage.getItem('binary_shelf_db');
    
    if (saved) {
        libraryData = JSON.parse(saved);
    } else {
        try {
            const res = await fetch('books.json');
            libraryData = await res.json();
            localStorage.setItem('binary_shelf_db', JSON.stringify(libraryData));
        } catch (e) {
            console.error("Database sync failed:", e);
        }
    }
    refreshDashboard(libraryData);
}

// 3. RENDER TECH CATALOG PAGE
function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if(!grid) return;

    const modules = [
        { name: "Web Dev", icon: "fa-code", keyword: "Web" },
        { name: "Databases", icon: "fa-database", keyword: "Database" },
        { name: "CyberSec", icon: "fa-user-shield", keyword: "Cyber" },
        { name: "Cloud", icon: "fa-cloud", keyword: "Cloud" },
        { name: "Design", icon: "fa-pen-nib", keyword: "Design" },
        { name: "Mobile", icon: "fa-mobile-screen", keyword: "Mobile" }
    ];

    grid.innerHTML = modules.map(m => `
        <div class="module-card fade-in" onclick="filterByModule('${m.keyword}')">
            <i class="fas ${m.icon} animate-float"></i>
            <h4>${m.name}</h4>
            <p style="font-size:0.75rem; color:#64748b; margin-top:10px">Click to filter registry</p>
        </div>
    `).join('');
}

// 4. MODULE FILTERING LOGIC
window.filterByModule = (keyword) => {
    console.log("Filtering Registry for:", keyword);
    
    // Switch to Dashboard View
    switchView('dashboard');

    // Sync the Search Input UI
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.value = keyword;

    // Filter libraryData based on Title inclusion
    const filtered = libraryData.filter(book => 
        book.title.toLowerCase().includes(keyword.toLowerCase())
    );

    // Render filtered list to Dashboard
    refreshDashboard(filtered);
};

// 5. REFRESH DASHBOARD TABLE
function refreshDashboard(data) {
    const list = document.getElementById('book-list');
    const countDisplay = document.getElementById('total-count');
    
    if(!list) return;
    list.innerHTML = "";
    countDisplay.innerText = libraryData.length.toLocaleString();

    if(data.length === 0) {
        list.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:#94a3b8;">No matching tech modules found.</td></tr>`;
        return;
    }

    data.slice(0, 100).forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="title-main">${book.title}</span>
                <span class="author-sub">by ${book.author}</span>
            </td>
            <td><code>${book.isbn}</code></td>
            <td><span class="status-box ${book.status}">${book.status}</span></td>
            <td><i class="fas fa-trash-can del-btn" onclick="deleteBook('${book.isbn}')"></i></td>
        `;
        list.appendChild(row);
    });
}

// 6. SEARCH INPUT HANDLING
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = libraryData.filter(b => 
        b.title.toLowerCase().includes(term) || 
        b.author.toLowerCase().includes(term)
    );
    refreshDashboard(filtered);
});

// 7. ADD & DELETE OPERATIONS
document.getElementById('book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newBook = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        status: document.getElementById('status').value
    };
    libraryData.unshift(newBook);
    localStorage.setItem('binary_shelf_db', JSON.stringify(libraryData));
    refreshDashboard(libraryData);
    e.target.reset();
});

window.deleteBook = (isbn) => {
    if(confirm("Confirm deletion?")) {
        libraryData = libraryData.filter(b => b.isbn !== isbn);
        localStorage.setItem('binary_shelf_db', JSON.stringify(libraryData));
        refreshDashboard(libraryData);
    }
};

// Start
init();
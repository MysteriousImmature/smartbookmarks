document.addEventListener('DOMContentLoaded', function () {
    const bookmarkForm = document.getElementById('bookmarkForm');
    const urlInput = document.getElementById('url');
    const categoryInput = document.getElementById('category');
    const searchInput = document.getElementById('searchInput');
    const reloadButton = document.getElementById('reloadButton');
    const bookmarkList = document.getElementById('bookmarkList');
    const themeToggle = document.getElementById('themeToggle');
    
    // Initialize theme
    initTheme();
    
    bookmarkForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const url = urlInput.value;
        const category = categoryInput.value;
        
        if (url && category) {
            saveBookmark(url, category);
            urlInput.value = '';
            categoryInput.value = '';
            renderBookmarks();
        }
    });
    
    reloadButton.addEventListener('click', function () {
        renderBookmarks();
    });
    
    searchInput.addEventListener('input', renderBookmarks);
    
    themeToggle.addEventListener('click', toggleTheme);
    
    renderBookmarks();
    
    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icon
        updateThemeIcon(newTheme);
    }
    
    /**
     * Update the theme toggle icon based on current theme
     * @param {string} theme - Current theme ('light' or 'dark')
     */
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeToggle.innerHTML = '<svg class="icon"><use xlink:href="#icon-sun"></use></svg>';
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            themeToggle.innerHTML = '<svg class="icon"><use xlink:href="#icon-moon"></use></svg>';
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    }
    
    /**
     * Initialize theme from localStorage or default to light
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
});

function saveBookmark(url, category) {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
        const bookmarks = data.bookmarks;
        bookmarks.push({ 
            id: generateUniqueId(), 
            url, 
            category,
            title: extractTitleFromUrl(url)
        });
        chrome.storage.sync.set({ bookmarks });
    });
}

/**
 * Extract a title from URL for display purposes
 * @param {string} url - URL to extract title from
 * @returns {string} - Extracted title or domain
 */
function extractTitleFromUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch (e) {
        return url;
    }
}

function renderBookmarks() {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
        const bookmarks = data.bookmarks;
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const filteredBookmarks = searchTerm ? 
            bookmarks.filter(bookmark =>
                bookmark.category.toLowerCase().includes(searchTerm) ||
                bookmark.url.toLowerCase().includes(searchTerm)
            ) : bookmarks;
        
        const bookmarkList = document.getElementById('bookmarkList');
        bookmarkList.innerHTML = '';
        
        if (filteredBookmarks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <svg class="icon"><use xlink:href="#icon-bookmark"></use></svg>
                <p>No bookmarks found</p>
            `;
            bookmarkList.appendChild(emptyState);
            return;
        }
        
        filteredBookmarks.forEach(bookmark => {
            const listItem = document.createElement('li');
            listItem.classList.add('bookmark-item', 'fade-in');
            
            const bookmarkInfo = document.createElement('div');
            bookmarkInfo.className = 'bookmark-info';
            
            const categoryElement = document.createElement('span');
            categoryElement.textContent = bookmark.category;
            categoryElement.classList.add('category');
            bookmarkInfo.appendChild(categoryElement);
            
            const urlElement = document.createElement('a');
            urlElement.textContent = bookmark.title || bookmark.url;
            urlElement.href = bookmark.url;
            urlElement.target = '_blank';
            urlElement.classList.add('url');
            bookmarkInfo.appendChild(urlElement);
            
            listItem.appendChild(bookmarkInfo);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'bookmark-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '<svg class="icon"><use xlink:href="#icon-trash"></use></svg>';
            deleteBtn.title = 'Delete bookmark';
            deleteBtn.addEventListener('click', function () {
                if (confirm('Are you sure you want to delete this bookmark?')) {
                    deleteBookmark(bookmark.id);
                    renderBookmarks();
                }
            });
            
            actionsDiv.appendChild(deleteBtn);
            listItem.appendChild(actionsDiv);
            
            bookmarkList.appendChild(listItem);
        });
    });
}

function deleteBookmark(id) {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
        const bookmarks = data.bookmarks.filter(bookmark => bookmark.id !== id);
        chrome.storage.sync.set({ bookmarks });
    });
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
  
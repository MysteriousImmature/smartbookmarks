document.addEventListener('DOMContentLoaded', function () {
    const bookmarkForm = document.getElementById('bookmarkForm');
    const urlInput = document.getElementById('url');
    const categoryInput = document.getElementById('category');
    const searchInput = document.getElementById('searchInput');
    const reloadButton = document.getElementById('reloadButton');
    const bookmarkList = document.getElementById('bookmarkList');
  
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
  
    renderBookmarks();
  });
  
  function saveBookmark(url, category) {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
      const bookmarks = data.bookmarks;
      bookmarks.push({ id: generateUniqueId(), url, category });
      chrome.storage.sync.set({ bookmarks });
    });
  }
  
  function renderBookmarks() {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
      const bookmarks = data.bookmarks;
      const searchInput = document.getElementById('searchInput');
      const filteredBookmarks = bookmarks.filter(bookmark =>
        bookmark.category.toLowerCase().includes(searchInput.value.toLowerCase())
      );
  
      const bookmarkList = document.getElementById('bookmarkList');
      bookmarkList.innerHTML = '';
  
      filteredBookmarks.forEach(bookmark => {
        const listItem = document.createElement('li');
        listItem.classList.add('bookmark-item');
  
        const categoryElement = document.createElement('span');
        categoryElement.textContent = `Category: ${bookmark.category}`;
        categoryElement.classList.add('category');
        listItem.appendChild(categoryElement);
  
        const urlElement = document.createElement('a');
        urlElement.textContent = bookmark.url;
        urlElement.href = bookmark.url;
        urlElement.target = '_blank';
        urlElement.classList.add('url');
        listItem.appendChild(urlElement);
  
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-icon');
        deleteIcon.addEventListener('click', function () {
          deleteBookmark(bookmark.id);
          renderBookmarks();
        });
        listItem.appendChild(deleteIcon);
  
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
  
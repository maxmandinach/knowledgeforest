// js/content-search.js
window.KnowledgeForest = window.KnowledgeForest || {};

// Content search module
KnowledgeForest.ContentSearch = (function() {
    // Reference other modules
    const Data = KnowledgeForest.Data;
    const UI = KnowledgeForest.UI;
    
    // Content catalog
    const contentCatalog = [
        {
            id: 'scott-bessent',
            title: 'Scott Bessent on the All-In Podcast',
            subtitle: 'Key insights from Scott Bessent\'s appearance on the All-In Podcast',
            url: 'https://raw.githubusercontent.com/maxmandinach/knowledgeforest-content/main/all-in-podcast-scott-bessent.json',
            searchTerms: ['scott bessent', 'all-in', 'all in', 'allin', 'podcast']
        }
        // Add more content entries here as needed
    ];
    
    // Private variables
    let searchTimeout;
    const searchDelay = 300; // ms
    
    // Show search results
    function showSearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            results.forEach(item => {
                const resultEl = document.createElement('div');
                resultEl.className = 'search-result-item';
                resultEl.innerHTML = `
                    <div class="title">${item.title}</div>
                    <div class="subtitle">${item.subtitle}</div>
                `;
                
                resultEl.addEventListener('click', () => handleContentSelection(item));
                resultsContainer.appendChild(resultEl);
            });
        }
        
        resultsContainer.classList.add('active');
    }
    
    // Handle content selection
    async function handleContentSelection(item) {
        // Hide search results
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.classList.remove('active');
        }
        
        // Clear search input
        const searchInput = document.getElementById('content-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Show loading button
        const loadingButton = document.createElement('button');
        loadingButton.className = 'loading-button';
        loadingButton.innerHTML = 'AI generating flashcards... <span class="sparkle">✨</span>';
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(loadingButton);
        }
        
        try {
            // Fetch content
            const response = await fetch(item.url);
            if (!response.ok) throw new Error('Failed to fetch content');
            
            const content = await response.json();
            
            // Process content
            Data.processUploadedContent(content, item.id);
            
            // Update UI
            UI.showNotification(`Added "${content.episode_title}" with ${content.flashcards.length} flashcards`);
            UI.renderContentList();
            
        } catch (error) {
            console.error('Error loading content:', error);
            UI.showNotification('Error loading content. Please try again.');
        } finally {
            // Remove loading button
            loadingButton.remove();
        }
    }
    
    // Search content
    function searchContent(query) {
        if (!query) return [];
        
        query = query.toLowerCase();
        return contentCatalog.filter(item => {
            return item.searchTerms.some(term => term.includes(query)) ||
                   item.title.toLowerCase().includes(query) ||
                   item.subtitle.toLowerCase().includes(query);
        });
    }
    
    // Handle search input
    function handleSearchInput(event) {
        const query = event.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout
        searchTimeout = setTimeout(() => {
            const results = searchContent(query);
            showSearchResults(results);
        }, searchDelay);
    }
    
    // Close search results when clicking outside
    function handleClickOutside(event) {
        const searchContainer = document.querySelector('.search-container');
        const resultsContainer = document.getElementById('search-results');
        
        if (searchContainer && resultsContainer && 
            !searchContainer.contains(event.target) && 
            resultsContainer.classList.contains('active')) {
            resultsContainer.classList.remove('active');
        }
    }
    
    // Initialize search functionality
    function init() {
        const searchInput = document.getElementById('content-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInput);
        }
        
        document.addEventListener('click', handleClickOutside);
    }
    
    // Public API
    return {
        init: init
    };
})(); 
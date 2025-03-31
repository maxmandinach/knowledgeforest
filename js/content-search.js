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
            id: 'ezra-klein-1',
            title: 'Ezra Klein with Balaji Srinivasan',
            subtitle: 'Interview about crypto, politics, and media',
            url: 'https://raw.githubusercontent.com/maxmandinach/knowledgeforest-content/main/ezra-klein-1-flashcards.json',
            searchTerms: ['ezra', 'balaji', 'crypto', 'politics', 'media', 'ezra klein']
        },
        {
            id: 'tucker-soon-shiong',
            title: 'Tucker Carlson with Patrick Soon-Shiong',
            subtitle: 'Interview about biotech, media, and the future of cancer care',
            url: 'https://raw.githubusercontent.com/maxmandinach/knowledgeforest-content/main/tucker-soon-shiong-flashcards.json',
            searchTerms: ['tucker', 'patrick soon-shiong', 'cancer', 'biotech', 'tucker carlson']
        },
        {
            id: 'lex-fridman-1',
            title: 'Lex Fridman with Sam Altman',
            subtitle: 'Interview about AI, technology, and the future',
            url: 'https://raw.githubusercontent.com/maxmandinach/knowledgeforest-content/main/lex-fridman-1-flashcards.json',
            searchTerms: ['lex', 'sam altman', 'ai', 'technology', 'lex fridman']
        }
    ];
    
    // Track selected episodes - using let since we need to reassign this array after generating flashcards
    let selectedEpisodes = [];
    
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
    
    // Render the selected episodes list
    function renderSelectedEpisodes() {
        const listEl = document.getElementById('selected-episodes-list');
        const containerEl = document.getElementById('selected-episodes');
        const generateBtn = document.getElementById('generate-flashcards-btn');
        
        if (!listEl || !containerEl || !generateBtn) return;
        
        // Clear existing list
        listEl.innerHTML = '';
        
        // Show/hide container based on selection
        containerEl.classList.toggle('visible', selectedEpisodes.length > 0);
        
        // Enable/disable generate button
        generateBtn.disabled = selectedEpisodes.length === 0;
        
        // Add each selected episode to the list
        selectedEpisodes.forEach(episode => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${episode.title}
                <button class="remove-episode" data-id="${episode.id}">×</button>
            `;
            
            // Add remove button handler
            const removeBtn = li.querySelector('.remove-episode');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                removeEpisode(episode.id);
            });
            
            listEl.appendChild(li);
        });
    }
    
    // Remove an episode from selection
    function removeEpisode(id) {
        const index = selectedEpisodes.findIndex(ep => ep.id === id);
        if (index !== -1) {
            selectedEpisodes.splice(index, 1);
            renderSelectedEpisodes();
        }
    }
    
    // Handle content selection
    function handleContentSelection(item) {
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
        
        // Check if episode is already selected
        if (selectedEpisodes.some(ep => ep.id === item.id)) {
            UI.showNotification('This episode is already selected');
            return;
        }
        
        // Add to selected episodes
        selectedEpisodes.push(item);
        renderSelectedEpisodes();
        
        // Show notification
        UI.showNotification(`Added "${item.title}" to selection`);
    }
    
    // Generate flashcards from selected episodes
    function generateFlashcards() {
        const generateBtn = document.getElementById('generate-flashcards-btn');
        if (!generateBtn) return;
        
        // Disable button and show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating flashcards... ✨';
        generateBtn.classList.add('loading');
        
        // Get selected episodes from our tracked array
        if (selectedEpisodes.length === 0) {
            UI.showNotification('Please select at least one episode');
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate Flashcards';
            generateBtn.classList.remove('loading');
            return;
        }
        
        // Log URLs for debugging
        console.log('Selected episodes:', selectedEpisodes.map(ep => ({
            id: ep.id,
            title: ep.title,
            url: ep.url
        })));
        
        // Simulate AI generation delay
        setTimeout(() => {
            // Create array to store all flashcards
            const allFlashcards = [];
            
            // Fetch content from each selected episode using their URLs
            Promise.all(selectedEpisodes.map(episode => {
                console.log('Fetching from URL:', episode.url);
                return fetch(episode.url);
            }))
                .then(responses => Promise.all(responses.map(r => r.json())))
                .then(contents => {
                    // Combine flashcards from all episodes
                    contents.forEach(content => {
                        if (content.flashcards) {
                            allFlashcards.push(...content.flashcards);
                        }
                    });
                    
                    // Create a unique ID for the combined content
                    const combinedId = 'content-' + Date.now();
                    
                    // Set the title based on number of episodes selected
                    const title = selectedEpisodes.length === 1 
                        ? selectedEpisodes[0].title  // Use actual episode title for single selection
                        : 'Combined Episodes';       // Fallback for multiple episodes
                    
                    // Process the combined flashcards with source IDs
                    Data.processUploadedContent({
                        episode_title: title,
                        flashcards: allFlashcards
                    }, combinedId, selectedEpisodes.map(ep => ep.id));
                    
                    // Show success notification
                    UI.showNotification(`Generated ${allFlashcards.length} flashcards from ${selectedEpisodes.length} episode${selectedEpisodes.length > 1 ? 's' : ''}`);
                    
                    // Clear selected episodes and update UI
                    selectedEpisodes = [];
                    renderSelectedEpisodes();
                    
                    // Force a re-render of the content list to show the new flashcards
                    UI.renderContentList();
                    
                    // Reset button state
                    generateBtn.disabled = false;
                    generateBtn.textContent = '✨ Generate Flashcards';
                    generateBtn.classList.remove('loading');
                })
                .catch(error => {
                    console.error('Error generating flashcards:', error);
                    UI.showNotification('Error generating flashcards');
                    
                    // Reset button state
                    generateBtn.disabled = false;
                    generateBtn.textContent = '✨ Generate Flashcards';
                    generateBtn.classList.remove('loading');
                });
        }, 2800); // 2.8 second delay
    }
    
    // Search content
    function searchContent(query) {
        // Return empty array if query is less than 2 characters
        if (!query || query.length < 2) return [];
        
        query = query.toLowerCase();
        return contentCatalog.filter(item => {
            return item.title.toLowerCase().includes(query) ||
                   item.searchTerms.some(term => term.toLowerCase().includes(query));
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
        
        // Add generate button click handler
        const generateBtn = document.getElementById('generate-flashcards-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', generateFlashcards);
        }
        
        document.addEventListener('click', handleClickOutside);
    }
    
    // Public API
    return {
        init: init,
        getSelectedEpisodes: function() { return selectedEpisodes; }
    };
})(); 
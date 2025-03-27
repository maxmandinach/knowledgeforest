// js/data.js
window.KnowledgeForest = window.KnowledgeForest || {};

// Data management module
KnowledgeForest.Data = (function() {
    // Private variables
    let contentLibrary = [];
    
    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('knowledgeForestData');
        if (savedData) {
            try {
                contentLibrary = JSON.parse(savedData);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                contentLibrary = [];
            }
        }
        return contentLibrary;
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('knowledgeForestData', JSON.stringify(contentLibrary));
    }
    
    // Create default content for new users
    function createDefaultContent() {
        contentLibrary = [
            {
                id: "sample1",
                title: "Sample Content - Introduction to Spaced Repetition",
                type: "article",
                source: "Knowledge Forest",
                date: new Date().toISOString(),
                cards: [
                    {
                        id: "sample1-card1",
                        type: "regular",
                        question: "What is spaced repetition?",
                        answer: "Spaced repetition is a learning technique that incorporates increasing intervals of time between subsequent review of previously learned material to exploit the psychological spacing effect.",
                        direct_quotes: null,
                        lastReviewed: null,
                        nextReview: new Date().toISOString(),
                        interval: 0,
                        ease: 2.5,
                        reviewHistory: []
                    },
                    {
                        id: "sample1-card2",
                        type: "regular",
                        question: "Who invented the first formal spaced repetition system?",
                        answer: "Hermann Ebbinghaus, a German psychologist, was the first to systematically study the spacing effect and forgetting curves in the 1880s, though modern implementations were developed in the 1960s and 1970s.",
                        direct_quotes: null,
                        lastReviewed: null,
                        nextReview: new Date().toISOString(),
                        interval: 0,
                        ease: 2.5,
                        reviewHistory: []
                    },
                    {
                        id: "sample1-card3",
                        type: "supplementary",
                        question: "What is the 'forgetting curve'?",
                        answer: "The forgetting curve is a mathematical formula that describes the rate at which information is forgotten after it is initially learned, showing that memory retention decreases exponentially over time when there is no attempt to retain it.",
                        direct_quotes: null,
                        lastReviewed: null,
                        nextReview: new Date().toISOString(),
                        interval: 0,
                        ease: 2.5,
                        reviewHistory: []
                    }
                ]
            }
        ];
        saveData();
    }
    
    // Load sample data
    function loadSampleData() {
        if (contentLibrary.length === 0) {
            createDefaultContent();
        }
    }
    
    // Process uploaded content
    function processUploadedContent(content, id) {
        if (!content.episode_title || !content.flashcards || !Array.isArray(content.flashcards)) {
            console.error('Invalid content format');
            return;
        }
        
        // Extract information from the filename or content
        const contentItem = {
            id: id,
            title: content.episode_title,
            type: 'podcast',
            source: content.episode_title.split(' - ')[0] || 'Unknown Source',
            date: new Date().toISOString(),
            cards: []
        };
        
        // Process each flashcard
        content.flashcards.forEach((card, index) => {
            contentItem.cards.push({
                id: `${id}-card${index}`,
                type: card.supplementary ? 'supplementary' : 'regular',
                question: card.question,
                answer: card.answer,
                direct_quotes: card.direct_quotes || null,
                lastReviewed: null,
                nextReview: new Date().toISOString(),
                interval: 0,
                ease: 2.5,
                reviewHistory: []
            });
        });
        
        // Add to library and save
        contentLibrary.push(contentItem);
        saveData();
    }
    
    // Public API
    return {
        loadData: loadData,
        saveData: saveData,
        getLibrary: function() { return contentLibrary; },
        setLibrary: function(library) { contentLibrary = library; saveData(); },
        loadSampleData: loadSampleData,
        processUploadedContent: processUploadedContent,
        createDefaultContent: createDefaultContent
    };
})();
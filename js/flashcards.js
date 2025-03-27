// js/flashcards.js
window.KnowledgeForest = window.KnowledgeForest || {};

// Flashcard module
KnowledgeForest.Flashcards = (function() {
    // Reference other modules
    const Data = KnowledgeForest.Data;
    const Algorithm = KnowledgeForest.Algorithm;
    const UI = KnowledgeForest.UI;
    
    // Private variables
    let currentSession = {
        cards: [],
        currentCardIndex: 0,
        reviewedCount: 0,
        totalRating: 0
    };
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Start a review session
    function startSession() {
        // Get selected content IDs
        const selectedContentIds = UI.getSelectedContentIds();
        const includeSupplementary = UI.getIncludeSupplementary();
        
        // If no content is selected, select the first available content
        if (selectedContentIds.length === 0 && Data.getLibrary().length > 0) {
            UI.toggleContentSelection(Data.getLibrary()[0].id);
        }
        
        // Get cards for selected content
        let allCards = [];
        const selectedIds = UI.getSelectedContentIds();
        
        selectedIds.forEach(id => {
            const content = Data.getLibrary().find(c => c.id === id);
            if (content) {
                allCards = allCards.concat(content.cards.map(card => ({
                    ...card,
                    contentId: content.id,
                    contentTitle: content.title,
                    source: content.source
                })));
            }
        });
        
        // Filter cards based on due date and type
        currentSession.cards = allCards.filter(card => {
            const isSupplementary = card.type === 'supplementary' || card.supplementary === true;
            const isDue = new Date(card.nextReview || new Date().toISOString()) <= new Date();
            
            return isDue && (includeSupplementary || !isSupplementary);
        });
        
        // If no cards are due, show all selected cards
        if (currentSession.cards.length === 0) {
            currentSession.cards = allCards.filter(card => {
                const isSupplementary = card.type === 'supplementary' || card.supplementary === true;
                return includeSupplementary || !isSupplementary;
            });
        }
        
        // Sort by due date (oldest first)
        currentSession.cards.sort((a, b) => {
            const dateA = new Date(a.nextReview || new Date().toISOString());
            const dateB = new Date(b.nextReview || new Date().toISOString());
            return dateA - dateB;
        });

        // Reset session variables
        currentSession.currentCardIndex = 0;
        currentSession.reviewedCount = 0;
        currentSession.totalRating = 0;

        // Switch to flashcard view
        UI.showFlashcards();

        // Show first card
        showNextCard();
    }
    
    // Show next card
    function showNextCard() {
        if (currentSession.currentCardIndex >= currentSession.cards.length) {
            // Session complete
            UI.showCurrentCard(null, true);
            UI.updateSessionStats(0, currentSession.reviewedCount, 
                currentSession.totalRating / currentSession.reviewedCount);
            return;
        }

        const card = currentSession.cards[currentSession.currentCardIndex];
        UI.showCurrentCard(card, false);
        UI.updateSessionStats(
            currentSession.cards.length - currentSession.currentCardIndex,
            currentSession.reviewedCount,
            currentSession.totalRating / (currentSession.reviewedCount || 1)
        );
    }

    // Show answer for current card
    function showAnswer() {
        UI.showAnswer();
    }

    // Rate current card
    function rateCard(rating) {
        if (currentSession.currentCardIndex >= currentSession.cards.length) return;

        const card = currentSession.cards[currentSession.currentCardIndex];
        
        // Update card with new review data
        const updatedCard = Algorithm.calculateNextReview(rating, card);
        currentSession.cards[currentSession.currentCardIndex] = updatedCard;
        
        // Update session statistics
        currentSession.reviewedCount++;
        currentSession.totalRating += rating;
        
        // Move to next card
        currentSession.currentCardIndex++;
        showNextCard();
    }

    // Return to dashboard
    function backToDashboard() {
        UI.showDashboard();
        // Save any changes to the cards
        Data.saveData();
    }

    // Public API
    return {
        startSession: startSession,
        showAnswer: showAnswer,
        rateCard: rateCard,
        backToDashboard: backToDashboard
    };
})();
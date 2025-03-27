// js/algorithm.js
window.KnowledgeForest = window.KnowledgeForest || {};

// Spaced repetition algorithm module
KnowledgeForest.Algorithm = (function() {
    
    // Spaced repetition algorithm (SM-2)
    function calculateNextReview(rating, card) {
        // Clone the card to avoid modifying the original
        const updatedCard = { ...card };
        
        // Initialize ease factor if not present
        if (!updatedCard.ease) {
            updatedCard.ease = 2.5;
        }
        
        // Initialize interval if not present
        if (!updatedCard.interval) {
            updatedCard.interval = 0;
        }
        
        // Initialize review history if not present
        if (!updatedCard.reviewHistory) {
            updatedCard.reviewHistory = [];
        }
        
        // Update ease factor based on performance
        if (rating < 3) {
            // Reset interval for ratings below 3
            updatedCard.interval = 0;
        } else {
            // Adjust ease factor based on rating
            updatedCard.ease = Math.max(1.3, updatedCard.ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
            
            // Calculate next interval
            if (updatedCard.interval === 0) {
                updatedCard.interval = 1;
            } else if (updatedCard.interval === 1) {
                updatedCard.interval = 6;
            } else {
                updatedCard.interval = Math.round(updatedCard.interval * updatedCard.ease);
            }
        }
        
        // Calculate the next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + updatedCard.interval);
        updatedCard.nextReview = nextDate.toISOString();
        updatedCard.lastReviewed = new Date().toISOString();
        
        // Add to review history
        updatedCard.reviewHistory.push({
            date: new Date().toISOString(),
            rating: rating,
            interval: updatedCard.interval,
            ease: updatedCard.ease
        });
        
        return updatedCard;
    }
    
    // Public API
    return {
        calculateNextReview: calculateNextReview
    };
})();
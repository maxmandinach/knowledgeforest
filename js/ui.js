// js/ui.js
window.KnowledgeForest = window.KnowledgeForest || {};

// UI rendering module
KnowledgeForest.UI = (function() {
    // Reference other modules
    const Data = KnowledgeForest.Data;
    
    // Private variables
    let selectedContentIds = [];
    let includeSupplementary = true;
    let showDueOnly = false;
    
    // Render the content list
    function renderContentList() {
        const contentListEl = document.getElementById('content-list');
        if (!contentListEl) return;
        
        contentListEl.innerHTML = '';
        const contentLibrary = Data.getLibrary();
        
        contentLibrary.forEach(content => {
            // Filter cards based on settings
            const filteredCards = content.cards.filter(card => {
                const isSupplementary = card.type === 'supplementary' || card.supplementary === true;
                const isDue = new Date(card.nextReview || new Date().toISOString()) <= new Date();
                
                return (includeSupplementary || !isSupplementary) && 
                       (!showDueOnly || isDue);
            });
            
            // Skip content if it has no cards meeting the filter criteria
            if (filteredCards.length === 0) {
                return;
            }
            
            // Calculate mastery percentage
            const masteredCards = content.cards.filter(card => {
                if (!card.reviewHistory || card.reviewHistory.length === 0) return false;
                const lastReview = card.reviewHistory[card.reviewHistory.length - 1];
                return lastReview.rating >= 4;
            });
            
            const masteryPercentage = content.cards.length > 0 
                ? Math.round((masteredCards.length / content.cards.length) * 100) 
                : 0;
            
            // Calculate due cards
            const dueCards = filteredCards.filter(card => {
                return new Date(card.nextReview || new Date().toISOString()) <= new Date();
            });
            
            // Create card element
            const cardEl = document.createElement('div');
            cardEl.className = `content-card ${selectedContentIds.includes(content.id) ? 'selected' : ''}`;
            cardEl.dataset.id = content.id;
            
            cardEl.innerHTML = `
                <h3>${content.title}</h3>
                <div class="content-meta">
                    <p>${content.source || ''}</p>
                    <span class="due-indicator">${dueCards.length} due</span>
                </div>
                <p><strong>${content.cards.length}</strong> total cards (<strong>${masteredCards.length}</strong> mastered)</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${masteryPercentage}%"></div>
                </div>
            `;
            
            cardEl.addEventListener('click', () => toggleContentSelection(content.id));
            contentListEl.appendChild(cardEl);
        });
        
        updateStartButtonState();
    }
    
    // Toggle content selection
    function toggleContentSelection(id) {
        if (selectedContentIds.includes(id)) {
            selectedContentIds = selectedContentIds.filter(contentId => contentId !== id);
        } else {
            selectedContentIds.push(id);
        }
        renderContentList();
    }
    
    // Update start button state
    function updateStartButtonState() {
        const startSessionBtn = document.getElementById('start-session-btn');
        if (startSessionBtn) {
            startSessionBtn.disabled = false;
        }
    }
    
    // Show notification
    function showNotification(message) {
        const notificationEl = document.getElementById('notification');
        if (!notificationEl) return;
        
        notificationEl.textContent = message;
        notificationEl.classList.add('active');
        
        setTimeout(() => {
            notificationEl.classList.remove('active');
        }, 3000);
    }
    
    // Update session statistics
    function updateSessionStats(remaining, reviewed, avgRating) {
        const cardsRemainingEl = document.getElementById('cards-remaining');
        const cardsReviewedEl = document.getElementById('cards-reviewed');
        const averageRatingEl = document.getElementById('average-rating');
        
        if (cardsRemainingEl) cardsRemainingEl.textContent = remaining;
        if (cardsReviewedEl) cardsReviewedEl.textContent = reviewed;
        
        const avgRatingFormatted = reviewed > 0 ? avgRating.toFixed(1) : '0.0';
        if (averageRatingEl) averageRatingEl.textContent = avgRatingFormatted;
    }
    
    // Show current card
    function showCurrentCard(card, isLastCard) {
        const flashcardEl = document.getElementById('flashcard');
        const cardQuestionEl = document.getElementById('card-question');
        const cardSourceEl = document.getElementById('card-source');
        const cardDueDateEl = document.getElementById('card-due-date');
        const answerContainerEl = document.getElementById('answer-container');
        const cardAnswerEl = document.getElementById('card-answer');
        const cardQuoteEl = document.getElementById('card-quote');
        const showAnswerBtn = document.getElementById('show-answer-btn');
        
        if (!cardQuestionEl || !flashcardEl) return;
        
        if (isLastCard) {
            // No more cards
            flashcardEl.classList.remove('supplementary');
            cardQuestionEl.textContent = "Session complete! You've reviewed all the cards.";
            cardSourceEl.textContent = "";
            cardDueDateEl.textContent = "";
            showAnswerBtn.style.display = 'none';
            answerContainerEl.style.display = 'none';
            return;
        }
        
        // Update card content
        cardQuestionEl.textContent = card.question;
        cardSourceEl.textContent = `Source: ${card.source || 'Unknown'} - ${card.contentTitle || ''}`;
        
        // Show due date
        const dueDate = new Date(card.nextReview || new Date().toISOString());
        const today = new Date();
        const diffTime = Math.abs(dueDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dueDate <= today) {
            cardDueDateEl.textContent = `Due: Today`;
        } else {
            cardDueDateEl.textContent = `Due: In ${diffDays} days`;
        }
        
        cardAnswerEl.textContent = card.answer;
        
        if (card.direct_quotes) {
            cardQuoteEl.textContent = card.direct_quotes;
            cardQuoteEl.style.display = 'block';
        } else {
            cardQuoteEl.style.display = 'none';
        }
        
        // Update card type
        const isSupplementary = card.type === 'supplementary' || card.supplementary === true;
        if (isSupplementary) {
            flashcardEl.classList.add('supplementary');
            flashcardEl.querySelector('.card-type').textContent = 'Supplementary';
        } else {
            flashcardEl.classList.remove('supplementary');
            flashcardEl.querySelector('.card-type').textContent = 'Regular';
        }
        
        // Reset answer view
        answerContainerEl.style.display = 'none';
        showAnswerBtn.style.display = 'block';
    }
    
    // Toggle views between dashboard and flashcards
    function showDashboard() {
        const dashboardEl = document.getElementById('dashboard');
        const flashcardContainerEl = document.getElementById('flashcard-container');
        
        if (dashboardEl && flashcardContainerEl) {
            flashcardContainerEl.style.display = 'none';
            dashboardEl.style.display = 'block';
        }
    }
    
    function showFlashcards() {
        console.log('UI: Switching to flashcard view...');
        const dashboardEl = document.getElementById('dashboard');
        const flashcardContainerEl = document.getElementById('flashcard-container');
        
        console.log('UI: Found dashboard element:', !!dashboardEl);
        console.log('UI: Found flashcard container:', !!flashcardContainerEl);
        
        if (dashboardEl && flashcardContainerEl) {
            dashboardEl.style.display = 'none';
            flashcardContainerEl.style.display = 'flex';
            console.log('UI: Successfully switched to flashcard view');
        } else {
            console.error('UI: Could not find required elements for view switch');
        }
    }
    
    // Show answer
    function showAnswer() {
        const answerContainerEl = document.getElementById('answer-container');
        const showAnswerBtn = document.getElementById('show-answer-btn');
        
        if (answerContainerEl && showAnswerBtn) {
            answerContainerEl.style.display = 'flex';
            showAnswerBtn.style.display = 'none';
        }
    }
    
    // Public API
    return {
        renderContentList: renderContentList,
        toggleContentSelection: toggleContentSelection,
        showNotification: showNotification,
        updateSessionStats: updateSessionStats,
        showCurrentCard: showCurrentCard,
        showDashboard: showDashboard,
        showFlashcards: showFlashcards,
        showAnswer: showAnswer,
        getSelectedContentIds: function() { return selectedContentIds; },
        setIncludeSupplementary: function(value) { includeSupplementary = value; },
        getIncludeSupplementary: function() { return includeSupplementary; },
        setShowDueOnly: function(value) { showDueOnly = value; },
        getShowDueOnly: function() { return showDueOnly; }
    };
})();
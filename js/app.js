// js/app.js
window.KnowledgeForest = window.KnowledgeForest || {};

// Main application module
KnowledgeForest.App = (function() {
    // Reference other modules
    const Data = KnowledgeForest.Data;
    const UI = KnowledgeForest.UI;
    const Flashcards = KnowledgeForest.Flashcards;
    
    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);
                
                // Validate content structure
                if (!content.episode_title || !content.flashcards || !Array.isArray(content.flashcards)) {
                    throw new Error('Invalid content structure: missing required fields');
                }

                // Validate each flashcard
                content.flashcards.forEach((card, index) => {
                    if (!card.question || !card.answer) {
                        throw new Error(`Invalid flashcard at index ${index}: missing required fields`);
                    }
                });

                const id = 'content-' + Date.now();
                Data.processUploadedContent(content, id);
                
                // Update UI
                document.getElementById('upload-status').textContent = 'Upload successful!';
                document.getElementById('upload-status').style.color = 'green';
                document.getElementById('file-upload').value = null;
                
                // Hide upload section after successful upload
                setTimeout(() => {
                    const uploadSection = document.getElementById('upload-section');
                    if (uploadSection) {
                        uploadSection.classList.remove('active');
                    }
                    const uploadStatus = document.getElementById('upload-status');
                    if (uploadStatus) {
                        uploadStatus.textContent = '';
                    }
                }, 2000);
                
                // Show notification
                UI.showNotification(`Added "${content.episode_title}" with ${content.flashcards.length} flashcards`);
                
                // Update UI
                UI.renderContentList();
                
            } catch (error) {
                console.error('Error processing uploaded file:', error);
                const uploadStatus = document.getElementById('upload-status');
                if (uploadStatus) {
                    uploadStatus.textContent = `Error: ${error.message}`;
                    uploadStatus.style.color = 'red';
                }
            }
        };

        reader.onerror = () => {
            console.error('Error reading file');
            const uploadStatus = document.getElementById('upload-status');
            if (uploadStatus) {
                uploadStatus.textContent = 'Error: Could not read file';
                uploadStatus.style.color = 'red';
            }
        };
        
        reader.readAsText(file);
    }
    
    // Toggle upload section
    function toggleUploadSection() {
        const uploadSectionEl = document.getElementById('upload-section');
        if (uploadSectionEl) {
            uploadSectionEl.classList.toggle('active');
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Helper function to safely add event listeners
        function safeAddEventListener(elementId, event, handler) {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element with id '${elementId}' not found for event listener setup`);
            }
        }

        // Toggle supplementary cards
        safeAddEventListener('toggle-supplementary', 'change', () => {
            UI.setIncludeSupplementary(document.getElementById('toggle-supplementary').checked);
            UI.renderContentList();
        });
        
        // Toggle due only cards
        safeAddEventListener('toggle-due-only', 'change', () => {
            UI.setShowDueOnly(document.getElementById('toggle-due-only').checked);
            UI.renderContentList();
        });
        
        // Start session button
        safeAddEventListener('start-session-btn', 'click', Flashcards.startSession);
        
        // Add content button
        safeAddEventListener('add-content-btn', 'click', toggleUploadSection);
        
        // Show answer button
        safeAddEventListener('show-answer-btn', 'click', Flashcards.showAnswer);
        
        // Back to dashboard button
        safeAddEventListener('back-to-dash-btn', 'click', Flashcards.backToDashboard);
        
        // File upload
        safeAddEventListener('file-upload', 'change', handleFileUpload);
        
        // Logo home button
        safeAddEventListener('logo-home', 'click', UI.showDashboard);
        
        // Rating buttons (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-button')) {
                const rating = parseInt(e.target.dataset.rating);
                if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                    Flashcards.rateCard(rating);
                } else {
                    console.warn('Invalid rating value:', rating);
                }
            }
        });
    }
    
    // Initialize app
    function init() {
        console.log('Initializing Knowledge Forest app...');
        
        // Load data
        Data.loadData();
        
        // Load sample data if no data exists
        if (Data.getLibrary().length === 0) {
            Data.loadSampleData();
        }
        
        // Render content list
        UI.renderContentList();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Knowledge Forest app initialized!');
    }
    
    // Public API
    return {
        init: init
    };
})();

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', KnowledgeForest.App.init);
// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const CONFIG = {
    MAX_CHARS: 280,
    API_BASE_URL: 'https://bible-api.com',
    DEFAULT_THEME: 'gradient-mode',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
    verses: [],
    currentIndex: 0,
    currentReference: '',
    currentTheme: CONFIG.DEFAULT_THEME,
    isLoading: false
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
    // Pages
    homePage: document.getElementById('homePage'),
    readerPage: document.getElementById('readerPage'),

    // Form elements
    form: document.getElementById('bibleForm'),
    translation: document.getElementById('translation'),
    book: document.getElementById('book'),
    chapter: document.getElementById('chapter'),
    verseStart: document.getElementById('verseStart'),
    verseEnd: document.getElementById('verseEnd'),

    // Display elements
    verseContainer: document.getElementById('verseContainer'),

    // Navigation buttons
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    homeBtn: document.getElementById('homeBtn'),

    // Formatting controls
    fontSizeSlider: document.getElementById('fontSizeSlider'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    fontWeightSlider: document.getElementById('fontWeightSlider'),
    fontWeightValue: document.getElementById('fontWeightValue'),

    // Theme buttons
    themeButtons: document.querySelectorAll('.theme-btn')
};

// ==========================================
// THEME MANAGEMENT
// ==========================================

function initTheme() {
    document.body.classList.add(CONFIG.DEFAULT_THEME);

    elements.themeButtons.forEach(btn => {
        btn.addEventListener('click', handleThemeChange);
    });
}

function handleThemeChange(event) {
    const theme = event.target.dataset.theme;

    // Remove all theme classes
    document.body.classList.remove('dark-mode', 'light-mode', 'gradient-mode');

    // Add selected theme
    document.body.classList.add(theme);
    state.currentTheme = theme;

    // Update button states
    elements.themeButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// ==========================================
// SCRIPTURE LOADING
// ==========================================

async function loadScripture(translation, book, chapter, verseStart, verseEnd) {
    if (state.isLoading) return;

    state.isLoading = true;
    showLoadingState();

    try {
        const passage = `${book}+${chapter}:${verseStart}-${verseEnd}`;
        const url = `${CONFIG.API_BASE_URL}/${passage}?translation=${translation}`;

        const data = await fetchWithRetry(url);

        if (!data.verses || data.verses.length === 0) {
            throw new Error('No verses found for the selected passage');
        }

        state.currentReference = data.reference;
        state.verses = chunkVerses(data.verses);
        state.currentIndex = 0;

        showReaderPage();
        displayVerse();

    } catch (error) {
        handleError(error);
    } finally {
        state.isLoading = false;
    }
}

async function fetchWithRetry(url, attempts = CONFIG.RETRY_ATTEMPTS) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            if (i === attempts - 1) throw error;

            await new Promise(resolve =>
                setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1))
            );
        }
    }
}

// ==========================================
// VERSE CHUNKING
// ==========================================

function chunkVerses(verseArray) {
    const chunks = [];
    let currentChunk = '';
    let currentVerses = [];

    verseArray.forEach(verse => {
        const verseText = verse.text.trim();
        const verseNum = verse.verse;

        // Check if adding this verse would exceed MAX_CHARS
        if ((currentChunk + verseText).length > CONFIG.MAX_CHARS && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                verses: [...currentVerses]
            });
            currentChunk = verseText + ' ';
            currentVerses = [verseNum];
        } else {
            currentChunk += verseText + ' ';
            currentVerses.push(verseNum);
        }
    });

    // Add the last chunk if it exists
    if (currentChunk.trim()) {
        chunks.push({
            text: currentChunk.trim(),
            verses: [...currentVerses]
        });
    }

    return chunks;
}

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================

function displayVerse() {
    const chunk = state.verses[state.currentIndex];

    if (!chunk) {
        handleError(new Error('No verse chunk available to display'));
        return;
    }

    const verseRef = formatVerseReference(chunk.verses);

    elements.verseContainer.innerHTML = `
        <div class="verse-display">${escapeHtml(chunk.text)}</div>
        <div class="reference">${escapeHtml(state.currentReference)} (${verseRef})</div>
    `;

    // Apply current formatting settings
    applyFormatting();
    updateNavigationButtons();

    // Update ARIA attributes
    elements.fontSizeSlider.setAttribute('aria-valuenow', elements.fontSizeSlider.value);
    elements.fontWeightSlider.setAttribute('aria-valuenow', elements.fontWeightSlider.value);
}

function formatVerseReference(verses) {
    if (verses.length === 1) {
        return `verse ${verses[0]}`;
    }
    return `verses ${verses[0]}-${verses[verses.length - 1]}`;
}

function applyFormatting() {
    const verseDisplay = elements.verseContainer.querySelector('.verse-display');

    if (verseDisplay) {
        verseDisplay.style.fontSize = `${elements.fontSizeSlider.value}rem`;
        verseDisplay.style.fontWeight = elements.fontWeightSlider.value;
    }
}

function showLoadingState() {
    elements.verseContainer.innerHTML = '<div class="loading">Loading scripture...</div>';
    elements.homePage.style.display = 'none';
    elements.readerPage.classList.add('active');
}

function showReaderPage() {
    document.body.classList.add(state.currentTheme);
    elements.homePage.style.display = 'none';
    elements.readerPage.classList.add('active');
}

function showHomePage() {
    elements.readerPage.classList.remove('active');
    elements.homePage.style.display = 'flex';

    // Ensure theme persists
    if (!document.body.classList.contains(state.currentTheme)) {
        document.body.className = state.currentTheme;
    }
}

// ==========================================
// NAVIGATION
// ==========================================

function navigatePrevious() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        displayVerse();
    }
}

function navigateNext() {
    if (state.currentIndex < state.verses.length - 1) {
        state.currentIndex++;
        displayVerse();
    }
}

function updateNavigationButtons() {
    elements.prevBtn.disabled = state.currentIndex === 0;
    elements.nextBtn.disabled = state.currentIndex === state.verses.length - 1;
}

// ==========================================
// FORMATTING CONTROLS
// ==========================================

function handleFontSizeChange(event) {
    const size = event.target.value;
    elements.fontSizeValue.textContent = `${size}rem`;

    const displays = document.querySelectorAll('.verse-display');
    displays.forEach(display => {
        display.style.fontSize = `${size}rem`;
    });

    // Update ARIA attribute
    event.target.setAttribute('aria-valuenow', size);
}

function handleFontWeightChange(event) {
    const weight = event.target.value;
    elements.fontWeightValue.textContent = weight;

    const displays = document.querySelectorAll('.verse-display');
    displays.forEach(display => {
        display.style.fontWeight = weight;
    });

    // Update ARIA attribute
    event.target.setAttribute('aria-valuenow', weight);
}

// ==========================================
// ERROR HANDLING
// ==========================================

function handleError(error) {
    console.error('Error:', error);

    const errorMessage = getErrorMessage(error);
    elements.verseContainer.innerHTML = `
        <div class="loading">
            ${escapeHtml(errorMessage)}
            <br><br>
            <button class="nav-btn" onclick="showHomePage()">Return Home</button>
        </div>
    `;
}

function getErrorMessage(error) {
    if (error.message.includes('HTTP error')) {
        return 'Unable to connect to the Bible API. Please check your internet connection and try again.';
    }

    if (error.message.includes('No verses found')) {
        return 'No verses found for the selected passage. Please check your selection and try again.';
    }

    return 'An error occurred while loading scripture. Please try again.';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function validateFormInputs() {
    const chapter = parseInt(elements.chapter.value);
    const verseStart = parseInt(elements.verseStart.value);
    const verseEnd = parseInt(elements.verseEnd.value);

    if (chapter < 1) {
        alert('Chapter must be at least 1');
        return false;
    }

    if (verseStart < 1 || verseEnd < 1) {
        alert('Verses must be at least 1');
        return false;
    }

    if (verseStart > verseEnd) {
        alert('Starting verse must be less than or equal to ending verse');
        return false;
    }

    return true;
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

function handleKeyboardShortcuts(event) {
    if (!elements.readerPage.classList.contains('active')) return;

    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            navigatePrevious();
            break;
        case 'ArrowRight':
            event.preventDefault();
            navigateNext();
            break;
        case 'Escape':
            event.preventDefault();
            showHomePage();
            break;
        case 'Home':
            event.preventDefault();
            if (state.verses.length > 0) {
                state.currentIndex = 0;
                displayVerse();
            }
            break;
        case 'End':
            event.preventDefault();
            if (state.verses.length > 0) {
                state.currentIndex = state.verses.length - 1;
                displayVerse();
            }
            break;
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Form submission
    elements.form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateFormInputs()) return;

        const translation = elements.translation.value;
        const book = elements.book.value;
        const chapter = elements.chapter.value;
        const verseStart = elements.verseStart.value;
        const verseEnd = elements.verseEnd.value;

        await loadScripture(translation, book, chapter, verseStart, verseEnd);
    });

    // Navigation buttons
    elements.prevBtn.addEventListener('click', navigatePrevious);
    elements.nextBtn.addEventListener('click', navigateNext);
    elements.homeBtn.addEventListener('click', showHomePage);

    // Formatting controls
    elements.fontSizeSlider.addEventListener('input', handleFontSizeChange);
    elements.fontWeightSlider.addEventListener('input', handleFontWeightChange);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    initTheme();
    initEventListeners();
    console.log('Big Bible initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose necessary functions to global scope for inline handlers
window.showHomePage = showHomePage;

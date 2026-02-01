// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================

const CONFIG = {
    MAX_CHARS: 280,
    API_BASE_URL: 'https://api.scripture.api.bible/v1',
    API_KEY: 'JbTbOtLeQo4RjUBOHt2Ms',
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
    isLoading: false,
    presenterMode: false,
    projectionWindow: null
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

    // Update projection window theme if in presenter mode
    if (state.presenterMode && state.projectionWindow && !state.projectionWindow.closed) {
        state.projectionWindow.document.body.className = theme;
    }
}

// ==========================================
// SCRIPTURE LOADING
// ==========================================

async function loadScripture(translation, book, chapter, verseStart, verseEnd) {
    if (state.isLoading) return;

    state.isLoading = true;
    showLoadingState();

    try {
        // Build passage ID for API.bible format (e.g., "JHN.3.16-JHN.3.17")
        const bookId = getBookId(book);
        const passageId = verseStart === verseEnd
            ? `${bookId}.${chapter}.${verseStart}`
            : `${bookId}.${chapter}.${verseStart}-${bookId}.${chapter}.${verseEnd}`;

        const url = `${CONFIG.API_BASE_URL}/bibles/${translation}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`;

        console.log('Fetching URL:', url);
        console.log('Translation:', translation);
        console.log('Passage ID:', passageId);

        const data = await fetchWithRetry(url);

        if (!data.data || !data.data.content) {
            throw new Error('No verses found for the selected passage');
        }

        // Parse the response from API.bible
        const verses = parseApiBibleResponse(data.data);

        if (verses.length === 0) {
            throw new Error('No verses found for the selected passage');
        }

        state.currentReference = data.data.reference;
        state.verses = chunkVerses(verses);
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
            const headers = {
                'api-key': CONFIG.API_KEY
            };

            const response = await fetch(url, { headers });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your API.bible dashboard.');
                }
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

// Parse API.bible response into verse objects
function parseApiBibleResponse(data) {
    const verses = [];
    const text = data.content.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags

    // For simplicity, create a single verse object with the full text
    // API.bible doesn't always return individual verses, so we treat the passage as one unit
    verses.push({
        text: text,
        verse: data.reference
    });

    return verses;
}

// Get USFM book ID for API.bible
function getBookId(bookName) {
    const bookMap = {
        'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
        'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1Samuel': '1SA', '2Samuel': '2SA',
        '1Kings': '1KI', '2Kings': '2KI', '1Chronicles': '1CH', '2Chronicles': '2CH', 'Ezra': 'EZR',
        'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO',
        'Ecclesiastes': 'ECC', 'SongofSolomon': 'SNG', 'Isaiah': 'ISA', 'Jeremiah': 'JER',
        'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOL',
        'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
        'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
        'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
        'Romans': 'ROM', '1Corinthians': '1CO', '2Corinthians': '2CO', 'Galatians': 'GAL',
        'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1Thessalonians': '1TH',
        '2Thessalonians': '2TH', '1Timothy': '1TI', '2Timothy': '2TI', 'Titus': 'TIT',
        'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1Peter': '1PE', '2Peter': '2PE',
        '1John': '1JN', '2John': '2JN', '3John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
    };
    return bookMap[bookName] || bookName.toUpperCase().substring(0, 3);
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
        if (state.presenterMode) {
            displayPresenterView();
        } else {
            displayVerse();
        }
    }
}

function navigateNext() {
    if (state.currentIndex < state.verses.length - 1) {
        state.currentIndex++;
        if (state.presenterMode) {
            displayPresenterView();
        } else {
            displayVerse();
        }
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

    // Update projection window if in presenter mode
    if (state.presenterMode && state.projectionWindow && !state.projectionWindow.closed) {
        const projectionDisplay = state.projectionWindow.document.querySelector('.verse-display');
        if (projectionDisplay) {
            projectionDisplay.style.fontSize = `${size}rem`;
        }
    }

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

    // Update projection window if in presenter mode
    if (state.presenterMode && state.projectionWindow && !state.projectionWindow.closed) {
        const projectionDisplay = state.projectionWindow.document.querySelector('.verse-display');
        if (projectionDisplay) {
            projectionDisplay.style.fontWeight = weight;
        }
    }

    // Update ARIA attribute
    event.target.setAttribute('aria-valuenow', weight);
}

// ==========================================
// ERROR HANDLING
// ==========================================

function handleError(error) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    const errorMessage = getErrorMessage(error);
    elements.verseContainer.innerHTML = `
        <div class="loading">
            ${escapeHtml(errorMessage)}
            <br><br>
            <small style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">Error: ${escapeHtml(error.message)}</small>
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

    // Presenter mode buttons
    const presenterBtn = document.getElementById('presenterBtn');
    const exitPresenterBtn = document.getElementById('exitPresenterBtn');
    const presenterForm = document.getElementById('presenterForm');

    if (presenterBtn) {
        presenterBtn.addEventListener('click', startPresenterMode);
    }

    if (exitPresenterBtn) {
        exitPresenterBtn.addEventListener('click', stopPresenterMode);
    }

    if (presenterForm) {
        presenterForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const translation = document.getElementById('presenterTranslation').value;
            const book = document.getElementById('presenterBook').value;
            const chapter = document.getElementById('presenterChapter').value;
            const verseStart = document.getElementById('presenterVerseStart').value;
            const verseEnd = document.getElementById('presenterVerseEnd').value;

            await loadScripture(translation, book, chapter, verseStart, verseEnd);
        });
    }

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

// ==========================================
// PRESENTER MODE
// ==========================================

function startPresenterMode() {
    state.presenterMode = true;

    // Open projection window
    state.projectionWindow = window.open('', 'BibleProjection', 'fullscreen=yes,scrollbars=no,menubar=no,toolbar=no,location=no,status=no');

    if (state.projectionWindow) {
        // Build projection window HTML
        state.projectionWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bible Projection</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 3rem;
                    }
                    body.dark-mode { background: #1a1a1a; }
                    body.light-mode { background: #ffffff; }
                    body.gradient-mode { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                    .verse-display {
                        color: white;
                        font-size: 4.5rem;
                        line-height: 1.6;
                        max-width: 1400px;
                        width: 100%;
                        font-weight: 900;
                        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
                        margin-bottom: 1rem;
                        text-align: center;
                    }
                    .reference {
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 1.8rem;
                        font-weight: 400;
                        max-width: 1400px;
                        width: 100%;
                        text-align: right;
                    }
                    body.light-mode .verse-display,
                    body.light-mode .reference { color: #000000; text-shadow: none; }
                </style>
            </head>
            <body class="${state.currentTheme}">
                <div id="projectionContent"></div>
            </body>
            </html>
        `);
        state.projectionWindow.document.close();

        // Show presenter view
        showPresenterView();
        updateProjectionWindow();
    } else {
        alert('Please allow pop-ups to use presenter mode');
        state.presenterMode = false;
    }
}

function stopPresenterMode() {
    state.presenterMode = false;
    if (state.projectionWindow && !state.projectionWindow.closed) {
        state.projectionWindow.close();
    }
    state.projectionWindow = null;
    showReaderPage();
}

function showPresenterView() {
    elements.readerPage.classList.add('presenter-mode');
    displayPresenterView();
}

function displayPresenterView() {
    if (!state.presenterMode) return;

    const prevChunk = state.verses[state.currentIndex - 1];
    const currentChunk = state.verses[state.currentIndex];
    const nextChunk = state.verses[state.currentIndex + 1];

    const container = elements.verseContainer;
    container.innerHTML = `
        <div class="presenter-view">
            <div class="preview-panels">
                <div class="preview-panel prev-panel">
                    <div class="panel-label">Previous</div>
                    <div class="panel-content">
                        ${prevChunk ? `<div class="preview-verse">${escapeHtml(prevChunk.text)}</div>` : '<div class="preview-empty">No previous slide</div>'}
                    </div>
                </div>
                <div class="preview-panel current-panel">
                    <div class="panel-label">Current</div>
                    <div class="panel-content">
                        ${currentChunk ? `
                            <div class="preview-verse current">${escapeHtml(currentChunk.text)}</div>
                            <div class="preview-reference">${escapeHtml(state.currentReference)}</div>
                        ` : '<div class="preview-empty">No current slide</div>'}
                    </div>
                </div>
                <div class="preview-panel next-panel">
                    <div class="panel-label">Next</div>
                    <div class="panel-content">
                        ${nextChunk ? `<div class="preview-verse">${escapeHtml(nextChunk.text)}</div>` : '<div class="preview-empty">No next slide</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    updateNavigationButtons();
    updateProjectionWindow();
}

function updateProjectionWindow() {
    if (!state.projectionWindow || state.projectionWindow.closed) {
        stopPresenterMode();
        return;
    }

    const chunk = state.verses[state.currentIndex];
    if (!chunk) return;

    const verseRef = formatVerseReference(chunk.verses);
    const content = state.projectionWindow.document.getElementById('projectionContent');

    if (content) {
        content.innerHTML = `
            <div class="verse-display" style="font-size: ${elements.fontSizeSlider.value}rem; font-weight: ${elements.fontWeightSlider.value};">
                ${escapeHtml(chunk.text)}
            </div>
            <div class="reference">${escapeHtml(state.currentReference)} (${verseRef})</div>
        `;
    }

    // Update theme
    state.projectionWindow.document.body.className = state.currentTheme;
}

// Expose necessary functions to global scope for inline handlers
window.showHomePage = showHomePage;
window.startPresenterMode = startPresenterMode;
window.stopPresenterMode = stopPresenterMode;

# Big Bible - Scripture Projector

A beautiful, responsive Bible verse projector designed for presentations, worship services, and personal study. Display scripture verses in a clean, customizable format with dynamic text sizing and multiple theme options.

## Features

### Core Functionality
- **Multiple Bible Translations**: Support for 6 different translations including KJV, WEB, BBE, ASV, YLT, and WEBBE
- **Flexible Verse Selection**: Choose any book, chapter, and verse range
- **Smart Text Chunking**: Automatically splits long passages into readable chunks (max 280 characters)
- **Navigation Controls**: Easy navigation between verse chunks with Previous/Next buttons

### Customization
- **Three Theme Options**:
  - Gradient Mode (default): Beautiful purple gradient background
  - Dark Mode: Sleek dark theme for low-light environments
  - Light Mode: Clean white background for bright venues
- **Adjustable Font Size**: Range from 2rem to 6rem for optimal readability
- **Adjustable Font Weight**: From light (100) to bold (900)
- **Real-time Preview**: See formatting changes instantly

### User Experience
- **Keyboard Shortcuts**:
  - `←` / `→`: Navigate between verses
  - `Escape`: Return to home page
  - `Home`: Jump to first verse chunk
  - `End`: Jump to last verse chunk
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility Features**:
  - ARIA labels and roles
  - Keyboard navigation support
  - Screen reader friendly
  - Focus indicators
- **Error Handling**: Graceful error messages with retry logic
- **Loading States**: Clear feedback during scripture loading

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for fetching Bible verses)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/Big-Bible-.git
cd Big-Bible-
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or simply drag and drop `index.html` into your browser.

### Deployment

This is a static website that can be deployed to any web hosting service:

- **GitHub Pages**: Push to GitHub and enable GitHub Pages in repository settings
- **Netlify**: Drag and drop the folder or connect your repository
- **Vercel**: Connect your repository for automatic deployments
- **Any Static Host**: Upload the files to your web server

## Usage

### Basic Usage

1. **Select Your Preferences**:
   - Choose a theme (Dark, Light, or Gradient)
   - Select your preferred Bible translation
   - Choose the book, chapter, and verse range

2. **Display Scripture**:
   - Click "Display Scripture" to load and display the verses
   - Use Previous/Next buttons or arrow keys to navigate

3. **Customize Display**:
   - Adjust font size using the slider
   - Modify font weight for emphasis
   - Changes apply in real-time

4. **Return Home**:
   - Click the "Home" button or press `Escape` to return to the selection screen

### Example Passages

Here are some popular passages to try:

- **John 3:16-17**: Classic salvation verse
- **Psalm 23:1-6**: The Lord is my shepherd
- **Matthew 5:3-12**: The Beatitudes
- **1 Corinthians 13:4-8**: Love is patient
- **Romans 8:28-39**: More than conquerors
- **Philippians 4:4-9**: Rejoice in the Lord

## Technical Details

### Architecture

The application is built with vanilla JavaScript, HTML, and CSS with no external dependencies:

- **index.html**: Semantic HTML5 structure with accessibility features
- **styles.css**: Modular CSS with theme support and responsive design
- **script.js**: Modern JavaScript with:
  - State management
  - Error handling with retry logic
  - Event-driven architecture
  - Keyboard navigation

### API Integration

This application uses the [Bible API](https://bible-api.com/) to fetch scripture verses. The API:
- Is free and open-source
- Requires no authentication
- Supports multiple translations
- Returns verses in JSON format

### Browser Compatibility

- Chrome/Edge: v90+
- Firefox: v88+
- Safari: v14+
- Mobile browsers: iOS Safari 14+, Chrome Mobile 90+

### File Structure

```
Big-Bible-/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js          # JavaScript application logic
└── README.md          # Documentation
```

## Customization

### Adding More Translations

To add additional Bible translations, edit the translation select in `index.html`:

```html
<option value="translation-code">Translation Name</option>
```

Ensure the translation code is supported by the Bible API.

### Modifying Themes

Themes are defined in `styles.css`. To add a new theme:

1. Add theme class to CSS:
```css
body.my-theme {
    background: your-background;
}
```

2. Add button to HTML:
```html
<button type="button" class="theme-btn" data-theme="my-theme">My Theme</button>
```

### Adjusting Character Limit

The character limit for verse chunks (default: 280) can be modified in `script.js`:

```javascript
const CONFIG = {
    MAX_CHARS: 280  // Change this value
};
```

## Accessibility

This application follows WCAG 2.1 Level AA guidelines:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Color contrast ratios
- Screen reader support
- Responsive text sizing

## Performance

- **Fast Loading**: No external dependencies, minimal file sizes
- **Optimized Rendering**: CSS animations use GPU acceleration
- **Efficient State Management**: Minimal DOM manipulation
- **Retry Logic**: Automatic retry for failed API requests

## Troubleshooting

### Verses Not Loading

- Check your internet connection
- Verify the verse range exists in the selected book
- Try a different translation
- Check browser console for error messages

### Display Issues

- Ensure JavaScript is enabled
- Try refreshing the page
- Clear browser cache
- Update to a modern browser

### Keyboard Shortcuts Not Working

- Ensure the reader page is active (verses are displayed)
- Check that no form inputs have focus
- Verify JavaScript is not blocked

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly across browsers
5. Commit with clear messages
6. Push and create a Pull Request

## License

This project is open source and available under the MIT License.

## Credits

- Bible verses provided by [Bible API](https://bible-api.com/)
- Developed with modern web standards
- Designed for worship and study

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the maintainers

## Roadmap

Potential future enhancements:
- Save favorite verses
- Share verse images on social media
- Additional translations
- Custom background images
- Multi-language interface
- Verse comparison between translations
- Print-friendly formatting
- Offline support with Service Workers

---

**Made with dedication for sharing God's Word**

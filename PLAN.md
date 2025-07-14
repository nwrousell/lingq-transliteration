# Chrome Extension for LingQ Transliteration

## Project Overview
A Chrome extension that transliterates Gujarati text on LingQ reader pages to IAST or Hunterian script. Built with extensibility in mind to support additional languages in the future.

## Technical Specifications

### Target URL Pattern
- Active on: `https://www.lingq.com/en/learn/gu/web/reader/*`
- Language detection: Extract language code ("gu") from URL path

### Core Functionality
1. **Text Processing**: Replace content in `p` tags within `div.reader-container`
2. **Word-level Processing**: Each word is wrapped in `span` elements within paragraphs
3. **Transliteration Options**: 
   - Off (original text)
   - IAST (International Alphabet of Sanskrit Transliteration)
   - Hunterian (simplified Latin script)
4. **Display Modes**:
   - Replace mode: Replace `textContent` of spans/paragraphs
   - Overlay mode: Add floating elements above original spans

### API Integration
- **Primary**: Aksharamukha Transliteration API
  - Endpoint: `https://aksharamukha.appspot.com/api/process`
  - Parameters: `source=Gujarati&target=IAST&text={text}`
  - Post-process IAST output to create Hunterian variant
- **Fallback**: Simple backend service (if needed)

### Architecture Design

#### Language-Agnostic Core
- `ContentProcessor`: Handles DOM manipulation and text replacement
- `SettingsManager`: Manages user preferences via localStorage
- `ExtensionController`: Coordinates between components
- `URLMatcher`: Determines if extension should be active

#### Language-Specific Implementation
- `GujaratiTransliterator` class containing:
  - URL pattern matching for Gujarati (`/gu/`)
  - API calls to Aksharamukha
  - IAST to Hunterian conversion logic
  - Error handling and fallbacks

### File Structure
```
extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   ├── content.js
│   └── content.css
├── core/
│   ├── ContentProcessor.js
│   ├── SettingsManager.js
│   ├── ExtensionController.js
│   └── URLMatcher.js
└── languages/
    └── GujaratiTransliterator.js
```

### Settings & State Management
- **Storage**: Chrome extension localStorage/sync storage
- **Settings**:
  - `transliterationMode`: "off" | "iast" | "hunterian"
  - `displayMode`: "replace" | "overlay"
- **Persistence**: Settings remembered between sessions

### User Interface
- **Popup**: Simple interface with:
  - Radio buttons for transliteration mode (Off/IAST/Hunterian)
  - Toggle for display mode (Replace/Overlay)
  - Language detection indicator
- **Content**: No additional UI elements on page

### Implementation Flow
1. **Page Load**: Content script checks URL pattern
2. **Language Detection**: Extract language code, load appropriate transliterator
3. **Text Processing**: Find target elements (`div.reader-container p span`)
4. **API Calls**: Batch transliteration requests to minimize API calls
5. **DOM Updates**: Apply transliterations based on user settings
6. **Error Handling**: Graceful fallbacks for API failures

### Extension Permissions
```json
{
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.lingq.com/*",
    "https://aksharamukha.appspot.com/*"
  ]
}
```

### Future Extensibility
- **New Languages**: Add new transliterator classes in `languages/` folder
- **URL Patterns**: Extend URLMatcher with additional language codes
- **APIs**: Plug in different transliteration services per language
- **Display Modes**: Add new visualization options in ContentProcessor

### Development Phases
1. **Phase 1**: Core architecture + Gujarati implementation (replace mode)
2. **Phase 2**: Add overlay display mode
3. **Phase 3**: Error handling and fallback mechanisms

### Technical Considerations
- **Performance**: Batch API calls, cache results
- **CORS**: Aksharamukha API should work from browser context
- **Error Handling**: Network failures, API rate limits, malformed responses
- **Memory**: Clean up event listeners and cached data
- **Security**: Validate API responses, sanitize DOM insertions
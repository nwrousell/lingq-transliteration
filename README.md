# LingQ Transliteration Chrome Extension

A Chrome extension that transliterates Gujarati text on LingQ reader pages to IAST or Hunterian script.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The extension will be added to Chrome

## Usage

1. Navigate to a LingQ Gujarati reader page (e.g., `https://www.lingq.com/en/learn/gu/web/reader/...`)
2. Click the extension icon in the toolbar
3. Select your preferred transliteration mode:
   - **Off**: Show original Gujarati text
   - **IAST**: International Alphabet of Sanskrit Transliteration
   - **Hunterian**: Simplified romanization
4. The page will automatically update with transliterated text

## Features

- **Automatic Detection**: Only activates on supported LingQ language pages
- **Word-level Processing**: Processes individual words (spans) within paragraphs
- **API Integration**: Uses Aksharamukha API for accurate transliteration
- **Persistent Settings**: Remembers your preferences between sessions
- **Extensible Architecture**: Designed to easily add support for other languages

## Technical Details

- **Target Elements**: Processes `<p>` tags within `div.reader-container`
- **API**: Aksharamukha Transliteration API
- **Storage**: Chrome sync storage for settings persistence
- **Architecture**: Modular design with language-specific implementations

## Development

### Project Structure
```
extension/
├── manifest.json           # Extension manifest
├── popup/                  # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content script
│   └── content.js
├── core/                  # Core architecture
│   ├── SettingsManager.js
│   ├── URLMatcher.js
│   └── ContentProcessor.js
└── languages/             # Language-specific implementations
    └── GujaratiTransliterator.js
```

### Adding New Languages

1. Create a new transliterator class in `languages/` folder
2. Add language code to `URLMatcher.supportedLanguages`
3. Update content script to initialize the appropriate transliterator
4. Update manifest.json if different API permissions are needed

## Current Status

**Phase 1** (Completed):
- ✅ Core architecture
- ✅ Gujarati transliteration with replace mode
- ✅ Settings management
- ✅ Popup interface

**Phase 2** (Planned):
- ⏳ Overlay display mode
- ⏳ Enhanced error handling
- ⏳ Performance optimizations
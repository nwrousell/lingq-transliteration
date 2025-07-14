class ExtensionController {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.urlMatcher = new URLMatcher();
    this.contentProcessor = new ContentProcessor();
    this.transliterator = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    const languageInfo = this.urlMatcher.getCurrentLanguage();
    if (!languageInfo) {
      console.log('LingQ Transliteration: Not on a supported page');
      return;
    }

    console.log(`LingQ Transliteration: Detected language: ${languageInfo.language}`);

    // Initialize transliterator based on detected language
    if (languageInfo.languageCode === 'gu') {
      this.transliterator = new GujaratiTransliterator();
    }

    if (!this.transliterator) {
      console.log('LingQ Transliteration: No transliterator available for this language');
      return;
    }

    // Listen for settings changes
    this.settingsManager.onSettingsChanged((changes) => {
      this.onSettingsChanged(changes);
    });

    // Process page with current settings
    await this.processPage();
    
    this.isInitialized = true;
    console.log('LingQ Transliteration: Initialized successfully');
  }

  async processPage() {
    const settings = await this.settingsManager.getSettings();
    const elements = this.contentProcessor.findTargetElements();
    
    if (elements.length === 0) {
      console.log('LingQ Transliteration: No target elements found');
      return;
    }

    console.log(`LingQ Transliteration: Processing ${elements.length} elements in ${settings.transliterationMode} mode`);
    
    await this.contentProcessor.processElements(
      elements, 
      this.transliterator, 
      settings.transliterationMode
    );
  }

  async onSettingsChanged(changes) {
    if (changes.transliterationMode !== undefined) {
      console.log(`LingQ Transliteration: Mode changed to ${changes.transliterationMode}`);
      await this.processPage();
    }
  }

  cleanup() {
    if (this.contentProcessor) {
      this.contentProcessor.cleanup();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

let extensionController = null;

async function initializeExtension() {
  try {
    extensionController = new ExtensionController();
    await extensionController.initialize();
  } catch (error) {
    console.error('LingQ Transliteration: Initialization failed:', error);
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (extensionController) {
    extensionController.cleanup();
  }
});
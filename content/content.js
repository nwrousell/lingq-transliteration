class ExtensionController {
  constructor() {
    this.settingsManager = new SettingsManager();
    this.urlMatcher = new URLMatcher();
    this.contentProcessor = new ContentProcessor();
    this.transliterator = null;
    this.isInitialized = false;
    this.observer = null;
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
    
    // Set up observer to watch for content changes
    this.setupContentObserver();
    
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

  setupContentObserver() {
    const container = document.querySelector('div.reader-container');
    if (!container) {
      // If container doesn't exist yet, wait and try again
      setTimeout(() => this.setupContentObserver(), 1000);
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      mutations.forEach((mutation) => {
        // Watch for child list changes (nodes added/removed)
        if (mutation.type === 'childList') {
          // Check added nodes
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  (node.tagName === 'P' || node.querySelector('p') || node.tagName === 'SPAN')) {
                shouldProcess = true;
                break;
              }
            }
          }
          // Check removed nodes (important for re-renders)
          if (mutation.removedNodes.length > 0) {
            for (const node of mutation.removedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  (node.tagName === 'P' || node.querySelector('p') || node.tagName === 'SPAN')) {
                shouldProcess = true;
                break;
              }
            }
          }
        }
        
        // Watch for text content changes in spans (direct textContent modifications)
        if (mutation.type === 'characterData' && 
            mutation.target.parentNode && 
            mutation.target.parentNode.tagName === 'SPAN') {
          shouldProcess = true;
        }
        
        // Watch for attribute changes that might affect text rendering
        if (mutation.type === 'attributes' && 
            mutation.target.tagName === 'SPAN' &&
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        console.log('LingQ Transliteration: Content change detected, reprocessing...');
        // Add a small delay to let LingQ finish its own processing
        setTimeout(() => this.processPage(), 100);
      }
    });

    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true, // Watch for text content changes
      attributes: true,    // Watch for attribute changes
      attributeFilter: ['class', 'style'] // Only watch relevant attributes
    });

    console.log('LingQ Transliteration: Content observer set up');
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.contentProcessor) {
      this.contentProcessor.cleanup();
    }
    // Save transliteration cache on cleanup
    if (this.transliterator && this.transliterator.forceSaveCache) {
      this.transliterator.forceSaveCache();
    }
  }
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (extensionController) {
    extensionController.cleanup();
  }
});
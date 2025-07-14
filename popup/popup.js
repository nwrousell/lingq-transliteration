class PopupController {
  constructor() {
    this.settingsManager = null;
    this.urlMatcher = null;
  }

  async initialize() {
    // Initialize managers
    this.settingsManager = new SettingsManager();
    this.urlMatcher = new URLMatcher();

    // Check current page status
    await this.checkPageStatus();
    
    // Load current settings
    await this.loadCurrentSettings();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  async checkPageStatus() {
    const statusElement = document.getElementById('language-status');
    
    try {
      // Get current tab URL
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const languageInfo = this.urlMatcher.isValidURL(tab.url);
      
      if (languageInfo) {
        statusElement.textContent = `Active on ${languageInfo.language.charAt(0).toUpperCase() + languageInfo.language.slice(1)} page`;
        statusElement.className = 'language-info success';
        this.enableSettings(true);
      } else {
        statusElement.textContent = 'Not active on this page';
        statusElement.className = 'language-info error';
        this.enableSettings(false);
      }
    } catch (error) {
      statusElement.textContent = 'Error checking page status';
      statusElement.className = 'language-info error';
      this.enableSettings(false);
    }
  }

  enableSettings(enabled) {
    const radioInputs = document.querySelectorAll('input[type="radio"]:not(#display-overlay)');
    radioInputs.forEach(input => {
      input.disabled = !enabled;
    });
  }

  async loadCurrentSettings() {
    const settings = await this.settingsManager.getSettings();
    
    // Set transliteration mode
    const modeRadio = document.getElementById(`mode-${settings.transliterationMode}`);
    if (modeRadio) {
      modeRadio.checked = true;
    }
    
    // Set display mode
    const displayRadio = document.getElementById(`display-${settings.displayMode}`);
    if (displayRadio) {
      displayRadio.checked = true;
    }
  }

  setupEventListeners() {
    // Transliteration mode change
    const modeRadios = document.querySelectorAll('input[name="transliterationMode"]');
    modeRadios.forEach(radio => {
      radio.addEventListener('change', async (e) => {
        if (e.target.checked) {
          await this.settingsManager.setSetting('transliterationMode', e.target.value);
        }
      });
    });

    // Display mode change (for future use)
    const displayRadios = document.querySelectorAll('input[name="displayMode"]');
    displayRadios.forEach(radio => {
      radio.addEventListener('change', async (e) => {
        if (e.target.checked) {
          await this.settingsManager.setSetting('displayMode', e.target.value);
        }
      });
    });
  }
}

// URL Matcher and Settings Manager classes for popup context
class SettingsManager {
  constructor() {
    this.defaultSettings = {
      transliterationMode: 'off',
      displayMode: 'replace'
    };
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(this.defaultSettings);
      return result;
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.defaultSettings;
    }
  }

  async setSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  }
}

class URLMatcher {
  constructor() {
    this.supportedLanguages = {
      'gu': 'gujarati'
    };
  }

  isValidURL(url) {
    const pattern = /https:\/\/www\.lingq\.com\/[^\/]+\/learn\/([^\/]+)\/web\/reader\//;
    const match = url.match(pattern);
    
    if (!match) return null;
    
    const languageCode = match[1];
    if (this.supportedLanguages[languageCode]) {
      return {
        isValid: true,
        languageCode: languageCode,
        language: this.supportedLanguages[languageCode]
      };
    }
    
    return null;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const popupController = new PopupController();
  await popupController.initialize();
});
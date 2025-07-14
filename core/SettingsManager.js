class SettingsManager {
  constructor() {
    this.defaultSettings = {
      transliterationMode: 'off', // 'off', 'iast', 'hunterian'
      displayMode: 'replace' // 'replace', 'overlay'
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

  async setSettings(settings) {
    try {
      await chrome.storage.sync.set(settings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  onSettingsChanged(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        const updatedSettings = {};
        for (let key in changes) {
          updatedSettings[key] = changes[key].newValue;
        }
        callback(updatedSettings);
      }
    });
  }
}
class URLMatcher {
  constructor() {
    this.supportedLanguages = {
      'gu': 'gujarati'
    };
  }

  isValidURL(url = window.location.href) {
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

  getCurrentLanguage() {
    return this.isValidURL();
  }

  addSupportedLanguage(code, name) {
    this.supportedLanguages[code] = name;
  }
}
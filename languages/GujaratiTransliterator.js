class GujaratiTransliterator {
  constructor() {
    this.apiBaseUrl = 'https://aksharamukha.appspot.com/api/process';
    this.cache = new Map();
    this.batchSize = 10;
  }

  async transliterate(text, mode) {
    if (mode === 'off') return text;
    
    const cacheKey = `${text}_${mode}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const irastText = await this.toIAST(text);
      let result;
      
      if (mode === 'iast') {
        result = irastText;
      } else if (mode === 'hunterian') {
        result = this.iastToHunterian(irastText);
      } else {
        result = text;
      }

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Transliteration error:', error);
      return text; // Return original text on error
    }
  }

  async toIAST(text) {
    const cleanText = text.trim();
    if (!cleanText) return text;

    try {
      const url = new URL(this.apiBaseUrl);
      url.searchParams.set('source', 'Gujarati');
      url.searchParams.set('target', 'IAST');
      url.searchParams.set('text', cleanText);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // API returns an array, take the first result
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }
      
      return cleanText; // Return original if no result
    } catch (error) {
      console.error('IAST conversion error:', error);
      return cleanText;
    }
  }

  iastToHunterian(iastText) {
    if (!iastText) return iastText;

    // Basic IAST to Hunterian conversion
    // Remove diacritical marks and convert to simple Latin
    return iastText
      .replace(/ā/g, 'a')
      .replace(/ī/g, 'i')
      .replace(/ū/g, 'u')
      .replace(/ṛ/g, 'ri')
      .replace(/ṝ/g, 'ri')
      .replace(/ḷ/g, 'l')
      .replace(/ē/g, 'e')
      .replace(/ō/g, 'o')
      .replace(/ṃ/g, 'm')
      .replace(/ḥ/g, 'h')
      .replace(/ṅ/g, 'ng')
      .replace(/ñ/g, 'n')
      .replace(/ṭ/g, 't')
      .replace(/ḍ/g, 'd')
      .replace(/ṇ/g, 'n')
      .replace(/ś/g, 'sh')
      .replace(/ṣ/g, 'sh')
      .replace(/'/g, '') // Remove apostrophes
      .toLowerCase();
  }

  async batchTransliterate(texts, mode) {
    const results = [];
    
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchPromises = batch.map(text => this.transliterate(text, mode));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  clearCache() {
    this.cache.clear();
  }
}
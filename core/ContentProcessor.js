class ContentProcessor {
  constructor() {
    this.originalContent = new Map();
    this.processedElements = new Set();
  }

  findTargetElements() {
    const container = document.querySelector('div.reader-container');
    if (!container) return [];

    return Array.from(container.querySelectorAll('p'));
  }

  getTextSpans(paragraph) {
    return Array.from(paragraph.querySelectorAll('span'));
  }

  storeOriginalContent(element) {
    if (!this.originalContent.has(element)) {
      this.originalContent.set(element, element.textContent);
    }
  }

  restoreOriginalContent(element) {
    if (this.originalContent.has(element)) {
      element.textContent = this.originalContent.get(element);
    }
  }

  async processElements(elements, transliterator, mode) {
    if (mode === 'off') {
      this.restoreAllContent();
      return;
    }

    for (const paragraph of elements) {
      await this.processParagraph(paragraph, transliterator, mode);
    }
  }

  async processParagraph(paragraph, transliterator, mode) {
    const spans = this.getTextSpans(paragraph);
    
    if (spans.length > 0) {
      // Process individual spans
      for (const span of spans) {
        await this.processSpan(span, transliterator, mode);
      }
    } else {
      // Process entire paragraph if no spans
      await this.processSpan(paragraph, transliterator, mode);
    }
  }

  async processSpan(element, transliterator, mode) {
    this.storeOriginalContent(element);
    
    const originalText = this.originalContent.get(element);
    if (!originalText || originalText.trim() === '') return;

    try {
      const transliteratedText = await transliterator.transliterate(originalText, mode);
      if (transliteratedText) {
        element.textContent = transliteratedText;
        this.processedElements.add(element);
      }
    } catch (error) {
      console.error('Error transliterating text:', error);
      // Keep original text on error
    }
  }

  restoreAllContent() {
    for (const [element, originalText] of this.originalContent) {
      element.textContent = originalText;
    }
    this.processedElements.clear();
  }

  cleanup() {
    this.restoreAllContent();
    this.originalContent.clear();
    this.processedElements.clear();
  }
}
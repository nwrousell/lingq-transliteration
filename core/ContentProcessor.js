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
    // Look for word-level spans that are deeply nested
    // The structure is: p > span > span (where the inner spans contain individual words)
    const allSpans = Array.from(paragraph.querySelectorAll('span'));
    
    // Filter to get only the deepest spans that contain actual text (word-level spans)
    const wordSpans = allSpans.filter(span => {
      // Check if this span contains text and has no child spans
      const hasChildSpans = span.querySelector('span') !== null;
      const hasText = span.textContent.trim() !== '';
      
      // We want spans that have text but no child spans (leaf spans)
      return hasText && !hasChildSpans;
    });
    
    return wordSpans;
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

    // Always restore original content before applying new transliteration
    this.restoreAllContent();

    // Collect all text spans for batch processing
    const elementsToProcess = [];
    const textsToTransliterate = [];
    
    for (const paragraph of elements) {
      const spans = this.getTextSpans(paragraph);
      
      if (spans.length > 0) {
        for (const span of spans) {
          this.storeOriginalContent(span);
          const originalText = this.originalContent.get(span);
          if (originalText && originalText.trim() !== '') {
            elementsToProcess.push(span);
            textsToTransliterate.push(originalText);
          }
        }
      } else {
        this.storeOriginalContent(paragraph);
        const originalText = this.originalContent.get(paragraph);
        if (originalText && originalText.trim() !== '') {
          elementsToProcess.push(paragraph);
          textsToTransliterate.push(originalText);
        }
      }
    }

    if (textsToTransliterate.length === 0) return;

    console.log(`LingQ Transliteration: Batch processing ${textsToTransliterate.length} text elements`);

    // Batch transliterate all texts
    const transliteratedTexts = await transliterator.batchTransliterate(textsToTransliterate, mode);
    
    // Apply results back to elements using array indices
    for (let i = 0; i < elementsToProcess.length; i++) {
      const element = elementsToProcess[i];
      const transliteratedText = transliteratedTexts[i];
      
      if (element && transliteratedText) {
        // Only change textContent to preserve styling and event listeners
        element.textContent = transliteratedText;
        this.processedElements.add(element);
      }
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
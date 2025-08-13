class TransliterationCache {
    constructor(cacheKey = 'lingq_transliteration_cache') {
        this.cacheKey = cacheKey;
        this.cache = this.loadCache();
        this.maxEntries = 1000;
    }

    loadCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('Failed to load transliteration cache:', error);
            return {};
        }
    }

    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch (error) {
            console.warn('Failed to save transliteration cache:', error);
            // If localStorage is full, clear some old entries
            if (error.name === 'QuotaExceededError') {
                this.clearOldCacheEntries();
                try {
                    localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
                } catch (retryError) {
                    console.warn('Failed to save cache even after cleanup:', retryError);
                }
            }
        }
    }

    clearOldCacheEntries() {
        const entries = Object.entries(this.cache);
        // Keep only the most recent entries
        if (entries.length > this.maxEntries) {
            const sortedEntries = entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
            this.cache = Object.fromEntries(sortedEntries.slice(0, this.maxEntries));
        }
    }

    get(key) {
        const cached = this.cache[key];
        return cached ? cached.result : null;
    }

    set(key, value) {
        this.cache[key] = {
            result: value,
            timestamp: Date.now()
        };
        
        // Save cache periodically (not on every request to avoid performance issues)
        if (Math.random() < 0.1) { // 10% chance to save
            this.saveCache();
        }
    }

    has(key) {
        return key in this.cache && this.cache[key].result !== undefined;
    }

    clear() {
        this.cache = {};
        try {
            localStorage.removeItem(this.cacheKey);
        } catch (error) {
            console.warn('Failed to clear cache from localStorage:', error);
        }
    }

    // Force save cache (useful for cleanup)
    forceSave() {
        this.saveCache();
    }

    // Get cache statistics
    getStats() {
        const entries = Object.entries(this.cache);
        return {
            entryCount: entries.length,
            oldestEntry: entries.length > 0 ? Math.min(...entries.map(([_, v]) => v.timestamp || 0)) : null,
            newestEntry: entries.length > 0 ? Math.max(...entries.map(([_, v]) => v.timestamp || 0)) : null
        };
    }
}
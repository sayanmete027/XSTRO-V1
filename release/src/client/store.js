"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CacheStore {
    constructor() {
        this.cache = new Map();
        this.stats = new Map();
    }
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        const stats = this.stats.get(key) || { hits: 0, created: new Date(), lastAccessed: null };
        stats.hits += 1;
        stats.lastAccessed = new Date();
        this.stats.set(key, stats);
        return this.cache.get(key); // Cast to T
    }
    set(key, value) {
        this.cache.set(key, value);
        if (!this.stats.has(key)) {
            this.stats.set(key, {
                hits: 0,
                created: new Date(),
                lastAccessed: null
            });
        }
    }
    del(key) {
        this.cache.delete(key);
        this.stats.delete(key);
    }
    flushAll() {
        this.cache.clear();
        this.stats.clear();
    }
    getStats(key) {
        return this.stats.get(key);
    }
    getAllStats() {
        return new Map(this.stats);
    }
}
exports.default = CacheStore;

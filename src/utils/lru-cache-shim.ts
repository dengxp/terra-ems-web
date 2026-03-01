// A simple memory cache to replace the problematic lru-cache dependency
// which crashes during Umi/SWC transpilation down to babel ES5.
export class LRUCache<K = any, V = any> {
    max: number;
    cache: Map<K, V>;

    constructor(options: { max?: number }) {
        this.max = options.max || 1000;
        this.cache = new Map<K, V>();
    }

    get(key: K): V | undefined {
        return this.cache.get(key);
    }

    set(key: K, val: V): void {
        if (this.cache.size >= this.max) {
            // Very naive eviction (first item) for safety
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) this.cache.delete(firstKey);
        }
        this.cache.set(key, val);
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: K): void {
        this.cache.delete(key);
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }
}

/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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

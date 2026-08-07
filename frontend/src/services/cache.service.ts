const STORAGE_PREFIX = 'damar-betest:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private prefix: string;

  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
    try {
      const item: CacheItem<T> = {
        data,
        expiresAt: Date.now() + ttl,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch {
      this.evictOldest();
      try {
        const item: CacheItem<T> = {
          data,
          expiresAt: Date.now() + ttl,
        };
        localStorage.setItem(this.getKey(key), JSON.stringify(item));
      } catch {
        // give up if still full
      }
    }
  }

  private evictOldest(): void {
    const entries: { key: string; expiresAt: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (!fullKey || !fullKey.startsWith(this.prefix)) continue;
      try {
        const item = JSON.parse(localStorage.getItem(fullKey) || '{}');
        entries.push({ key: fullKey, expiresAt: item.expiresAt || 0 });
      } catch {
        entries.push({ key: fullKey, expiresAt: 0 });
      }
    }
    entries.sort((a, b) => a.expiresAt - b.expiresAt);
    const toRemove = Math.ceil(entries.length / 3);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      const item: CacheItem<T> = JSON.parse(raw);
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(this.getKey(key));
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch {
      // ignore
    }
  }

  delPattern(pattern: string): void {
    try {
      const fullPattern = this.getKey(pattern);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.matchPattern(key, fullPattern)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );
    return regex.test(key);
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }
}

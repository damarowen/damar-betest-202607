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
      // localStorage might be full
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

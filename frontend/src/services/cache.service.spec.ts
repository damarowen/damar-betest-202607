import { CacheService } from './cache.service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    localStorage.clear();
    cache = new CacheService('test:');
  });

  it('should set and get value', () => {
    cache.set('key', { name: 'Damar' });
    expect(cache.get<{ name: string }>('key')).toEqual({ name: 'Damar' });
  });

  it('should return null for expired value', () => {
    cache.set('key', { name: 'Damar' }, -1);
    expect(cache.get('key')).toBeNull();
  });

  it('should remove value', () => {
    cache.set('key', { name: 'Damar' });
    cache.remove('key');
    expect(cache.get('key')).toBeNull();
  });

  it('should clear values with prefix', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });
});

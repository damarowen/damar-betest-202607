import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  disconnect: jest.fn(),
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get and parse cached value', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ name: 'Damar' }));
    const result = await service.get('key');
    expect(result).toEqual({ name: 'Damar' });
  });

  it('should return null on cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.get('key');
    expect(result).toBeNull();
  });

  it('should set value with ttl', async () => {
    await service.set('key', { name: 'Damar' }, 60);
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'key',
      60,
      JSON.stringify({ name: 'Damar' }),
    );
  });

  it('should delete by key', async () => {
    await service.del('key');
    expect(mockRedis.del).toHaveBeenCalledWith('key');
  });

  it('should delete by pattern', async () => {
    mockRedis.keys.mockResolvedValue(['a', 'b']);
    await service.delPattern('pattern:*');
    expect(mockRedis.del).toHaveBeenCalledWith('a', 'b');
  });
});

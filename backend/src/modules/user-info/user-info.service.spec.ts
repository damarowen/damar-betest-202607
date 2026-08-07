import { Test, TestingModule } from '@nestjs/testing';
import { UserInfoService } from './user-info.service';
import { UserInfoRepository } from './user-info.repository';
import { RedisService } from '../redis/redis.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByAccountNumber: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  existsByUniqueFields: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('UserInfoService', () => {
  let service: UserInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInfoService,
        { provide: UserInfoRepository, useValue: mockRepository },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<UserInfoService>(UserInfoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [{ userId: '1', fullName: 'Damar' }];
    mockRepository.findAll.mockResolvedValue(users);
    mockRepository.count.mockResolvedValue(1);

    const result = await service.findAll({});
    expect(result.data).toEqual(users);
    expect(result.total).toBe(1);
  });

  it('should find user by id with cache', async () => {
    const user = { userId: '1', fullName: 'Damar' };
    mockRedisService.get.mockResolvedValue(null);
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findById('1');
    expect(result).toEqual(user);
    expect(mockRedisService.set).toHaveBeenCalled();
  });

  it('should throw NotFoundException when user not found', async () => {
    mockRedisService.get.mockResolvedValue(null);
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });

  it('should create user', async () => {
    const dto = {
      userId: '1',
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(false);
    mockRepository.create.mockResolvedValue(dto);

    const result = await service.create(dto);
    expect(result).toEqual(dto);
  });

  it('should throw ConflictException on duplicate', async () => {
    const dto = {
      userId: '1',
      fullName: 'Damar',
      accountNumber: '100',
      emailAddress: 'damar@example.com',
      registrationNumber: 'REG-1',
      role: 'admin',
    };
    mockRepository.existsByUniqueFields.mockResolvedValue(true);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });
});

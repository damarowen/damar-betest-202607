import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    return {
      secret:
        this.configService.get<string>('JWT_SECRET') || 'default_secret',
      signOptions: {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1d',
      },
    };
  }
}

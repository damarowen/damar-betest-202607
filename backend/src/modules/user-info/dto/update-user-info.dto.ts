import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiPropertyOptional({ example: 'Damar Owen Updated' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '100000001' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'damar-new@example.com' })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional({ example: 'REG-2024-0001' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'user', enum: ['admin', 'user'] })
  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: string;
}

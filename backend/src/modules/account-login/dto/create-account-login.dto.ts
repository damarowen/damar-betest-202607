import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountLoginDto {
  @ApiProperty({ example: 'acc-001' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 'damar' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'user-001' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

import {
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountLoginDto {
  @ApiProperty({ example: 'damar' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  userInfoId: string;
}

import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInfoDto {
  @ApiProperty({ example: 'Damar Owen' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '100000001' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'damar@example.com' })
  @IsEmail()
  emailAddress: string;

  @ApiProperty({ example: 'REG-2024-0001' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'user'] })
  @IsEnum(['admin', 'user'])
  role: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  userName: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

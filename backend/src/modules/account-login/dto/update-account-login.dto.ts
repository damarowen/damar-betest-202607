import {
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountLoginDto {
  @ApiPropertyOptional({ example: 'damar-new' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  lastLoginDateTime?: Date;
}

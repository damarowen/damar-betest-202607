import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate JWT token' })
  @ApiResponse({ status: 200, description: 'Token generated' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.userName, loginDto.password);
  }
}

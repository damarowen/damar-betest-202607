import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserInfoService } from './user-info.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { ListUserInfoDto } from './dto/list-user-info.dto';

@ApiTags('User Info')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-infos')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get()
  @ApiOperation({ summary: 'List User Info with filter and sort' })
  @ApiQuery({ name: 'fullName', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user'] })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: ListUserInfoDto) {
    return this.userInfoService.findAll(query);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get User Info detail by userId' })
  async findById(@Param('userId') userId: string) {
    return this.userInfoService.findById(userId);
  }

  @Get('account-number/:accountNumber')
  @ApiOperation({ summary: 'Get User Info by accountNumber' })
  async findByAccountNumber(
    @Param('accountNumber') accountNumber: string,
  ) {
    return this.userInfoService.findByAccountNumber(accountNumber);
  }

  @Get('registration-number/:registrationNumber')
  @ApiOperation({ summary: 'Get User Info by registrationNumber' })
  async findByRegistrationNumber(
    @Param('registrationNumber') registrationNumber: string,
  ) {
    return this.userInfoService.findByRegistrationNumber(registrationNumber);
  }

  @Post()
  @ApiOperation({ summary: 'Create new User Info' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Duplicate unique field' })
  async create(@Body() dto: CreateUserInfoDto) {
    return this.userInfoService.create(dto);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update User Info by userId' })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserInfoDto,
  ) {
    return this.userInfoService.update(userId, dto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete User Info by userId' })
  async delete(@Param('userId') userId: string) {
    return this.userInfoService.delete(userId);
  }
}

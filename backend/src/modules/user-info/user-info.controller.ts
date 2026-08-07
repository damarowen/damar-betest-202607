import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserInfoService } from './user-info.service';
import { CreateUserInfoDto } from './dto/create-user-info.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';
import { ListUserInfoDto } from './dto/list-user-info.dto';

@ApiTags('User Info')
@ApiBearerAuth()
@Controller('user-infos')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'List User Info with filter and sort' })
  @ApiQuery({ name: 'fullName', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user'] })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: ListUserInfoDto) {
    return this.userInfoService.findAll(query);
  }

  @Get('account-number/:accountNumber')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get User Info by accountNumber' })
  async findByAccountNumber(
    @Param('accountNumber') accountNumber: string,
  ) {
    return this.userInfoService.findByAccountNumber(accountNumber);
  }

  @Get('registration-number/:registrationNumber')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get User Info by registrationNumber' })
  async findByRegistrationNumber(
    @Param('registrationNumber') registrationNumber: string,
  ) {
    return this.userInfoService.findByRegistrationNumber(registrationNumber);
  }

  @Get(':userId')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get User Info detail by userId' })
  async findById(@Param('userId') userId: string) {
    return this.userInfoService.findById(userId);
  }

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Create new User Info' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Duplicate unique field' })
  @ApiResponse({ status: 403, description: 'Forbidden: user cannot create admin' })
  async create(@Body() dto: CreateUserInfoDto, @Req() req: any) {
    return this.userInfoService.create(dto, req.user?.role);
  }

  @Put(':userId')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Update User Info by userId' })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserInfoDto,
    @Req() req: any,
  ) {
    return this.userInfoService.update(userId, dto, req.user?.role);
  }

  @Delete(':userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete User Info by userId' })
  async delete(@Param('userId') userId: string) {
    return this.userInfoService.delete(userId);
  }
}

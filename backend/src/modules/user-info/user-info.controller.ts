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

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get User Info detail by id' })
  async findById(@Param('id') id: string) {
    return this.userInfoService.findById(id);
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

  @Put(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Update User Info by id' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserInfoDto,
    @Req() req: any,
  ) {
    return this.userInfoService.update(id, dto, req.user?.role, req.user?.userInfoId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete User Info by id' })
  async delete(@Param('id') id: string) {
    return this.userInfoService.delete(id);
  }
}

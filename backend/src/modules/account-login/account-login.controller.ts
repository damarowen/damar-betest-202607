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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AccountLoginService } from './account-login.service';
import { CreateAccountLoginDto } from './dto/create-account-login.dto';
import { UpdateAccountLoginDto } from './dto/update-account-login.dto';
import { ListAccountLoginDto } from './dto/list-account-login.dto';

@ApiTags('Account Login')
@ApiBearerAuth()
@Controller('account-logins')
export class AccountLoginController {
  constructor(private readonly accountLoginService: AccountLoginService) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'List Account Logins with filter and sort' })
  @ApiQuery({ name: 'userName', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: ListAccountLoginDto) {
    return this.accountLoginService.findAll(query);
  }

  @Get('inactive')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get Account Logins with lastLoginDateTime > 3 days' })
  async findInactive() {
    return this.accountLoginService.findInactive(3);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get Account Login detail by id' })
  async findById(@Param('id') id: string) {
    return this.accountLoginService.findById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create new Account Login' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Duplicate account' })
  async create(@Body() dto: CreateAccountLoginDto) {
    return this.accountLoginService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update Account Login by id' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountLoginDto,
  ) {
    return this.accountLoginService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Account Login by id' })
  async delete(@Param('id') id: string) {
    return this.accountLoginService.delete(id);
  }
}

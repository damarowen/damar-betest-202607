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
import { AccountLoginService } from './account-login.service';
import { CreateAccountLoginDto } from './dto/create-account-login.dto';
import { UpdateAccountLoginDto } from './dto/update-account-login.dto';
import { ListAccountLoginDto } from './dto/list-account-login.dto';

@ApiTags('Account Login')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account-logins')
export class AccountLoginController {
  constructor(private readonly accountLoginService: AccountLoginService) {}

  @Get()
  @ApiOperation({ summary: 'List Account Logins with filter and sort' })
  @ApiQuery({ name: 'userName', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: ListAccountLoginDto) {
    return this.accountLoginService.findAll(query);
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Get Account Logins with lastLoginDateTime > 3 days' })
  async findInactive() {
    return this.accountLoginService.findInactive(3);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get Account Login detail by accountId' })
  async findById(@Param('accountId') accountId: string) {
    return this.accountLoginService.findById(accountId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Account Login' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Duplicate account' })
  async create(@Body() dto: CreateAccountLoginDto) {
    return this.accountLoginService.create(dto);
  }

  @Put(':accountId')
  @ApiOperation({ summary: 'Update Account Login by accountId' })
  async update(
    @Param('accountId') accountId: string,
    @Body() dto: UpdateAccountLoginDto,
  ) {
    return this.accountLoginService.update(accountId, dto);
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Account Login by accountId' })
  async delete(@Param('accountId') accountId: string) {
    return this.accountLoginService.delete(accountId);
  }
}

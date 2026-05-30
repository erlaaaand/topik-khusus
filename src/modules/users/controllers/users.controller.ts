import { Controller, Get, Post, Body, Param, NotFoundException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import type { User } from '../../../common/interfaces/user.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat user baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`[POST /users] Request masuk — email: ${createUserDto.email}`);
    const user = await this.usersService.createUser(createUserDto);
    this.logger.log(`[POST /users] Response dikirim — user id: ${user.id}`);
    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Mengambil semua data user (Mendemonstrasikan Redis Cache)' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil data.' })
  async findAll(): Promise<User[]> {
    this.logger.log('[GET /users] Request masuk');
    const users = await this.usersService.getAllUsers();
    this.logger.log(`[GET /users] Response dikirim — ${users.length} user`);
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil satu data user berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data user ditemukan.' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan.' })
  async findOne(@Param('id') id: string): Promise<User> {
    this.logger.log(`[GET /users/:id] Request masuk — id: ${id}`);
    const user = await this.usersService.getUserById(id);

    if (user === null) {
      this.logger.warn(`[GET /users/:id] User id: ${id} tidak ditemukan — 404`);
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    this.logger.log(`[GET /users/:id] Response dikirim — user id: ${id}`);
    return user;
  }
}
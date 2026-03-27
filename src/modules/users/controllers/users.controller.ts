import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import type { User } from '../../../common/interfaces/user.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat user baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mengambil semua data user (Mendemonstrasikan Redis Cache)' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil data.' })
  async findAll(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil satu data user berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Data user ditemukan.' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan.' })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.getUserById(id);

    if (user === null) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    return user;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../common/interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly database: User[] = [];

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(),
      name: createUserDto.name,
      email: createUserDto.email,
      createdAt: new Date(),
    };

    this.database.push(newUser);

    await this.cacheManager.del('users:all');

    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    const cacheKey = 'users:all';

    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);

    if (cachedUsers !== undefined && cachedUsers !== null) {
      return cachedUsers;
    }

    const usersFromDb: User[] = this.database;

    await this.cacheManager.set(cacheKey, usersFromDb, 60000);

    return usersFromDb;
  }

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `users:${id}`;

    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser !== undefined && cachedUser !== null) {
      return cachedUser;
    }

    const user = this.database.find((u) => u.id === id);

    if (user !== undefined) {
      await this.cacheManager.set(cacheKey, user, 60000);
      return user;
    }

    return null;
  }
}
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from '../../../common/interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { MessagingService } from '../../../messaging/messaging.service';
import { EVENT_PATTERNS } from '../../../common/constants/queue.constants';

@Injectable()
export class UsersService {
  private readonly database: User[] = [];
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly messagingService: MessagingService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(),
      name: createUserDto.name,
      email: createUserDto.email,
      createdAt: new Date(),
    };

    this.database.push(newUser);

    await this.cacheManager.del('users:all');

    // Publish event ke RabbitMQ
    await this.messagingService.publishEvent(EVENT_PATTERNS.USER_CREATED, {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      timestamp: newUser.createdAt,
    });

    this.logger.log(`User baru dibuat: ${newUser.id}`);

    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    const cacheKey = 'users:all';

    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);

    if (cachedUsers !== undefined && cachedUsers !== null) {
      this.logger.log('Data users diambil dari Redis cache');
      return cachedUsers;
    }

    const usersFromDb: User[] = this.database;

    await this.cacheManager.set(cacheKey, usersFromDb, 60000);

    this.logger.log('Data users diambil dari database, disimpan ke cache');

    return usersFromDb;
  }

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `users:${id}`;

    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser !== undefined && cachedUser !== null) {
      this.logger.log(`User ${id} diambil dari Redis cache`);
      return cachedUser;
    }

    const user = this.database.find((u) => u.id === id);

    if (user !== undefined) {
      await this.cacheManager.set(cacheKey, user, 60000);
      this.logger.log(`User ${id} diambil dari database, disimpan ke cache`);
      return user;
    }

    return null;
  }
}

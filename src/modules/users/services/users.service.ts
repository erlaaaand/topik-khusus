import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { User } from '../../../common/interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { MessagingService } from '../../../messaging/messaging.service';
import { EVENT_PATTERNS } from '../../../common/constants/queue.constants';
import { UserEntity, type UserDocument } from '../schemas/user.schemas';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly messagingService: MessagingService,
  ) {}

  private toUser(doc: UserDocument): User {
    return {
      id: (doc._id as { toString(): string }).toString(),
      name: doc.name,
      email: doc.email,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`[CREATE] Memulai pembuatan user baru — email: ${createUserDto.email}`);

    const created = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
    });

    const newUser = this.toUser(created);
    this.logger.log(`[CREATE] User berhasil disimpan ke MongoDB — id: ${newUser.id}`);

    await this.cacheManager.del('users:all');
    this.logger.log(`[CACHE] Cache "users:all" di-invalidate setelah user baru dibuat`);

    await this.messagingService.publishEvent(EVENT_PATTERNS.USER_CREATED, {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      timestamp: newUser.createdAt,
    });

    this.logger.log(`[CREATE] Proses selesai — user id: ${newUser.id} siap dikembalikan`);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    this.logger.log('[FIND_ALL] Mengambil semua data users');

    const cacheKey = 'users:all';
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);

    if (cachedUsers !== undefined && cachedUsers !== null) {
      this.logger.log(`[CACHE HIT] "users:all" ditemukan di Redis — ${cachedUsers.length} user dikembalikan`);
      return cachedUsers;
    }

    this.logger.log('[CACHE MISS] "users:all" tidak ada di Redis — mengambil dari MongoDB');
    const docs = await this.userModel.find().lean().exec();
    const users: User[] = docs.map((doc) => ({
      id: (doc._id as { toString(): string }).toString(),
      name: doc.name,
      email: doc.email,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt,
    }));

    await this.cacheManager.set(cacheKey, users, 60000);
    this.logger.log(`[CACHE SET] ${users.length} user disimpan ke Redis dengan TTL 60 detik`);

    return users;
  }

  async getUserById(id: string): Promise<User | null> {
    this.logger.log(`[FIND_ONE] Mencari user dengan id: ${id}`);

    const cacheKey = `users:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser !== undefined && cachedUser !== null) {
      this.logger.log(`[CACHE HIT] "users:${id}" ditemukan di Redis`);
      return cachedUser;
    }

    this.logger.log(`[CACHE MISS] "users:${id}" tidak ada di Redis — mengambil dari MongoDB`);
    const doc = await this.userModel.findById(id).lean().exec();

    if (doc === null) {
      this.logger.warn(`[FIND_ONE] User dengan id: ${id} tidak ditemukan di MongoDB`);
      return null;
    }

    const user: User = {
      id: (doc._id as { toString(): string }).toString(),
      name: doc.name,
      email: doc.email,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt,
    };

    await this.cacheManager.set(cacheKey, user, 60000);
    this.logger.log(`[CACHE SET] User id: ${id} disimpan ke Redis dengan TTL 60 detik`);

    return user;
  }

  async existsById(id: string): Promise<boolean> {
    this.logger.log(`[EXISTS] Memeriksa keberadaan user id: ${id}`);
    const count = await this.userModel.countDocuments({ _id: id }).exec();
    const exists = count > 0;
    this.logger.log(`[EXISTS] User id: ${id} — ${exists ? 'ditemukan' : 'tidak ditemukan'}`);
    return exists;
  }
}
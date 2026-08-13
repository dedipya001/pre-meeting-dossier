import { Redis } from "ioredis";

export interface CacheService {
  getJson<T>(key: string): Promise<T | undefined>;
  setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}

export class MemoryCacheService implements CacheService {
  private readonly entries = new Map<string, { expiresAt: number; value: unknown }>();

  async getJson<T>(key: string): Promise<T | undefined> {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

export class RedisCacheService implements CacheService {
  private readonly redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  async getJson<T>(key: string): Promise<T | undefined> {
    if (this.redis.status === "wait") await this.redis.connect();
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) as T : undefined;
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.redis.status === "wait") await this.redis.connect();
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }
}

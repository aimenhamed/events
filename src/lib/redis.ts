import IORedis, { Redis as RedisClient } from "ioredis";
import { logger } from "./logger";

type RedisConfig = {
  host: string;
  username: string;
  password: string;
};

export class Redis {
  private readonly logger = logger.child({ module: "redis" });
  private client: RedisClient;

  constructor(config: RedisConfig) {
    this.client = new IORedis({ ...config, lazyConnect: true });
  }

  async start() {
    await this.client.connect();
    this.logger.info("Redis connected");
  }

  async stop() {
    await this.client.quit();
    this.logger.info("Redis disconnected");
  }

  async hset(key: string, value: any): Promise<number> {
    const serialized = JSON.stringify(value);
    const res = await this.client.hset(key, "data", serialized);
    return res;
  }

  async getAll(key: string) {
    const keys = await this.client.keys(key);
    const values = [];
    for (const key of keys) {
      const value = await this.get(key);
      values.push(value);
    }
    return values;
  }

  async get(key: string) {
    const deserialized = await this.client.hget(key, "data");
    if (!deserialized) return undefined;
    const value = JSON.parse(deserialized);
    return value;
  }

  async flush() {
    await this.client.flushall();
  }
}

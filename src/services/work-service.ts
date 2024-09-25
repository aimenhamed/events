import { logger } from "../lib/logger";
import { Redis } from "../lib/redis";
import { EventProcessor } from "../lib/event-processor";

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class WorkService {
  private readonly logger = logger.child({ module: "WorkService" });

  constructor(
    private readonly redis: Redis,
    private readonly eventProcessor: EventProcessor,
  ) {
    this.eventProcessor.registerListener("job", (payload) =>
      this.doWork(payload),
    );
  }

  async doWork(payload: any) {
    this.logger.info(`Doing work for ${payload.id}`);
    await wait(15000);
    this.logger.info(`Finished work for ${payload.id}`);
    await this.redis.hset(payload.id, "COMPLETE");
  }

  async startJob(body: any) {
    const id = crypto.randomUUID();
    await this.redis.hset(id, "IN PROGRESS");
    this.eventProcessor.fire("job", { id, body });
    return id;
  }

  async getJobStatus(id: string) {
    const status = await this.redis.get(id);
    return status;
  }

  async listenJobStatus(id: string) {
    // TODO
    const status = await this.redis.get(id);
    return status;
  }
}

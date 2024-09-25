import { Elysia } from "elysia";
import { logger } from "./logger";
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";
import { Redis } from "./redis";
import { EventProcessor } from "./event-processor";
import type { Server } from "../types/server";
import type { Controller } from "../types/controller";
import { WorkService } from "../services/work-service";
import { WorkController } from "../controllers/work-controller";

export class App {
  private readonly logger = logger.child({ module: "app" });
  private readonly server: Server;
  private readonly redis: Redis;
  private readonly eventProcessor: EventProcessor;

  // services
  private readonly workService: WorkService;

  constructor() {
    this.redis = new Redis({
      host: Bun.env.REDIS_HOST!,
      username: Bun.env.REDIS_USER ?? "",
      password: Bun.env.REDIS_PASS ?? "",
    });
    this.eventProcessor = new EventProcessor();

    // services
    this.workService = new WorkService(this.redis, this.eventProcessor);
    this.server = this.createServer();
  }

  private createServer() {
    const app = new Elysia()
      .use(cors())
      .use(staticPlugin({ prefix: "/", assets: "./ui/dist" }));
    const api = this.createApi();
    app.use(api);
    return app;
  }

  private createApi() {
    const api = new Elysia({ prefix: "/api" });
    api.onRequest(({ request }) => {
      const path = request.url.split("/api")[1];
      const route = path ? `/api${path}` : request.url;
      this.logger.info(`Received request ${request.method} ${route}`);
    });
    const controllers: Controller[] = [new WorkController(this.workService)];
    for (const controller of controllers) {
      api.use(controller.routes());
    }
    return api;
  }

  async run() {
    await this.redis.start();
    this.server.listen(8080, () =>
      this.logger.info("Listening on http://localhost:8080"),
    );
  }
}

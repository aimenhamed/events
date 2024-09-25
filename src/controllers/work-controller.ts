import { Elysia, t } from "elysia";
import { logger } from "../lib/logger";
import type { Controller } from "../types/controller";
import type { WorkService } from "../services/work-service";
import { inspect } from "bun";

export class WorkController implements Controller {
  private readonly logger = logger.child({ module: "WorkController" });

  constructor(private readonly workService: WorkService) {}

  routes() {
    return new Elysia({ prefix: "/evals" })
      .post("/", async ({ body }) => {
        this.logger.info(`Received job request: ${inspect(body)}`);
        return await this.workService.startJob(body);
      })
      .get(
        "/:jobId",
        async ({ params: { jobId } }) => {
          return await this.workService.getJobStatus(jobId);
        },
        {
          params: t.Object({
            jobId: t.String(),
          }),
        },
      )
      .get(
        "/listen/:jobId",
        async ({ params: { jobId } }) => {
          return await this.workService.listenJobStatus(jobId);
        },
        {
          params: t.Object({
            jobId: t.String(),
          }),
        },
      );
  }
}

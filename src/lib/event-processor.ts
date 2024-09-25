import { EventEmitter } from "node:events";
import { logger } from "./logger";

export class EventProcessor {
  private readonly logger = logger.child({ module: "EvalService" });
  private readonly eventEmitter = new EventEmitter();

  fire(eventName: string, payload?: any) {
    this.eventEmitter.emit(eventName, payload);
    this.logger.info(`Emitted ${eventName}`);
  }

  registerListener(eventName: string, handler: (...args: any[]) => void) {
    this.eventEmitter.on(eventName, handler);
    this.logger.info(`Attached listener for ${eventName}`);
  }
}

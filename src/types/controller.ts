import { Elysia } from "elysia";

export interface Controller {
  routes: () => Elysia<any, any>;
}

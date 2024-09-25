import { App } from "./lib/app";

async function main() {
  const app = new App();
  await app.run();
}

main();

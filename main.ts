import { logBanner } from "./utils/app.util.ts";
import Updater from "./services/updater.service.ts";

logBanner();
const args = Deno.args;

if (args.includes("--update")) {
  const updater = new Updater();
  await updater.checkForUpdates();
}
console.log('run')
// Main.run();
// logBenner()

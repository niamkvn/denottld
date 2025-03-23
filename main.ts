import Updater from "./services/updater.service.ts";
import { logBanner } from "./utils/app.util.ts";

logBanner()
const updater = new Updater();
updater.checkForUpdates();
// Main.run();
// logBenner()
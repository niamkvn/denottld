import { logBanner } from "./utils/app.util.ts";
import Updater from "./services/updater.service.ts";

logBanner()
const updater = new Updater();
updater.checkForUpdates();
// Main.run();
// logBenner()
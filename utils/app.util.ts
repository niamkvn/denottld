import appConfig from "../config/app.config.ts";

export function logBanner() {
  console.log(`
     ____                   _   _   _     _ 
    |  _ \\  ___ _ __   ___ | |_| |_| | __| |
    | | | |/ _ \\ '_ \\ / _ \\| __| __| |/ _\` |
    | |_| |  __/ | | | (_) | |_| |_| | (_| |
    |____/ \\___|_| |_|\\___/ \\__|\\__|_|\\__,_| v${appConfig.version}
    `);
}

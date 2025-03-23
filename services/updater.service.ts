import fs from "npm:fs-extra";
import appConfig from "../config/app.config.ts";
import updateConfig from "../config/update.config.ts";

export default class Updater {
  private readonly tempDir: string = "./storage/temp";

  async checkForUpdates() {
    console.log("🔍 Checking for updates...");
    // const localVersion = await this.getLocalVersion();
    const remoteVersion = await this.getRemoteVersion();
    if (!remoteVersion || appConfig.version === remoteVersion) {
      console.log("✅ No updates available.");
      return;
    }
    console.log(`🚀 Updating from ${appConfig.version} to ${remoteVersion}...`);
    await this.downloadAndApplyUpdates();
  }

  private async getLocalVersion(): Promise<string> {
    try {
      const config = JSON.parse(await Deno.readTextFile("./deno.json"));
      return config.metadata.version;
    } catch (error) {
      console.error("❌ Failed to get local version.");
      console.error(error);
      Deno.exit(1);
    }
  }

  private async getRemoteVersion(): Promise<string | null> {
    try {
      const response = await fetch(updateConfig.remoteDenoJsonUrl);
      const json = await response.json();
      return json.metadata.version || null;
    } catch (error) {
      console.error("❌ Failed to get remote version.");
      console.error(error);
      Deno.exit(1);
    }
  }

  private async downloadAndApplyUpdates(): Promise<void> {
    await fs.remove(this.tempDir);
    await fs.mkdirs(this.tempDir);
    const zipPath = `${this.tempDir}/main.zip`;
    const extractPath = `${this.tempDir}/extracted`;
    console.log("⬇️ Downloading updates...");
    await this.downloadUpdates(zipPath);
    console.log("📦 Extracting updates...");
    await this.extractUpdates(zipPath, extractPath);
    console.log("🔄 Applying updates...");
    await this.replaceFiles(extractPath);
    console.log("🧹 Cleaning up...");
    await fs.remove(this.tempDir);
    console.log("✅ Updates applied successfully. Exiting...");
    Deno.exit();
  }

  private async downloadUpdates(outputPath: string): Promise<void> {
    try {
      const response = await fetch(updateConfig.remoteRepoUrl);
      if (!response.body) throw new Error("Failed to download file");
      const file = await Deno.open(outputPath, { write: true, create: true });
      await response.body.pipeTo(file.writable);
      console.log("📥 Download complete.");
    } catch (error) {
      console.error("❌ Failed to download update:", JSON.stringify(error));
    }
  }

  private async extractUpdates(zipPath: string, extractPath: string): Promise<void> {
    const command = new Deno.Command("unzip", {
      args: ["-q", zipPath, "-d", extractPath],
    });
    const child = command.spawn();
    const { success } = await child.status;
    if (!success) {
      console.error("❌ Failed to extract zip file.");
      Deno.exit(1);
    }
  }

  private async replaceFiles(extractPath: string): Promise<void> {
    const updatesPath = `${extractPath}/denotest-main`;
    const existingFiles = await this.listFiles("./");
    const newFiles = await this.listFiles(updatesPath);

    // await fs.copy(updatesPath, "./", { overwrite: true });

    // for (const file of existingFiles) {
    //   if (!newFiles.has(file)) {
    //     const targetPath = join('./', file);
    //     console.log(`🗑 Removing deprecated file: ${targetPath}`);
    //     await remove(targetPath, { recursive: true });
    //   }
    // }
  }

  private async listFiles(dir: string, relativeTo: string = dir): Promise<Set<string>> {
    const files = new Set<string>();

    for await (const entry of Deno.readDir(dir)) {
      const fullPath = `${dir}/${entry.name}`;
      const relativePath = fullPath.replace(relativeTo + "/", "");

      if (entry.isDirectory) {
        const subFiles = await this.listFiles(fullPath, relativeTo);
        subFiles.forEach((subFile) => files.add(subFile));
      } else {
        files.add(relativePath);
      }
    }

    return files;
  }
}

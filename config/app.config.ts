const denoConfig = JSON.parse(await Deno.readTextFile("./deno.json"));

export default {
  name: denoConfig.metadata.name,
  version: denoConfig.metadata.version,
};

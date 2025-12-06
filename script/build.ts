import { rm } from "fs/promises";
import { build as viteBuild } from "vite";
import { exec } from "child_process";
import path from "path";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  await viteBuild({
    root: path.resolve("client"),
    configFile: path.resolve("client", "vite.config.ts"),
  });

  await new Promise((resolve, reject) => {
    exec("tsc -p tsconfig.json", (err, stdout, stderr) => {
      if (stdout.trim()) console.log(stdout);
      if (stderr.trim()) console.error(stderr);
      if (err) return reject(err);
      resolve(true);
    });
  });

  console.log(" Build complete");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});

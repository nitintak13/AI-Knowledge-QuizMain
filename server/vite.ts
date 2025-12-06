import { type Express } from "express";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(server: Server, app: Express) {
  const isProd = process.env.NODE_ENV === "production";

  const clientRoot = path.resolve(__dirname, "../client");
  const distRoot = path.resolve(__dirname, "../../dist/client");

  if (isProd) {
    app.use(
      require("express").static(distRoot, {
        index: false,
      })
    );

    app.get("*", async (req, res) => {
      const indexHtml = await fs.promises.readFile(
        path.join(distRoot, "index.html"),
        "utf-8"
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    });

    return;
  }

  const vite = await createViteServer({
    root: clientRoot,
    configFile: path.join(clientRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: {
        server,
        path: "/vite-hmr",
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const indexHtmlPath = path.join(clientRoot, "index.html");
      let template = await fs.promises.readFile(indexHtmlPath, "utf-8");

      template = await vite.transformIndexHtml(req.originalUrl, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });
}

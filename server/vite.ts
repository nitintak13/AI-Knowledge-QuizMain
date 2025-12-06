import { type Express } from "express";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";
import path from "path";
import fs from "fs";

export async function setupVite(server: Server, app: Express) {
  const clientRoot = path.resolve(__dirname, "../client");

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

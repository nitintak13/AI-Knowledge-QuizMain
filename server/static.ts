import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../../client/dist");

  if (!fs.existsSync(distPath)) {
    console.warn(
      `[serveStatic] WARNING: Expected frontend build not found at ${distPath}`
    );
    console.warn(`[serveStatic] Make sure "npm run build" builds the client.`);
    return;
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

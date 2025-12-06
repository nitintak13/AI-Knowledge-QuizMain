import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Correct client build output path
  const distPath = path.resolve(process.cwd(), "dist/client");

  if (!fs.existsSync(distPath)) {
    console.warn("[serveStatic] WARNING: Frontend build missing at:");
    console.warn("  " + distPath);
    console.warn("[serveStatic] Did you run 'npm run build'?");
    return;
  }

  console.log("[serveStatic] Serving static files from:", distPath);

  // Serve static assets
  app.use(express.static(distPath));

  // React Router fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Extend IncomingMessage to hold rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Logging helper
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${time} [${source}] ${message}`);
}

// API request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: unknown;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const ms = Date.now() - start;
      let msg = `${req.method} ${path} ${res.statusCode} in ${ms}ms`;
      if (capturedJson) msg += ` :: ${JSON.stringify(capturedJson)}`;
      log(msg);
    }
  });

  next();
});

// -----------------------
// BOOTSTRAP SERVER
// -----------------------
(async () => {
  await registerRoutes(httpServer, app);

  // DEV MODE → use Vite
  if (process.env.NODE_ENV === "development") {
    log("Development mode: enabling Vite", "express");
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // PROD MODE → serve static build
  if (process.env.NODE_ENV === "production") {
    log("Production mode: serving static build", "express");
    serveStatic(app);
  }

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${message}`, "error");
    res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    log(`Server running on port ${port}`);
  });
})();

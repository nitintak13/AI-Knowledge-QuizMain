import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = __dirname;
const projectRoot = path.resolve(__dirname, "..");

export default defineConfig({
  root: clientRoot,

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.resolve(projectRoot, "shared"),
    },
  },

  build: {
    outDir: path.resolve(projectRoot, "dist/client"),
    emptyOutDir: true,
  },
});

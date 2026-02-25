import { defineConfig } from "vite";

// 部署到 GitHub Pages 子路径时设为 /repo-name/，本地或 Vercel 等用 /
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  root: ".",
  base,
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: "index.html",
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});

# GitHub Pages 部署说明

本仓库通过 **GitHub Actions** 自动把 Vite 打包后的站点部署到 Pages，而不是直接发布源码。

## 必须做的一步（否则会一直「加载中…」）

1. 打开仓库 **Settings** → **Pages**
2. 在 **Build and deployment** 里，**Source** 选择 **「GitHub Actions」**（不要选 “Deploy from a branch”）
3. 保存后，每次推送到 `main`（或 `master`）会自动构建并部署

若 Source 选的是分支，GitHub 会直接提供仓库里的 `index.html` 和 `main.js` 等源码，浏览器无法正确加载，页面就会一直停在「加载中…」。

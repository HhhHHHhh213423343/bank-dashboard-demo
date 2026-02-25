# 行长经营分析驾驶舱（H5 Demo）

技术栈：React + Tailwind CSS（CDN）+ Recharts + Lucide React。支持 **Vite 打包**，部署后不依赖外网 CDN，手机端访问更稳定。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`；手机同一 Wi‑Fi 下访问 `http://<电脑IP>:5173`。

## 打包并部署（推荐：手机端稳定访问）

打包后所有依赖会打进静态文件，**不再请求 esm.sh**，适合部署到任意静态托管（Vercel / Netlify / Cloudflare Pages 等），手机端更稳定。

```bash
npm install
npm run build
```

将生成的 **`dist/`** 目录整体部署到托管平台即可。

- **Vercel**：连 GitHub 后选本仓库，**Root Directory** 默认，**Build Command** 填 `npm run build`，**Output Directory** 填 `dist`，部署。
- **Netlify**：连 GitHub，**Build command** 填 `npm run build`，**Publish directory** 填 `dist`，部署。
- **Cloudflare Pages**：连 GitHub，**Build command** 填 `npm run build`，**Build output directory** 填 `dist`，部署。

部署完成后用手机浏览器打开平台给的链接即可。

## 路由说明

使用 Hash 路由（`#/loan`、`#/deposit` 等），无刷新切换。

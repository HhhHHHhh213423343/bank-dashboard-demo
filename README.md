# 行长经营分析驾驶舱（H5 Demo）

技术栈：React + Tailwind CSS（CDN）+ Recharts + Lucide React（均通过 ESM CDN 引入，无需 Node/NPM）。

说明：为避免 CDN 下 `react-router-dom` 与 React 版本不一致引发运行错误，路由使用了轻量的 **Hash 路由实现**（无刷新切换）。

## 运行

在本目录执行：

```bash
python3 -m http.server 5173
```

浏览器打开：

- 本机：`http://127.0.0.1:5173`
- 手机（同一 Wi‑Fi）：`http://<电脑局域网IP>:5173`

## 核心链路

首页卡片入口 → `存款总览` → `按机构下钻`（点击分行）→ 分行详情（产品结构饼图 + 异常预警自然语言）。


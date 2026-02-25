const root = document.getElementById("root");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function showError(err) {
  const msg = err?.stack || err?.message || String(err);
  root.innerHTML = `
    <div class="min-h-screen grid place-items-center px-6">
      <div class="w-full max-w-[520px]">
        <div class="rounded-2xl border border-warn/30 bg-warn/10 p-4">
          <div class="text-[15px] font-semibold">页面加载失败</div>
          <div class="mt-2 text-[12px] text-white/70 leading-relaxed">
            这通常是外部 ESM 模块（React/Recharts/Lucide）拉取失败或脚本运行报错导致。
          </div>
          <div class="mt-3 rounded-xl border border-line bg-black/30 p-3 text-[12px] text-white/80 overflow-auto whitespace-pre-wrap">
${escapeHtml(msg)}
          </div>
          <div class="mt-3 text-[12px] text-white/60">
            你可以尝试：强刷（Cmd+Shift+R）或更换网络（公司网可能拦截 esm.sh）。
          </div>
        </div>
      </div>
    </div>
  `;
}

window.addEventListener("error", (e) => {
  // 脚本语法/运行错误
  showError(e?.error || e?.message || e);
});

window.addEventListener("unhandledrejection", (e) => {
  // 动态 import / Promise 错误
  showError(e?.reason || e);
});

// cache-bust：避免 304 让你一直看到旧状态
const v = Date.now();
// GitHub Pages 子目录下用绝对路径，避免无末尾斜杠时 ./main.js 解析到根目录
const base = (typeof document !== "undefined" && document.querySelector("base")?.getAttribute("href")) || "";
const mainUrl = base ? `${base.replace(/\/$/, "")}/main.js?v=${v}` : `./main.js?v=${v}`;
import(/* @vite-ignore */ mainUrl).catch(showError);


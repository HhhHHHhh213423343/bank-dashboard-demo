#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地启动经营驾驶舱网页（必须用 HTTP 打开，不能直接双击 index.html）。
支持电脑浏览器 + 同一 WiFi 下的手机访问。
"""
import http.server
import os
import socket
import sys
from pathlib import Path

PORT = 8765
DIR = Path(__file__).resolve().parent
os.chdir(DIR)


def _local_ips():
    """本机所有局域网 IPv4，供手机访问用（可能有多个网卡）。"""
    out = []
    try:
        import subprocess
        # 兼容 macOS / Linux：取到 192.168 / 10. 等内网 IP
        r = subprocess.run(
            ["ifconfig"] if sys.platform == "darwin" else ["ip", "-4", "addr"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if r.returncode != 0:
            raise SystemError("ifconfig/ip failed")
        text = (r.stdout or "") + (r.stderr or "")
        for part in text.split():
            # 简单匹配 192.168.x.x 或 10.x.x.x
            if part.count(".") == 3:
                try:
                    a, b, c, d = part.split(".")
                    if (a == "192" and b == "168") or a == "10" or (a == "172" and 16 <= int(b) <= 31):
                        out.append(part)
                except Exception:
                    pass
    except Exception:
        pass
    if not out:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(0)
            s.connect(("8.8.8.8", 80))
            out = [s.getsockname()[0]]
            s.close()
        except Exception:
            pass
    return list(dict.fromkeys(out))  # 去重保持顺序


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def main():
    # 0.0.0.0 表示允许同一局域网内其他设备（如手机）访问
    with http.server.HTTPServer(("0.0.0.0", PORT), Handler) as httpd:
        local = f"http://localhost:{PORT}/"
        ips = _local_ips()
        print("=" * 50)
        print("  经营驾驶舱 本地服务已启动")
        print("  电脑浏览器: " + local)
        if ips:
            print("  手机访问（任选一个，同一 WiFi 下在浏览器输入）：")
            for ip in ips:
                print("    http://" + ip + ":" + str(PORT) + "/")
        else:
            print("  手机访问: 确保手机与电脑同一 WiFi，在浏览器输入 电脑IP:8765")
        print("  若手机打不开: Mac 需在「系统设置→网络→防火墙」允许本机传入连接或暂时关闭防火墙。")
        print("  按 Ctrl+C 停止")
        print("=" * 50)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已停止。")

if __name__ == "__main__":
    main()

# 🦞 OpenClaw Manager

OpenClaw 的桌面管理工具，支持 macOS / Windows / Linux。

## 功能

- Gateway 控制 — 启动、停止、重启，实时日志查看
- 多实例管理 — 本机、Docker、NAS、远端实例切换
- 模型管理 — 添加自定义模型，设置默认模型
- 渠道配置 — Telegram、Discord、飞书、Slack、WhatsApp、Signal 等
- 系统诊断 — 一键检测环境、配置、服务状态
- 检查更新 — 自动检测新版本，按平台推荐下载
- 备份恢复 — 配置目录备份与恢复
- 技能管理 — 查看、搜索已安装技能
- App 日志 — 本地查看应用运行日志

## 下载

当前版本：v2.0.0 Beta

| 平台 | 格式 | 链接 |
|------|------|------|
| macOS (Apple Silicon) | DMG | [下载](https://github.com/ffffff9331/openclaw-manager/releases/latest) |
| Windows | MSI / EXE | [下载](https://github.com/ffffff9331/openclaw-manager/releases/latest) |
| Linux | AppImage / DEB | [下载](https://github.com/ffffff9331/openclaw-manager/releases/latest) |

> macOS 未签名，首次打开如果提示"已损坏"，在终端运行：
> ```bash
> xattr -cr "/Applications/OpenClawManager.app"
> ```

## 环境要求

- macOS 11.0+ / Windows 10+ / Ubuntu 20.04+
- 已安装 [OpenClaw](https://github.com/openclaw/openclaw)

## 本地开发

```bash
npm install
npm run tauri dev
```

构建：

```bash
npm run tauri build
```

## 更新日志

### v2.0.0 Beta (2026-04-12)

从旧版管理工具升级为桌面控制台形态：

- 架构重构：拆出 types / services / hooks / stores / pages / lib
- 多实例管理：实例列表、切换、持久化
- 三平台发布：macOS / Windows / Linux CI 构建
- 跨平台适配：Rust 后端全面重构，Windows 命令执行、PATH 构建、文件读取均已适配
- 自动更新：Tauri updater 签名 + GitHub Releases 分发
- 性能优化：按页懒加载，减少启动阶段后台加载
- 平台感知 UI：macOS 专属功能（LaunchAgent）在其他平台自动隐藏

### v1.1.x (2026-03)

旧版阶段，主要完成渠道状态显示、模型管理、检查更新、跨平台链接打开等基础功能。

## 许可证

MIT

---

Made with ❤️ by [ffffff9331](https://github.com/ffffff9331)

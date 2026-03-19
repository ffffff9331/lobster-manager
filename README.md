# 🦞 OpenClawManager - OpenClaw 管理助手

一款专为 OpenClaw 用户打造的桌面管理工具，让 AI 助手配置变得简单高效。

## ⭐ 功能特性

- 🖥️ **系统诊断** - 一键检测：操作系统、OpenClaw版本、Node.js版本、配置目录、OpenClaw Doctor
- 🎛️ **Gateway 控制** - 一键启动/停止/重启，随时掌控
- ⚡ **快捷指令** - 内置常用命令，支持自定义指令
- 🤖 **模型管理** - 自由添加自定义 AI 模型，设为默认
- 📱 **多平台集成** - Telegram、Discord、飞书、Slack、WhatsApp、Signal
- 🌐 **一键跳转** - 6个渠道一键打开对应网页
- 📋 **App 日志** - 本地查看应用运行日志
- 🔄 **检查更新** - 自动检测新版本，一键下载

## 📥 下载安装

### macOS
[下载 macOS 版 (Apple Silicon)](https://github.com/ffffff9331/openclaw-manager/releases/download/v1.1.2/OpenClawManager_1.1.1_aarch64.dmg)

> 💡 **提示**：macOS 下载后如果提示"已损坏"，在终端运行 `xattr -cr "/Applications/OpenClawManager.app"` 即可打开。

### Windows
[下载 Windows Installer (.exe)](https://github.com/ffffff9331/openclaw-manager/releases/download/v1.1.2/OpenClawManager_1.1.1_x64-setup.exe)

[下载 Windows MSI (.msi)](https://github.com/ffffff9331/openclaw-manager/releases/download/v1.1.2/OpenClawManager_1.1.1_x64_en-US.msi)

### Linux
[下载 Linux AppImage](https://github.com/ffffff9331/openclaw-manager/releases/download/v1.1.2/OpenClawManager_1.1.1_amd64.AppImage)

## 📝 更新日志

### v1.1.1 (2026-03-19)

从 v1.0.1 到 v1.1.1 的完整升级，主要围绕**稳定性修复 + 实用功能补充 + 完美跨平台**三大方向。

#### 🐛 修复问题
- **频道状态显示**：原本只显示 Telegram → 现在6个渠道（TG/飞书/Discord/WhatsApp/Signal/Slack）都能正常完整显示
- **当前模型显示错误**：正则匹配问题已彻底修复
- **添加模型失败**：先初始化空数组，防崩溃
- **删除模型残留数据**：现在彻底删除整个 provider 记录
- **检查更新按钮失效**：逻辑修复，现在能正常触发并在有新版时自动变成"下载"状态

#### ✨ 新增功能
- **对话工具网页一键打开**：每个渠道旁边都有"打开"按钮，一键跳转对应平台的对话网页
- **App运行日志查看**：设置页面新增日志查看入口，方便排查问题
- **检查更新模块**：设置页底部新增"检查更新"功能，结果直接显示在模块内
- **Node.js 版本提示**：实时显示当前 Node.js 是否有更新可用
- **版本号完全自动化**：从配置文件/后端自动读取版本号，侧边栏和设置页都实时同步显示
- **跨平台打开链接**：全部"打开链接/网页"操作改用 Tauri 的 openUrl API，Win/Mac/Linux 全兼容

#### 🎨 UI/交互优化
- 侧边栏底部简化：只保留版本号显示
- 设置页布局调整：检查更新模块移到危险区域上方
- 集成 tauri-plugin-dialog，弹窗交互更现代

#### 🌐 跨平台体验大提升
所有平台差异化命令（如原来的 open 只在 macOS 好用）全部替换为跨平台方案，Windows、macOS、Linux 用户现在都能流畅使用全部功能！

> 💡 **总结**：v1.0.1 是"能用但有小毛病"的基础版，v1.1.1 直接进化成"全平台稳如老狗 + 功能更实用 + 用着更舒服"的生产力工具！

## 📋 环境要求

- macOS 11.0+ / Windows 10+ / Ubuntu 20.04+
- 已安装 [OpenClaw](https://github.com/openclaw/openclaw)

## 🔧 全部版本

👉 [查看所有版本](https://github.com/ffffff9331/openclaw-manager/releases)

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建
npm run tauri build
```

## 📄 许可证

MIT

---

Made with ❤️ by [ffffff9331](https://github.com/ffffff9331)

# 🦞 OpenClawManager - OpenClaw 管理助手

一款专为 OpenClaw 用户打造的桌面管理工具，让 AI 助手配置变得简单高效。

> 当前版本口径：**v2.0.0 Beta 已发布**  
> 当前状态：**Beta 可继续内部测试与收口，正式版尚未完成**

## ⭐ 功能特性

- 🖥️ **系统诊断** - 一键检测：操作系统、OpenClaw 版本、Node.js 版本、配置目录、OpenClaw Doctor
- 🎛️ **Gateway 控制** - 一键启动/停止/重启，随时掌控
- ⚡ **快捷指令** - 内置常用命令，支持自定义指令
- 🤖 **模型管理** - 自由添加自定义 AI 模型，设为默认
- 📱 **多平台集成** - Telegram、Discord、飞书、Slack、WhatsApp、Signal
- 🌐 **一键跳转** - 渠道配置与相关网页一键打开
- 🧩 **多实例管理** - 支持实例列表、切换当前实例、持久化保存
- 📋 **App 日志** - 本地查看应用运行日志
- 🔄 **检查更新** - 自动检测新版本，一键下载

## 📥 下载安装

### 当前推荐：v2.0.0 Beta

这是一个 **Beta 预发布版本**，重点是继续完成桌面端控制 UI 的真实可用性收口，而不是宣称正式版已完成。

### macOS
[下载 macOS 版 (Apple Silicon DMG)](https://github.com/ffffff9331/openclaw-manager/releases/tag/v2.0.0-beta)

> 💡 **提示**：macOS 下载后如果提示“已损坏”，可在终端运行：
>
> ```bash
> xattr -cr "/Applications/OpenClawManager.app"
> ```

### Windows
[下载 Windows Setup EXE](https://github.com/ffffff9331/openclaw-manager/releases/tag/v2.0.0-beta)

### Linux
[下载 Linux AppImage](https://github.com/ffffff9331/openclaw-manager/releases/tag/v2.0.0-beta)

> 当前发布页按 **三平台各一个推荐包** 收口：
> - macOS：DMG
> - Windows：Setup EXE
> - Linux：AppImage

## 🚀 v2 Beta 相比旧版的核心升级

如果你之前用过 `v1.1.x`，那这次 `v2.0.0 Beta` 的重点不是单点小修，而是整体产品形态升级：

- **从单体页面堆叠，升级到模块化结构**：状态、服务、页面、hooks、stores 已明显拆开
- **从偏本机管理，升级到多实例管理**：支持实例列表、当前实例切换、实例持久化
- **从“能打包”，升级到三平台 Beta 发布**：macOS / Windows / Linux 已具备统一测试分发能力
- **从功能堆叠，升级到真实性能收口**：开始系统处理启动慢、切页慢、首开重加载
- **从入口分散，升级到控制台口径统一**：诊断、刷新、版本检查、页面交互持续向正式版体验收口

一句话：
**旧版更像“能用的小工具”，v2 Beta 更像“开始成型的桌面控制台”。**

## 📝 更新日志

### v2.0.0 Beta (2026-04-12)

这是 `openclaw manager` 从旧版管理工具形态，向 **更完整的桌面控制台** 推进的一版 Beta。

#### 🚀 本次核心升级
- **进入 v2.0.0 Beta 阶段**：项目已从“继续准备 Beta”切换到“Beta 已发布、继续收口”
- **架构更清晰**：拆出 `types / services / hooks / stores / pages / lib`，`App.tsx` 不再是单文件巨石
- **多实例能力增强**：支持实例列表、当前实例切换、实例持久化，核心页面持续向“操作跟当前实例走”收口
- **三平台 Beta 发布补齐**：已具备 macOS / Windows / Linux 三平台测试分发能力
- **性能收口进入主线**：重点处理启动慢、切页慢、首开重加载等真实体感问题

#### 🔧 本次重点调整
- **性能方向调整**：按页懒加载，减少启动阶段后台自触发加载
- **版本检查收敛**：诊断 / 刷新链路统一带版本检查，不再保留误导性的独立检查入口
- **交互整理**：精简部分页面重复入口与误导性交互，继续向正式版口径收口
- **实例一致性推进**：持续修补“界面切了实例、底层却还打本机”的残留风险

#### ⚠️ 当前说明
- 这仍然是 **Beta 版本**，不是正式版完成口径
- 当前仍可能存在性能尾项、页面细节问题和局部交互缺口
- 如果你用于稳定生产环境，请先谨慎评估

#### 🎯 当前优先反馈
欢迎优先反馈这些问题：
- 启动慢、切页慢、界面卡顿
- 实例切换后行为不一致
- 诊断 / 刷新 / 状态展示口径不一致
- 某些页面仍存在重复入口或误导性交互

## 📚 历史版本记录

- **v1.1.1（2026-03-19）**：旧版阶段的代表性更新，主要完成了渠道状态显示修复、模型管理稳定性修复、检查更新逻辑修复、对话工具网页一键打开、App 日志查看，以及 Win / Mac / Linux 跨平台打开链接能力补齐。

> 更早版本细节不再作为当前首页主叙事，当前以 **v2.0.0 Beta** 为主。

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

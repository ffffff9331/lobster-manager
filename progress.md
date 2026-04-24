# openclaw-manager 性能收口 Progress

## 2026-04-12
- 已开始正式版前“性能收口”主线
- 已建立 task_plan.md / findings.md / progress.md
- 已审计 `AppContent` 与重点 hooks 的自动触发链路
- 已完成一轮最小性能修复：取消 `tasks / models / skills / doctor / settings` 的首开自动刷新
- 已跑 `npm run build`，通过
- 下一步：拉起真实 Tauri 宿主环境，做首开/切页体感验证

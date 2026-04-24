# openclaw-manager 性能收口 Findings

## 2026-04-12
- 已确认 `AppContent.tsx` 中各 tab 通过 `useTabRefresh` 控制首次刷新与最小刷新间隔
- 当前更重的页面 `tasks / models / skills / doctor / settings` 首次进入仍存在自动刷新链路，会在切页首开阶段触发较重数据加载
- `tasks` 页当前 `loadCronData` 已比历史版本保守：拉状态和列表，但不再默认拉首个 run 详情
- 本轮最小修法：取消 `tasks / models / skills / doctor / settings` 的 `initialRefreshers`，保留更核心页面的保守自动刷新
- 构建验证已通过：`npm run build`

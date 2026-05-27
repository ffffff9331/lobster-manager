import { useState, useMemo, useCallback } from "react";
import { testInstanceConnectivity, type ConnectivityResult } from "../services/instanceConnectivityService";
import type { AppInstance } from "../types/core";
import { Activity, Play, RefreshCw, RotateCcw, Square, Terminal, Search, X } from "lucide-react";
import type { GatewayStatus } from "../types/core";

interface GatewayPageState {
  currentInstanceObj?: AppInstance;
  currentInstance?: {
    name: string;
    type: import("../types/core").AppInstance["type"];
    baseUrl: string;
  };
  gatewayStatus: GatewayStatus;
  systemLoading: string | null;
  liveLogs: string;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onRefresh: () => void | Promise<void>;
  onRefreshLogs: () => void | Promise<void>;
}

interface GatewayPageProps {
  gatewayState: GatewayPageState;
}

export function GatewayPage({ gatewayState }: GatewayPageProps) {
  const {
    currentInstance,
    gatewayStatus,
    systemLoading,
    liveLogs,
    onStart,
    onStop,
    onRestart,
    onRefresh,
    onRefreshLogs,
  } = gatewayState;

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectivityResult | null>(null);
  const [logSearch, setLogSearch] = useState("");
  const [logLevelFilter, setLogLevelFilter] = useState<string>("");

  const handleTestConnection = useCallback(async () => {
    if (!gatewayState.currentInstanceObj) return;
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const result = await testInstanceConnectivity(gatewayState.currentInstanceObj);
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({ reachable: false, gatewayOk: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setTestingConnection(false);
    }
  }, [gatewayState.currentInstanceObj]);

  const filteredLogs = useMemo(() => {
    if (!liveLogs) return "";
    let lines = liveLogs.split("\n");
    if (logLevelFilter) {
      lines = lines.filter(line => line.toLowerCase().includes(logLevelFilter.toLowerCase()));
    }
    if (logSearch.trim()) {
      const q = logSearch.trim().toLowerCase();
      lines = lines.filter(line => line.toLowerCase().includes(q));
    }
    return lines.join("\n");
  }, [liveLogs, logSearch, logLevelFilter]);

  const safePort = typeof gatewayStatus.port === "number" ? String(gatewayStatus.port) : "-";
  const safeUptime = typeof gatewayStatus.uptime === "string" && gatewayStatus.uptime.trim() ? gatewayStatus.uptime : "-";

  return (
    <div className="page-container">
      <div className="gateway-container">
        <div className="card">
          <div className="card-header">
            <Activity size={22} />
            <h2>实例运行态</h2>
          </div>

          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            当前实例：
            <strong>{currentInstance?.name || "未选择实例"}</strong>
            <span style={{ color: "var(--text-secondary)" }}>
              {currentInstance ? ` ｜ ${currentInstance.type} ｜ ${currentInstance.baseUrl}` : " ｜ 请先选择要操作的实例"}
            </span>
            <div style={{ marginTop: 6, color: "var(--text-secondary)" }}>
              这里管理当前实例的 Gateway 服务。侧栏“在线/离线”表示实例连通性；本页“运行中/已停止”表示服务运行态。
            </div>
          </div>

          <div className="status-grid">
            <div className="status-card">
              <div className="status-label">运行状态</div>
              <div className={`status-value ${gatewayStatus.running ? "success" : "error"}`}>
                {gatewayStatus.running ? (
                  <>
                    <span className="status-dot"></span> 运行中
                  </>
                ) : (
                  <>
                    <span className="status-dot offline"></span> 已停止
                  </>
                )}
              </div>
            </div>
            <div className="status-card">
              <div className="status-label">端口</div>
              <div className="status-value">{safePort}</div>
            </div>
            <div className="status-card">
              <div className="status-label">运行时间 / 最近动作</div>
              <div className="status-value">{safeUptime}</div>
            </div>
          </div>


          <div className="gateway-controls">
            <button
              className={`btn ${gatewayStatus.running ? "btn-primary" : "btn-secondary"}`}
              onClick={onStart}
              disabled={gatewayStatus.running || systemLoading?.startsWith("gateway")}
            >
              <Play size={18} />
              {gatewayStatus.running ? "已启动" : "启动"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onStop}
              disabled={!gatewayStatus.running || systemLoading?.startsWith("gateway")}
            >
              <Square size={18} />
              停止
            </button>
            <button
              className="btn btn-secondary"
              onClick={onRestart}
              disabled={systemLoading?.startsWith("gateway")}
            >
              <RotateCcw size={18} />
              重启
            </button>
            <button
              className="btn btn-secondary"
              onClick={onRefresh}
              disabled={systemLoading?.startsWith("gateway")}
            >
              <RefreshCw size={18} />
              刷新
            </button>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-secondary btn-small"
              onClick={handleTestConnection}
              disabled={testingConnection || !gatewayState.currentInstanceObj}
            >
              {testingConnection ? "测试中..." : "测试连接"}
            </button>
            {connectionResult && (
              <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: connectionResult.reachable ? "var(--success, #16a34a)" : "var(--error, #dc2626)" }}>
                  {connectionResult.reachable ? "✅ 可达" : "❌ 不可达"}
                </span>
                {connectionResult.gatewayOk !== undefined && (
                  <span style={{ color: connectionResult.gatewayOk ? "var(--success, #16a34a)" : "var(--warning, #d97706)" }}>
                    Gateway: {connectionResult.gatewayOk ? "正常" : "异常"}
                  </span>
                )}
                {connectionResult.version && <span>版本: {connectionResult.version}</span>}
                {connectionResult.responseTimeMs && <span>耗时: {connectionResult.responseTimeMs}ms</span>}
                {connectionResult.error && <span style={{ color: "var(--error, #dc2626)" }}>{connectionResult.error}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Terminal size={22} />
              <h2>运行日志</h2>
            </div>
            <button className="btn btn-secondary" onClick={onRefreshLogs}>
              <RefreshCw size={16} /> 刷新日志
            </button>
          </div>
          <pre className="log-window">{liveLogs || "暂无日志，点击“刷新日志”加载。"}</pre>
        </div>
      </div>
    </div>
  );
}

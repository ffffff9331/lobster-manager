import { useState, useEffect, useCallback } from "react";
import { Activity, Check, RefreshCw, Terminal } from "lucide-react";
import type { AppInstance, GatewayStatus } from "../../types/core";
import type { WorkflowContext } from "../../types/workflow";
import { readFromInstance } from "../../services/instanceCommandService";
import { parseGatewayRunningFromJson } from "../../lib/cliOutputParser";

interface MonitorStepProps {
  instance?: AppInstance;
  context: WorkflowContext;
  onUpdateContext: (patch: Partial<WorkflowContext>) => void;
  onComplete: () => void;
  onViewFullLogs?: () => void;
}

export function MonitorStep({ instance, context, onUpdateContext, onComplete, onViewFullLogs }: MonitorStepProps) {
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({ running: false });
  const [recentLogs, setRecentLogs] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!instance) return;
    setLoading(true);
    try {
      const statusResult = await readFromInstance(instance, "openclaw gateway status --json");
      if (statusResult.success) {
        try {
          const parsed = JSON.parse(statusResult.output);
          const running = parseGatewayRunningFromJson(statusResult.output);
          setGatewayStatus({ running, port: parsed?.port, uptime: parsed?.uptime });
          onUpdateContext({ gatewayRunning: running, healthOk: running });
        } catch {
          setGatewayStatus({ running: statusResult.success });
        }
      }

      const logResult = await readFromInstance(instance, "openclaw gateway logs --tail 20");
      if (logResult.success) {
        setRecentLogs(logResult.output);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [instance]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  const healthOk = context.healthOk || gatewayStatus.running;

  return (
    <div className="card">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={22} />
          <h2>运行监控</h2>
        </div>
        <button className="btn btn-secondary btn-small" onClick={refresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 刷新
        </button>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        实时监控 Gateway 运行状态和最近日志。
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: gatewayStatus.running ? "var(--success-bg, #f0fdf4)" : "var(--bg-secondary)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>运行状态</div>
          <div style={{ fontWeight: 600, color: gatewayStatus.running ? "var(--success)" : "var(--error)" }}>
            {gatewayStatus.running ? "🟢 运行中" : "🔴 已停止"}
          </div>
        </div>
        <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>端口</div>
          <div style={{ fontWeight: 600 }}>{gatewayStatus.port || "-"}</div>
        </div>
        <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>运行时间</div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{gatewayStatus.uptime || "-"}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>最近日志（20行）</span>
          <button className="btn btn-secondary btn-small" onClick={onViewFullLogs} style={{ fontSize: 11, padding: "2px 8px" }}>
            查看全部 <Terminal size={12} />
          </button>
        </div>
        <pre style={{ fontSize: 11, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, maxHeight: 180, overflow: "auto", whiteSpace: "pre-wrap" }}>
          {recentLogs || "暂无日志"}
        </pre>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={!healthOk} onClick={onComplete}>
          {healthOk ? "监控正常，继续下一步" : "Gateway 未运行，请先启动"}
        </button>
        <button className="btn btn-secondary" onClick={onComplete}>
          跳过
        </button>
      </div>
    </div>
  );
}

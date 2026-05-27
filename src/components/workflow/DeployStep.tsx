import { useState, useCallback, useRef } from "react";
import { Rocket, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { testInstanceConnectivity, type ConnectivityResult } from "../../services/instanceConnectivityService";
import { startOpenClawGateway } from "../../services/openclawInstallService";
import type { AppInstance } from "../../types/core";
import type { WorkflowContext } from "../../types/workflow";

interface DeployStepProps {
  instance?: AppInstance;
  context: WorkflowContext;
  onUpdateContext: (patch: Partial<WorkflowContext>) => void;
  onComplete: () => void;
}

export function DeployStep({ instance, context, onUpdateContext, onComplete }: DeployStepProps) {
  const [testing, setTesting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState<ConnectivityResult | null>(null);

  const handleTest = useCallback(async () => {
    if (!instance) return;
    setTesting(true);
    setResult(null);
    try {
      const r = await testInstanceConnectivity(instance);
      setResult(r);
      if (r.reachable && r.gatewayOk) {
        onUpdateContext({ gatewayRunning: true });
      }
    } catch (error) {
      setResult({ reachable: false, gatewayOk: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setTesting(false);
    }
  }, [instance, onUpdateContext]);

  const handleTestRef = useRef(handleTest);
  handleTestRef.current = handleTest;

  const handleStartGateway = useCallback(async () => {
    if (!instance) return;
    setStarting(true);
    try {
      const r = await startOpenClawGateway(instance);
      if (r.success) {
        onUpdateContext({ gatewayRunning: true });
        // 等一下再测试
        setTimeout(() => void handleTestRef.current(), 2000);
      }
    } catch {
      // ignore
    } finally {
      setStarting(false);
    }
  }, [instance, onUpdateContext, handleTest]);

  const gatewayOk = context.gatewayRunning || (result?.reachable && result?.gatewayOk);

  return (
    <div className="card">
      <div className="card-header">
        <Rocket size={22} />
        <h2>部署验证</h2>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        确认 Gateway 正在运行，API 端点可达。
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: gatewayOk ? "var(--success-bg, #f0fdf4)" : "var(--bg-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {gatewayOk ? <Check size={16} style={{ color: "var(--success)" }} /> : testing ? <Loader2 size={16} className="animate-spin" /> : <span style={{ width: 16 }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Gateway 连通性</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {gatewayOk ? "Gateway 正常运行，API 可达" : "尚未验证或 Gateway 未运行"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-small" onClick={handleTest} disabled={testing}>
                {testing ? "测试中..." : "测试连接"} <RefreshCw size={12} />
              </button>
              <button className="btn btn-secondary btn-small" onClick={handleStartGateway} disabled={starting || gatewayOk}>
                {starting ? "启动中..." : "启动 Gateway"}
              </button>
            </div>
          </div>
          {result && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ color: result.reachable ? "var(--success)" : "var(--error)" }}>
                {result.reachable ? "✅ 可达" : "❌ 不可达"}
              </span>
              {result.version && <span>版本: {result.version}</span>}
              {result.responseTimeMs && <span>耗时: {result.responseTimeMs}ms</span>}
              {result.error && <span style={{ color: "var(--error)" }}>{result.error}</span>}
            </div>
          )}
        </div>

        {/* 实例信息 */}
        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-secondary)", fontSize: 13 }}>
          <div><strong>实例：</strong>{instance?.name || "未选择"}</div>
          <div><strong>类型：</strong>{instance?.type || "-"}</div>
          <div><strong>地址：</strong>{instance?.baseUrl || "-"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={!gatewayOk} onClick={onComplete}>
          {gatewayOk ? "验证通过，继续下一步" : "请先验证 Gateway 连通性"}
        </button>
        <button className="btn btn-secondary" onClick={onComplete}>
          跳过
        </button>
      </div>
    </div>
  );
}

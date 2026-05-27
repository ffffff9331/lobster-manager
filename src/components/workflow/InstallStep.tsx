import { useState, useEffect, useCallback } from "react";
import { Check, Download, Loader2, AlertCircle } from "lucide-react";
import { checkNodeJs, installLocalNodeJs, type NodeJsStatus } from "../../services/nodeJsCheckService";
import { checkOpenClawInstalled, installOpenClaw, startOpenClawGateway } from "../../services/openclawInstallService";
import type { AppInstance } from "../../types/core";
import type { WorkflowContext } from "../../types/workflow";

interface InstallStepProps {
  instance?: AppInstance;
  context: WorkflowContext;
  onUpdateContext: (patch: Partial<WorkflowContext>) => void;
  onComplete: () => void;
}

type InstallPhase = "checking" | "node" | "openclaw" | "gateway" | "done" | "error";

export function InstallStep({ instance, context, onUpdateContext, onComplete }: InstallStepProps) {
  const [phase, setPhase] = useState<InstallPhase>("checking");
  const [nodeStatus, setNodeStatus] = useState<NodeJsStatus | null>(null);
  const [log, setLog] = useState("");
  const [error, setError] = useState("");

  const runInstall = useCallback(async () => {
    if (!instance) {
      setError("请先选择实例");
      setPhase("error");
      return;
    }

    setPhase("checking");
    setLog("正在检查环境...\n");

    // 1. 检查 Node.js
    const node = await checkNodeJs();
    setNodeStatus(node);

    if (!node.installed) {
      setPhase("node");
      setLog(prev => prev + "未检测到 Node.js 18+，开始安装...\n");
      const nodeResult = await installLocalNodeJs();
      setLog(prev => prev + (nodeResult.output || "") + "\n");
      if (!nodeResult.success) {
        setError(nodeResult.error || "Node.js 安装失败");
        setPhase("error");
        return;
      }
      const recheck = await checkNodeJs();
      setNodeStatus(recheck);
      onUpdateContext({ nodeInstalled: recheck.installed });
    } else {
      setLog(prev => prev + `Node.js ${node.version} / npm ${node.npmVersion} ✅\n`);
      onUpdateContext({ nodeInstalled: true });
    }

    // 2. 检查/安装 OpenClaw
    setPhase("openclaw");
    const installed = await checkOpenClawInstalled(instance);
    if (installed.installed) {
      setLog(prev => prev + `OpenClaw ${installed.version} 已安装 ✅\n`);
      onUpdateContext({ openclawInstalled: true });
    } else {
      setLog(prev => prev + "正在安装 OpenClaw...\n");
      const result = await installOpenClaw(instance);
      setLog(prev => prev + (result.output || "") + "\n");
      if (!result.success) {
        setError(result.error || "OpenClaw 安装失败");
        setPhase("error");
        return;
      }
      onUpdateContext({ openclawInstalled: true });
      setLog(prev => prev + "OpenClaw 安装完成 ✅\n");
    }

    // 3. 启动 Gateway
    setPhase("gateway");
    setLog(prev => prev + "正在启动 Gateway...\n");
    const startResult = await startOpenClawGateway(instance);
    setLog(prev => prev + (startResult.output || "") + "\n");
    if (startResult.success) {
      onUpdateContext({ gatewayRunning: true });
      setLog(prev => prev + "Gateway 启动成功 ✅\n");
    } else {
      setLog(prev => prev + `Gateway 启动未确认: ${startResult.error || ""}\n`);
      // Gateway 启动不确定，不自动推进，让用户决定
      setPhase("done");
      return;
    }

    setPhase("done");
    onComplete();
  }, [instance, onUpdateContext, onComplete]);

  useEffect(() => {
    if (context.openclawInstalled && context.nodeInstalled) {
      setPhase("done");
      setLog("环境已就绪，跳过安装步骤。\n");
    } else {
      void runInstall();
    }
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <Download size={22} />
        <h2>环境安装</h2>
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          {nodeStatus?.installed ? <Check size={16} style={{ color: "var(--success)" }} /> : phase === "node" ? <Loader2 size={16} className="animate-spin" /> : <span style={{ width: 16 }} />}
          <span>Node.js 18+ / npm</span>
          {nodeStatus?.installed && <span style={{ color: "var(--text-secondary)" }}>v{nodeStatus.version}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          {context.openclawInstalled ? <Check size={16} style={{ color: "var(--success)" }} /> : phase === "openclaw" ? <Loader2 size={16} className="animate-spin" /> : <span style={{ width: 16 }} />}
          <span>OpenClaw CLI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          {context.gatewayRunning ? <Check size={16} style={{ color: "var(--success)" }} /> : phase === "gateway" ? <Loader2 size={16} className="animate-spin" /> : <span style={{ width: 16 }} />}
          <span>Gateway 服务</span>
        </div>
      </div>

      {log && (
        <pre style={{ fontSize: 11, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, maxHeight: 200, overflow: "auto", whiteSpace: "pre-wrap" }}>
          {log}
        </pre>
      )}

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "var(--error-bg, #fef2f2)", border: "1px solid var(--error, #dc2626)", borderRadius: 8, marginTop: 10, fontSize: 13, color: "var(--error, #dc2626)" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {phase === "error" && (
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setError(""); void runInstall(); }}>
          重试
        </button>
      )}
    </div>
  );
}

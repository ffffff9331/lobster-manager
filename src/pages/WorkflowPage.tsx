import { useState, useCallback, useMemo } from "react";
import { Workflow, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { StepIndicator } from "../components/workflow/StepIndicator";
import { InstallStep } from "../components/workflow/InstallStep";
import { ConfigureStep } from "../components/workflow/ConfigureStep";
import { DeployStep } from "../components/workflow/DeployStep";
import { MonitorStep } from "../components/workflow/MonitorStep";
import { BackupStep } from "../components/workflow/BackupStep";
import type { AppInstance } from "../types/core";
import type { WorkflowStep, WorkflowStepId, WorkflowContext } from "../types/workflow";
import type { TabKey } from "../components/AppSidebar";

interface WorkflowPageProps {
  instance?: AppInstance;
  onNavigate: (tab: TabKey) => void;
}

export function WorkflowPage({ instance, onNavigate }: WorkflowPageProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [context, setContext] = useState<WorkflowContext>({});

  const steps = useMemo<WorkflowStep[]>(() => [
    {
      id: "install" as WorkflowStepId,
      title: "安装",
      description: "检查环境、安装 Node.js 和 OpenClaw",
      status: context.nodeInstalled && context.openclawInstalled ? "completed" : currentStepIndex === 0 ? "active" : "pending",
    },
    {
      id: "configure" as WorkflowStepId,
      title: "配置",
      description: "配置模型和对话频道",
      status: context.modelConfigured ? "completed" : currentStepIndex === 1 ? "active" : currentStepIndex > 1 ? "completed" : "pending",
    },
    {
      id: "deploy" as WorkflowStepId,
      title: "部署",
      description: "启动 Gateway 并验证连通性",
      status: context.gatewayRunning ? "completed" : currentStepIndex === 2 ? "active" : currentStepIndex > 2 ? "completed" : "pending",
    },
    {
      id: "monitor" as WorkflowStepId,
      title: "监控",
      description: "查看运行状态和日志",
      status: context.healthOk ? "completed" : currentStepIndex === 3 ? "active" : currentStepIndex > 3 ? "completed" : "pending",
    },
    {
      id: "backup" as WorkflowStepId,
      title: "备份",
      description: "创建完整备份",
      status: context.backupConfigured ? "completed" : currentStepIndex === 4 ? "active" : "pending",
    },
  ], [context, currentStepIndex]);

  const updateContext = useCallback((patch: Partial<WorkflowContext>) => {
    setContext(prev => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleStepComplete = useCallback(() => {
    goNext();
  }, [goNext]);

  const allComplete = steps.every(s => s.status === "completed");

  const renderCurrentStep = () => {
    const stepId = steps[currentStepIndex]?.id;
    switch (stepId) {
      case "install":
        return <InstallStep instance={instance} context={context} onUpdateContext={updateContext} onComplete={handleStepComplete} />;
      case "configure":
        return (
          <ConfigureStep
            instance={instance}
            context={context}
            onUpdateContext={updateContext}
            onComplete={handleStepComplete}
            onNavigateToModels={() => onNavigate("models")}
            onNavigateToChannels={() => onNavigate("chat")}
          />
        );
      case "deploy":
        return <DeployStep instance={instance} context={context} onUpdateContext={updateContext} onComplete={handleStepComplete} />;
      case "monitor":
        return (
          <MonitorStep
            instance={instance}
            context={context}
            onUpdateContext={updateContext}
            onComplete={handleStepComplete}
            onViewFullLogs={() => onNavigate("gateway")}
          />
        );
      case "backup":
        return <BackupStep instance={instance} context={context} onUpdateContext={updateContext} onComplete={handleStepComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      {/* 头部 */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Workflow size={24} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>工作流</h2>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {instance ? `${instance.name}（${instance.type}）` : "请先选择实例"}
              </div>
            </div>
          </div>
          {allComplete && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success, #16a34a)", fontSize: 13, fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              全部完成
            </div>
          )}
        </div>
      </div>

      {/* 步骤指示器 */}
      <StepIndicator steps={steps} currentStepIndex={currentStepIndex} onStepClick={setCurrentStepIndex} />

      {/* 当前步骤内容 */}
      {renderCurrentStep()}

      {/* 底部导航 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button className="btn btn-secondary" onClick={goPrev} disabled={currentStepIndex === 0}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button className="btn btn-secondary" onClick={goNext} disabled={currentStepIndex === steps.length - 1}>
          下一步 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

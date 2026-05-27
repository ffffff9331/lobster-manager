/** 工作流步骤状态 */
export type StepStatus = "pending" | "active" | "completed" | "error" | "skipped";

/** 工作流步骤定义 */
export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  canSkip?: boolean;
}

/** 工作流上下文 — 在步骤之间共享的状态 */
export interface WorkflowContext {
  instanceId?: string;
  nodeInstalled?: boolean;
  openclawInstalled?: boolean;
  gatewayRunning?: boolean;
  modelConfigured?: boolean;
  channelConfigured?: boolean;
  backupConfigured?: boolean;
  healthOk?: boolean;
}

/** 预定义的工作流步骤 ID */
export type WorkflowStepId = "install" | "configure" | "deploy" | "monitor" | "backup";

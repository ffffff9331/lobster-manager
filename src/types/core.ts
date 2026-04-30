// 核心类型 — 按领域拆分到子模块，此处统一 re-export 保持向后兼容

export * from "./gateway";
export * from "./instance";
export * from "./model";
export * from "./channel";
export * from "./cron";

// 通用类型（不属于某个独立领域）

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string | null;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  action: string;
  target: string;
  result: string;
  detail?: string;
}

export interface CommandResultState {
  cmd: string;
  output: string;
  success: boolean;
  error?: string;
}

export interface CustomCommandFormState {
  cmd: string;
  label: string;
  desc: string;
}

export type BuiltInTaskAction = "restartGateway";

export interface CustomCommandItem extends CustomCommandFormState {
  builtIn?: boolean;
  action?: BuiltInTaskAction;
}

export interface SettingsState {
  whitelistEnabled: boolean;
  fileAccessEnabled: boolean;
}

export interface BackupCreateOptions {
  output?: string;
  verify?: boolean;
  includeWorkspace?: boolean;
  onlyConfig?: boolean;
  dryRun?: boolean;
}

export interface BackupArtifact {
  command: string;
  output: string;
  archivePath?: string;
}

export interface InstallGuideTemplate {
  label: string;
  description?: string;
  content: string;
}

export interface InstallGuide {
  title: string;
  summary: string;
  steps: string[];
  notes?: string[];
  templates?: InstallGuideTemplate[];
}

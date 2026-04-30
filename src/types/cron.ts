// Cron 定时任务相关类型

export interface CronJobSchedule {
  kind: "every" | "cron" | string;
  everyMs?: number;
  anchorMs?: number;
  expr?: string;
  tz?: string;
}

export interface CronJobPayload {
  kind: "systemEvent" | "agentTurn" | string;
  text?: string;
  message?: string;
  timeoutSeconds?: number;
}

export interface CronJobState {
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastRunStatus?: string;
  lastStatus?: string;
  lastDurationMs?: number;
  lastDeliveryStatus?: string;
  consecutiveErrors?: number;
  runningAtMs?: number;
  lastError?: string;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  agentId?: string;
  sessionKey?: string;
  createdAtMs?: number;
  updatedAtMs?: number;
  schedule: CronJobSchedule;
  sessionTarget?: string;
  wakeMode?: string;
  payload: CronJobPayload;
  state?: CronJobState;
}

export interface CronSchedulerStatus {
  enabled: boolean;
  storePath?: string;
  jobs?: number;
  nextWakeAtMs?: number;
}

export interface CronRunEntry {
  ts: number;
  jobId: string;
  action: string;
  status?: string;
  summary?: string;
  runAtMs?: number;
  durationMs?: number;
  nextRunAtMs?: number;
  deliveryStatus?: string;
}

export type CronPayloadKind = "systemEvent" | "agentTurn";
export type CronScheduleKind = "every" | "cron";
export type CronSessionTarget = "main" | "isolated";

export interface CronJobFormState {
  id?: string;
  name: string;
  description: string;
  scheduleKind: CronScheduleKind;
  every: string;
  cronExpr: string;
  timezone: string;
  payloadKind: CronPayloadKind;
  payloadText: string;
  sessionTarget: CronSessionTarget;
  model: string;
  timeoutSeconds: string;
  enabled: boolean;
}

// Gateway 相关类型

export interface GatewayStatus {
  running: boolean;
  port?: number;
  uptime?: string;
}

export interface GatewayLaunchAgentHistoryItem {
  at: string;
  action: string;
  state: string;
}

export interface GatewayControlState {
  lastDispatch?: string;
  lastRequest?: string;
  lastResult?: string;
  lastLaunchAgentAction?: string;
  lastLaunchAgentResult?: string;
  lastLaunchAgentState?: string;
  lastLaunchAgentStartedAt?: string;
  lastLaunchAgentFinishedAt?: string;
  lastLaunchAgentDurationSec?: number;
  lastLaunchAgentLog?: string;
  lastLaunchAgentError?: string;
  lastLaunchAgentErrorKind?: string;
  lastLaunchAgentRecoveryHint?: string;
  launchAgentHistory?: GatewayLaunchAgentHistoryItem[];
  launchAgentPlistExists?: boolean;
  launchAgentLoaded?: boolean;
  launchAgentStatus?: string;
}

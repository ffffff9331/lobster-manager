// 模型相关类型

export interface ModelConfig {
  provider: string;
  name: string;
  id: string;
  baseUrl: string;
  apiKey?: string;
  apiKeyRaw?: string;
  contextWindow?: number;
  maxTokens?: number;
}

export interface ModelFormState {
  name: string;
  id: string;
  baseUrl: string;
  apiKey: string;
  contextWindow: string;
  maxTokens: string;
}

export interface ModelSwitchFeedback {
  targetLabel: string;
  beforeProvider: string;
  beforeModel: string;
  afterProvider: string;
  afterModel: string;
  effective: boolean;
  message: string;
}

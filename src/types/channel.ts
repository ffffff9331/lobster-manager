// 渠道相关类型

export interface Channel {
  id: string;
  name: string;
  icon: string;
  status: "configured" | "not_configured";
  enabled: boolean;
  platform: string;
  runtimeSessionKey?: string;
  runtimeModel?: string;
  runtimeAge?: string;
  runtimeKind?: string;
  createdBy?: string;
  createdFrom?: string;
  initialModelHint?: string;
}

export interface TelegramChannelConfig {
  botToken: string;
  userId: string;
  dmPolicy: string;
  groupPolicy: string;
}

export interface FeishuChannelConfig {
  appId: string;
  appSecret: string;
  verificationToken: string;
}

export interface DiscordChannelConfig {
  botToken: string;
  applicationId: string;
}

export interface SlackChannelConfig {
  botToken: string;
  signingSecret: string;
}

export interface WhatsappChannelConfig {
  phoneNumberId: string;
  accessToken: string;
}

export interface SignalChannelConfig {
  phoneNumber: string;
  password: string;
}

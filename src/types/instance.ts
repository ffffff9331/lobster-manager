// 实例相关类型

export type AppInstanceStatus = "online" | "offline" | "unknown";
export type AppInstanceSource = "manual" | "discovered" | "imported";

interface AppInstanceBase {
  id: string;
  name: string;
  status: AppInstanceStatus;
  baseUrl: string;
  apiBasePath: string;
  healthPath: string;
  apiKey?: string;
  isCurrent?: boolean;
  source?: AppInstanceSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AppInstanceType = "local" | "wsl" | "docker" | "nas" | "remote";

export interface LocalAppInstance extends AppInstanceBase {
  type: "local";
}

export interface WslAppInstance extends AppInstanceBase {
  type: "wsl";
}

export interface DockerAppInstance extends AppInstanceBase {
  type: "docker";
}

export interface NasAppInstance extends AppInstanceBase {
  type: "nas";
}

export interface RemoteAppInstance extends AppInstanceBase {
  type: "remote";
}

export type AppInstance = LocalAppInstance | WslAppInstance | DockerAppInstance | NasAppInstance | RemoteAppInstance;

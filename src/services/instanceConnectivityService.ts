/**
 * 实例连接测试服务
 * 测试 Gateway 是否可达、API 是否正常响应
 */
import type { AppInstance, CommandResult } from "../types/core";
import { readFromInstance } from "./instanceCommandService";

export interface ConnectivityResult {
  reachable: boolean;
  gatewayOk: boolean;
  version?: string;
  responseTimeMs?: number;
  error?: string;
}

export async function testInstanceConnectivity(instance: AppInstance): Promise<ConnectivityResult> {
  const start = Date.now();
  
  try {
    // 1. 测试 gateway status
    const statusResult = await readFromInstance(instance, "openclaw gateway status --json");
    const responseTimeMs = Date.now() - start;
    
    if (!statusResult.success) {
      return {
        reachable: false,
        gatewayOk: false,
        responseTimeMs,
        error: statusResult.error || statusResult.output || "Gateway 状态查询失败",
      };
    }

    // 2. 获取版本
    let version: string | undefined;
    try {
      const versionResult = await readFromInstance(instance, "openclaw --version");
      if (versionResult.success) {
        version = versionResult.output.trim();
      }
    } catch {
      // 版本获取失败不影响连接测试结果
    }

    // 3. 尝试 HTTP 健康检查
    let gatewayOk = false;
    try {
      const healthUrl = `${instance.baseUrl.replace(/\/$/, "")}${instance.healthPath || "/health"}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      gatewayOk = response.ok;
    } catch {
      // HTTP 不可达但 CLI 可达也算部分成功
      gatewayOk = statusResult.success;
    }

    return {
      reachable: true,
      gatewayOk,
      version,
      responseTimeMs: Date.now() - start,
    };
  } catch (error) {
    return {
      reachable: false,
      gatewayOk: false,
      responseTimeMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

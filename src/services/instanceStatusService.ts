import type { AppInstance, AppInstanceStatus } from "../types/core";
import { canUseTauriInvoke, isWebPreview } from "../lib/platform";
import { parseGatewayRunningFromJson } from "../lib/cliOutputParser";
import { readFromInstance } from "./instanceCommandService";

function isHealthyHttpPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  if (value.running === true) return true;
  if (value.status === "ok" || value.status === "healthy" || value.status === "running") return true;
  const service = value.service as { runtime?: { status?: string; state?: string } } | undefined;
  return service?.runtime?.status === "running" || service?.runtime?.state === "active";
}

async function probeViaHttpHealth(instance: AppInstance): Promise<AppInstanceStatus> {
  const healthUrl = isWebPreview() && (instance.type === "local" || instance.type === "wsl")
    ? "/__openclaw_health"
    : new URL(instance.healthPath || "/health", instance.bridgeBaseUrl || instance.baseUrl).toString();

  try {
    const response = await fetch(healthUrl, { method: "GET" });
    if (!response.ok) return "offline";
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return isHealthyHttpPayload(await response.json()) ? "online" : "unknown";
    }
    const text = await response.text();
    if (!text.trim()) return "unknown";
    try {
      return isHealthyHttpPayload(JSON.parse(text)) ? "online" : "unknown";
    } catch {
      return /ok|healthy|running/i.test(text) ? "online" : "unknown";
    }
  } catch {
    return isWebPreview() && (instance.type === "local" || instance.type === "wsl") ? "unknown" : "offline";
  }
}

async function probeLocalInstance(instance: AppInstance): Promise<AppInstanceStatus> {
  if (!canUseTauriInvoke()) {
    return probeViaHttpHealth(instance);
  }

  try {
    const result = await readFromInstance(instance, "openclaw gateway status --json");
    if (result.success && parseGatewayRunningFromJson(result.output)) {
      return "online";
    }
    return probeViaHttpHealth(instance);
  } catch {
    return probeViaHttpHealth(instance);
  }
}

export async function probeInstanceStatus(instance: AppInstance): Promise<AppInstanceStatus> {
  if (instance.type === "local" || instance.type === "wsl") {
    return probeLocalInstance(instance);
  }

  try {
    const result = await readFromInstance(instance, "openclaw gateway status --json");
    if (!result.success || !parseGatewayRunningFromJson(result.output)) {
      return "offline";
    }
    return "online";
  } catch {
    return "offline";
  }
}

export async function refreshInstanceStatuses(instances: AppInstance[]): Promise<AppInstance[]> {
  const BATCH_SIZE = 5;
  const results: AppInstance[] = [];
  for (let i = 0; i < instances.length; i += BATCH_SIZE) {
    const batch = instances.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (instance) => ({
        ...instance,
        status: await probeInstanceStatus(instance),
        updatedAt: new Date().toISOString(),
      })),
    );
    results.push(...batchResults);
  }
  return results;
}

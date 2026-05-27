/**
 * 实例健康监控 Hook
 * 定时轮询所有实例的健康状态，返回状态映射
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { AppInstance, AppInstanceStatus } from "../types/core";
import { readFromInstance } from "../services/instanceCommandService";

export interface InstanceHealthState {
  status: AppInstanceStatus;
  lastChecked?: number;
  error?: string;
}

const HEALTH_POLL_INTERVAL_MS = 30_000; // 30秒轮询一次
const HEALTH_TIMEOUT_MS = 5_000;

export function useInstanceHealthMonitor(instances: AppInstance[]) {
  const [healthMap, setHealthMap] = useState<Map<string, InstanceHealthState>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkInstance = useCallback(async (instance: AppInstance): Promise<InstanceHealthState> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
      
      const healthUrl = `${instance.baseUrl.replace(/\/$/, "")}${instance.healthPath || "/health"}`;
      const response = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        return { status: "online", lastChecked: Date.now() };
      }
      return { status: "offline", lastChecked: Date.now(), error: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : "连接超时",
      };
    }
  }, []);

  const checkAll = useCallback(async () => {
    const newMap = new Map<string, InstanceHealthState>();
    const checks = instances.map(async (instance) => {
      const state = await checkInstance(instance);
      newMap.set(instance.id, state);
    });
    await Promise.allSettled(checks);
    setHealthMap(newMap);
  }, [instances, checkInstance]);

  useEffect(() => {
    // 首次检查
    void checkAll();
    
    // 定时轮询
    intervalRef.current = setInterval(() => void checkAll(), HEALTH_POLL_INTERVAL_MS);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkAll]);

  const getInstanceHealth = useCallback((instanceId: string): InstanceHealthState => {
    return healthMap.get(instanceId) || { status: "unknown" };
  }, [healthMap]);

  return { healthMap, getInstanceHealth, refreshHealth: checkAll };
}

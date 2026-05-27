import { useState, useCallback, useEffect } from "react";
import type { AppInstance } from "../types/core";
import { checkOpenClawInstalled, installOpenClaw, startOpenClawGateway } from "../services/openclawInstallService";
import { checkNodeJs, installLocalNodeJs, type NodeJsStatus } from "../services/nodeJsCheckService";
import { GATEWAY_DEFAULT_PORT } from "../config/constants";
import { checkDockerEnvironment, installOpenClawWithDocker, type InstallTarget } from "../services/dockerInstallService";

interface UseAutoInstallOptions {
  currentInstance?: AppInstance;
  installTarget: InstallTarget;
  dockerWorkDir?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useAutoInstall({ currentInstance, installTarget, dockerWorkDir, onSuccess, onError }: UseAutoInstallOptions) {
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState("");
  const [installOutput, setInstallOutput] = useState("");
  const [nodeJsStatus, setNodeJsStatus] = useState<NodeJsStatus | null>(null);
  const [dockerStatus, setDockerStatus] = useState<{ docker: boolean; compose: boolean } | null>(null);
  const [checkingEnv, setCheckingEnv] = useState(false);

  const checkEnvironment = useCallback(async () => {
    setCheckingEnv(true);
    try {
      if (installTarget === "docker") {
        const status = await checkDockerEnvironment();
        setDockerStatus(status);
      } else {
        const status = await checkNodeJs();
        setNodeJsStatus(status);
      }
    } finally {
      setCheckingEnv(false);
    }
  }, [installTarget]);

  useEffect(() => {
    void checkEnvironment();
  }, [checkEnvironment]);

  const checkAndInstall = useCallback(async () => {
    // Docker 安装流程
    if (installTarget === "docker") {
      if (!dockerStatus?.docker || !dockerStatus?.compose) {
        onError?.("请先安装 Docker 和 Docker Compose");
        return;
      }

      if (!dockerWorkDir) {
        onError?.("请指定 Docker 工作目录");
        return;
      }

      setInstalling(true);
      setInstallStatus("正在使用 Docker 安装 OpenClaw...");
      setInstallOutput("创建 docker-compose.yml...\n");

      try {
        const result = await installOpenClawWithDocker(dockerWorkDir);

        if (!result.success) {
          setInstallStatus("❌ Docker 安装失败");
          setInstallOutput(prev => `${prev}\n${result.error || result.output}`);
          onError?.(result.error || "安装失败");
          setInstalling(false);
          return;
        }

        setInstallStatus("✅ OpenClaw Docker 容器启动已发起");
        setInstallOutput(prev => `${prev}\n${result.output}\n\n容器地址: http://localhost:${GATEWAY_DEFAULT_PORT}`);
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setInstallStatus(`❌ 错误: ${message}`);
        setInstallOutput(prev => `${prev}\n\n错误: ${message}`);
        onError?.(message);
      } finally {
        setInstalling(false);
      }
      return;
    }

    // npm 安装流程（本机 Windows/macOS）
    if (!currentInstance) {
      onError?.("请先选择实例");
      return;
    }

    setInstalling(true);
    setInstallStatus("检查 Node.js / npm 环境...");
    setInstallOutput("");

    try {
      let resolvedNodeStatus = nodeJsStatus;
      if (!resolvedNodeStatus?.installed) {
        setInstallStatus("正在准备 Node.js / npm...");
        setInstallOutput("未检测到 Node.js 18+，将先在本机安装 Node.js LTS。\n");
        const nodeInstallResult = await installLocalNodeJs();
        setInstallOutput(prev => `${prev}${nodeInstallResult.output || ""}`);
        if (!nodeInstallResult.success) {
          setInstallStatus("❌ Node.js / npm 准备失败");
          setInstallOutput(prev => `${prev}${nodeInstallResult.error ? `\n${nodeInstallResult.error}` : ""}`);
          onError?.(nodeInstallResult.error || "Node.js / npm 准备失败");
          setInstalling(false);
          return;
        }

        resolvedNodeStatus = await checkNodeJs();
        setNodeJsStatus(resolvedNodeStatus);
        if (!resolvedNodeStatus.installed) {
          setInstallStatus("⚠️ Node.js 已安装但当前进程暂未识别");
          setInstallOutput(prev => `${prev}\n请重启 OpenClaw Manager 后再次点击安装。`);
          setInstalling(false);
          return;
        }
      }

      setInstallStatus("检查 OpenClaw 安装状态...");
      const { installed, version } = await checkOpenClawInstalled(currentInstance);
      
      if (installed) {
        setInstallStatus(`OpenClaw 已安装（版本：${version}）`);
        setInstallOutput(`检测到 OpenClaw ${version}`);
        
        setInstallStatus("启动 Gateway...");
        const startResult = await startOpenClawGateway(currentInstance);
        
        if (startResult.success) {
          setInstallStatus("✅ OpenClaw 已安装，Gateway 启动已发起");
          setInstallOutput(prev => `${prev}\n\nGateway 启动已发起`);
          onSuccess?.();
        } else {
          setInstallStatus("⚠️ Gateway 启动失败");
          setInstallOutput(prev => `${prev}\n\n${startResult.error || startResult.output}`);
        }
        
        setInstalling(false);
        return;
      }

      setInstallStatus("正在安装 OpenClaw...");
      setInstallOutput("执行: npm install -g openclaw@latest\n");

      const installResult = await installOpenClaw(currentInstance);

      if (!installResult.success) {
        setInstallStatus("❌ 安装失败");
        setInstallOutput(prev => `${prev}\n${installResult.error || installResult.output}`);
        onError?.(installResult.error || "安装失败");
        setInstalling(false);
        return;
      }

      setInstallOutput(prev => `${prev}\n${installResult.output}`);
      setInstallStatus("安装已完成，正在启动 Gateway...");

      const startResult = await startOpenClawGateway(currentInstance);

      if (startResult.success) {
        setInstallStatus("✅ OpenClaw 安装完成，Gateway 启动已发起");
        setInstallOutput(prev => `${prev}\n\nGateway 启动已发起`);
        onSuccess?.();
      } else {
        setInstallStatus("⚠️ 安装已完成，但 Gateway 启动未确认");
        setInstallOutput(prev => `${prev}\n\n${startResult.error || startResult.output}`);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setInstallStatus(`❌ 错误: ${message}`);
      setInstallOutput(prev => `${prev}\n\n错误: ${message}`);
      onError?.(message);
    } finally {
      setInstalling(false);
    }
  }, [currentInstance, installTarget, dockerWorkDir, nodeJsStatus, dockerStatus, onSuccess, onError]);

  return {
    installing,
    installStatus,
    installOutput,
    nodeJsStatus,
    dockerStatus,
    checkingEnv,
    checkEnvironment,
    checkAndInstall,
  };
}

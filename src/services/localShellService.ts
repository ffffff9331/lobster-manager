import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { formatInstanceCapabilityError } from "../lib/errorMessage";
import { hasExplicitInstance, supportsHostFileOps } from "../lib/instanceCapabilities";
import type { AppInstance } from "../types/core";

export async function openConfigDirectory(instance?: AppInstance) {
  if (!hasExplicitInstance(instance)) {
    alert("请先选择要操作的实例，当前不再默认打开本机 local 配置目录。");
    return;
  }

  if (!supportsHostFileOps(instance)) {
    alert(formatInstanceCapabilityError("打开配置目录失败", "请先连接到对应机器手动处理。"));
    return;
  }

  await openUrl("file://$HOME/.openclaw").catch(async () => {
    const isWindows = navigator.userAgent.includes("Windows");
    const isLinux = navigator.userAgent.includes("Linux");
    if (isWindows) {
      await invoke("dispatch_command", { command: 'start "" "%USERPROFILE%\\.openclaw"' });
    } else if (isLinux) {
      await invoke("dispatch_command", { command: "xdg-open ~/.openclaw" });
    } else {
      await invoke("dispatch_command", { command: "open ~/.openclaw" });
    }
  });
}

import type { AppInstance, CommandResultState, CustomCommandItem } from "../types/core";
import { runQuickCommand } from "./taskService";

export async function executeTaskCommand(item: Pick<CustomCommandItem, "cmd" | "action">, instance?: AppInstance): Promise<CommandResultState> {
  if (item.action === "restartGateway") {
    return {
      cmd: item.cmd,
      output: "此按钮仅做入口引导，不会直接重启 Gateway。请前往 Gateway 页执行重载/重启。",
      success: false,
      error: "此快捷项不执行 Gateway 重启，只负责引导到 Gateway 页。",
    };
  }

  return runQuickCommand(item.cmd, instance);
}

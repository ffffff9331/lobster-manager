import { isLocalInstance } from "../lib/instanceCapabilities";
import { isWindows } from "../lib/platform";
import type { AppInstance, CommandResult } from "../types/core";
import { dispatchDetachedLocalCommand } from "./commandService";
import { dispatchToInstance } from "./instanceCommandService";

function getRemoveDataCommand(): string {
  if (isWindows()) {
    return 'rmdir /s /q "%USERPROFILE%\\.openclaw"';
  }
  return "rm -rf ~/.openclaw";
}

function getUninstallCommand(): string {
  return "npm uninstall -g openclaw";
}

async function dispatchHighImpactCommand(instance: AppInstance | undefined, command: string): Promise<CommandResult> {
  if (isLocalInstance(instance)) {
    return dispatchDetachedLocalCommand(command);
  }
  return dispatchToInstance(instance, command);
}

export async function removeOpenClawData(instance?: AppInstance) {
  await dispatchHighImpactCommand(instance, getRemoveDataCommand());
}

export async function uninstallOpenClaw(instance?: AppInstance) {
  await dispatchHighImpactCommand(instance, getUninstallCommand());
  await removeOpenClawData(instance);
}

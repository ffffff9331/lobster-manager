import { dispatchLocalCommand, readLocalCommand } from "./commandService";
import { isWindows, isMacOS } from "../lib/platform";

export interface NodeJsStatus {
  installed: boolean;
  version?: string;
  npmVersion?: string;
}

function parseNodeStatus(nodeOutput: string, npmOutput: string): NodeJsStatus {
  const nodeVersion = nodeOutput.trim();
  const npmVersion = npmOutput.trim();
  const majorVersion = parseInt(nodeVersion.replace(/^v/, "").split(".")[0] || "0", 10);
  return {
    installed: Number.isFinite(majorVersion) && majorVersion >= 18,
    version: nodeVersion,
    npmVersion,
  };
}

export async function checkNodeJs(): Promise<NodeJsStatus> {
  try {
    const nodeResult = await readLocalCommand("node --version");
    const npmResult = await readLocalCommand("npm --version");

    if (nodeResult.success && npmResult.success) {
      return parseNodeStatus(nodeResult.output, npmResult.output);
    }

    return { installed: false };
  } catch {
    return { installed: false };
  }
}


export async function installLocalNodeJs(): Promise<{ success: boolean; output: string; error?: string }> {
  const current = await checkNodeJs();
  if (current.installed) {
    return {
      success: true,
      output: `Node.js ${current.version || ""} / npm ${current.npmVersion || ""} 已安装`,
    };
  }

  if (isWindows()) {
    const wingetResult = await dispatchLocalCommand(
      "winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements",
    );
    if (!wingetResult.success) {
      return {
        success: false,
        output: wingetResult.output,
        error: wingetResult.error || "Node.js 自动安装失败：未能通过 winget 安装 OpenJS.NodeJS.LTS",
      };
    }
    return {
      success: true,
      output: wingetResult.output || "Node.js 安装命令已执行完成；如仍检测不到，请重启 OpenClaw Manager。",
    };
  }

  if (isMacOS()) {
    const brewResult = await readLocalCommand("brew --version");
    if (!brewResult.success) {
      return {
        success: false,
        output: brewResult.output,
        error: "未检测到 Homebrew，无法自动安装 Node.js；请先安装 Homebrew 或使用 Node.js pkg 安装包。",
      };
    }

    const installResult = await dispatchLocalCommand("brew install node");
    if (!installResult.success) {
      return {
        success: false,
        output: installResult.output,
        error: installResult.error || "Node.js 自动安装失败：brew install node 执行失败",
      };
    }
    return {
      success: true,
      output: installResult.output || "Node.js 安装命令已执行完成。",
    };
  }

  return {
    success: false,
    output: "",
    error: "当前平台暂不支持自动安装 Node.js，请按页面指引手动安装 Node.js 18+。",
  };
}

export function getNodeJsDownloadUrl(): string {
  if (isWindows()) {
    return "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi";
  }
  if (isMacOS()) {
    return "https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg";
  }
  return "https://nodejs.org/en/download/";
}

export function getNodeJsInstallInstructions(): string[] {
  if (isWindows()) {
    return [
      "1. 下载 Node.js 安装包",
      "2. 双击运行安装程序",
      "3. 按照向导完成安装",
      "4. 重启 openclaw manager",
    ];
  }

  if (isMacOS()) {
    return [
      "方法 1 - 使用 Homebrew（推荐）：",
      "  brew install node",
      "",
      "方法 2 - 下载安装包：",
      "  1. 下载 Node.js 安装包",
      "  2. 双击 .pkg 文件安装",
      "  3. 重启 openclaw manager",
    ];
  }

  return [
    "Linux 安装方法：",
    "  # Ubuntu/Debian",
    "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
    "  sudo apt-get install -y nodejs",
    "",
    "  # CentOS/RHEL",
    "  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -",
    "  sudo yum install -y nodejs",
  ];
}

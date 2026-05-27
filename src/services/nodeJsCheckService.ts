import { dispatchLocalCommand, readLocalCommand } from "./commandService";
import { isWindows, isMacOS } from "../lib/platform";
import { logger } from "../lib/logger";

export interface NodeJsStatus {
  installed: boolean;
  version?: string;
  npmVersion?: string;
}

// ─── 国内镜像配置 ───

const NPM_REGISTRY_CN = "https://registry.npmmirror.com";
const NODE_MIRROR_CN = "https://npmmirror.com/mirrors/node";

/** 检测当前 npm registry 是否已经是国内镜像 */
async function isUsingCnMirror(): Promise<boolean> {
  try {
    const result = await readLocalCommand("npm config get registry");
    if (!result.success) return false;
    const registry = result.output.trim().toLowerCase();
    return registry.includes("npmmirror.com") || registry.includes("taobao.org") || registry.includes("registry.npmmirror");
  } catch {
    return false;
  }
}

/** 设置 npm 使用国内镜像 */
export async function setupNpmMirror(): Promise<{ success: boolean; output: string }> {
  if (await isUsingCnMirror()) {
    return { success: true, output: "npm 已使用国内镜像" };
  }
  const result = await dispatchLocalCommand(`npm config set registry ${NPM_REGISTRY_CN}`);
  if (result.success) {
    logger.info("npm registry 已切换到国内镜像:", NPM_REGISTRY_CN);
    return { success: true, output: `npm registry 已切换到 ${NPM_REGISTRY_CN}` };
  }
  return { success: false, output: result.error || "切换 npm 镜像失败" };
}

/** 获取当前 npm registry 用于安装命令的 --registry 参数 */
export function getNpmRegistryArg(): string {
  return `--registry ${NPM_REGISTRY_CN}`;
}

// ─── Node.js 检测 ───

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

// ─── Node.js 安装（国内优先）───

export async function installLocalNodeJs(): Promise<{ success: boolean; output: string; error?: string }> {
  const current = await checkNodeJs();
  if (current.installed) {
    // Node 已装，确保 npm 镜像也配好
    await setupNpmMirror();
    return {
      success: true,
      output: `Node.js ${current.version || ""} / npm ${current.npmVersion || ""} 已安装，npm 镜像已配置`,
    };
  }

  if (isWindows()) {
    return installNodeWindows();
  }

  if (isMacOS()) {
    return installNodeMacos();
  }

  return {
    success: false,
    output: "",
    error: "当前平台暂不支持自动安装 Node.js，请按页面指引手动安装 Node.js 18+。",
  };
}

async function installNodeWindows(): Promise<{ success: boolean; output: string; error?: string }> {
  let output = "";

  // 方案 1：winget（国内一般可用）
  const wingetResult = await dispatchLocalCommand(
    "winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements",
  );
  if (wingetResult.success) {
    output += wingetResult.output || "Node.js 安装完成\n";
    // 设置国内 npm 镜像
    const mirrorResult = await setupNpmMirror();
    output += mirrorResult.output + "\n";
    return { success: true, output };
  }

  // 方案 2：winget 失败，尝试直接下载 MSI（用国内镜像）
  output += "winget 安装失败，尝试从国内镜像下载...\n";
  const msiUrl = `${NODE_MIRROR_CN}/latest-v20.x/node-v20-lts-x64.msi`;
  const msiResult = await dispatchLocalCommand(
    `powershell -Command "Invoke-WebRequest -Uri '${msiUrl}' -OutFile '$env:TEMP\\node-lts.msi'; Start-Process msiexec.exe -ArgumentList '/i','$env:TEMP\\node-lts.msi','/quiet','/norestart' -Wait"`,
  );
  if (msiResult.success) {
    output += "Node.js MSI 安装完成\n";
    const mirrorResult = await setupNpmMirror();
    output += mirrorResult.output + "\n";
    return { success: true, output };
  }

  return {
    success: false,
    output,
    error: `Node.js 自动安装失败。\nwinget 错误: ${wingetResult.error || wingetResult.output}\nMSI 错误: ${msiResult.error || msiResult.output}\n\n请手动从 https://npmmirror.com/mirrors/node 下载安装 Node.js 20 LTS。`,
  };
}

async function installNodeMacos(): Promise<{ success: boolean; output: string; error?: string }> {
  let output = "";

  // 方案 1：Homebrew
  const brewResult = await readLocalCommand("brew --version");
  if (brewResult.success) {
    const installResult = await dispatchLocalCommand("brew install node");
    if (installResult.success) {
      output += installResult.output || "Node.js 安装完成\n";
      const mirrorResult = await setupNpmMirror();
      output += mirrorResult.output + "\n";
      return { success: true, output };
    }
    output += `brew install node 失败: ${installResult.error || installResult.output}\n`;
  } else {
    output += "未检测到 Homebrew\n";
  }

  // 方案 2：Homebrew 不可用，提示手动安装
  return {
    success: false,
    output,
    error: "macOS 自动安装需要 Homebrew。请先安装 Homebrew（https://brew.sh），或从 https://npmmirror.com/mirrors/node 手动下载 Node.js 20 LTS。",
  };
}

// ─── 下载链接和指引 ───

/** 获取 Node.js 下载链接（国内镜像优先） */
export function getNodeJsDownloadUrl(): string {
  if (isWindows()) {
    return `${NODE_MIRROR_CN}/latest-v20.x/node-v20-lts-x64.msi`;
  }
  if (isMacOS()) {
    return `${NODE_MIRROR_CN}/latest-v20.x/node-v20-lts-arm64.pkg`;
  }
  return `${NODE_MIRROR_CN}/`;
}

export function getNodeJsInstallInstructions(): string[] {
  if (isWindows()) {
    return [
      "1. 从国内镜像下载 Node.js：",
      `   ${NODE_MIRROR_CN}/latest-v20.x/node-v20-lts-x64.msi`,
      "2. 双击运行安装程序",
      "3. 按照向导完成安装",
      "4. 安装完成后，npm 会自动配置国内镜像",
    ];
  }

  if (isMacOS()) {
    return [
      "方法 1 - 使用 Homebrew（推荐）：",
      "  brew install node",
      "",
      "方法 2 - 从国内镜像下载安装包：",
      `   ${NODE_MIRROR_CN}/latest-v20.x/node-v20-lts-arm64.pkg`,
      "   双击 .pkg 文件安装",
      "",
      "安装完成后，npm 会自动配置国内镜像",
    ];
  }

  return [
    "Linux 安装方法：",
    "  # Ubuntu/Debian",
    "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
    "  sudo apt-get install -y nodejs",
    "",
    "  # 或使用国内镜像手动安装",
    `  ${NODE_MIRROR_CN}/`,
  ];
}

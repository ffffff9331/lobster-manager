/**
 * 统一日志工具
 * 生产环境下输出到 console，前端环境统一前缀。
 */
type Level = "info" | "warn" | "error" | "debug";

function emit(level: Level, ...args: unknown[]) {
  const prefix = "[openclaw-manager]";
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.debug;
  fn(prefix, ...args);
}

export const logger = {
  info: (...args: unknown[]) => emit("info", ...args),
  warn: (...args: unknown[]) => emit("warn", ...args),
  error: (...args: unknown[]) => emit("error", ...args),
  debug: (...args: unknown[]) => emit("debug", ...args),
};

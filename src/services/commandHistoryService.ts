/**
 * 命令执行历史服务
 * 记录每次命令执行，支持重跑
 */

export interface CommandHistoryEntry {
  id: string;
  command: string;
  label?: string;
  output: string;
  success: boolean;
  error?: string;
  instanceType?: string;
  instanceId?: string;
  executedAt: string;
}

const STORAGE_KEY = "ocm.commandHistory.v1";
const MAX_ENTRIES = 200;

export function loadCommandHistory(): CommandHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCommandHistory(entries: CommandHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function appendCommandHistory(entry: Omit<CommandHistoryEntry, "id" | "executedAt">): CommandHistoryEntry {
  const newEntry: CommandHistoryEntry = {
    ...entry,
    id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    executedAt: new Date().toISOString(),
  };
  const entries = loadCommandHistory();
  entries.unshift(newEntry);
  saveCommandHistory(entries);
  return newEntry;
}

export function clearCommandHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

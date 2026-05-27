import { useState, useCallback } from "react";
import { DatabaseBackup, Check, Loader2, Download } from "lucide-react";
import { createBackup } from "../../services/backupService";
import type { AppInstance, BackupCreateOptions } from "../../types/core";
import type { WorkflowContext } from "../../types/workflow";

interface BackupStepProps {
  instance?: AppInstance;
  context: WorkflowContext;
  onUpdateContext: (patch: Partial<WorkflowContext>) => void;
  onComplete: () => void;
}

export function BackupStep({ instance, context, onUpdateContext, onComplete }: BackupStepProps) {
  const [backing, setBacking] = useState(false);
  const [backupResult, setBackupResult] = useState<string>("");
  const [archivePath, setArchivePath] = useState<string>("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState<BackupCreateOptions>({
    includeWorkspace: true,
    verify: true,
  });

  const handleBackup = useCallback(async () => {
    if (!instance) return;
    setBacking(true);
    setError("");
    setBackupResult("");
    try {
      const artifact = await createBackup(options, instance);
      if (artifact.archivePath) {
        setArchivePath(artifact.archivePath);
        setBackupResult(artifact.output || "备份完成");
        onUpdateContext({ backupConfigured: true });
      } else {
        setBackupResult(artifact.output || "备份命令已执行");
        onUpdateContext({ backupConfigured: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBacking(false);
    }
  }, [instance, options, onUpdateContext]);

  return (
    <div className="card">
      <div className="card-header">
        <DatabaseBackup size={22} />
        <h2>备份</h2>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        创建一份完整备份，包含配置、工作区和数据。
      </p>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={options.includeWorkspace ?? true} onChange={(e) => setOptions(prev => ({ ...prev, includeWorkspace: e.target.checked }))} />
          包含工作区文件
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={options.verify ?? false} onChange={(e) => setOptions(prev => ({ ...prev, verify: e.target.checked }))} />
          备份后校验完整性
        </label>
      </div>

      {archivePath && (
        <div style={{ padding: 10, background: "var(--success-bg, #f0fdf4)", border: "1px solid var(--success, #16a34a)", borderRadius: 8, marginBottom: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Check size={16} style={{ color: "var(--success)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>备份已完成</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>{archivePath}</div>
          </div>
        </div>
      )}

      {backupResult && !archivePath && (
        <pre style={{ fontSize: 11, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, maxHeight: 150, overflow: "auto", whiteSpace: "pre-wrap", marginBottom: 12 }}>
          {backupResult}
        </pre>
      )}

      {error && (
        <div style={{ padding: 10, background: "var(--error-bg, #fef2f2)", border: "1px solid var(--error, #dc2626)", borderRadius: 8, marginBottom: 12, fontSize: 13, color: "var(--error, #dc2626)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" onClick={handleBackup} disabled={backing || !instance}>
          {backing ? <><Loader2 size={14} className="animate-spin" /> 备份中...</> : <><Download size={14} /> 立即备份</>}
        </button>
        <button className="btn btn-primary" onClick={onComplete}>
          {context.backupConfigured || archivePath ? "完成" : "跳过备份"}
        </button>
      </div>
    </div>
  );
}

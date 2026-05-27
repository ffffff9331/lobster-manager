import { useState, useEffect, useCallback } from "react";
import { Settings, Check, Loader2, ChevronRight } from "lucide-react";
import { loadModelConfigs } from "../../services/modelService";
import type { ModelConfig } from "../../types/model";
import type { AppInstance } from "../../types/core";
import type { WorkflowContext } from "../../types/workflow";

interface ConfigureStepProps {
  instance?: AppInstance;
  context: WorkflowContext;
  onUpdateContext: (patch: Partial<WorkflowContext>) => void;
  onComplete: () => void;
  onNavigateToModels?: () => void;
  onNavigateToChannels?: () => void;
}

export function ConfigureStep({ instance, context, onUpdateContext, onComplete, onNavigateToModels, onNavigateToChannels }: ConfigureStepProps) {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instance) return;
    setLoading(true);
    loadModelConfigs(instance)
      .then((configs) => {
        setModels(configs);
        onUpdateContext({ modelConfigured: configs.length > 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instance]);

  const hasModels = models.length > 0;
  const isComplete = hasModels;

  return (
    <div className="card">
      <div className="card-header">
        <Settings size={22} />
        <h2>配置</h2>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
        配置模型和对话频道，让 OpenClaw 能正常工作。
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {/* 模型配置 */}
        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: hasModels ? "var(--success-bg, #f0fdf4)" : "var(--bg-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasModels ? <Check size={16} style={{ color: "var(--success)" }} /> : loading ? <Loader2 size={16} className="animate-spin" /> : <span style={{ width: 16 }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>模型配置</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {hasModels ? `已配置 ${models.length} 个模型` : "尚未配置模型，请先添加至少一个模型"}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-small" onClick={onNavigateToModels}>
              {hasModels ? "管理模型" : "添加模型"} <ChevronRight size={14} />
            </button>
          </div>
          {hasModels && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>
              {models.slice(0, 3).map(m => (
                <div key={m.id} style={{ padding: "2px 0" }}>• {m.provider}/{m.name}</div>
              ))}
              {models.length > 3 && <div>...还有 {models.length - 3} 个</div>}
            </div>
          )}
        </div>

        {/* 频道配置 */}
        <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>对话频道（可选）</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                配置 Telegram / Discord / 飞书等对话渠道
              </div>
            </div>
            <button className="btn btn-secondary btn-small" onClick={onNavigateToChannels}>
              配置频道 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={!isComplete} onClick={onComplete}>
          {isComplete ? "配置完成，继续下一步" : "请先配置至少一个模型"}
        </button>
        <button className="btn btn-secondary" onClick={onComplete}>
          跳过
        </button>
      </div>
    </div>
  );
}

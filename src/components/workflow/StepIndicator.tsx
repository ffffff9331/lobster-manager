import { Check, Circle, Loader2, X, SkipForward } from "lucide-react";
import type { WorkflowStep, StepStatus } from "../../types/workflow";

interface StepIndicatorProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

const statusIcon: Record<StepStatus, React.ReactNode> = {
  pending: <Circle size={16} />,
  active: <Loader2 size={16} className="animate-spin" />,
  completed: <Check size={16} />,
  error: <X size={16} />,
  skipped: <SkipForward size={16} />,
};

const statusColor: Record<StepStatus, string> = {
  pending: "var(--text-muted, #a3a3a3)",
  active: "var(--primary, #3b82f6)",
  completed: "var(--success, #16a34a)",
  error: "var(--error, #dc2626)",
  skipped: "var(--text-muted, #a3a3a3)",
};

export function StepIndicator({ steps, currentStepIndex, onStepClick }: StepIndicatorProps) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 20, padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, overflowX: "auto" }}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = step.status === "completed";
        const canClick = isCompleted || isActive || index <= currentStepIndex;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
            <button
              onClick={() => canClick && onStepClick(index)}
              disabled={!canClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 8,
                border: isActive ? "2px solid var(--primary, #3b82f6)" : "1px solid var(--border)",
                background: isActive ? "var(--primary-bg, #eff6ff)" : isCompleted ? "var(--success-bg, #f0fdf4)" : "transparent",
                color: statusColor[step.status],
                cursor: canClick ? "pointer" : "default",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                whiteSpace: "nowrap",
                flex: 1,
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {statusIcon[step.status]}
              <span>{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <div style={{ width: 20, height: 1, background: isCompleted ? "var(--success, #16a34a)" : "var(--border)", flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

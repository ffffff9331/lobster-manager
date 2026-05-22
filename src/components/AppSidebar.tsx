import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  FileText,
  House,
  ListTodo,
  MessageSquare,
  Moon,
  Puzzle,
  Settings,
  Sun,
  Wrench,
} from "lucide-react";
import { InstanceSwitcher } from "./InstanceSwitcher";
import type { AppInstance } from "../types/core";

export type TabKey = "overview" | "chat" | "gateway" | "tasks" | "models" | "skills" | "doctor" | "applogs" | "settings";

interface AppSidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  appVersion: string;
  instances: AppInstance[];
  currentInstanceId: string | null;
  onChangeInstance: (instanceId: string) => void;
  onAddInstance: () => void;
  onRefreshStatuses: () => void;
  refreshingStatuses: boolean;
  gatewayIcon: LucideIcon;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  group: "core" | "manage" | "advanced";
}

const staticNavItems: NavItem[] = [
  { key: "overview", label: "概览", icon: House, group: "core" },
  { key: "chat", label: "对话工具", icon: MessageSquare, group: "core" },
  { key: "doctor", label: "安装与修复", icon: Wrench, group: "manage" },
  { key: "models", label: "模型", icon: Cpu, group: "manage" },
  { key: "tasks", label: "定时任务", icon: ListTodo, group: "advanced" },
  { key: "skills", label: "技能", icon: Puzzle, group: "advanced" },
  { key: "applogs", label: "日志", icon: FileText, group: "advanced" },
  { key: "settings", label: "高级", icon: Settings, group: "advanced" },
];

export function AppSidebar({
  activeTab,
  setActiveTab,
  darkMode,
  onToggleTheme,
  appVersion,
  instances,
  currentInstanceId,
  onChangeInstance,
  onAddInstance,
  onRefreshStatuses,
  refreshingStatuses,
  gatewayIcon: GatewayIcon,
}: AppSidebarProps) {
  const navItems: NavItem[] = [
    ...staticNavItems.slice(0, 3),
    { key: "gateway", label: "实例", icon: GatewayIcon, group: "manage" },
    ...staticNavItems.slice(3),
  ];

  const groupedNavItems = [
    { title: "主线", key: "core", items: navItems.filter((item) => item.group === "core") },
    { title: "管理", key: "manage", items: navItems.filter((item) => item.group === "manage") },
    { title: "高级", key: "advanced", items: navItems.filter((item) => item.group === "advanced") },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div />
        <button className="theme-toggle" onClick={onToggleTheme}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {groupedNavItems.map((group) => (
          <div key={group.key} className="sidebar-nav-group">
            <div className="sidebar-nav-group-title">{group.title}</div>
            {group.items.map(({ key, label, icon: Icon }) => (
              <button key={key} className={`nav-item ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="version" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>v{appVersion}</span>
          <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={onAddInstance}>
            新增实例
          </button>
        </div>
        <div className="version" style={{ opacity: 0.75, marginTop: 6 }}>
          <span>实例 {instances.length}</span>
        </div>
        <InstanceSwitcher
          instances={instances}
          currentInstanceId={currentInstanceId}
          onChange={onChangeInstance}
          onRefreshStatuses={onRefreshStatuses}
          refreshingStatuses={refreshingStatuses}
        />
      </div>
    </aside>
  );
}

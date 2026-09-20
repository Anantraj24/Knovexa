import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Search,
  MessageSquareText,
  Settings,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/chat', label: 'RAG Chat', icon: MessageSquareText },
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/search', label: 'Semantic Search', icon: Search },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={clsx(
        'h-screen bg-surface border-r border-border flex flex-col transition-all duration-normal select-none shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-border flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-input bg-accent flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-text-primary">Knovexa</span>
            <span className="text-[11px] text-text-muted">Document Intelligence</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors duration-fast',
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / System status */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="bg-surface-elevated rounded-input p-2.5 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-text-secondary">Engine Ready</span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">v0.1.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

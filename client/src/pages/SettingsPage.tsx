import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import { healthApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { User, Cpu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: health, isLoading: isHealthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.check,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Workspace Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your profile, system credentials, and active AI engine configurations.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">User Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-muted">Full Name</span>
            <div className="font-medium text-text-primary mt-0.5">{user?.name}</div>
          </div>
          <div>
            <span className="text-text-muted">Email Address</span>
            <div className="font-medium text-text-primary mt-0.5">{user?.email}</div>
          </div>
          <div>
            <span className="text-text-muted">Role</span>
            <div className="font-medium text-text-primary mt-0.5">{user?.role}</div>
          </div>
          <div>
            <span className="text-text-muted">User ID</span>
            <div className="font-mono text-[11px] text-text-secondary mt-0.5">{user?.id}</div>
          </div>
        </div>
      </div>

      {/* Engine & Provider Info */}
      <div className="bg-surface rounded-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Cpu className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">AI Engine & Providers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-text-muted">Active AI Provider</span>
            <div className="font-medium text-text-primary mt-0.5 capitalize flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {health?.aiProvider || 'Ollama (Local)'}
            </div>
          </div>
          <div>
            <span className="text-text-muted">Database Connection</span>
            <div className="font-medium text-text-primary mt-0.5 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  health?.database === 'healthy' ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <span className="capitalize">{health?.database || 'Connected'}</span>
            </div>
          </div>
          <div>
            <span className="text-text-muted">Document Storage</span>
            <div className="font-medium text-text-primary mt-0.5">Local Encrypted Disk (Max 20MB)</div>
          </div>
          <div>
            <span className="text-text-muted">System Health</span>
            <div className="font-medium text-green-500 mt-0.5 capitalize">
              {isHealthLoading ? 'Pinging...' : health?.status || 'Online'}
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-surface rounded-card border border-border p-5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-text-primary">Current Session</h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Signing out will invalidate your local access tokens.
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

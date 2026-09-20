import React from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
      {/* Search trigger button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-input bg-surface-elevated border border-border text-text-muted hover:text-text-primary text-xs transition-colors duration-fast w-64 text-left"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Semantic search documents...</span>
          <kbd className="ml-auto text-[10px] bg-surface-muted px-1.5 py-0.5 rounded border border-border">
            /
          </kbd>
        </button>
      </div>

      {/* User profile & controls */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-text-primary leading-none">{user.name}</span>
              <span className="text-[11px] text-text-muted mt-0.5 leading-none">{user.email}</span>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-text-muted hover:text-status-error"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

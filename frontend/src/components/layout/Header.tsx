'use client';

import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/30 backdrop-blur-xl supports-[backdrop-filter]:bg-card/30 shadow-lg shadow-primary/5">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary/10"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/50 animate-pulse-glow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block bg-gradient-primary bg-clip-text text-transparent">
              Sunstudio Config Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-3 text-sm bg-muted/20 rounded-full px-4 py-2 border border-border/50">
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-primary">
                    {user.role || 'User'}
                  </p>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full ring-2 ring-primary/50"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center ring-2 ring-accent/50">
                    <span className="text-white font-semibold text-xs">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Logout"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

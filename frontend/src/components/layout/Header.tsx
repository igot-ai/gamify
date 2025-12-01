'use client';

import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, Menu, Settings2 } from 'lucide-react';
import { GameSelector } from './GameSelector';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base hidden sm:inline-block">
              Sunstudio Config Portal
            </span>
            <span className="font-semibold text-base sm:hidden">
              Config
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Game Selector */}
          <GameSelector />
          
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm border-l border-border pl-3">
                <div className="text-right">
                  <p className="font-medium text-foreground text-xs">
                    {user.displayName || user.email}
                  </p>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border">
                    <span className="text-foreground font-medium text-xs">
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
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

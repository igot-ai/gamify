'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Button } from '../ui/Button';
import { Home, Gamepad2, Settings, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Games', icon: Gamepad2, path: '/games' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-border bg-card/30 backdrop-blur-xl p-4 space-y-4 fixed h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-primary text-white shadow-lg shadow-primary/50' 
                      : 'hover:bg-muted/50 hover:translate-x-1'
                  }`}
                  onClick={() => router.push(item.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <aside className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-md">
            <div className="w-64 h-full glass-effect border-r border-border p-4 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gradient">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-primary text-white shadow-lg shadow-primary/50' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        router.push(item.path);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-64 bg-gradient-to-br from-background via-background to-card/20 min-h-[calc(100vh-4rem)]">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


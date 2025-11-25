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
        <aside className="hidden md:block w-56 border-r bg-card p-3 space-y-1 fixed h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-sm font-normal ${isActive
                      ? 'bg-secondary border-l-2 border-primary font-medium'
                      : 'hover:bg-muted'
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
          <aside className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm">
            <div className="w-64 h-full bg-card border-r p-4 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start text-sm ${isActive
                          ? 'bg-secondary border-l-2 border-primary'
                          : 'hover:bg-muted'
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
        <main className="flex-1 md:ml-56">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


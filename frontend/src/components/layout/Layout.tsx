import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Button } from '../ui/Button';
import { Home, Gamepad2, Settings, X } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: Home, path: '/' },
        { label: 'Games', icon: Gamepad2, path: '/games' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 border-r border-border bg-card/50 p-4 space-y-4 fixed h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Button
                                    key={item.path}
                                    variant={isActive ? 'default' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => navigate(item.path)}
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
                    <aside className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur">
                        <div className="w-64 h-full bg-card border-r border-border p-4 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold">Menu</h2>
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
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Button
                                            key={item.path}
                                            variant={isActive ? 'default' : 'ghost'}
                                            className="w-full justify-start"
                                            onClick={() => {
                                                navigate(item.path);
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
                <main className="flex-1 md:ml-64 bg-gradient-to-b from-background to-background/80">
                    {children}
                </main>
            </div>
        </div>
    );
}

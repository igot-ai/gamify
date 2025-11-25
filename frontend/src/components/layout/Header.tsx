import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, Menu } from 'lucide-react';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="font-bold text-lg hidden sm:inline-block">
                            Sunstudio Config Portal
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <div className="hidden sm:flex items-center gap-2 text-sm">
                                <div className="text-right">
                                    <p className="font-medium">{user.displayName || user.email}</p>
                                    <p className="text-xs text-muted-foreground">{user.role || 'User'}</p>
                                </div>
                                {user.photoURL && (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className="h-8 w-8 rounded-full"
                                    />
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

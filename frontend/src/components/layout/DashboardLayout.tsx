'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Button } from '../ui/Button';
import { 
  Home, 
  Settings, 
  X, 
  Coins, 
  Tv, 
  Bell, 
  ShoppingCart, 
  Rocket, 
  Gamepad2,
  Vibrate,
  Ban,
  Gift,
  Star,
  Link,
  Trophy,
  DollarSign,
  RotateCw,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import type { SectionType } from '@/types/api';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  sectionType?: SectionType;
}

// Config section navigation items - simple, no sub-items
const configSections: NavItem[] = [
  { label: 'Economy', icon: Coins, path: '/sections/economy', sectionType: 'economy' },
  { label: 'Ads', icon: Tv, path: '/sections/ads', sectionType: 'ads' },
  { label: 'Notifications', icon: Bell, path: '/sections/notification', sectionType: 'notification' },
  { label: 'Shop', icon: ShoppingCart, path: '/sections/shop', sectionType: 'shop' },
  { label: 'Boosters', icon: Rocket, path: '/sections/booster', sectionType: 'booster' },
  { label: 'Game Config', icon: Gamepad2, path: '/sections/game', sectionType: 'game' },
  { label: 'Haptic', icon: Vibrate, path: '/sections/haptic', sectionType: 'haptic' },
  { label: 'Remove Ads', icon: Ban, path: '/sections/remove-ads', sectionType: 'remove_ads' },
  { label: 'Tile Bundle', icon: Gift, path: '/sections/tile-bundle', sectionType: 'tile_bundle' },
  { label: 'Rating', icon: Star, path: '/sections/rating', sectionType: 'rating' },
  { label: 'Links', icon: Link, path: '/sections/link', sectionType: 'link' },
  { label: 'Chapter Rewards', icon: Trophy, path: '/sections/chapter-reward', sectionType: 'chapter_reward' },
  { label: 'Game Economy', icon: DollarSign, path: '/sections/game-economy', sectionType: 'game_economy' },
  { label: 'Shop Settings', icon: ShoppingCart, path: '/sections/shop-settings', sectionType: 'shop_settings' },
  { label: 'Spin Wheel', icon: RotateCw, path: '/sections/spin', sectionType: 'spin' },
  { label: 'Hint Offer', icon: Lightbulb, path: '/sections/hint-offer', sectionType: 'hint_offer' },
  { label: 'Tutorial', icon: BookOpen, path: '/sections/tutorial', sectionType: 'tutorial' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { selectedGame, selectedGameId } = useGame();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/') || pathname?.startsWith(path + '?');
  };

  // Build URL with gameId param for section pages
  const buildNavUrl = (path: string) => {
    // For section pages, include gameId if available
    if (path.startsWith('/sections/') && selectedGameId) {
      return `${path}?gameId=${selectedGameId}`;
    }
    return path;
  };

  const renderNavItem = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Button
        key={item.path}
        variant={active ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start text-sm font-normal',
          active
            ? 'bg-secondary text-secondary-foreground border-l-2 border-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
        onClick={() => {
          router.push(buildNavUrl(item.path));
          onClick?.();
        }}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">{item.label}</span>
      </Button>
    );
  };

  const renderSidebarContent = (onItemClick?: () => void) => (
    <nav className="space-y-1 flex flex-col h-full">
      {/* Dashboard - Always visible */}
      {renderNavItem({ label: 'Dashboard', icon: Home, path: '/dashboard' }, onItemClick)}

      {/* Config sections - Only when game is selected */}
      {selectedGameId && (
        <>
          {/* Configure Section Header */}
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Configure
            </span>
          </div>
          {configSections.map((item) => renderNavItem(item, onItemClick))}
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings - Always at bottom */}
      <div className="border-t border-border pt-2 mt-2">
        {renderNavItem({ label: 'Settings', icon: Settings, path: '/settings' }, onItemClick)}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r bg-card p-3 fixed h-[calc(100vh-3.5rem)] overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <aside className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm">
            <div className="w-64 h-full bg-card border-r p-4 flex flex-col">
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
              {selectedGame && (
                <div className="mb-4 p-2 bg-muted/50 rounded-md">
                  <span className="text-xs text-muted-foreground">Current Game</span>
                  <p className="text-sm font-medium truncate">{selectedGame.name}</p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {renderSidebarContent(() => setSidebarOpen(false))}
              </div>
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

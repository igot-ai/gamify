'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  BookOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Users,
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useIsAdmin } from '@/stores/authStore';
import type { SectionType } from '@/types/api';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SubItem {
  id: string;
  label: string;
  tabParam?: string;  // For tabs on same page (e.g., Economy)
  path?: string;      // For separate pages (e.g., Special Offer items)
  sectionType?: SectionType;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  sectionType?: SectionType;
  subItems?: SubItem[];
}

// Config section navigation items - grouped items first, then standalone items
const configSections: NavItem[] = [
  { 
    label: 'Economy', 
    icon: Coins, 
    path: '/sections/economy', 
    sectionType: 'economy',
    subItems: [
      { id: 'currencies', label: 'Currencies', tabParam: 'currencies' },
      { id: 'inventory', label: 'Inventory Items', tabParam: 'inventory' },
      { id: 'virtual-purchases', label: 'Virtual Purchases', tabParam: 'virtual-purchases' },
      { id: 'real-purchases', label: 'Real Purchases', tabParam: 'real-purchases' },
      { id: 'settings', label: 'Settings', tabParam: 'settings' },
    ]
  },
  { 
    label: 'Game Config', 
    icon: Gamepad2, 
    path: '/sections/game-config',
    subItems: [
      { id: 'game', label: 'Game Config', path: '/sections/game', sectionType: 'game' },
      { id: 'haptic', label: 'Haptic', path: '/sections/haptic', sectionType: 'haptic' },
      { id: 'rating', label: 'Rating', path: '/sections/rating', sectionType: 'rating' },
      { id: 'link', label: 'Links', path: '/sections/link', sectionType: 'link' },
      { id: 'game-economy', label: 'Game Economy', path: '/sections/game-economy', sectionType: 'game_economy' },
      { id: 'chapter-reward', label: 'Chapter Rewards', path: '/sections/chapter-reward', sectionType: 'chapter_reward' },
    ]
  },
  { 
    label: 'Special Offer', 
    icon: Sparkles, 
    path: '/sections/special-offer',
    subItems: [
      { id: 'hint-offer', label: 'Hint Offer', path: '/sections/hint-offer', sectionType: 'hint_offer' },
      { id: 'remove-ads', label: 'Remove Ads', path: '/sections/remove-ads', sectionType: 'remove_ads' },
      { id: 'tile-bundle', label: 'Tile Bundle', path: '/sections/tile-bundle', sectionType: 'tile_bundle' },
      { id: 'spin', label: 'Spin Wheel', path: '/sections/spin', sectionType: 'spin' },
    ]
  },
  { label: 'Ads', icon: Tv, path: '/sections/ads', sectionType: 'ads' },
  { label: 'Notifications', icon: Bell, path: '/sections/notification', sectionType: 'notification' },
  { label: 'Boosters', icon: Rocket, path: '/sections/booster', sectionType: 'booster' },
  { label: 'Shop Settings', icon: ShoppingCart, path: '/sections/shop-settings', sectionType: 'shop_settings' },
  { label: 'Tutorial', icon: BookOpen, path: '/sections/tutorial', sectionType: 'tutorial' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['Economy'])); // Economy expanded by default
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedGame, selectedGameId } = useGame();
  const isAdmin = useIsAdmin();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/') || pathname?.startsWith(path + '?');
  };

  // Check if a specific tab is active
  const isTabActive = (path: string, tabParam: string) => {
    if (!pathname?.startsWith(path)) return false;
    const currentTab = searchParams?.get('tab');
    // If no tab param in URL, default to first tab (currencies for economy)
    if (!currentTab) return tabParam === 'currencies';
    return currentTab === tabParam;
  };

  // Build URL with gameId param for section pages
  const buildNavUrl = (path: string, tabParam?: string) => {
    const params = new URLSearchParams();
    if (selectedGameId) {
      params.set('gameId', selectedGameId);
    }
    if (tabParam) {
      params.set('tab', tabParam);
    }
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
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

  const renderNavItemWithSubItems = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.has(item.label);
    // Check if any sub-item is active (for path-based sub-items)
    const hasActiveSubItem = item.subItems?.some(sub => sub.path && isActive(sub.path));
    const isParentActive = isActive(item.path) || hasActiveSubItem;

    return (
      <div key={item.path}>
        {/* Parent item */}
        <Button
          variant={isParentActive && !isExpanded ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-sm font-normal',
            isParentActive
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          onClick={() => toggleExpanded(item.label)}
        >
          <Icon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Sub-items */}
        {isExpanded && item.subItems && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subItems.map((subItem) => {
              // Handle both tab-based (Economy) and path-based (Special Offer) sub-items
              const isSubActive = subItem.path 
                ? isActive(subItem.path) 
                : isTabActive(item.path, subItem.tabParam!);
              
              const subItemUrl = subItem.path 
                ? buildNavUrl(subItem.path)
                : buildNavUrl(item.path, subItem.tabParam);

              return (
                <Button
                  key={subItem.id}
                  variant={isSubActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-sm font-normal pl-6',
                    isSubActive
                      ? 'bg-secondary text-secondary-foreground border-l-2 border-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => {
                    router.push(subItemUrl);
                    onClick?.();
                  }}
                >
                  <span className="flex-1 text-left">{subItem.label}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSidebarContent = (onItemClick?: () => void) => (
    <nav className="space-y-1 flex flex-col h-full">
      {/* Dashboard - Always visible */}
      {renderNavItem({ label: 'Dashboard', icon: Home, path: '/dashboard' }, onItemClick)}
      
      {/* Games - Always visible */}
      {renderNavItem({ label: 'Games', icon: Layers, path: '/games' }, onItemClick)}
      
      {/* User Management - Admin only */}
      {isAdmin && renderNavItem({ label: 'User Management', icon: Users, path: '/users' }, onItemClick)}

      {/* Config sections - Only when game is selected */}
      {selectedGameId && (
        <>
          {/* Configure Section Header */}
          <div className="pt-4 pb-2">
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Configure
            </span>
          </div>
          {configSections.map((item) => 
            item.subItems 
              ? renderNavItemWithSubItems(item, onItemClick)
              : renderNavItem(item, onItemClick)
          )}
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

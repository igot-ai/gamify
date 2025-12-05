'use client';

import { useEffect, useLayoutEffect, useState, useRef } from 'react';
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
  Sparkles,
  Layers,
  Users,
} from 'lucide-react';
import { useSelectedGame } from '@/hooks/useSelectedGame';
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
  // Use a Set to track expanded tabs - allows multiple tabs to be open
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
  const lastActiveParentRef = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedGame, selectedGameId } = useSelectedGame();
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

  // Build URL with appId param for section pages
  const buildNavUrl = (path: string, tabParam?: string) => {
    const params = new URLSearchParams();
    if (selectedGameId) {
      params.set('appId', selectedGameId);
    }
    if (tabParam) {
      params.set('tab', tabParam);
    }
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  // Determine which parent should be expanded based on current path
  const getActiveParent = (): string | null => {
    for (const item of configSections) {
      if (!item.subItems) continue;
      if (isActive(item.path)) return item.label;
      for (const sub of item.subItems) {
        if (sub.path && isActive(sub.path)) return item.label;
        // Also check for tab-based subitems
        if (sub.tabParam && isTabActive(item.path, sub.tabParam)) return item.label;
      }
    }
    return null;
  };

  const activeParent = getActiveParent();
  
  // Auto-expand/collapse based on active parent - only one tab open at a time
  useLayoutEffect(() => {
    if (activeParent && activeParent !== lastActiveParentRef.current) {
      // New parent - collapse all others and expand this one
      setExpandedTabs(new Set([activeParent]));
      lastActiveParentRef.current = activeParent;
    } else if (!activeParent) {
      setExpandedTabs(new Set());
      lastActiveParentRef.current = null;
    }
  }, [activeParent]);

  const renderNavItem = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <div
        key={item.path}
        className={cn(
          'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        onClick={() => {
          router.push(buildNavUrl(item.path));
          onClick?.();
        }}
      >
        <Icon className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        <span className={cn(
          'text-sm transition-colors',
          active ? 'font-medium' : 'font-normal'
        )}>{item.label}</span>
        {active && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>
    );
  };

  const renderNavItemWithSubItems = (item: NavItem, onClick?: () => void) => {
    const Icon = item.icon;
    const isExpanded = expandedTabs.has(item.label);
    const hasActiveSubItem = item.subItems?.some(sub => sub.path && isActive(sub.path));
    const isParentActive = isActive(item.path) || hasActiveSubItem;

    const handleParentClick = () => {
      setExpandedTabs(prev => {
        const next = new Set(prev);
        if (isExpanded) {
          next.delete(item.label);
        } else {
          next.add(item.label);
        }
        return next;
      });
    };

    return (
      <div key={item.path}>
        {/* Parent item */}
        <div
          className={cn(
            'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
            isParentActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          onClick={handleParentClick}
        >
          <Icon className={cn(
            'h-[18px] w-[18px] flex-shrink-0 transition-colors',
            isParentActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )} />
          <span className={cn(
            'flex-1 text-sm transition-colors',
            isParentActive ? 'font-medium' : 'font-normal'
          )}>{item.label}</span>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground/60 transition-transform duration-200',
            isExpanded ? 'rotate-0' : '-rotate-90'
          )} />
        </div>

        {/* Sub-items with connecting line */}
        {isExpanded && (
        <div 
          className="relative overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150"
        >
          {/* Vertical connecting line */}
          <div className="absolute left-[21px] top-1 bottom-1 w-px bg-border/60" />
          
          <div className="ml-3 pl-4 py-1 space-y-0.5">
            {item.subItems?.map((subItem) => {
              const isSubActive = subItem.path 
                ? isActive(subItem.path) 
                : isTabActive(item.path, subItem.tabParam!);
              
              const subItemUrl = subItem.path 
                ? buildNavUrl(subItem.path)
                : buildNavUrl(item.path, subItem.tabParam);

              return (
                <div
                  key={subItem.id}
                  className={cn(
                    'group/sub relative flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-150',
                    isSubActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => {
                    // Immediately collapse all other tabs and expand this one
                    // This prevents flicker by updating state before navigation
                    setExpandedTabs(new Set([item.label]));
                    router.push(subItemUrl);
                    onClick?.();
                  }}
                >
                  {/* Active indicator dot */}
                  <div className={cn(
                    'absolute -left-4 w-1.5 h-1.5 rounded-full transition-all duration-150',
                    isSubActive 
                      ? 'bg-primary scale-100' 
                      : 'bg-border scale-75 group-hover/sub:scale-100'
                  )} />
                  <span className={cn(
                    'text-[13px] transition-colors',
                    isSubActive ? 'font-medium' : 'font-normal'
                  )}>{subItem.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    );
  };

  const renderSidebarContent = (onItemClick?: () => void) => (
    <nav className="space-y-0.5 flex flex-col h-full">
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
          <div className="pt-5 pb-2">
            <span className="px-3 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
              Configure
            </span>
          </div>
          <div className="space-y-0.5">
            {configSections.map((item) => 
              item.subItems 
                ? renderNavItemWithSubItems(item, onItemClick)
                : renderNavItem(item, onItemClick)
            )}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings - Always at bottom */}
      <div className="border-t border-border pt-3 mt-3">
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

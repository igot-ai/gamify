'use client';

import { cn } from '@/lib/utils';
import type { SectionType } from '@/types/api';

interface TabItem {
  id: string;
  label: string;
}

// Define tabs - only Economy has sub-tabs, others show their form directly
export const SECTION_TABS: Partial<Record<SectionType, TabItem[]>> = {
  economy: [
    { id: 'currencies', label: 'Currencies' },
    { id: 'inventory', label: 'Inventory Items' },
    { id: 'virtual-purchases', label: 'Virtual Purchases' },
    { id: 'real-purchases', label: 'Real Purchases' },
    { id: 'settings', label: 'Settings' },
  ],
  // Other sections don't need sub-tabs
};

interface SectionTabsProps {
  sectionType: SectionType;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
}

export function SectionTabs({
  sectionType,
  activeTab,
  onTabChange,
  disabled = false,
}: SectionTabsProps) {
  const tabs = SECTION_TABS[sectionType] || [];

  // Don't render anything if no tabs
  if (tabs.length === 0) return null;

  return (
    <div className="border-b border-border">
      <nav className="flex gap-1 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !disabled && onTabChange(tab.id)}
            disabled={disabled}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


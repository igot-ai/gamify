'use client';

import { cn } from '@/lib/utils';
import type { SectionType } from '@/types/api';

interface TabItem {
  id: string;
  label: string;
}

// Define tabs - Economy tabs are now in the sidebar navigation
export const SECTION_TABS: Partial<Record<SectionType, TabItem[]>> = {
  // Economy sub-navigation is handled in the sidebar (DashboardLayout)
  // Other sections can add tabs here if needed
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


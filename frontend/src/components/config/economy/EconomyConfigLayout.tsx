'use client';

import * as React from 'react';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Coins, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { 
  economyConfigSchema,
  type EconomyConfig,
  defaultEconomyConfig
} from '@/lib/validations/economyConfig';
import { transformEconomyConfigToExport } from '@/lib/economyExportTransform';

import { CurrenciesSection } from './CurrenciesSection';
import { InventoryItemsSection } from './InventoryItemsSection';
import { VirtualPurchasesSection } from './VirtualPurchasesSection';
import { RealPurchasesSection } from './RealPurchasesSection';
import { EconomySettingsSection } from './EconomySettingsSection';

// Section configuration
const sections = [
  { 
    id: 'currencies', 
    label: 'Currencies', 
    icon: Coins,
    countKey: 'currencies' as const,
  },
  { 
    id: 'inventory', 
    label: 'Inventory Items', 
    icon: Package,
    countKey: 'inventoryItems' as const,
  },
  { 
    id: 'virtual-purchases', 
    label: 'Virtual Purchases', 
    icon: ShoppingCart,
    countKey: 'virtualPurchases' as const,
  },
  { 
    id: 'real-purchases', 
    label: 'Real Purchases', 
    icon: CreditCard,
    countKey: 'realPurchases' as const,
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings,
    countKey: null,
  },
] as const;

type SectionId = typeof sections[number]['id'];

interface EconomyConfigLayoutProps {
  initialData?: EconomyConfig;
  onSave: (data: EconomyConfig) => void;
  onSaveSection?: (sectionId: string, data: any) => void;
  isSaving?: boolean;
  /** Active section controlled from outside (e.g., sidebar) */
  activeTab?: string;
  /** Hide internal sidebar navigation (when controlled from main sidebar) */
  hideSidebar?: boolean;
  /** Read-only mode for viewing deployed configs */
  readOnly?: boolean;
}

export interface EconomyConfigLayoutRef {
  getData: () => EconomyConfig;
  save: () => Promise<void>;
  setActiveSection: (sectionId: string) => void;
  reset: (data: EconomyConfig) => void;
}

export const EconomyConfigLayout = forwardRef<EconomyConfigLayoutRef, EconomyConfigLayoutProps>(
  function EconomyConfigLayout({ 
    initialData, 
    onSave,
    onSaveSection,
    isSaving = false,
    activeTab,
    hideSidebar = false,
    readOnly = false,
  }, ref) {
  const [activeSection, setActiveSection] = useState<SectionId>(
    (activeTab as SectionId) || 'currencies'
  );

  // Update active section when activeTab prop changes
  useEffect(() => {
    if (activeTab && sections.some(s => s.id === activeTab)) {
      setActiveSection(activeTab as SectionId);
    }
  }, [activeTab]);

  // Initialize form with react-hook-form
  const form = useForm<EconomyConfig>({
    resolver: zodResolver(economyConfigSchema) as any,
    defaultValues: initialData || defaultEconomyConfig,
  });

  // Reset form when initialData changes (e.g., after page refresh or version switch)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // Expose methods via ref for parent component to call
  useImperativeHandle(ref, () => ({
    getData: () => form.getValues(),
    save: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        onSave(form.getValues());
      }
    },
    setActiveSection: (sectionId: string) => {
      if (sections.some(s => s.id === sectionId)) {
        setActiveSection(sectionId as SectionId);
      }
    },
    reset: (data: EconomyConfig) => {
      console.log('Resetting economy form with data:', data);
      form.reset(data);
    },
  }));

  // Watch form values for counts
  const formValues = form.watch();

  // Get count for a section
  const getCount = (countKey: typeof sections[number]['countKey']) => {
    if (!countKey) return null;
    const value = formValues[countKey];
    return Array.isArray(value) ? value.length : 0;
  };

  // Handle section save - calls section-specific save or falls back to full save
  const handleSectionSave = (sectionId: string, data: any) => {
    if (onSaveSection) {
      onSaveSection(sectionId, data);
    } else {
      // If no section-specific handler, trigger full form save
      onSave(form.getValues());
    }
  };

  // Handle full form submit
  const handleSubmit = form.handleSubmit((data) => {
    onSave(data);
  });

  const renderContent = () => (
    <div className="p-6">
      {activeSection === 'currencies' && (
        <CurrenciesSection 
          onSave={(data) => handleSectionSave('currencies', data)}
          isSaving={isSaving}
          readOnly={readOnly}
        />
      )}
      {activeSection === 'inventory' && (
        <InventoryItemsSection 
          onSave={(data) => handleSectionSave('inventory', data)}
          isSaving={isSaving}
          readOnly={readOnly}
        />
      )}
      {activeSection === 'virtual-purchases' && (
        <VirtualPurchasesSection 
          onSave={(data) => handleSectionSave('virtual-purchases', data)}
          isSaving={isSaving}
          readOnly={readOnly}
        />
      )}
      {activeSection === 'real-purchases' && (
        <RealPurchasesSection 
          onSave={(data) => handleSectionSave('real-purchases', data)}
          isSaving={isSaving}
          readOnly={readOnly}
        />
      )}
      {activeSection === 'settings' && (
        <EconomySettingsSection 
          onSave={(data) => handleSectionSave('settings', data)}
          isSaving={isSaving}
          onExport={() => {
            const data = form.getValues();
            const exportData = transformEconomyConfigToExport(data);
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'economy-config.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          onImport={(data) => {
            form.reset(data);
          }}
          onValidate={() => {
            return form.trigger();
          }}
          readOnly={readOnly}
        />
      )}
    </div>
  );

  // If sidebar is hidden, render content only
  if (hideSidebar) {
    return (
      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="h-full">
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-stripe-md">
            <ScrollArea className="h-full min-h-[600px]">
              {renderContent()}
            </ScrollArea>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="h-full">
        <div className="flex h-full min-h-[600px] rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-stripe-md">
          {/* Sidebar Navigation */}
          <div className="w-[260px] border-r border-border/40 bg-muted/20 flex flex-col">
            {/* Sidebar Header */}
            <div className="px-5 py-4 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Economy Configuration
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Manage currencies, items & purchases
              </p>
            </div>

            {/* Navigation Items */}
            <ScrollArea className="flex-1">
              <nav className="p-3 space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const count = getCount(section.countKey);
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        'hover:bg-muted/50',
                        isActive ? [
                          'bg-primary/10 text-primary border-l-2 border-primary',
                          'shadow-sm'
                        ] : [
                          'text-muted-foreground hover:text-foreground',
                          'border-l-2 border-transparent'
                        ]
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="flex-1 text-left">{section.label}</span>
                      {count !== null && (
                        <Badge 
                          variant={isActive ? 'default' : 'secondary'}
                          className={cn(
                            'h-5 min-w-[20px] px-1.5 text-xs font-medium',
                            isActive ? 'bg-primary text-primary-foreground' : ''
                          )}
                        >
                          {count}
                        </Badge>
                      )}
                      <ChevronRight className={cn(
                        'h-4 w-4 flex-shrink-0 transition-transform',
                        isActive ? 'text-primary rotate-90' : 'text-muted-foreground/50'
                      )} />
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* Sidebar Footer with Summary */}
            <div className="px-4 py-3 border-t border-border/30 bg-muted/30">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Coins className="h-3 w-3" />
                  <span>{getCount('currencies')} currencies</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>{getCount('inventoryItems')} items</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ShoppingCart className="h-3 w-3" />
                  <span>{getCount('virtualPurchases')} virtual</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  <span>{getCount('realPurchases')} IAP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              {renderContent()}
            </ScrollArea>
          </div>
        </div>
      </form>
    </FormProvider>
  );
});

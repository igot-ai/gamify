/**
 * Transform internal EconomyConfig to Unity-compatible export format.
 * 
 * This transforms camelCase internal structure to PascalCase Unity format
 * with numeric enum values instead of string enums.
 */

import type { EconomyConfig, ResourceType, ProductType } from './validations/economyConfig';

// ============================================
// EXPORT FORMAT TYPES
// ============================================

export interface ExportCurrencyDefinition {
  Id: string;
  DisplayName: string;
  DefaultBalance: number;
  MaxValue: number;
  AllowNegative: boolean;
}

export interface ExportInventoryItemDefinition {
  Id: string;
  DisplayName: string;
  DefaultQuantity: number;
  IsStackable: boolean;
  MaxStackSize: number;
}

export interface ExportResourceReference {
  ResourceType: number; // 0 = Currency, 1 = Item
  ResourceId: string;
  Amount: number;
}

export interface ExportVirtualPurchaseDefinition {
  Id: string;
  Name: string;
  Costs: ExportResourceReference[];
  Rewards: ExportResourceReference[];
}

export interface ExportRealMoneyProductDefinition {
  ProductId: string;
  ProductType: number; // 0 = Consumable, 1 = NonConsumable
  Name: string;
  Rewards: ExportResourceReference[];
}

export interface ExportEconomyConfig {
  CurrencyDefinitions: ExportCurrencyDefinition[];
  InventoryItemDefinitions: ExportInventoryItemDefinition[];
  VirtualPurchaseDefinitions: ExportVirtualPurchaseDefinition[];
  RealMoneyProductDefinitions: ExportRealMoneyProductDefinition[];
  EnableRefundProcessing: boolean;
}

// ============================================
// ENUM MAPPINGS
// ============================================

const RESOURCE_TYPE_MAP: Record<ResourceType, number> = {
  Currency: 0,
  Item: 1,
};

const PRODUCT_TYPE_MAP: Record<ProductType, number> = {
  Consumable: 0,
  NonConsumable: 1,
};

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform internal EconomyConfig to Unity-compatible export format.
 */
export function transformEconomyConfigToExport(config: EconomyConfig): ExportEconomyConfig {
  return {
    CurrencyDefinitions: transformCurrencies(config.currencies),
    InventoryItemDefinitions: transformInventoryItems(config.inventoryItems),
    VirtualPurchaseDefinitions: transformVirtualPurchases(config.virtualPurchases),
    RealMoneyProductDefinitions: transformRealPurchases(config.realPurchases),
    EnableRefundProcessing: config.settings?.enableRefundProcessing ?? false,
  };
}

function transformCurrencies(currencies: EconomyConfig['currencies']): ExportCurrencyDefinition[] {
  return (currencies ?? []).map((currency) => ({
    Id: currency.id,
    DisplayName: currency.displayName,
    DefaultBalance: currency.startingBalance,
    MaxValue: currency.maxValue,
    AllowNegative: currency.allowNegative,
  }));
}

function transformInventoryItems(items: EconomyConfig['inventoryItems']): ExportInventoryItemDefinition[] {
  return (items ?? []).map((item) => ({
    Id: item.id,
    DisplayName: item.displayName,
    DefaultQuantity: item.startingQuantity,
    IsStackable: item.isStackable,
    MaxStackSize: item.maxStackSize,
  }));
}

function transformResourceReference(ref: { type: ResourceType; resourceId: string; amount: number }): ExportResourceReference {
  return {
    ResourceType: RESOURCE_TYPE_MAP[ref.type],
    ResourceId: ref.resourceId,
    Amount: ref.amount,
  };
}

function transformVirtualPurchases(purchases: EconomyConfig['virtualPurchases']): ExportVirtualPurchaseDefinition[] {
  return (purchases ?? []).map((purchase) => ({
    Id: purchase.id,
    Name: purchase.name,
    Costs: (purchase.costs ?? []).map(transformResourceReference),
    Rewards: (purchase.rewards ?? []).map(transformResourceReference),
  }));
}

function transformRealPurchases(purchases: EconomyConfig['realPurchases']): ExportRealMoneyProductDefinition[] {
  return (purchases ?? []).map((purchase) => ({
    ProductId: purchase.productId,
    ProductType: PRODUCT_TYPE_MAP[purchase.productType],
    Name: purchase.displayName,
    Rewards: (purchase.rewards ?? []).map(transformResourceReference),
  }));
}


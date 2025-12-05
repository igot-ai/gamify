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

// ============================================
// REVERSE ENUM MAPPINGS (for import)
// ============================================

const RESOURCE_TYPE_REVERSE_MAP: Record<number, ResourceType> = {
  0: 'Currency',
  1: 'Item',
};

const PRODUCT_TYPE_REVERSE_MAP: Record<number, ProductType> = {
  0: 'Consumable',
  1: 'NonConsumable',
};

// ============================================
// EXPORT TRANSFORMS (camelCase -> PascalCase)
// ============================================

export function transformCurrenciesToUnity(currencies: EconomyConfig['currencies']): ExportCurrencyDefinition[] {
  return (currencies ?? []).map((currency) => ({
    Id: currency.id ?? '',
    DisplayName: currency.displayName ?? '',
    DefaultBalance: currency.startingBalance ?? 0,
    MaxValue: currency.maxValue ?? 0,
    AllowNegative: currency.allowNegative ?? false,
  }));
}

export function transformInventoryItemsToUnity(items: EconomyConfig['inventoryItems']): ExportInventoryItemDefinition[] {
  return (items ?? []).map((item) => ({
    Id: item.id ?? '',
    DisplayName: item.displayName ?? '',
    DefaultQuantity: item.startingQuantity ?? 0,
    IsStackable: item.isStackable ?? true,
    MaxStackSize: item.maxStackSize ?? 0,
  }));
}

function transformResourceReference(ref: { type: ResourceType; resourceId: string; amount: number }): ExportResourceReference {
  return {
    ResourceType: RESOURCE_TYPE_MAP[ref.type] ?? 0,
    ResourceId: ref.resourceId ?? '',
    Amount: ref.amount ?? 0,
  };
}

export function transformVirtualPurchasesToUnity(purchases: EconomyConfig['virtualPurchases']): ExportVirtualPurchaseDefinition[] {
  return (purchases ?? []).map((purchase) => ({
    Id: purchase.id ?? '',
    Name: purchase.name ?? '',
    Costs: (purchase.costs ?? []).map(transformResourceReference),
    Rewards: (purchase.rewards ?? []).map(transformResourceReference),
  }));
}

export function transformRealPurchasesToUnity(purchases: EconomyConfig['realPurchases']): ExportRealMoneyProductDefinition[] {
  return (purchases ?? []).map((purchase) => ({
    ProductId: purchase.productId ?? '',
    ProductType: PRODUCT_TYPE_MAP[purchase.productType] ?? 0,
    Name: purchase.displayName ?? '',
    Rewards: (purchase.rewards ?? []).map(transformResourceReference),
  }));
}

// ============================================
// IMPORT TRANSFORMS (PascalCase -> camelCase)
// ============================================

function transformResourceReferenceFromUnity(ref: ExportResourceReference): { type: ResourceType; resourceId: string; amount: number } {
  return {
    type: RESOURCE_TYPE_REVERSE_MAP[ref.ResourceType] ?? 'Currency',
    resourceId: ref.ResourceId ?? '',
    amount: ref.Amount ?? 0,
  };
}

export function transformCurrenciesFromUnity(currencies: ExportCurrencyDefinition[]): EconomyConfig['currencies'] {
  return (currencies ?? []).map((currency) => ({
    id: currency.Id ?? '',
    displayName: currency.DisplayName ?? '',
    description: '',
    iconPath: '',
    startingBalance: currency.DefaultBalance ?? 0,
    maxValue: currency.MaxValue ?? 0,
    allowNegative: currency.AllowNegative ?? false,
  }));
}

export function transformInventoryItemsFromUnity(items: ExportInventoryItemDefinition[]): EconomyConfig['inventoryItems'] {
  return (items ?? []).map((item) => ({
    id: item.Id ?? '',
    displayName: item.DisplayName ?? '',
    description: '',
    iconPath: '',
    startingQuantity: item.DefaultQuantity ?? 0,
    isStackable: item.IsStackable ?? true,
    maxStackSize: item.MaxStackSize ?? 0,
  }));
}

export function transformVirtualPurchasesFromUnity(purchases: ExportVirtualPurchaseDefinition[]): EconomyConfig['virtualPurchases'] {
  return (purchases ?? []).map((purchase) => ({
    id: purchase.Id ?? '',
    name: purchase.Name ?? '',
    costs: (purchase.Costs ?? []).map(transformResourceReferenceFromUnity),
    rewards: (purchase.Rewards ?? []).map(transformResourceReferenceFromUnity),
    bonuses: [],
  }));
}

export function transformRealPurchasesFromUnity(purchases: ExportRealMoneyProductDefinition[]): EconomyConfig['realPurchases'] {
  return (purchases ?? []).map((purchase) => ({
    productId: purchase.ProductId ?? '',
    productType: PRODUCT_TYPE_REVERSE_MAP[purchase.ProductType] ?? 'Consumable',
    displayName: purchase.Name ?? '',
    rewards: (purchase.Rewards ?? []).map(transformResourceReferenceFromUnity),
    bonuses: [],
  }));
}

// Legacy internal functions for full config transform
function transformCurrencies(currencies: EconomyConfig['currencies']): ExportCurrencyDefinition[] {
  return transformCurrenciesToUnity(currencies);
}

function transformInventoryItems(items: EconomyConfig['inventoryItems']): ExportInventoryItemDefinition[] {
  return transformInventoryItemsToUnity(items);
}

function transformVirtualPurchases(purchases: EconomyConfig['virtualPurchases']): ExportVirtualPurchaseDefinition[] {
  return transformVirtualPurchasesToUnity(purchases);
}

function transformRealPurchases(purchases: EconomyConfig['realPurchases']): ExportRealMoneyProductDefinition[] {
  return transformRealPurchasesToUnity(purchases);
}


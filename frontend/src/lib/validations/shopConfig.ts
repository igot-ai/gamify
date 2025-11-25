import { z } from 'zod';
import { currencyRewardSchema, type CurrencyReward } from './economyConfig';

// Re-export for convenience
export { currencyRewardSchema };
export type { CurrencyReward };

// Item Price schema - can reference currency OR IAP product_id
export const itemPriceSchema = z.object({
  currency_id: z.string().min(1, 'Currency ID or IAP product ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
});

// Shop Item schema
export const shopItemSchema = z
  .object({
    id: z.string().min(1, 'Item ID is required'),
    name: z.string().min(1, 'Item name is required'),
    description: z.string().min(1, 'Item description is required'),
    icon_url: z.string().url().optional().or(z.literal('')),
    price: itemPriceSchema,
    rewards: z.array(currencyRewardSchema).min(1, 'At least one reward is required'),
    limited_time: z.boolean().default(false),
    expires_at: z.string().datetime().optional().or(z.literal('')),
    purchase_limit: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // If limited_time is true, expires_at must be provided
      if (data.limited_time && !data.expires_at) {
        return false;
      }
      return true;
    },
    {
      message: 'Expires at date is required for limited time items',
      path: ['expires_at'],
    }
  )
  .refine(
    (data) => {
      // If limited_time is true, purchase_limit should be provided
      if (data.limited_time && !data.purchase_limit) {
        return false;
      }
      return true;
    },
    {
      message: 'Purchase limit is required for limited time items',
      path: ['purchase_limit'],
    }
  )
  .refine(
    (data) => {
      // If expires_at is provided, it must be in the future
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const now = new Date();
        return expiryDate > now;
      }
      return true;
    },
    {
      message: 'Expires at date must be in the future',
      path: ['expires_at'],
    }
  );

// Shop Category schema
export const shopCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Category name is required'),
  icon_url: z.string().url().optional().or(z.literal('')),
  items: z.array(shopItemSchema).default([]),
});

// Shop Config schema with cross-field validation
export const shopConfigSchema = z
  .object({
    categories: z.array(shopCategorySchema).default([]),
    featured_items: z.array(z.string()).default([]),
    rotation_enabled: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Collect all item IDs from all categories
      const allItemIds = new Set<string>();
      data.categories.forEach((category) => {
        category.items.forEach((item) => {
          allItemIds.add(item.id);
        });
      });

      // Check that all featured items exist in categories
      const invalidFeaturedItems = data.featured_items.filter(
        (itemId) => !allItemIds.has(itemId)
      );

      return invalidFeaturedItems.length === 0;
    },
    {
      message: 'Featured items must exist in shop categories',
      path: ['featured_items'],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate item IDs across categories
      const allItemIds: string[] = [];
      data.categories.forEach((category) => {
        category.items.forEach((item) => {
          allItemIds.push(item.id);
        });
      });

      const uniqueIds = new Set(allItemIds);
      return uniqueIds.size === allItemIds.length;
    },
    {
      message: 'Item IDs must be unique across all categories',
      path: ['categories'],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate category IDs
      const categoryIds = data.categories.map((cat) => cat.id);
      const uniqueCategoryIds = new Set(categoryIds);
      return uniqueCategoryIds.size === categoryIds.length;
    },
    {
      message: 'Category IDs must be unique',
      path: ['categories'],
    }
  );

// Type exports
export type ItemPrice = z.infer<typeof itemPriceSchema>;
export type ShopItem = z.infer<typeof shopItemSchema>;
export type ShopCategory = z.infer<typeof shopCategorySchema>;
export type ShopConfig = z.infer<typeof shopConfigSchema>;


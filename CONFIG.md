# 🎮 Game Configuration System Documentation

## Overview

This configuration management system provides a comprehensive solution for managing game configurations with:
- ✅ **JSON-based structured configs** for different game aspects
- ✅ **Version control** with automatic versioning
- ✅ **Change tracking** via audit logs
- ✅ **Visual JSON editor** for managing complex configurations
- ✅ **Multi-environment support** (Dev, Staging, Production)
- ✅ **Approval workflow** (Draft → Review → Approved → Deployed)
- ✅ **Firebase Remote Config integration** for deployment

---

## Configuration Structure

### Config Model

Each configuration contains multiple sections (JSON columns in database):

```typescript
interface GameConfig {
  id: string;
  version: number;  // Auto-incremented version number
  game_id: string;
  environment_id: string;
  status: ConfigStatus;  // 'draft' | 'in_review' | 'approved' | 'deployed' | 'archived'
  
  // Configuration Sections (all optional)
  game_core_config?: GameCoreConfig;
  economy_config?: EconomyConfig;
  ad_config?: AdConfig;
  notification_config?: NotificationConfig;
  booster_config?: BoosterConfig;
  chapter_reward_config?: ChapterRewardConfig;
  shop_config?: ShopConfig;
  analytics_config?: object;
  ux_config?: object;
  
  // Audit Fields
  created_by: string;
  updated_by?: string;
  reviewed_by?: string;
  approved_by?: string;
  deployed_at?: datetime;
}
```

---

## 1. Economy Configuration

**Purpose:** Manage in-game currencies, IAP packages, and daily rewards

### Schema

```typescript
interface EconomyConfig {
  currencies: Currency[];        // At least 1 required
  iap_packages: IAPPackage[];   // Optional
  daily_rewards: DailyReward[]; // Optional
}

interface Currency {
  id: string;              // e.g., "coins", "gems"
  name: string;            // Display name
  icon_url?: string;       // URL to currency icon
  type: 'soft' | 'hard';   // Soft (farmable) or Hard (premium)
  starting_amount: number; // Initial amount for new players (>= 0)
}

interface IAPPackage {
  id: string;                    // Unique package ID
  product_id: string;            // App Store / Play Store ID (must start with com. or android.)
  price: number;                 // Price in currency (> 0)
  currency: string;              // Default: "USD"
  rewards: CurrencyReward[];     // What player gets (min 1 reward)
}

interface CurrencyReward {
  currency_id: string;  // References Currency.id
  amount: number;       // Amount to give (> 0)
}

interface DailyReward {
  day: number;               // Day 1-30
  rewards: CurrencyReward[]; // Rewards for that day
}
```

### Example

```json
{
  "economy_config": {
    "currencies": [
      {
        "id": "coins",
        "name": "Coins",
        "type": "soft",
        "starting_amount": 1000,
        "icon_url": "https://cdn.example.com/coins.png"
      },
      {
        "id": "gems",
        "name": "Gems",
        "type": "hard",
        "starting_amount": 50
      }
    ],
    "iap_packages": [
      {
        "id": "starter_pack",
        "product_id": "com.sunstudio.game.starter",
        "price": 4.99,
        "currency": "USD",
        "rewards": [
          { "currency_id": "gems", "amount": 500 },
          { "currency_id": "coins", "amount": 5000 }
        ]
      },
      {
        "id": "mega_pack",
        "product_id": "com.sunstudio.game.mega",
        "price": 19.99,
        "currency": "USD",
        "rewards": [
          { "currency_id": "gems", "amount": 2500 }
        ]
      }
    ],
    "daily_rewards": [
      {
        "day": 1,
        "rewards": [
          { "currency_id": "coins", "amount": 100 }
        ]
      },
      {
        "day": 2,
        "rewards": [
          { "currency_id": "coins", "amount": 150 },
          { "currency_id": "gems", "amount": 5 }
        ]
      },
      {
        "day": 7,
        "rewards": [
          { "currency_id": "gems", "amount": 50 }
        ]
      }
    ]
  }
}
```

### Validation Rules

- ✅ At least 1 currency required
- ✅ Currency IDs must be unique
- ✅ IAP product_id must start with `com.` or `android.`
- ✅ All prices and amounts must be positive
- ✅ Daily reward days must be unique (1-30)
- ✅ Currency rewards must reference existing currency IDs

---

## 2. Ad Configuration

**Purpose:** Configure ad networks, placements, and monetization settings

### Schema

```typescript
interface AdConfig {
  enabled: boolean;
  networks: AdNetwork[];
  placements: AdPlacement[];
  settings: AdSettings;
}

interface AdNetwork {
  id: string;                    // e.g., "admob", "unity"
  name: string;                  // Display name
  enabled: boolean;
  priority: number;              // Load order (lower = higher priority)
  app_id: string;                // Network-specific app ID
  test_mode?: boolean;
}

interface AdPlacement {
  id: string;                    // e.g., "level_complete_interstitial"
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  position?: 'top' | 'bottom';   // For banners
  frequency_cap?: number;        // Max shows per session
  cooldown?: number;             // Seconds between shows
  rewards?: CurrencyReward[];    // For rewarded ads
}

interface AdSettings {
  show_banner_on_startup: boolean;
  interstitial_frequency: number;       // Show every N level completes
  rewarded_ads_available: boolean;
  gdpr_consent_required: boolean;
}
```

### Example

```json
{
  "ad_config": {
    "enabled": true,
    "networks": [
      {
        "id": "admob",
        "name": "Google AdMob",
        "enabled": true,
        "priority": 1,
        "app_id": "ca-app-pub-1234567890123456~1234567890",
        "test_mode": false
      },
      {
        "id": "unity",
        "name": "Unity Ads",
        "enabled": true,
        "priority": 2,
        "app_id": "1234567"
      }
    ],
    "placements": [
      {
        "id": "level_complete",
        "type": "interstitial",
        "frequency_cap": 1,
        "cooldown": 60
      },
      {
        "id": "watch_for_coins",
        "type": "rewarded",
        "rewards": [
          { "currency_id": "coins", "amount": 100 }
        ]
      },
      {
        "id": "bottom_banner",
        "type": "banner",
        "position": "bottom"
      }
    ],
    "settings": {
      "show_banner_on_startup": true,
      "interstitial_frequency": 3,
      "rewarded_ads_available": true,
      "gdpr_consent_required": true
    }
  }
}
```

---

## 3. Notification Configuration

**Purpose:** Configure push notifications and in-game messages

### Schema

```typescript
interface NotificationConfig {
  push_enabled: boolean;
  local_notifications: LocalNotification[];
  push_notifications: PushNotification[];
  firebase_config?: FirebaseNotificationConfig;
}

interface LocalNotification {
  id: string;
  title: string;
  body: string;
  trigger_after_hours: number;     // Hours after last session
  repeat?: 'daily' | 'weekly';
  enabled: boolean;
}

interface PushNotification {
  id: string;
  type: 'marketing' | 'transactional' | 'gameplay';
  title: string;
  body: string;
  deep_link?: string;              // App deep link
  enabled: boolean;
}

interface FirebaseNotificationConfig {
  sender_id: string;
  server_key: string;
  topics: string[];
}
```

### Example

```json
{
  "notification_config": {
    "push_enabled": true,
    "local_notifications": [
      {
        "id": "daily_reward",
        "title": "Daily Reward Available!",
        "body": "Come back and claim your daily reward",
        "trigger_after_hours": 24,
        "repeat": "daily",
        "enabled": true
      },
      {
        "id": "energy_full",
        "title": "Energy Restored",
        "body": "Your energy is full! Come play now",
        "trigger_after_hours": 4,
        "enabled": true
      }
    ],
    "push_notifications": [
      {
        "id": "new_event",
        "type": "marketing",
        "title": "New Event Started!",
        "body": "Join the Halloween event and win exclusive rewards",
        "deep_link": "game://events/halloween",
        "enabled": true
      }
    ],
    "firebase_config": {
      "sender_id": "123456789012",
      "server_key": "AAAAxxxxxxxx:APA91bF...",
      "topics": ["all_users", "high_spenders", "inactive_users"]
    }
  }
}
```

---

## 4. Game Core Configuration

**Purpose:** Core game mechanics and settings

### Schema

```typescript
interface GameCoreConfig {
  version: string;
  game_settings: GameSettings;
  difficulty_settings: DifficultySettings;
  progression: ProgressionSettings;
}

interface GameSettings {
  starting_level: number;
  max_level: number;
  energy_system_enabled: boolean;
  max_energy: number;
  energy_refill_time_minutes: number;
}

interface DifficultySettings {
  easy_mode_available: boolean;
  difficulty_scaling_factor: number;
  tutorial_enabled: boolean;
}

interface ProgressionSettings {
  xp_per_level: number;
  xp_scaling_factor: number;
  unlock_requirements: UnlockRequirement[];
}

interface UnlockRequirement {
  feature_id: string;
  required_level: number;
}
```

---

## 5. Shop Configuration

**Purpose:** In-game shop items and bundles

### Schema

```typescript
interface ShopConfig {
  categories: ShopCategory[];
  featured_items: string[];  // Item IDs
  rotation_enabled: boolean;
}

interface ShopCategory {
  id: string;
  name: string;
  icon_url?: string;
  items: ShopItem[];
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  price: ItemPrice;
  rewards: CurrencyReward[];
  limited_time?: boolean;
  expires_at?: string;
  purchase_limit?: number;
}

interface ItemPrice {
  currency_id: string;  // References Currency.id OR IAP product_id
  amount: number;
}
```

---

## 6. Booster Configuration

**Purpose:** Power-ups and boosters

### Schema

```typescript
interface BoosterConfig {
  boosters: Booster[];
}

interface Booster {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  type: 'consumable' | 'duration' | 'permanent';
  duration_seconds?: number;  // For duration type
  effect: BoosterEffect;
  price: ItemPrice;
  stackable: boolean;
}

interface BoosterEffect {
  type: 'score_multiplier' | 'move_bonus' | 'time_extension' | 'hint';
  value: number;
}
```

---

## 7. Chapter Reward Configuration

**Purpose:** Level/chapter progression rewards

### Schema

```typescript
interface ChapterRewardConfig {
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  name: string;
  level_range: { start: number; end: number };
  completion_rewards: CurrencyReward[];
  star_rewards: StarReward[];
}

interface StarReward {
  stars_required: number;  // 1, 2, or 3
  rewards: CurrencyReward[];
}
```

---

## Versioning System

### How Versioning Works

1. **Auto-incrementing versions**: Each config for a game gets a unique version number (1, 2, 3...)
2. **Immutable deployed configs**: Once deployed, a config cannot be edited
3. **Edit creates new version**: To make changes, create a new version based on existing config
4. **Version history**: All versions are preserved for audit trail
5. **Rollback capability**: Can re-deploy any previous version

### Version Lifecycle

```
                 ┌─────────┐
                 │  DRAFT  │ ← Editable
                 └────┬────┘
                      │ Submit for Review
                      ▼
              ┌───────────────┐
              │   IN_REVIEW   │ ← Read-only
              └───────┬───────┘
                      │ Approve (Lead Designer+)
                      ▼
              ┌───────────────┐
              │   APPROVED    │ ← Ready to deploy
              └───────┬───────┘
                      │ Deploy (Product Manager+)
                      ▼
              ┌───────────────┐
              │   DEPLOYED    │ ← Live in production
              └───────────────┘
```

### Change Tracking

Every config change is tracked in `audit_logs` table:

```typescript
interface AuditLog {
  id: string;
  entity_type: 'config' | 'game' | 'environment';
  entity_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'deployed';
  user_id: string;
  changes: object;  // JSON diff of what changed
  timestamp: datetime;
}
```

**Tracked Actions:**
- ✅ Config created
- ✅ Config updated (with field-level changes)
- ✅ Status changed (Draft → Review → Approved → Deployed)
- ✅ Deployed to Firebase (with version number)
- ✅ Who made each change and when

### Example Change Log

```json
{
  "action": "updated",
  "config_id": "cfg_123",
  "user_id": "user_456",
  "timestamp": "2025-11-25T10:30:00Z",
  "changes": {
    "economy_config": {
      "old": {
        "currencies": [
          { "id": "coins", "starting_amount": 1000 }
        ]
      },
      "new": {
        "currencies": [
          { "id": "coins", "starting_amount": 1500 }
        ]
      }
    }
  }
}
```

---

## JSON Editor Features

### Visual Editor Components

1. **Section Tabs**: Switch between config sections (Economy, Ads, Notifications, etc.)
2. **Form Validation**: Real-time validation with error messages
3. **Array Management**: Add/remove items (currencies, IAP packages, etc.)
4. **Nested Objects**: Expandable sections for complex structures
5. **JSON Preview**: Live preview of the JSON structure
6. **Diff Viewer**: Compare versions side-by-side

### Editor Capabilities

```typescript
// Economy Config Editor
<EconomyConfigForm
  initialData={config.economy_config}
  onSubmit={handleSaveEconomy}
  onCancel={handleCancel}
/>

// Features:
- Add/Remove currencies with validation
- Configure IAP packages with product ID validation
- Set up daily reward calendar (day selector)
- Real-time price and reward calculations
- Icon upload for currencies
- Drag-and-drop reordering
```

### Auto-save and Recovery

- ✅ **Draft auto-save**: Changes saved automatically every 30 seconds
- ✅ **Unsaved changes warning**: Prompt before leaving page
- ✅ **Version snapshots**: Can restore previous saves
- ✅ **Conflict detection**: Warns if another user edited same config

---

## API Endpoints

### Config Management

```typescript
// List configs with filters
GET /api/v1/configs?game_id={id}&environment_id={id}&status={status}

// Get specific config
GET /api/v1/configs/{config_id}

// Create new config (Draft)
POST /api/v1/configs
Body: {
  game_id: string;
  environment_id: string;
  economy_config?: EconomyConfig;
  // ... other sections
}

// Update config (Draft only)
PATCH /api/v1/configs/{config_id}
Body: {
  economy_config?: EconomyConfig;
  // ... sections to update
}

// Submit for review
POST /api/v1/configs/{config_id}/submit-review

// Approve (Lead Designer+)
POST /api/v1/configs/{config_id}/approve

// Deploy to Firebase (Product Manager+)
POST /api/v1/configs/{config_id}/deploy
```

### Version History

```typescript
// Get all versions for a game
GET /api/v1/configs?game_id={id}&all_versions=true

// Get specific version
GET /api/v1/configs/{config_id}

// Compare versions
GET /api/v1/configs/{config_id}/diff?compare_with={other_config_id}

// Rollback (creates new version from old)
POST /api/v1/configs/{config_id}/rollback
```

---

## Environment Strategy

### Environments

1. **Development**: For testing and development
2. **Staging**: For QA and pre-production testing
3. **Production**: Live environment for users

### Environment-specific Configs

Each environment can have its own config:

```
Game: "Puzzle Adventure"
├── Dev Environment
│   └── Config v5 (draft) - Testing new IAP
├── Staging Environment
│   └── Config v3 (deployed) - QA testing
└── Production Environment
    └── Config v2 (deployed) - Live for users
```

### Promotion Flow

```
Dev (draft) → Staging (test) → Production (live)
```

**Best Practices:**
1. Test in Dev first
2. Deploy to Staging for QA approval
3. After QA passes, deploy same config to Production
4. Never skip Staging for major changes

---

## Firebase Remote Config Integration

### Deployment Process

1. **Validation**: Config validated against schema
2. **Conversion**: Portal format → Firebase format
3. **Upload**: Push to Firebase Remote Config
4. **Version Tag**: Firebase version number recorded
5. **Status Update**: Config marked as DEPLOYED

### Firebase Format

```json
{
  "parameters": {
    "economy_config": {
      "defaultValue": {
        "value": "{\"currencies\":[...]}"
      }
    },
    "ad_config": {
      "defaultValue": {
        "value": "{\"enabled\":true,...}"
      }
    }
  },
  "conditions": [],
  "version": {
    "versionNumber": "42",
    "updateTime": "2025-11-25T10:30:00Z",
    "updateUser": {
      "email": "pm@sunstudio.com"
    }
  }
}
```

### Client-side Usage

```typescript
// Unity game client
RemoteConfig.FetchDataAsync().ContinueWith(task => {
  var economyConfig = RemoteConfig.GetValue("economy_config").StringValue;
  var config = JsonConvert.DeserializeObject<EconomyConfig>(economyConfig);
  // Use config in game
});
```

---

## Security & Permissions

### Role-based Access Control

| Role | Create | Edit Draft | Submit Review | Approve | Deploy |
|------|--------|-----------|---------------|---------|--------|
| Designer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Lead Designer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Product Manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

### Audit Trail

All actions logged:
- Who made the change
- What was changed (field-level diff)
- When it happened
- Which config/version

---

## Best Practices

### 1. Config Organization
- ✅ Keep sections focused (economy separate from ads)
- ✅ Use descriptive IDs (`starter_pack` not `pack1`)
- ✅ Document complex values in description fields
- ✅ Use consistent naming conventions

### 2. Version Management
- ✅ Always test in Dev environment first
- ✅ Use meaningful version descriptions
- ✅ Keep production configs stable
- ✅ Plan deployments during low-traffic periods

### 3. Change Control
- ✅ Review all changes before deployment
- ✅ Test IAP packages thoroughly (real purchases!)
- ✅ Verify currency rewards don't break economy
- ✅ Keep audit log for compliance

### 4. Data Validation
- ✅ Use schema validation before save
- ✅ Test JSON structure before deployment
- ✅ Verify all IDs reference existing entities
- ✅ Check for circular dependencies

---

## Migration Guide

### From Spreadsheet to Portal

1. **Export current config** from spreadsheet as JSON
2. **Create game** in portal
3. **Create environment** (e.g., Production)
4. **Import config** using API or manual entry
5. **Validate** all sections work correctly
6. **Deploy** to Firebase
7. **Test** in game client
8. **Monitor** for issues

### From Firebase Console to Portal

1. **Download** current Firebase Remote Config
2. **Convert** format (Firebase → Portal schema)
3. **Create config** in portal
4. **Import** converted data
5. **Test** side-by-side with old config
6. **Switch** game client to portal-managed config
7. **Deprecate** manual Firebase console edits

---

## Troubleshooting

### Common Issues

**Issue**: Config won't deploy
- ✅ Check status is APPROVED
- ✅ Verify all required fields present
- ✅ Check Firebase credentials valid
- ✅ Review validation errors in logs

**Issue**: Changes not showing in game
- ✅ Verify config deployed successfully
- ✅ Check game client fetching latest config
- ✅ Clear game cache/reinstall
- ✅ Check Firebase Remote Config version

**Issue**: Version conflict
- ✅ Refresh page to see latest version
- ✅ Merge changes manually if needed
- ✅ Create new version if necessary

---

## Future Enhancements

### Planned Features
- 🔄 A/B testing support (% rollout)
- 📊 Config analytics (which values perform best)
- 🔍 Advanced search and filtering
- 📋 Config templates (presets for common setups)
- 🤖 AI-powered config suggestions
- 📱 Mobile app for config approval
- 🔔 Slack/Discord notifications for status changes

---

## Support

For questions or issues:
- 📧 Email: support@sunstudio.com
- 📚 Wiki: https://wiki.sunstudio.com/config-portal
- 💬 Slack: #config-portal

---

# 🎨 Frontend UI Architecture & Component Plan

## Overview

The frontend provides a comprehensive configuration management interface for managing a single game's configurations across multiple environments. The UI is organized into three main flows:

1. **Config List View** - Browse all configurations for a game
2. **Config Editor** - Edit configuration sections with real-time validation
3. **Config Detail View** - Review and manage configuration status and workflow

---

## Application Structure

### Route Hierarchy

```
/games
├── [gameId]
│   └── /configs                    # Main configs list for a game
│       └── [configId]
│           ├── /                   # Config detail/review view
│           └── /edit               # Config editor (draft only)

/configs
├── [configId]                      # Config detail page (alternative route)
│   ├── /                          # Detail view
│   └── /edit                       # Editor (draft only)
```

### Page Components

#### 1. Configs List Page (`/games/[gameId]/configs`)

**Purpose:** Display all configurations for a specific game with filtering and creation options

**Component Structure:**
```
├── Page Header
│   ├── Title + Description
│   └── Game Name
│
├── Filter & Action Bar
│   ├── Environment Selector (dropdown)
│   ├── Status Filter (dropdown)
│   ├── Search Input
│   └── "+ New Config" Button
│
└── Configurations Table
    ├── Table Headers (Version | Status | Created | Created By | Actions)
    ├── Table Rows (for each config)
    │   ├── Version Badge
    │   ├── Status Badge (colored)
    │   ├── Created Date
    │   ├── Created By User
    │   └── Action Buttons
    │       ├── 👁️ View (always)
    │       ├── ✏️ Edit (draft only)
    │       └── ⚡ Deploy (approved only)
    └── Empty State (if no configs)
```

**Key Features:**
- ✅ Real-time filtering by environment & status
- ✅ Search by config ID
- ✅ Status-dependent actions
- ✅ Loading skeleton state
- ✅ Empty state messaging

**UI Components Used:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Input` (search)
- `Table`, `TableHeader`, `TableRow`, `TableCell`
- `Button` (actions)
- `StatusBadge` (custom)

---

#### 2. Config Editor Page (`/configs/[configId]/edit`)

**Purpose:** Edit configuration sections with real-time validation and JSON preview

**Component Structure:**

```
├── Page Header
│   ├── Title "Edit Configuration"
│   └── Version + Status Info
│
├── Tab Navigation (Horizontal)
│   ├── 📊 Economy Tab
│   ├── 📺 Ads Tab
│   ├── 🔔 Notifications Tab
│   ├── 🚀 Boosters Tab
│   └── 🛍️ Shop Tab
│
├── Tab Content (Dynamic)
│   ├── Card Header
│   │   ├── Section Title
│   │   └── Description
│   └── Card Content
│       └── Config Form (specific to tab)
│
└── Action Bar (Sticky Bottom)
    ├── Save Draft Button
    └── Submit for Review Button
```

---

### 2.1 Economy Config Form Component

**File:** `src/components/config/EconomyConfigForm.tsx`

**Purpose:** Manage currencies, IAP packages, and daily rewards

**Structure:**

```
EconomyConfigForm
├── Currencies Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Currency Items List
│   │   ├── CollapsibleCurrencyItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Currency Name
│   │   │   │   ├── ID, Type, Starting Amount (subtitle)
│   │   │   │   ├── Edit Button (pencil icon)
│   │   │   │   └── Delete Button (trash icon)
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Currency ID Input
│   │   │       ├── Currency Name Input
│   │   │       ├── Type Selector (soft/hard)
│   │   │       ├── Starting Amount Input (number)
│   │   │       ├── Icon URL Input (optional)
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Each item can be independently edited/deleted
│   │
│   └── Add Currency Button (outline)
│
├── IAP Packages Section (Card)
│   ├── Card Header (Title, Description)
│   ├── IAP Package Items List
│   │   ├── CollapsibleIAPItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Package ID + Product ID
│   │   │   │   ├── Price + Currency
│   │   │   │   ├── Rewards Count
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Package ID Input
│   │   │       ├── Product ID Input (validation: com. or android.)
│   │   │       ├── Price Input (decimal)
│   │   │       ├── Currency Selector
│   │   │       ├── Rewards Sub-Array
│   │   │       │   ├── Currency Selector (references currencies)
│   │   │       │   ├── Amount Input
│   │   │       │   ├── Add Reward Button
│   │   │       │   └── Remove Reward Button
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Collapsible for complex nested structure
│   │
│   └── Add IAP Package Button (outline)
│
├── Daily Rewards Section (Card) [Future Implementation]
│   ├── Card Header (Title, Description)
│   ├── Day Selector (Calendar-like UI)
│   ├── Rewards for Selected Day
│   └── Add/Remove Rewards for Each Day
│
└── Action Buttons (Sticky)
    ├── Cancel Button (outline)
    └── Save Economy Config Button (primary)
```

**Key Features:**
- ✅ Inline add/edit for currencies
- ✅ Nested rewards configuration for IAP packages
- ✅ Real-time validation with error messages
- ✅ Type-safe field references (currency_id references currencies)
- ✅ Collapsible sections for complex data
- ✅ Form state management with react-hook-form

**Validation:**
- ✅ Currency ID & name required
- ✅ Currency type must be 'soft' or 'hard'
- ✅ Starting amount >= 0
- ✅ Product ID must start with 'com.' or 'android.'
- ✅ IAP price > 0
- ✅ At least 1 currency required
- ✅ Unique currency IDs
- ✅ Daily reward days must be unique (1-30)
- ✅ All referenced currencies must exist

---

### 2.2 Ad Config Form Component

**File:** `src/components/config/AdConfigForm.tsx` [TODO: Create]

**Purpose:** Configure ad networks, placements, and monetization settings

**Structure:**

```
AdConfigForm
├── Ad System Toggle (Switch)
│   └── "Enable Ads" label with description
│
├── Ad Networks Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Network Items List
│   │   ├── CollapsibleNetworkItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Network Name + Enabled Badge
│   │   │   │   ├── Priority + App ID
│   │   │   │   ├── Test Mode indicator
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Network ID Input (admob, unity, etc.)
│   │   │       ├── Network Name Input
│   │   │       ├── Enabled Toggle (switch)
│   │   │       ├── Priority Input (lower = higher priority)
│   │   │       ├── App ID Input
│   │   │       ├── Test Mode Toggle
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Sortable list (by priority)
│   │
│   └── Add Network Button (outline)
│
├── Ad Placements Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Placement Items List
│   │   ├── CollapsiblePlacementItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Placement ID + Type Badge
│   │   │   │   ├── Position (for banners)
│   │   │   │   ├── Frequency Cap + Cooldown
│   │   │   │   ├── Rewards Info (for rewarded)
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Placement ID Input
│   │   │       ├── Type Selector (banner/interstitial/rewarded/native)
│   │   │       ├── Position Selector (top/bottom/center - if banner)
│   │   │       ├── Frequency Cap Input (optional)
│   │   │       ├── Cooldown Input in seconds (optional)
│   │   │       ├── Rewards Sub-Array (if rewarded type)
│   │   │       │   ├── Currency Selector
│   │   │       │   ├── Amount Input
│   │   │       │   └── Add/Remove Buttons
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Grouped by placement type
│   │
│   └── Add Placement Button (outline)
│
├── Ad Settings Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Show Banner on Startup (toggle)
│   ├── Interstitial Frequency Input (show every N levels)
│   ├── Rewarded Ads Available (toggle)
│   └── GDPR Consent Required (toggle)
│
└── Action Buttons (Sticky)
    ├── Cancel Button (outline)
    └── Save Ad Config Button (primary)
```

**Key Features:**
- ✅ Enable/disable entire ad system
- ✅ Multiple ad networks with priority ordering
- ✅ Ad placement types with conditional fields
- ✅ Network/placement CRUD operations
- ✅ Settings toggles
- ✅ Real-time validation

---

### 2.3 Notification Config Form Component

**File:** `src/components/config/NotificationConfigForm.tsx` [TODO: Create]

**Purpose:** Configure push notifications and in-game messages

**Structure:**

```
NotificationConfigForm
├── Push Notifications Toggle (Switch)
│   └── "Enable Push Notifications" label
│
├── Local Notifications Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Local Notification Items List
│   │   ├── CollapsibleNotificationItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Notification ID
│   │   │   │   ├── Title + Body (preview)
│   │   │   │   ├── Trigger Time + Repeat Schedule
│   │   │   │   ├── Enabled Badge
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Notification ID Input
│   │   │       ├── Title Input
│   │   │       ├── Body Textarea (longer message)
│   │   │       ├── Trigger After Hours Input (number)
│   │   │       ├── Repeat Type Selector (none/daily/weekly)
│   │   │       ├── Enabled Toggle
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Rich preview of notification
│   │
│   └── Add Local Notification Button (outline)
│
├── Push Notifications Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Push Notification Items List
│   │   ├── CollapsiblePushItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Push ID + Type Badge
│   │   │   │   ├── Title + Body (preview)
│   │   │   │   ├── Deep Link Info
│   │   │   │   ├── Enabled Badge
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Push ID Input
│   │   │       ├── Type Selector (marketing/transactional/gameplay)
│   │   │       ├── Title Input
│   │   │       ├── Body Textarea
│   │   │       ├── Deep Link Input (optional)
│   │   │       ├── Enabled Toggle
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Type-specific UI variations
│   │
│   └── Add Push Notification Button (outline)
│
├── Firebase Configuration Section (Card) [Optional]
│   ├── Card Header (Title, Description)
│   ├── Sender ID Input
│   ├── Server Key Input (masked)
│   ├── Topics Multi-Input
│   │   ├── "Add Topic" button
│   │   ├── Topic tags (removable)
│   │   └── "all_users", "high_spenders", "inactive_users" suggestions
│   └── Validate Firebase Credentials Button
│
└── Action Buttons (Sticky)
    ├── Cancel Button (outline)
    └── Save Notification Config Button (primary)
```

**Key Features:**
- ✅ Toggle notification system on/off
- ✅ Separate local vs push notifications
- ✅ Time-based triggering for local notifications
- ✅ Type-specific settings for push notifications
- ✅ Firebase integration with credential validation
- ✅ Topic management for Firebase

---

### 2.4 Booster Config Form Component

**File:** `src/components/config/BoosterConfigForm.tsx` [TODO: Create]

**Purpose:** Configure power-ups and boosters

**Structure:**

```
BoosterConfigForm
├── Boosters Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Booster Items List
│   │   ├── CollapsibleBoosterItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Booster Name + Icon
│   │   │   │   ├── Type Badge (consumable/duration/permanent)
│   │   │   │   ├── Description (truncated)
│   │   │   │   ├── Effect + Value
│   │   │   │   ├── Price Display
│   │   │   │   ├── Stackable Badge
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Booster ID Input
│   │   │       ├── Name Input
│   │   │       ├── Description Textarea
│   │   │       ├── Icon URL Input
│   │   │       ├── Type Selector (consumable/duration/permanent)
│   │   │       ├── Duration Input seconds (if duration type)
│   │   │       ├── Effect Type Selector
│   │   │       │   └── (score_multiplier/move_bonus/time_extension/hint)
│   │   │       ├── Effect Value Input (number)
│   │   │       ├── Price Section
│   │   │       │   ├── Currency Selector (references currencies)
│   │   │       │   └── Amount Input
│   │   │       ├── Stackable Toggle
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Type-conditional fields (duration, stackable behavior)
│   │
│   └── Add Booster Button (outline)
│
└── Action Buttons (Sticky)
    ├── Cancel Button (outline)
    └── Save Booster Config Button (primary)
```

**Key Features:**
- ✅ Three booster types with conditional fields
- ✅ Effect type system
- ✅ Pricing configuration
- ✅ Duration handling for timed boosters
- ✅ Stackability configuration

---

### 2.5 Shop Config Form Component

**File:** `src/components/config/ShopConfigForm.tsx` [TODO: Create]

**Purpose:** Configure in-game shop items and bundles

**Structure:**

```
ShopConfigForm
├── Shop Settings Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Rotation Enabled Toggle
│   └── Featured Items Section
│       ├── Label "Featured Items"
│       ├── Searchable Item Selector
│       ├── Selected Items Tags (removable)
│       └── Add Item Button
│
├── Shop Categories Section (Card)
│   ├── Card Header (Title, Description)
│   ├── Category Items List
│   │   ├── CollapsibleCategoryItem
│   │   │   ├── View Mode (Summary)
│   │   │   │   ├── Category Name + Icon
│   │   │   │   ├── Item Count
│   │   │   │   ├── Edit Button
│   │   │   │   └── Delete Button
│   │   │   │
│   │   │   └── Edit Mode (Form)
│   │   │       ├── Category ID Input
│   │   │       ├── Category Name Input
│   │   │       ├── Icon URL Input
│   │   │       ├── Items Sub-Array
│   │   │       │   ├── ItemsTable or List
│   │   │       │   ├── CollapsibleShopItem (for each item)
│   │   │       │   │   ├── Item ID
│   │   │       │   │   ├── Name
│   │   │       │   │   ├── Description (preview)
│   │   │       │   │   ├── Icon URL
│   │   │       │   │   ├── Price
│   │   │       │   │   ├── Rewards
│   │   │       │   │   ├── Limited Time Indicator
│   │   │       │   │   ├── Edit Button
│   │   │       │   │   └── Delete Button
│   │   │       │   │
│   │   │       │   └── Add Item Button
│   │   │       │
│   │   │       ├── Save Button
│   │   │       └── Cancel Button
│   │   │
│   │   └── Nested category-item structure
│   │
│   └── Add Category Button (outline)
│
└── Action Buttons (Sticky)
    ├── Cancel Button (outline)
    └── Save Shop Config Button (primary)
```

**Key Features:**
- ✅ Shop rotation configuration
- ✅ Featured items selection
- ✅ Category organization
- ✅ Per-category item management
- ✅ Limited-time item configuration
- ✅ Purchase limit per item
- ✅ Nested form complexity management

---

#### 3. Config Detail Page (`/configs/[configId]`)

**Purpose:** Review configuration details, approve/deploy, and view audit info

**Component Structure:**

```
├── Page Header
│   ├── Back Button (arrow)
│   ├── Title "Configuration Details"
│   ├── Version Info
│   └── Status Badge (right-aligned)
│
├── Actions Card
│   ├── Card Header (Title: "Actions")
│   └── Action Buttons (conditional on status & user role)
│       ├── ✏️ Edit Config (draft only)
│       ├── ✅ Approve (in_review + lead_designer+)
│       ├── ⚡ Deploy (approved + product_manager+)
│       └── Disabled state message (if no actions available)
│
├── Info Grid (2 columns)
│   ├── Metadata Card
│   │   ├── Status
│   │   ├── Version
│   │   ├── Created Date
│   │   ├── Created By
│   │   ├── Approved By (if set)
│   │   └── Deployed At (if set)
│   │
│   └── Configuration Sections Card
│       ├── Economy Config (✓ Configured / Not configured)
│       ├── Ad Config (✓ Configured / Not configured)
│       ├── Notification Config (✓ Configured / Not configured)
│       ├── Booster Config (✓ Configured / Not configured)
│       └── Shop Config (✓ Configured / Not configured)
│
├── Config Previews (for each configured section)
│   ├── Preview Card
│   │   ├── Card Header (Section Title)
│   │   ├── Card Description
│   │   └── JSON Preview (syntax-highlighted)
│   │
│   └── Collapsible for each section
│
└── Audit Trail Card [Future Enhancement]
    ├── Timeline of changes
    ├── Who made each change
    ├── When it was changed
    └── What was changed (field-level diff)
```

**Key Features:**
- ✅ Role-based action visibility
- ✅ Status-dependent workflow actions
- ✅ Comprehensive metadata display
- ✅ JSON preview of all configured sections
- ✅ Back navigation
- ✅ Loading and error states

---

## Component Reusability Matrix

### Common Form Components

| Component | Used By | Purpose |
|-----------|---------|---------|
| `FormField` | All config forms | Standardized form field rendering |
| `FormControl` | All config forms | Field control wrapper |
| `FormLabel` | All config forms | Form labels |
| `FormMessage` | All config forms | Error messages |
| `Input` | All forms | Text/number inputs |
| `Textarea` | Notification, Shop | Multi-line text |
| `Select` | All forms | Dropdown selection |
| `Toggle/Switch` | Ad, Notification, Shop | Boolean toggles |
| `Card` | All pages | Section containers |
| `Button` | All pages | Actions |
| `StatusBadge` | List, Detail pages | Status indicators |

### Collapsible Item Pattern

All config sections use a collapsible pattern for items:
- **View Mode**: Compact summary with action buttons
- **Edit Mode**: Inline form with save/cancel buttons
- **Stateless**: UI state managed by parent component

---

## Data Flow & State Management

### Config Editor Data Flow

```
┌─ Page Component (useConfig hook)
│  └─ Get initial config data from API
│
├─ Tab State (activeTab)
│  └─ Control which config section is displayed
│
└─ Form State (react-hook-form for each section)
   ├─ Economy form state
   ├─ Ad form state
   ├─ Notification form state
   ├─ Booster form state
   └─ Shop form state
   
   Each form:
   ├─ useFieldArray for array fields (currencies, networks, etc.)
   ├─ Real-time validation via Zod schemas
   ├─ Error state per field
   └─ Individual section save/submit

Actions:
├─ Save Section: PATCH /api/v1/configs/{id} with section data
├─ Save Draft: Persist entire config state
└─ Submit for Review: POST /api/v1/configs/{id}/submit-review
```

### List Page Data Flow

```
┌─ Page Component (useConfigs hook)
│  └─ Query params: game_id, environment_id, status
│
├─ Filter State
│  ├─ selectedEnvironment
│  ├─ selectedStatus
│  └─ searchTerm
│
└─ Configs Query
   ├─ GET /api/v1/configs with filters
   ├─ Cached and refetched on filter change
   └─ Display in table

Actions:
├─ Create: POST /api/v1/configs
├─ View: Navigate to /configs/{id}
├─ Edit: Navigate to /configs/{id}/edit
└─ Deploy: POST /api/v1/configs/{id}/deploy
```

---

## Validation Schemas (Zod)

### Existing Schemas
- ✅ `economyConfigSchema` - In place
- ✅ `adConfigSchema` [TODO: Create]
- ✅ `notificationConfigSchema` [TODO: Create]
- ✅ `boosterConfigSchema` [TODO: Create]
- ✅ `shopConfigSchema` [TODO: Create]

**Location:** `src/lib/validations/`

**Schema Characteristics:**
- Type-safe with Zod inference
- Cross-field validation (e.g., referenced IDs exist)
- Error messages for UI display
- Exported types for component props

---

## UI/UX Best Practices

### 1. Form Input Pattern

```typescript
// Field wrapper with consistent styling
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label Text *</FormLabel>
      <FormControl>
        <Input placeholder="..." {...field} />
      </FormControl>
      <FormMessage /> {/* Validation errors */}
    </FormItem>
  )}
/>
```

### 2. Collapsible Item Pattern

```typescript
// View mode: compact summary
if (!isEditing) {
  return (
    <div className="flex justify-between items-center">
      <div>{/* Summary content */}</div>
      <div className="flex gap-2">
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
        <Button onClick={() => remove(index)}>Delete</Button>
      </div>
    </div>
  );
}

// Edit mode: full form
return (
  <div>{/* Form fields */}</div>
);
```

### 3. Array Item Management

```typescript
// Use useFieldArray for CRUD on arrays
const { fields, append, remove, update } = useFieldArray({
  control: form.control,
  name: 'arrayFieldName',
});

// Map over fields to render items
fields.map((field, index) => (
  <CollapsibleItem key={field.id} index={index} />
));
```

### 4. Conditional Field Visibility

```typescript
// Show fields only if certain conditions met
{selectedType === 'duration' && (
  <FormField
    control={form.control}
    name="duration_seconds"
    render={({ field }) => /* ... */}
  />
)}
```

---

## Loading & Error States

### Skeleton Loading (List Page)

```typescript
if (isLoading) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4" />
      <div className="h-64 bg-muted rounded" />
    </div>
  );
}
```

### Empty State

```typescript
if (data.length === 0) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      No configurations found
    </div>
  );
}
```

### Error Boundary

```typescript
<ErrorBoundary>
  {/* Component content */}
</ErrorBoundary>
```

---

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Single column layout
  - Full-width forms
  - Stacked buttons
  - Simplified table (horizontal scroll)

- **Tablet**: 768px - 1024px
  - Two column layouts
  - Side-by-side forms
  - Grid adjustments

- **Desktop**: > 1024px
  - Full grid layouts
  - Optimal spacing
  - All features visible

### Tailwind Classes Used

```
grid-cols-1 md:grid-cols-2 lg:grid-cols-3  /* Responsive grids */
w-full md:w-auto                           /* Responsive widths */
flex flex-col md:flex-row                  /* Responsive flex */
text-sm md:text-base lg:text-lg            /* Responsive text */
```

---

## Implementation Priority

### Phase 1 (MVP - Core)
- ✅ Config List Page
- ✅ Economy Config Form (partially done)
- ✅ Config Detail Page
- ✅ Basic workflow (Draft → Review → Approve → Deploy)

### Phase 2 (Tier 1)
- 🔄 Ad Config Form [IN PROGRESS]
- 🔄 Notification Config Form [IN PROGRESS]
- JSON diff viewer for config comparisons
- Audit trail display
- Version history timeline

### Phase 3 (Tier 2)
- Booster Config Form
- Shop Config Form
- Config templates/presets
- Bulk operations (deploy multiple configs)
- Export/import configs

### Phase 4 (Tier 3)
- Config search and advanced filtering
- A/B testing configuration
- Config analytics dashboard
- Mobile app for approvals
- Slack/Discord notifications

---

## Testing Strategy

### Unit Tests

```typescript
// Form component tests
- renders all fields correctly
- validates required fields
- shows error messages
- calls onSubmit with correct data
- handles array add/remove operations
```

### Integration Tests

```typescript
// Page tests
- displays configs from API
- filters work correctly
- create config flow
- edit config flow
- submit for review flow
```

### E2E Tests (Cypress)

```typescript
// User workflows
- User can create and edit economy config
- User can submit config for review
- User can approve and deploy config
- Multiple config versions maintained
```

---

## API Integration Points

### Endpoints Used

```
GET    /api/v1/configs?game_id={id}&environment_id={id}&status={status}
GET    /api/v1/configs/{config_id}
POST   /api/v1/configs
PATCH  /api/v1/configs/{config_id}
POST   /api/v1/configs/{config_id}/submit-review
POST   /api/v1/configs/{config_id}/approve
POST   /api/v1/configs/{config_id}/deploy
```

### Hooks Created

- `useConfigs()` - List configs with filters
- `useConfig()` - Get single config
- `useCreateConfig()` - Create new config
- `useUpdateConfig()` - Update config
- `useSubmitForReview()` - Submit for review
- `useApproveConfig()` - Approve config
- `useDeployConfig()` - Deploy to Firebase

---

## Accessibility (a11y)

### WCAG 2.1 AA Compliance

- ✅ Semantic HTML (form, fieldset, legend)
- ✅ ARIA labels for icon-only buttons
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management (focus trap in modals)
- ✅ Color not only indicator
- ✅ Sufficient contrast ratios
- ✅ Error messages linked to fields

### Implementation

```typescript
// Icon-only button needs aria-label
<Button
  variant="ghost"
  size="sm"
  onClick={() => edit(index)}
  aria-label="Edit item"
>
  <Edit className="h-4 w-4" />
</Button>

// Form field with proper labeling
<FormLabel htmlFor="fieldId">Label</FormLabel>
<Input id="fieldId" />
```

---


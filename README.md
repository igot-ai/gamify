# Sunstudio Configuration Management Portal

## Executive Summary

As a game development company managing multiple live titles, Sunstudio's success relies on rapid iteration, controlled feature rollouts, and data-driven optimization. This portal serves as the centralized command center for managing game configurations, enabling our teams to confidently deploy features, test variations, and optimize player experiences without engineering bottlenecks.

## Business Context

### The Challenge

Modern mobile game development requires:
- **Rapid Iteration**: Launch features without app store releases
- **Risk Mitigation**: Test changes with subset of users before full rollout
- **Cross-Game Efficiency**: Manage multiple titles with consistent workflows
- **Data-Driven Decisions**: A/B test configurations to optimize metrics
- **Operational Safety**: Control who can change what, with full audit trails

Currently, configuration management is fragmented across Notion documents, Firebase console, and manual processes. This creates:
- ❌ High risk of production errors from manual Firebase console edits
- ❌ Slow feature rollouts requiring developer intervention
- ❌ Limited visibility into who changed what and when
- ❌ Difficult A/B testing setup and management
- ❌ No standardized workflow across different games

### The Solution

A unified configuration management portal that provides:
- ✅ **Single Source of Truth**: All game configs in one place
- ✅ **Safe Deployments**: Review, approve, and rollback workflows
- ✅ **A/B Testing Built-In**: Create experiments with a few clicks
- ✅ **Firebase Sync**: Automatic two-way sync with Firebase Remote Config
- ✅ **Audit & Compliance**: Full history of all changes
- ✅ **Multi-Game Support**: Scale across all Sunstudio titles

## Configuration Architecture

Based on our current Notion-based system, we manage the following configuration domains:

### 1. **Game Core Configuration**
Fundamental game mechanics and behavior settings:
- Game version and build information
- Feature flags (enable/disable features remotely)
- Gameplay parameters (speeds, timers, difficulty curves)
- Debug settings and development tools

### 2. **Economy Configuration**
Player progression and monetization balance:
- Currency systems (soft/hard currency)
- Pricing and IAP configurations
- Reward tables and drop rates
- Daily bonuses and progression rewards
- Shop bundles and special offers
- Resource generation rates

### 3. **Advertising Configuration**
Ad placement and monetization optimization:
- Ad network priorities and waterfalls
- Placement settings (interstitial, rewarded, banner)
- Frequency caps and cooldowns
- Ad eligibility rules
- Remove ads IAP configuration

### 4. **Notification Configuration**
Player retention through push notifications:
- Notification schedules and triggers
- Message templates and localization
- Notification channels and priorities
- Time zone handling
- Permission prompting strategy

### 5. **Analytics Configuration**
Event tracking and data collection:
- Analytics provider settings
- Custom event definitions
- User property tracking
- Conversion funnel definitions

### 6. **User Experience Configuration**
Polish and player comfort features:
- Haptic feedback settings
- Audio/music preferences
- Tutorial flows
- Onboarding experiences
- UI/UX variations

### 7. **Content Configuration**
Dynamic content and assets:
- Level packs and bundles
- Seasonal events
- Limited-time offers
- Asset bundle references

## Core Features

### 1. Configuration Management

#### Multi-Game Support
```yaml
Project Structure:
├── Game A
│   ├── Production
│   ├── Staging
│   └── Development
├── Game B
│   ├── Production
│   ├── Staging
│   └── Development
```

Each game has independent configurations across environments, with shared templates for common patterns.

#### Version Control
- Full history of all configuration changes
- Diff view between versions
- Rollback to any previous version
- Tag important releases

#### Schema Validation
- Type-safe configuration editing
- Required field validation
- Range checks for numerical values
- Relationship validation (e.g., economy balance checks)

### 2. Firebase Remote Config Integration

#### Bidirectional Sync
- **Import**: Pull current Firebase configs into portal
- **Export**: Push portal configs to Firebase
- **Conflict Resolution**: Detect and handle external changes
- **Batch Operations**: Update multiple parameters atomically

#### Environment Management
- Production, Staging, Development environments
- Environment-specific overrides
- Promotion workflows (Dev → Staging → Prod)

#### Real-time Updates
- Monitor Firebase config changes
- Notify team of external modifications
- Automatic sync scheduling

### 3. A/B Testing & Experiments

#### Experiment Creation Workflow
```
1. Define Test
   - Experiment name and hypothesis
   - Target metrics and goals
   - Duration and sample size

2. Configure Variants
   - Control group (baseline)
   - Treatment groups (variations)
   - Parameter overrides per variant

3. Set Targeting Rules
   - User segments (new vs. returning, country, platform)
   - Traffic allocation (e.g., 50/50 split)
   - Exclusion criteria

4. Review & Launch
   - Preview changes
   - Get stakeholder approval
   - Schedule start/end dates

5. Monitor & Analyze
   - Real-time metrics dashboard
   - Statistical significance tracking
   - Declare winner or rollback
```

#### Advanced Targeting
- User property-based segmentation
- Geographic targeting
- Platform/version targeting
- Custom audience rules

#### Gradual Rollouts
- Canary releases (1% → 10% → 50% → 100%)
- Automatic rollback on error rate increase
- Feature flags with percentage-based rollout

### 4. Release Management

#### Approval Workflows
```
Draft → Review → Approved → Scheduled → Deployed → Live
```

**Role-Based Permissions:**
- **Game Designer**: Create and edit configs (Draft)
- **Lead Designer**: Review and approve configs
- **Product Manager**: Schedule releases
- **Admin**: Emergency rollback and system settings

#### Scheduled Releases
- Time-based releases (e.g., launch at 00:00 UTC)
- Event-triggered releases (e.g., after server maintenance)
- Batch multiple changes into single release

#### Safety Mechanisms
- **Review Period**: Mandatory review before production
- **Dry Run**: Test sync without applying changes
- **Automatic Rollback**: Revert if error metrics spike
- **Emergency Stop**: Instant rollback capability

### 5. Multi-Tenant Architecture

#### Game Isolation
- Separate databases per game or shared with namespacing
- Independent permission models
- Game-specific templates and schemas

#### Cross-Game Features
- Shared configuration templates
- Reusable experiment patterns
- Organization-wide analytics

## Technical Architecture

### Recommended Tech Stack

#### Frontend
- **Framework**: React 18 + TypeScript + Vite
  - Fast development with HMR (Hot Module Replacement)
  - Optimized production builds
  - Modern tooling
- **UI Components**: shadcn/ui + Radix UI
  - Accessible, customizable components
  - Consistent design system
- **State Management**: TanStack Query (React Query)
  - Server state synchronization
  - Optimistic updates
  - Automatic caching
- **Forms**: React Hook Form + Zod
  - Type-safe validation
  - Great developer experience

#### Backend
- **Framework**: FastAPI (Python 3.11+)
  - **TDD Excellence**: pytest is the gold standard for Python testing
  - **Type Safety**: Pydantic models provide runtime validation + IDE support
  - **Auto Documentation**: Built-in OpenAPI/Swagger
  - **Async Support**: Modern async/await for better performance
  - **Engineer-Friendly**: Python is widely known, great tooling, easy debugging
- **Database**: PostgreSQL
  - JSONB for flexible config storage
  - Strong relational queries for audit logs
- **ORM**: SQLAlchemy 2.0
  - Async support
  - Flexible and powerful

#### Infrastructure
- **Firebase Admin SDK**: Remote Config management (Python SDK)
- **Authentication**: Firebase Auth + JWT
  - SSO support for team members
  - Role-based access control
- **Hosting**: 
  - Backend: Cloud Run, Railway, or any Python ASGI host
  - Frontend: Vercel or Netlify
  - Auto-scaling
  - Global CDN
- **CI/CD**: GitHub Actions
  - Automated pytest testing and deployment
  - Code coverage reporting

### Data Model

```python
# Configuration Schema (Pydantic)
from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel

class ConfigStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    DEPLOYED = "deployed"
    ARCHIVED = "archived"

class Environment(str, Enum):
    PRODUCTION = "production"
    STAGING = "staging"
    DEVELOPMENT = "development"

class GameConfig(BaseModel):
    id: str
    game_id: str
    environment: Environment
    version: int
    status: ConfigStatus
    
    # Configuration sections (JSONB in database)
    game_config: Optional[dict] = None
    economy_config: Optional[dict] = None
    ad_config: Optional[dict] = None
    notification_config: Optional[dict] = None
    analytics_config: Optional[dict] = None
    ux_config: Optional[dict] = None
    
    # Metadata
    created_by: str
    created_at: datetime
    updated_by: Optional[str] = None
    updated_at: datetime
    reviewed_by: Optional[str] = None
    approved_by: Optional[str] = None
    deployed_at: Optional[datetime] = None

# A/B Test Schema
class ExperimentStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"

class ExperimentVariant(BaseModel):
    id: str
    name: str
    description: str
    traffic_percent: int
    config_overrides: dict

class Experiment(BaseModel):
    id: str
    game_id: str
    name: str
    hypothesis: str
    status: ExperimentStatus
    
    variants: list[ExperimentVariant]
    targeting: dict  # User segments, countries, platforms
    schedule: dict   # Start/end dates
    metrics: dict    # Primary/secondary metrics
    
    created_by: str
    created_at: datetime

# Audit Log Schema
class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    ROLLBACK = "rollback"
    DEPLOY = "deploy"

class AuditLog(BaseModel):
    id: str
    game_id: str
    action: AuditAction
    entity_type: str  # config, experiment, release
    entity_id: str
    changes: dict     # JSON diff
    user_id: str
    user_email: str
    timestamp: datetime
    metadata: dict    # IP, user agent, reason
```

### Security Considerations

1. **Authentication & Authorization**
   - OAuth 2.0 / OIDC for team SSO
   - Row-level security for multi-game tenancy
   - API key management for programmatic access

2. **Audit Logging**
   - Immutable audit trail
   - Who, what, when, why for every change
   - Retention policies for compliance

3. **Data Protection**
   - Encryption at rest and in transit
   - Secrets management (Firebase credentials, API keys)
   - Regular security audits

4. **Rate Limiting**
   - API rate limits per user/game
   - Firebase quota management
   - DDoS protection

## Development Roadmap

### Phase 1: MVP (4-6 weeks)
**Goal**: Replace manual Notion → Firebase workflow

- [ ] User authentication (Firebase Auth)
- [ ] Basic config CRUD for one game
- [ ] Firebase Remote Config sync (read/write)
- [ ] Simple approval workflow (draft → review → deploy)
- [ ] Audit logging
- [ ] Single environment (production)

**Success Criteria**: Product team can edit and deploy configs without engineering help

### Phase 2: A/B Testing (3-4 weeks)
**Goal**: Enable data-driven experimentation

- [ ] Experiment creation and management
- [ ] Variant configuration
- [ ] User segmentation and targeting
- [ ] Firebase Conditions integration
- [ ] Basic analytics dashboard

**Success Criteria**: Run first A/B test end-to-end through portal

### Phase 3: Multi-Game & Environments (2-3 weeks)
**Goal**: Scale to all Sunstudio games

- [ ] Multi-tenant architecture
- [ ] Environment management (dev/staging/prod)
- [ ] Configuration templates
- [ ] Bulk operations
- [ ] Advanced permissions

**Success Criteria**: All games migrated to portal

### Phase 4: Advanced Features (4-6 weeks)
**Goal**: Production-grade operations

- [ ] Scheduled releases
- [ ] Gradual rollouts with automatic rollback
- [ ] Configuration diffing and comparison
- [ ] Advanced analytics integration
- [ ] Notification system for events
- [ ] API for programmatic access

**Success Criteria**: Zero-downtime releases with full observability

### Phase 5: Optimization (Ongoing)
- [ ] Performance optimization
- [ ] Enhanced UI/UX based on feedback
- [ ] Advanced A/B testing features (multi-variate, sequential testing)
- [ ] Integration with BI tools
- [ ] Mobile app for approvals

## Success Metrics

### Operational Efficiency
- **Time to Deploy**: < 5 minutes (from approval to live)
- **Config Change Frequency**: Enable daily iterations
- **Error Rate**: < 0.1% of deployments cause issues
- **Team Autonomy**: 90% of config changes need no engineering help

### Product Velocity
- **Experiment Throughput**: 5+ concurrent A/B tests per game
- **Feature Flag Usage**: 20+ active flags per game
- **Rollback Time**: < 2 minutes for emergency revert

### Business Impact
- **Revenue Optimization**: 5-10% lift from A/B tested economy changes
- **Retention**: Improved D1/D7 retention from notification optimization
- **Ad Revenue**: 10-15% increase from ad placement experiments

## Team & Responsibilities

### Development Team
- **Full-Stack Engineers** (2-3): Portal development
- **DevOps Engineer** (1): Infrastructure, CI/CD, Firebase setup
- **QA Engineer** (1): Test automation, release validation

### Stakeholders
- **Product Managers**: Define requirements, prioritize features
- **Game Designers**: Primary users, provide feedback
- **Data Analysts**: A/B test design, metrics tracking
- **Engineering Leadership**: Architecture review, resource allocation

## Getting Started

### For Developers
```bash
# Clone repository
git clone https://github.com/sunstudio/gamify-config.git
cd gamify-config

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with Firebase credentials

# Run development server
npm run dev

# Run tests
npm test
```

### For Game Teams
1. **Access Portal**: Navigate to `https://config.sunstudio.com`
2. **Select Your Game**: Choose from game dropdown
3. **Edit Configuration**: Modify values in relevant sections
4. **Submit for Review**: Click "Submit for Review"
5. **Monitor Status**: Track approval and deployment progress
6. **Verify in Game**: Test changes in your game client

### Configuration Best Practices

1. **Use Feature Flags for Risky Changes**
   - Wrap new features in flags
   - Test internally before public rollout

2. **A/B Test Before Full Rollout**
   - Test economy changes with 10% of users first
   - Validate metrics before 100% rollout

3. **Document Changes**
   - Add clear descriptions to config changes
   - Reference Jira tickets or design docs

4. **Test in Staging First**
   - Always verify in staging environment
   - Use dev builds to test locally

5. **Monitor After Deployment**
   - Watch error rates and key metrics
   - Be ready to rollback if issues arise

## Support & Documentation

- **User Guide**: [Link to detailed user guide]
- **API Documentation**: [Link to API docs]
- **Video Tutorials**: [Link to video library]
- **Slack Channel**: #config-portal-support
- **Emergency Contact**: [On-call rotation]

## Appendix

### Configuration Examples

See screenshots in `/Config screenshot 1/` for reference implementations:
- [Full config 1.png](Config%20screenshot%201/Full%20config%201.png) - Complete configuration structure
- [Economy config 1.png](Config%20screenshot%201/Economy%20config%201.png) - Currency and reward systems
- [Ad config 1.png](Config%20screenshot%201/Ad%20config%201.png) - Advertisement settings
- [Notification config 1.png](Config%20screenshot%201/Notification%20config%201.png) - Push notification setup

### Related Resources
- [Firebase Remote Config Documentation](https://firebase.google.com/docs/remote-config)
- [A/B Testing Best Practices](https://firebase.google.com/docs/ab-testing)
- [Game Economy Design Patterns](https://www.gamedeveloper.com/design/economy-design)

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-25  
**Owner**: Engineering & Product Teams  
**Status**: Planning Phase

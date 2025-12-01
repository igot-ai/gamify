/**
 * Config Workflow E2E Tests
 * 
 * BDD Scenarios:
 * - Complete workflow: Draft → Deploy
 * - User can deploy draft configs to Firebase
 * - Workflow state transitions are enforced
 */

describe('Section Config Workflow', () => {
  beforeEach(() => {
    // Given: User is logged in
    cy.login('test@sunstudio.com', 'testpassword123');
  });

  describe('Feature: Complete Workflow Journey', () => {
    it('Scenario: User can complete full config workflow (draft → deploy)', () => {
      // Given: User creates a new section config
      cy.visit('/sections/economy');
      cy.contains('New Version').click();
      cy.url().should('include', '/edit');

      // When: User fills in config and saves
      cy.contains('Add Currency').click();
      cy.get('input[name*="currency.id"]').type('coins');
      cy.get('input[name*="currency.name"]').type('Coins');
      cy.get('select[name*="currency.type"]').select('soft');
      cy.get('input[name*="currency.starting_amount"]').type('1000');
      cy.contains('Save').click();

      // Then: Config is saved
      cy.contains(/saved/i).should('be.visible');

      // When: User deploys to Firebase
      cy.contains('Deploy').click();

      // Then: Config is deployed
      cy.contains(/deployed|success/i).should('be.visible');
      cy.contains('Deployed').should('be.visible');
    });
  });

  describe('Feature: Workflow State Enforcement', () => {
    it('Scenario: User cannot edit deployed configs', () => {
      // Given: A config is in "Deployed" status
      cy.visit('/sections/economy/deployed-config-id');

      // Then: Edit leads to view-only state
      cy.contains('Edit').should('not.exist');
    });

    it('Scenario: User cannot deploy already deployed configs', () => {
      // Given: A config is in "Deployed" status
      cy.visit('/sections/economy/deployed-config-id');

      // Then: Deploy button is not available
      cy.contains('Deploy').should('not.exist');
    });
  });

  describe('Feature: Section Independence', () => {
    it('Scenario: User can deploy sections independently', () => {
      // Given: User has different section configs
      // When: User deploys economy section
      cy.visit('/sections/economy');
      cy.get('table tbody tr').first().find('button[aria-label*="Deploy"]').click();

      // Then: Only economy section is deployed, other sections unaffected
      cy.visit('/sections/ads');
      // Ads section should still be in its own state
      cy.get('table tbody tr').should('exist');
    });
  });
});

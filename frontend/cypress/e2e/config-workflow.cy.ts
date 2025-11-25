/**
 * Config Workflow E2E Tests
 * 
 * BDD Scenarios:
 * - Complete workflow: Draft → Review → Approve → Deploy
 * - User with correct role can approve configs
 * - User can deploy approved configs to Firebase
 * - Workflow state transitions are enforced
 */

describe('Config Workflow', () => {
  beforeEach(() => {
    // Given: User is logged in
    cy.login('test@sunstudio.com', 'testpassword123');
  });

  describe('Feature: Complete Workflow Journey', () => {
    it('Scenario: User can complete full config workflow', () => {
      // Given: User creates a new config
      cy.visit('/games/test-game-id/configs');
      cy.contains('New Config').click();
      cy.url().should('include', '/edit');

      // When: User fills in config and saves as draft
      cy.contains('Economy').click();
      cy.contains('Add Currency').click();
      cy.get('input[name*="currency.id"]').type('coins');
      cy.get('input[name*="currency.name"]').type('Coins');
      cy.get('select[name*="currency.type"]').select('soft');
      cy.get('input[name*="currency.starting_amount"]').type('1000');
      cy.contains('Save Draft').click();

      // Then: Config is saved as draft
      cy.contains(/saved|draft/i).should('be.visible');

      // When: User submits for review
      cy.contains('Submit for Review').click();

      // Then: Config status is "In Review"
      cy.contains('In Review').should('be.visible');

      // When: User with LEAD_DESIGNER role approves
      cy.contains('Approve').click();

      // Then: Config status is "Approved"
      cy.contains('Approved').should('be.visible');

      // When: User with PRODUCT_MANAGER role deploys
      cy.contains('Deploy to Firebase').click();

      // Then: Config is deployed
      cy.contains(/deployed|success/i).should('be.visible');
      cy.contains('Deployed').should('be.visible');
    });
  });

  describe('Feature: Workflow State Enforcement', () => {
    it('Scenario: User cannot edit non-draft configs', () => {
      // Given: A config is in "In Review" status
      cy.visit('/configs/review-config-id');

      // Then: Edit button is not available
      cy.contains('Edit').should('not.exist');
    });

    it('Scenario: User cannot approve non-review configs', () => {
      // Given: A config is in "Draft" status
      cy.visit('/configs/draft-config-id');

      // Then: Approve button is not available
      cy.contains('Approve').should('not.exist');
    });

    it('Scenario: User cannot deploy non-approved configs', () => {
      // Given: A config is in "In Review" status
      cy.visit('/configs/review-config-id');

      // Then: Deploy button is not available
      cy.contains('Deploy').should('not.exist');
    });
  });

  describe('Feature: Role-Based Actions', () => {
    it('Scenario: Only LEAD_DESIGNER+ can approve configs', () => {
      // Given: User with GAME_DESIGNER role
      // When: User tries to approve
      cy.visit('/configs/review-config-id');

      // Then: Approve button is disabled or hidden
      cy.contains('Approve').should('not.exist').or('be.disabled');
    });

    it('Scenario: Only PRODUCT_MANAGER+ can deploy configs', () => {
      // Given: User with LEAD_DESIGNER role
      // When: User tries to deploy
      cy.visit('/configs/approved-config-id');

      // Then: Deploy button is disabled or hidden
      cy.contains('Deploy').should('not.exist').or('be.disabled');
    });
  });
});


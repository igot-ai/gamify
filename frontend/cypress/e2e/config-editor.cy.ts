/**
 * Section Config Editor Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can edit Economy config section
 * - User can edit Ad config section
 * - User can edit Notification config section
 * - User can save config
 * - User can deploy config directly
 * - Form validation prevents invalid data
 */

describe('Section Config Editor Page', () => {
  beforeEach(() => {
    // Given: User is logged in and editing a section config
    cy.login('test@sunstudio.com', 'testpassword123');
    cy.visit('/sections/economy/test-config-id/edit');
  });

  describe('Feature: Economy Config Editing', () => {
    it('Scenario: User can add a new currency', () => {
      // Given: User is on Economy config editor
      // When: User clicks "Add Currency" button
      cy.contains('Add Currency').click();

      // Then: Currency form appears
      cy.get('input[name*="currency"]').should('be.visible');

      // When: User fills in currency details
      cy.get('input[name*="currency.id"]').type('gems');
      cy.get('input[name*="currency.name"]').type('Gems');
      cy.get('select[name*="currency.type"]').select('hard');
      cy.get('input[name*="currency.starting_amount"]').type('100');

      // Then: Currency is added to list
      cy.contains('gems').should('be.visible');
    });

    it('Scenario: User can edit existing currency', () => {
      // Given: A currency exists in the config
      // When: User clicks edit on currency
      cy.get('[data-testid="currency-item"]').first().find('button[aria-label*="Edit"]').click();

      // Then: Currency form opens with existing data
      cy.get('input[name*="currency.name"]').should('have.value');

      // When: User updates currency and saves
      cy.get('input[name*="currency.starting_amount"]').clear().type('200');
      cy.contains('Save').click();

      // Then: Currency is updated
      cy.contains('200').should('be.visible');
    });

    it('Scenario: Form validation prevents invalid currency data', () => {
      // Given: User is adding a currency
      cy.contains('Add Currency').click();

      // When: User tries to save with invalid data
      cy.get('input[name*="currency.id"]').type(''); // Empty ID
      cy.get('input[name*="currency.starting_amount"]').type('-100'); // Negative amount
      cy.contains('Save').click();

      // Then: Validation errors are shown
      cy.contains(/required|invalid|must be positive/i).should('be.visible');
    });
  });

  describe('Feature: Ad Config Editing', () => {
    beforeEach(() => {
      cy.visit('/sections/ads/test-config-id/edit');
    });

    it('Scenario: User can configure ad networks', () => {
      // Given: User is on Ad Config editor
      // When: User adds an ad network
      cy.contains('Add Network').click();
      cy.get('input[name*="network.name"]').type('AdMob');
      cy.get('input[name*="network.priority"]').type('1');
      cy.get('input[name*="network.enabled"]').check();

      // Then: Network is added
      cy.contains('AdMob').should('be.visible');
    });
  });

  describe('Feature: Notification Config Editing', () => {
    beforeEach(() => {
      cy.visit('/sections/notification/test-config-id/edit');
    });

    it('Scenario: User can configure notification strategies', () => {
      // Given: User is on Notification Config editor
      // When: User adds a notification strategy
      cy.contains('Add Strategy').click();
      cy.get('input[name*="strategy.name"]').type('Daily Reminder');
      cy.get('select[name*="strategy.channel"]').select('push');

      // Then: Strategy is added
      cy.contains('Daily Reminder').should('be.visible');
    });
  });

  describe('Feature: Save and Deploy', () => {
    it('Scenario: User can save config', () => {
      // Given: User has made changes
      cy.contains('Add Currency').click();
      cy.get('input[name*="currency.id"]').type('coins');
      cy.get('input[name*="currency.name"]').type('Coins');
      cy.get('select[name*="currency.type"]').select('soft');
      cy.get('input[name*="currency.starting_amount"]').type('1000');

      // When: User clicks "Save"
      cy.contains('Save').click();

      // Then: Config is saved and success message appears
      cy.contains(/saved/i).should('be.visible');
    });

    it('Scenario: User can deploy config directly', () => {
      // Given: User has completed config
      // When: User clicks "Deploy"
      cy.contains('Deploy').click();

      // Then: Config is deployed
      cy.contains(/deployed|success/i).should('be.visible');
      cy.url().should('not.include', '/edit'); // Redirected to detail view
    });
  });

});

/**
 * Configurations Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can view configs list for a game
 * - User can filter configs by environment and status
 * - User can create a new config
 * - User can navigate to config detail/editor
 */

describe('Configurations Page', () => {
  beforeEach(() => {
    // Given: User is logged in and has a game
    cy.login('test@sunstudio.com', 'testpassword123');
    // Assuming game with ID exists - in real test, create one first
    cy.visit('/games/test-game-id/configs');
  });

  describe('Feature: Config List Display', () => {
    it('Scenario: User can view list of configs for a game', () => {
      // Given: User is on configs page
      // When: Page loads
      // Then: Configs table is displayed
      cy.contains('Configurations').should('be.visible');
      cy.get('table').should('be.visible');
    });

    it('Scenario: Configs table displays correct information', () => {
      // Given: Configs exist
      // Then: Table shows version, status, created date, and actions
      cy.contains('Version').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Created').should('be.visible');
      cy.contains('Created By').should('be.visible');
    });
  });

  describe('Feature: Filter Configs', () => {
    it('Scenario: User can filter configs by environment', () => {
      // Given: User is on configs page
      // When: User selects an environment
      cy.get('select').first().select('production');

      // Then: Only configs for that environment are shown
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });

    it('Scenario: User can filter configs by status', () => {
      // Given: User is on configs page
      // When: User selects a status filter
      cy.contains('Status').parent().find('select').select('draft');

      // Then: Only configs with that status are shown
      cy.get('[data-status="draft"]').should('exist');
    });
  });

  describe('Feature: Create Config', () => {
    it('Scenario: User can create a new config', () => {
      // Given: User has selected game and environment
      cy.get('select').first().select('production');

      // When: User clicks "New Config" button
      cy.contains('New Config').click();

      // Then: User is redirected to config editor
      cy.url().should('include', '/configs/');
      cy.url().should('include', '/edit');
    });

    it('Scenario: User cannot create config without selecting environment', () => {
      // Given: No environment is selected
      // When: User tries to click "New Config"
      // Then: Button is disabled
      cy.contains('New Config').should('be.disabled');
    });
  });

  describe('Feature: Config Actions', () => {
    it('Scenario: User can view config details', () => {
      // Given: A config exists
      // When: User clicks view button
      cy.get('button[aria-label*="View"]').first().click();

      // Then: User is navigated to config detail page
      cy.url().should('include', '/configs/');
      cy.url().should('not.include', '/edit');
    });

    it('Scenario: User can edit draft configs', () => {
      // Given: A draft config exists
      // When: User clicks edit button
      cy.get('[data-status="draft"]').first().find('button[aria-label*="Edit"]').click();

      // Then: User is navigated to config editor
      cy.url().should('include', '/edit');
    });

    it('Scenario: User can deploy approved configs', () => {
      // Given: An approved config exists
      // When: User clicks deploy button
      cy.get('[data-status="approved"]').first().find('button[aria-label*="Deploy"]').click();

      // Then: Config is deployed and status changes
      cy.contains('Config deployed to Firebase').should('be.visible');
    });
  });
});


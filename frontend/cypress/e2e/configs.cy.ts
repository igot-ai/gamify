/**
 * Section Configurations Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can view section config versions list
 * - User can filter configs by status
 * - User can create a new config version
 * - User can navigate to config detail/editor
 */

describe('Section Configurations Page', () => {
  beforeEach(() => {
    // Given: User is logged in and has a game selected
    cy.login('test@sunstudio.com', 'testpassword123');
    // Navigate to a section page
    cy.visit('/sections/economy');
  });

  describe('Feature: Section Config List Display', () => {
    it('Scenario: User can view list of config versions for a section', () => {
      // Given: User is on section configs page
      // When: Page loads
      // Then: Configs table is displayed
      cy.contains('Economy').should('be.visible');
      cy.get('table').should('be.visible');
    });

    it('Scenario: Configs table displays correct information', () => {
      // Given: Configs exist
      // Then: Table shows version, status, created date, and actions
      cy.contains('Version').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Created').should('be.visible');
    });
  });

  describe('Feature: Filter Configs', () => {
    it('Scenario: User can filter configs by status', () => {
      // Given: User is on section configs page
      // When: User selects a status filter
      cy.get('select').select('draft');

      // Then: Only configs with that status are shown
      cy.get('[data-status="draft"]').should('exist');
    });
  });

  describe('Feature: Create Config Version', () => {
    it('Scenario: User can create a new config version', () => {
      // Given: User is on section page
      // When: User clicks "New Version" button
      cy.contains('New Version').click();

      // Then: User is redirected to config editor
      cy.url().should('include', '/sections/economy/');
      cy.url().should('include', '/edit');
    });
  });

  describe('Feature: Config Actions', () => {
    it('Scenario: User can view config details', () => {
      // Given: A config exists
      // When: User clicks view button
      cy.get('button[aria-label*="View"]').first().click();

      // Then: User is navigated to config detail page
      cy.url().should('include', '/sections/economy/');
      cy.url().should('not.include', '/edit');
    });

    it('Scenario: User can edit draft configs', () => {
      // Given: A draft config exists
      // When: User clicks edit button
      cy.get('[data-status="draft"]').first().find('button[aria-label*="Edit"]').click();

      // Then: User is navigated to config editor
      cy.url().should('include', '/edit');
    });

    it('Scenario: User can deploy draft configs directly', () => {
      // Given: A draft config exists
      // When: User clicks deploy button
      cy.get('[data-status="draft"]').first().find('button[aria-label*="Deploy"]').click();

      // Then: Config is deployed and status changes
      cy.contains('Deployed to Firebase').should('be.visible');
    });
  });
});

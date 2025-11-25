/**
 * Dashboard Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can view dashboard after login
 * - Dashboard displays game cards
 * - User can navigate to games page
 * - Dashboard shows empty state when no games exist
 */

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Given: User is logged in
    cy.intercept('GET', '**/api/v1/games').as('getGames');
    cy.login('test@sunstudio.com', 'testpassword123');
    cy.visit('/');
    cy.wait('@getGames');
  });

  describe('Feature: Dashboard Display', () => {
    it('Scenario: User can view dashboard after login', () => {
      // Given: User is logged in
      // When: User navigates to dashboard
      cy.visit('/');

      // Then: Dashboard is displayed
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Manage configurations for all your games').should('be.visible');
    });

    it('Scenario: Dashboard displays game statistics', () => {
      // Given: User is on dashboard
      // Then: Statistics cards are visible
      cy.contains('Games').should('be.visible');
      cy.contains('Configurations').should('be.visible');
    });

    it('Scenario: Dashboard shows empty state when no games exist', () => {
      // Given: No games exist in the system
      // When: User views dashboard
      // Then: Empty state message is displayed
      cy.contains(/no games|create your first game/i).should('be.visible');
    });
  });

  describe('Feature: Navigation', () => {
    it('Scenario: User can navigate to Games page from dashboard', () => {
      // Given: User is on dashboard
      // When: User clicks on Games card or navigation
      cy.contains('Games').click();

      // Then: User is navigated to Games page
      cy.url().should('include', '/games');
    });

    it('Scenario: User can navigate to game configs from game card', () => {
      // Given: At least one game exists
      // When: User clicks on a game card
      cy.get('[data-testid="game-card"]').first().click();

      // Then: User is navigated to game configs page
      cy.url().should('include', '/configs');
    });
  });

  describe('Feature: Game Cards', () => {
    it('Scenario: Game cards display correct information', () => {
      // Given: Games exist in the system
      // When: User views dashboard
      // Then: Game cards show name, description, and environment count
      cy.get('[data-testid="game-card"]').should('be.visible');
      // Note: This will need data-testid attributes added to components
    });
  });
});


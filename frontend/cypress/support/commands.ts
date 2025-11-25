/// <reference types="cypress" />

// BDD-style helper commands

/**
 * Login a user with email and password
 * Given: User credentials
 * When: User submits login form
 * Then: User is authenticated and redirected
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to dashboard
  cy.url().should('not.include', '/login');
});

/**
 * Logout the current user
 * Given: User is logged in
 * When: User clicks logout
 * Then: User is logged out and redirected to login
 */
Cypress.Commands.add('logout', () => {
  cy.get('button[title="Logout"]').click();
  cy.url().should('include', '/login');
});

/**
 * Wait for API call to complete
 * Given: API endpoint
 * When: Request is made
 * Then: Response is received
 */
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Prevent TypeScript errors
export {};


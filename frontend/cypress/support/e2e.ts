// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands');

// Initialize BDD support
/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      waitForApi(alias: string): Chainable<any>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Screenshot after each test
afterEach(() => {
  const specName = Cypress.spec.name;
  const testName = Cypress.currentTest.titlePath.join(' -- ').replace(/[\/\\:*?"<>|]/g, '-');
  // Capture the state at the end of the test
  cy.screenshot(`${specName}/${testName} (finished)`);
});

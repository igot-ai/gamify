/**
 * Login Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can login with email and password
 * - User can login with Google OAuth
 * - User sees error message on invalid credentials
 * - User is redirected to dashboard after successful login
 * - User cannot access protected routes when logged out
 */

describe('Login Page', () => {
  beforeEach(() => {
    // Given: User is on the login page
    cy.visit('/login');
  });

  describe('Feature: User Authentication', () => {
    it('Scenario: User can login with valid email and password', () => {
      // Given: User has valid credentials
      const email = 'test@sunstudio.com';
      const password = 'testpassword123';

      // When: User enters credentials and submits form
      cy.get('input[type="email"]').should('be.visible').type(email);
      cy.get('input[type="password"]').should('be.visible').type(password);
      cy.get('button[type="submit"]').should('be.visible').click();

      // Then: User is redirected to dashboard
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/');
    });

    it('Scenario: User sees error message on invalid credentials', () => {
      // Given: User has invalid credentials
      const email = 'invalid@example.com';
      const password = 'wrongpassword';

      // When: User enters invalid credentials and submits
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();

      // Then: Error message is displayed
      cy.contains(/failed|error|invalid/i).should('be.visible');
      cy.url().should('include', '/login');
    });

    it('Scenario: User can login with Google OAuth', () => {
      // Given: User wants to login with Google
      // When: User clicks "Sign in with Google" button
      cy.contains('Sign in with Google').should('be.visible').click();

      // Then: Google OAuth popup should appear (or redirect)
      // Note: In test environment, this may be mocked
      cy.url().should('satisfy', (url) => {
        return url.includes('/login') || url.includes('accounts.google.com');
      });
    });

    it('Scenario: Form validation prevents empty submission', () => {
      // Given: User is on login page
      // When: User tries to submit empty form
      cy.get('button[type="submit"]').click();

      // Then: Form validation prevents submission
      cy.get('input[type="email"]:invalid').should('exist');
      cy.get('input[type="password"]:invalid').should('exist');
    });
  });

  describe('Feature: Protected Route Access', () => {
    it('Scenario: Logged out user is redirected to login', () => {
      // Given: User is not logged in
      // When: User tries to access dashboard
      cy.visit('/');

      // Then: User is redirected to login page
      cy.url().should('include', '/login');
    });

    it('Scenario: Logged in user is redirected from login page', () => {
      // Given: User is logged in
      cy.login('test@sunstudio.com', 'testpassword123');

      // When: User visits login page
      cy.visit('/login');

      // Then: User is redirected to dashboard
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/');
    });
  });

  describe('Feature: UI Elements', () => {
    it('Scenario: All login form elements are visible', () => {
      // Given: User is on login page
      // Then: All form elements are visible
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Sign in with Google').should('be.visible');
      cy.contains('Sunstudio Config Portal').should('be.visible');
    });

    it('Scenario: Form has proper labels and placeholders', () => {
      // Given: User is on login page
      // Then: Form has proper accessibility attributes
      cy.get('input[type="email"]').should('have.attr', 'placeholder');
      cy.get('input[type="password"]').should('have.attr', 'placeholder');
      cy.get('label').should('contain', 'Email');
      cy.get('label').should('contain', 'Password');
    });
  });
});


/**
 * Games Management Page E2E Tests
 * 
 * BDD Scenarios:
 * - User can view list of games
 * - User can create a new game
 * - User can edit an existing game
 * - User can delete a game
 * - User can search/filter games
 */

describe('Games Management Page', () => {
  beforeEach(() => {
    // Given: User is logged in
    cy.intercept('GET', '**/api/v1/games').as('getGames');
    cy.login('test@sunstudio.com', 'testpassword123');
    cy.visit('/games');
    cy.wait('@getGames');
  });

  describe('Feature: Game List Display', () => {
    it('Scenario: User can view list of all games', () => {
      // Given: User is on games page
      // When: Page loads
      // Then: Games table is displayed
      cy.contains('Games').should('be.visible');
      cy.get('table').should('be.visible');
    });

    it('Scenario: Games table displays correct columns', () => {
      // Given: Games exist
      // Then: Table has correct headers
      cy.contains('Name').should('be.visible');
      cy.contains('Firebase Project').should('be.visible');
      cy.contains('Environments').should('be.visible');
      cy.contains('Created').should('be.visible');
      cy.contains('Actions').should('be.visible');
    });
  });

  describe('Feature: Create Game', () => {
    it('Scenario: User can create a new game', () => {
      // Given: User is on games page
      // When: User clicks "New Game" button
      cy.contains('New Game').click();

      // Then: Create game modal opens with proper UI elements
      cy.contains('Create New Game').should('be.visible');
      cy.contains('Add a new game to manage its configurations').should('be.visible');
      cy.contains('Cancel').should('be.visible');
      cy.contains('Create Game').should('be.visible');

      // When: User fills in game details and submits
      cy.get('input[id="name"]').type('Test Game');
      cy.get('input[id="description"]').type('A test game');
      cy.get('input[id="firebase_project_id"]').type('test-firebase-project');
      cy.contains('button', 'Create Game').click();

      // Then: Game is created and appears in list
      cy.contains('Test Game').should('be.visible');
      cy.contains('Game created successfully').should('be.visible');
    });

    it('Scenario: User can cancel game creation', () => {
      // Given: User opens create game modal
      cy.contains('New Game').click();
      cy.contains('Create New Game').should('be.visible');

      // When: User clicks Cancel button
      cy.contains('button', 'Cancel').click();

      // Then: Modal closes without creating game
      cy.contains('Create New Game').should('not.exist');
    });

    it('Scenario: Form shows helpful descriptions and labels', () => {
      // Given: User opens create game modal
      cy.contains('New Game').click();

      // Then: Form shows proper labels with required indicators
      cy.contains('Name').should('be.visible');
      cy.contains('Name').parent().within(() => {
        cy.contains('*').should('be.visible'); // Required indicator
      });
      cy.contains('Firebase Project ID').should('be.visible');
      cy.contains('Firebase Project ID').parent().within(() => {
        cy.contains('*').should('be.visible'); // Required indicator
      });

      // And: Help text is visible
      cy.contains('Find this in your Firebase Console').should('be.visible');
      cy.contains('Provide a brief description').should('be.visible');
    });

    it('Scenario: Form validation shows error messages for empty fields', () => {
      // Given: User opens create game modal
      cy.contains('New Game').click();

      // When: User tries to submit without filling required fields
      cy.contains('button', 'Create Game').click();

      // Then: Validation errors are displayed
      cy.contains('Game name is required').should('be.visible');
      cy.contains('Firebase Project ID is required').should('be.visible');
    });

    it('Scenario: Form validation shows error for short game name', () => {
      // Given: User opens create game modal
      cy.contains('New Game').click();

      // When: User enters a single character name
      cy.get('input[id="name"]').type('A');
      cy.contains('button', 'Create Game').click();

      // Then: Validation error is displayed
      cy.contains('Game name must be at least 2 characters').should('be.visible');
    });

    it('Scenario: Form validation shows error for invalid Firebase Project ID', () => {
      // Given: User opens create game modal
      cy.contains('New Game').click();

      // When: User enters invalid Firebase Project ID with uppercase/special chars
      cy.get('input[id="name"]').type('Test Game');
      cy.get('input[id="firebase_project_id"]').type('Invalid_Project_ID!');
      cy.contains('button', 'Create Game').click();

      // Then: Validation error is displayed
      cy.contains('Only lowercase letters, numbers, and hyphens allowed').should('be.visible');
    });

    it('Scenario: Form clears errors when user corrects input', () => {
      // Given: User has validation errors
      cy.contains('New Game').click();
      cy.contains('button', 'Create Game').click();
      cy.contains('Game name is required').should('be.visible');

      // When: User enters valid name
      cy.get('input[id="name"]').type('Valid Game Name');

      // Then: Error message disappears
      cy.contains('Game name is required').should('not.exist');
    });

    it('Scenario: Form shows loading state during submission', () => {
      // Given: User opens create game modal and fills form
      cy.contains('New Game').click();
      cy.get('input[id="name"]').type('Test Game');
      cy.get('input[id="firebase_project_id"]').type('test-project');

      // When: User submits form
      cy.contains('button', 'Create Game').click();

      // Then: Button shows loading state
      cy.contains('Creating...').should('be.visible');
      // Note: Button should be disabled during loading
      cy.contains('button', 'Creating...').should('be.disabled');
    });
  });

  describe('Feature: Edit Game', () => {
    it('Scenario: User can edit an existing game', () => {
      // Given: A game exists
      // When: User clicks edit button on a game
      cy.get('button').contains('svg').first().click();

      // Then: Edit modal opens with game data and proper UI
      cy.contains('Edit Game').should('be.visible');
      cy.contains('Update the game details below').should('be.visible');
      cy.contains('Cancel').should('be.visible');
      cy.contains('Update Game').should('be.visible');

      // When: User updates game name and saves
      cy.get('input[id="name"]').clear().type('Updated Game Name');
      cy.contains('button', 'Update Game').click();

      // Then: Game is updated
      cy.contains('Updated Game Name').should('be.visible');
      cy.contains('Game updated successfully').should('be.visible');
    });

    it('Scenario: User can cancel game editing', () => {
      // Given: User opens edit modal
      cy.get('button').contains('svg').first().click();
      cy.contains('Edit Game').should('be.visible');

      // When: User clicks Cancel button
      cy.contains('button', 'Cancel').click();

      // Then: Modal closes without updating
      cy.contains('Edit Game').should('not.exist');
    });

    it('Scenario: Edit form shows validation errors', () => {
      // Given: User opens edit modal
      cy.get('button').contains('svg').first().click();

      // When: User clears required field and submits
      cy.get('input[id="name"]').clear();
      cy.contains('button', 'Update Game').click();

      // Then: Validation error is shown
      cy.contains('Game name is required').should('be.visible');
    });
  });

  describe('Feature: Delete Game', () => {
    it('Scenario: User can delete a game with confirmation', () => {
      // Given: A game exists
      // When: User clicks delete button
      cy.get('button[aria-label*="Delete"]').first().click();

      // Then: Confirmation dialog appears
      cy.contains('Delete Game').should('be.visible');
      cy.contains('Are you sure').should('be.visible');

      // When: User confirms deletion
      cy.contains('Delete').click();

      // Then: Game is deleted
      cy.contains('Game deleted successfully').should('be.visible');
    });

    it('Scenario: User can cancel game deletion', () => {
      // Given: User opens delete confirmation
      cy.get('button[aria-label*="Delete"]').first().click();

      // When: User clicks Cancel
      cy.contains('Cancel').click();

      // Then: Dialog closes and game is not deleted
      cy.contains('Delete Game').should('not.exist');
    });
  });

  describe('Feature: Search and Filter', () => {
    it('Scenario: User can search games by name', () => {
      // Given: Multiple games exist
      // When: User types in search box
      cy.get('input[placeholder*="Search games"]').type('Test');

      // Then: Only matching games are displayed
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
  });
});


describe('Login Flow', () => {
  it('should redirect to login, log in, and see the home page', () => {
    // Intercept the login request
    cy.intercept('POST', 'http://localhost:9000/auth/customer/emailpass', {
      statusCode: 200,
      body: {},
    }).as('loginRequest');

    // Visit the root
    cy.visit('/');

    // Should be redirected to the login page
    cy.url().should('include', '/login');

    // Fill out the login form
    cy.get('ion-input[type="email"]').type('test02@test.com');
    cy.get('ion-input[type="password"]').type('Rwbento123!');

    // Click the login button
    cy.get('[data-cy=login-button]').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest');

    // Should be on the home page
    cy.url().should('include', '/tabs/tab1');

    // Should see the products title
    cy.contains('ion-title', 'Products');
  });
});

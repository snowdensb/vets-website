// VSA-QA helper functions to allow the user to change a dropdown input to the value provided
export const checkErrMsgs = (currentPage, completed = 0) => {
  // completed param's for when some req'd fields are already completed.
  // Using findAllByText() here instead of get(), because
  // not all .schemaform-required-span instances are used for req'd fields.
  cy.findAllByText(/required|choose.at.least/i, {
    selector: '.schemaform-required-span',
  }).then($collection => {
    // Should have at least 1 required-span.
    // I.e., at least 1 req'd field should be on the form-page.
    expect($collection).to.have.length.gt(0);
    cy.contains('Continue').click();
    // Error-messages count should equal required-spans count.
    cy.get('.usa-input-error-message')
      .should('have.length', $collection.length - completed)
      .and('be.visible');
    // Form should not advance beyond current page.
    cy.location('pathname').should('contain', currentPage);
  });
};

export const checkMilAddress = () => {
  const milCityOptVals = ['', 'APO', 'FPO', 'DPO'];

  cy.get('[name*=isMilitary]').check();
  cy.get('[name*=country')
    .should('be.disabled')
    .and('have.value', 'USA');
  cy.get('label[for*=city]').should('contain.text', 'APO/FPO/DPO');
  cy.get('input[name*=city]').should('not.exist');
  cy.get('select[name*=city]').should('exist');
  cy.get('select[name*=city] option').then(opts => {
    const actualVals = [...opts].map(o => o.value);
    expect(actualVals).to.deep.eq(milCityOptVals);
  });
  cy.get('[name*=isMilitary]').uncheck();
};

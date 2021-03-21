import * as formData from './formDataSets/chapter31-maximal.json';

Cypress.config('waitForAnimations', true);

// QA-test to replace testForm, for cypress-testrail-reporter compatibility.

describe('VRE Chapter 31', () => {
  const checkErrMsgs = (currentPage, completed = 0) => {
    // Using findAllByText() here instead of get(), because
    // not all .schemaform-required-span spans are used for req'd fields.
    cy.findAllByText(/required|choose.at.least/i, {
      selector: '.schemaform-required-span',
    }).then($collection => {
      // Should have at least one required-span.
      expect($collection).to.have.length.gt(0);
      cy.contains('Continue').click();
      // Error-messages count should equal required-spans count.
      cy.get('.usa-input-error-message').should(
        'have.length',
        $collection.length - completed,
      );
      // Form should not advance beyond current page.
      cy.location('pathname').should('contain', currentPage);
    });
  };
  const checkMilAddress = () => {
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

  describe('Introduction', () => {
    it('Should hide Wizard after wizard-completion', () => {
      cy.visit(
        '/careers-employment/vocational-rehabilitation/apply/introduction',
      );
      window.sessionStorage.setItem('wizardStatus31', 'complete');
      cy.reload();
      cy.contains('Is this the form I need?').should('not.exist');
    });

    it('Should allow unauthenticated application', () => {
      cy.get('.va-button-link.schemaform-start-button')
        .eq(0)
        .click();
      cy.location('pathname').should('contain', '/veteran-information-review');
    });
  });

  describe('Step 1 of 4: Veteran Information', () => {
    it('Should display error-messages for empty required-fields', () => {
      // Using findAllByText() here instead of get(), because
      // one of the .schemaform-required-span spans is NOT for a req'd field.
      checkErrMsgs('/veteran-information-review');
    });
    it('Should allow advance after required-fields completion', () => {
      const dobArr = formData.veteranInformation.dob.split('-');
      const dobMonth = dobArr[1].replace(/^0+/, '');
      const dobDay = dobArr[2].replace(/^0+/, '');
      const dobYear = dobArr[0];

      cy.get('[name=root_veteranInformation_fullName_first]').type(
        formData.veteranInformation.fullName.first,
      );
      cy.get('[name=root_veteranInformation_fullName_last]').type(
        formData.veteranInformation.fullName.last,
      );
      cy.get('[name=root_veteranInformation_ssn]').type(
        formData.veteranInformation.ssn,
      );
      cy.get('[name=root_veteranInformation_dobMonth]').select(dobMonth);
      cy.get('[name=root_veteranInformation_dobDay]').select(dobDay);
      cy.get('[name=root_veteranInformation_dobYear]').type(dobYear);
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/veteran-contact-information');
    });
  });

  describe('Step 1 of 4: Veteran Information [contact info]', () => {
    it('Should display error-messages for empty required-fields', () => {
      checkErrMsgs('/veteran-contact-information');
    });
    it('Should update label(s)/fields(s) for military address', () => {
      checkMilAddress();
    });
    it('Should allow advance after required-fields completion', () => {
      const addr = formData.veteranAddress;

      cy.get('[name*=country]').select(addr.country);
      cy.get('[name*=street]')
        .eq(0)
        .type(addr.street);
      cy.get('[name*=city]').type(addr.city);
      cy.get('[name*=state').select(addr.state);
      cy.get('[name*=postalCode]').type(addr.postalCode);
      cy.get('[name*=mainPhone]').type(formData.mainPhone);
      cy.get('[name*=email]').type(formData.email);
      cy.get('[name*=confirmEmail]').type(formData.email);
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/additional-information');
    });
  });

  describe('Step 2 of 4: Additional Information', () => {
    it('Should display error-messages for empty required-fields - Not moving', () => {
      checkErrMsgs('/additional-information');
    });
    it('Should allow advance after required-fields completion - Not moving', () => {
      cy.get('[name*=yearsOfEducation]').type(formData.yearsOfEducation);
      cy.get('[name*=isMoving][value=N]').check();
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/communication-preferences');
    });
    it('Should display new-address form - Moving', () => {
      cy.contains('Back').click();
      cy.location('pathname').should('contain', '/additional-information');
      cy.get('[name*=isMoving][value=Y]').check();
      cy.get('#root_newAddress__title').should('be.visible');
      cy.get('[name*=newAddress').should('have.length.gte', 4);
    });
    it('Should display error-messages for empty required-fields - Moving', () => {
      checkErrMsgs('/additional-information', 2);
    });
    it('Should update label(s)/fields(s) for military address - Moving', () => {
      checkMilAddress();
    });
    it('Should allow advance after required-fields completion - Moving', () => {
      const newAddr = formData.newAddress;

      cy.get('[name*=country]').select(newAddr.country);
      cy.get('[name*=street]')
        .eq(0)
        .type(newAddr.street);
      cy.get('[name*=city]').type(newAddr.city);
      cy.get('[name*=state').select(newAddr.state);
      cy.get('[name*=postalCode]').type(newAddr.postalCode);
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/communication-preferences');
    });
  });

  describe('Step 3 of 4: Communication Preferences', () => {
    it('Should display error-messages for empty required-fields', () => {
      checkErrMsgs('/communication-preferences');
    });
    it('Should allow advance after required-fields completion', () => {
      const apptTimePrefs = formData.appointmentTimePreferences;
      const selectedApptTimePrefs = {};

      Object.keys(apptTimePrefs).forEach(key => {
        if (apptTimePrefs[key]) selectedApptTimePrefs[key] = true;
      });

      cy.log('apptTimePrefs:', apptTimePrefs);
      cy.log('apptTimePrefs:', selectedApptTimePrefs);

      cy.get(`[name*=useEva][value=${formData.useEva ? 'Y' : 'N'}]`).check();
      cy.get(
        `[name*=useTelecounseling][value=${
          formData.useTelecounseling ? 'Y' : 'N'
        }]`,
      ).check();
      Object.keys(selectedApptTimePrefs).forEach(key => {
        cy.get(`[name*=appointmentTimePreferences][id*=${key}]`).check();
      });
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/review-and-submit');
    });
  });

  describe('Step 4 of 4: Review Application', () => {
    it('Should expand/collapse sections', () => {
      cy.get('.input-section').within(() => {
        cy.get('.usa-unstyled-list').each($list => {
          cy.wrap($list).within(() => {
            cy.get('[id*=collapsible-]').should('not.be.visible');
            cy.get('.accordion-header button').click();
            cy.get('[id*=collapsible-]').should('be.visible');
            cy.get('.accordion-header button').click();
            cy.get('[id*=collapsible-]').should('not.be.visible');
          });
        });
      });
    });
    it('Should edit Veteran Information section', () => {
      cy.get('.input-section').within(() => {
        cy.get('[data-chapter=veteranInformation]').within(() => {
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]')
            .should('be.visible')
            .within(() => {
              // Edit Veteran Information subsection.
              cy.get('div[name=veteranInformationScrollElement]')
                .next('form')
                .within(() => {
                  const vetInfo2 = {
                    fullName: {
                      first: 'Joe',
                      last: 'Blow',
                    },
                    ssn: '987654321',
                    dob: '1989-04-03',
                  };
                  const dobArr = vetInfo2.dob.split('-');
                  const dobMonth = dobArr[1].replace(/^0+/, '');
                  const dobDay = dobArr[2].replace(/^0+/, '');
                  const dobYear = dobArr[0];

                  cy.get(
                    '.form-review-panel-page-header-row button[aria-label*="Veteran Information"]',
                  ).click();
                  cy.get('.schemaform-block').should('be.visible');
                  cy.get(
                    'button[type=submit][aria-label*="Veteran Information"]',
                  ).should('be.visible');
                  cy.get('[name*=fullName_first]')
                    .clear()
                    .type(vetInfo2.fullName.first);
                  cy.get('[name*=fullName_last]')
                    .clear()
                    .type(vetInfo2.fullName.last);
                  cy.get('[name*=_ssn]')
                    .clear()
                    .type(vetInfo2.ssn);
                  cy.get('[name*=_dobMonth]').select(dobMonth);
                  cy.get('[name*=_dobDay]').select(dobDay);
                  cy.get('[name*=_dobYear]')
                    .clear()
                    .type(dobYear);
                  cy.contains('Update page')
                    .click()
                    .should('not.exist');
                  cy.get('.schemaform-block').should('not.exist');
                  cy.get('dl.review').should('be.visible');
                });

              // Edit Contact Information subsection.
              cy.get('div[name=contactInformationScrollElement]')
                .next('form')
                .within(() => {
                  const vetAddr2 = {
                    country: 'USA',
                    street: '321 Any St',
                    city: 'Anytown',
                    state: 'AZ',
                    postalCode: '54321',
                  };

                  cy.get(
                    '.form-review-panel-page-header-row button[aria-label*="Contact Information"]',
                  ).click();
                  cy.get('.input-section.schemaform-field-container').should(
                    'be.visible',
                  );
                  cy.get(
                    'button[type=submit][aria-label*="Contact Information"]',
                  ).should('be.visible');
                  cy.get('[name*=country]').select(vetAddr2.country);
                  cy.get('[name*=street]')
                    .eq(0)
                    .clear()
                    .type(vetAddr2.street);
                  cy.get('[name*=city]')
                    .clear()
                    .type(vetAddr2.city);
                  cy.get('[name*=state]').select(vetAddr2.state);
                  cy.get('[name*=postalCode]')
                    .clear()
                    .type(vetAddr2.postalCode);
                  cy.contains('Update page')
                    .click()
                    .should('not.exist');
                  cy.get('.input-section.schemaform-field-container').should(
                    'not.exist',
                  );
                  cy.get('dl.review').should('be.visible');
                });
            });
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]').should('not.be.visible');
        });
      });
    });
  });
});

/* This is a VSA-QA E2E test, for compatibility with
* cypress-testrail-reporter.
* Once VSP's testForm() works w/ cypress-testrail-reporter,
* this one can be removed.
*/

// import ADDRESS_DATA from 'platform/forms/address/data';
import * as qaHelpers from '../helpers.qa';
import * as formData from './formDataSets/chapter31-maximal.json';

Cypress.config('waitForAnimations', true);

describe('VRE Chapter 31', () => {
  // eslint-disable-next-line mocha/no-exclusive-tests
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
      qaHelpers.checkErrMsgs('/veteran-information-review');
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
      qaHelpers.checkErrMsgs('/veteran-contact-information');
    });
    it('Should update label(s)/fields(s) for military address', () => {
      qaHelpers.checkMilAddress();
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
      qaHelpers.checkErrMsgs('/additional-information');
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
      qaHelpers.checkErrMsgs('/additional-information', 2);
    });
    it('Should update label(s)/fields(s) for military address - Moving', () => {
      qaHelpers.checkMilAddress();
    });
    it('Should allow advance after required-fields completion - Moving', () => {
      const newAddr = formData.newAddress;

      cy.get('[name*=country]').select(newAddr.country);
      cy.get('[name*=street]')
        .eq(0)
        .type(newAddr.street);
      cy.get('[name*=city]').type(newAddr.city);
      cy.get('[name*=state]').select(newAddr.state);
      cy.get('[name*=postalCode]').type(newAddr.postalCode);
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/communication-preferences');
    });
  });

  describe('Step 3 of 4: Communication Preferences', () => {
    it('Should display error-messages for empty required-fields', () => {
      qaHelpers.checkErrMsgs('/communication-preferences');
    });
    it('Should allow advance after required-fields completion', () => {
      const apptTimePrefs = formData.appointmentTimePreferences;
      const selectedApptTimePrefs = {};

      // Actual form doesn't have 'Other' appointment-pref option.
      delete apptTimePrefs.other;

      // Get selected appt-time-prefs.
      Object.keys(apptTimePrefs).forEach(key => {
        if (apptTimePrefs[key]) selectedApptTimePrefs[key] = true;
      });
      // cy.log('apptTimePrefs:', apptTimePrefs);
      // cy.log('apptTimePrefs:', selectedApptTimePrefs);

      // Complete required fields.
      cy.get(`[name*=useEva][value=${formData.useEva ? 'Y' : 'N'}]`).check();
      cy.get(
        `[name*=useTelecounseling][value=${
          formData.useTelecounseling ? 'Y' : 'N'
        }]`,
      ).check();
      Object.keys(selectedApptTimePrefs).forEach(key => {
        cy.log(`currKey: ${key}`);
        cy.get(
          `[type=checkbox][name*=appointmentTimePreferences][id*=${key}]`,
        ).check();
      });
      cy.contains('Continue').click();
      cy.location('pathname').should('contain', '/review-and-submit');
    });
  });

  // eslint-disable-next-line mocha/no-exclusive-tests
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
      // cy.log('ADDRESS_DATA:', ADDRESS_DATA);
      const vetInfo2 = {
        fullName: {
          first: 'Joe',
          last: 'Blow',
        },
        ssn: '987654321',
        dob: '1989-04-03',
      };
      const mainPhone2 = '123-457-7890';
      const email2 = 'joe@vets.com';
      const dobArr = vetInfo2.dob.split('-');
      const dobMonth = dobArr[1].replace(/^0+/, '');
      const dobDay = dobArr[2].replace(/^0+/, '');
      const dobYear = dobArr[0];
      const vetAddr2 = {
        country: 'USA',
        street: '321 Any St',
        city: 'Anytown',
        state: 'AZ',
        postalCode: '54321',
      };
      const countryName = 'United States';
      const stateName2 = 'Arizona';

      cy.get('.input-section').within(() => {
        cy.get('[data-chapter=veteranInformation]').within(() => {
          // Expand section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]')
            .should('be.visible')
            .within(() => {
              // Edit Veteran Information subsection.
              cy.get('div[name=veteranInformationScrollElement]')
                .next('form')
                .within(() => {
                  // Open edit-form.
                  cy.get(
                    '.form-review-panel-page-header-row button[aria-label*="Veteran Information"]',
                  ).click();
                  cy.get('.schemaform-block').should('be.visible');
                  cy.get(
                    'button[type=submit][aria-label*="Veteran Information"]',
                  ).should('be.visible');
                  // Edit fields.
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
                  // Save edits.
                  cy.contains('Update page')
                    .click()
                    .then($btn => {
                      cy.wrap($btn).should('not.exist');
                    });
                  cy.get('.schemaform-block').should('not.exist');
                  cy.get('dl.review').should('be.visible');

                  // Validate edits.
                  cy.get('dl.review').within(() => {
                    cy.contains(/first.name/i)
                      .next()
                      .should('have.text', vetInfo2.fullName.first);
                    cy.contains(/last.name/i)
                      .next()
                      .should('have.text', vetInfo2.fullName.last);
                    cy.contains(/social.security/i)
                      .next()
                      .should(
                        'have.text',
                        vetInfo2.ssn.replace(
                          /^(\d{3})(\d{2})(\d{4})$/,
                          '$1-$2-$3',
                        ),
                      );
                    cy.contains(/birth/i)
                      .next()
                      .should(
                        'have.text',
                        vetInfo2.dob.replace(
                          /^(\d{4})-(\d{2})-(\d{2})$/,
                          '$2/$3/$1',
                        ),
                      );
                  });
                });

              // Edit Contact Information subsection.
              cy.get('div[name=contactInformationScrollElement]')
                .next('form')
                .within(() => {
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
                  cy.get('[name*=mainPhone]')
                    .clear()
                    .type(mainPhone2);
                  cy.get('[name*=email]')
                    .clear()
                    .type(email2);
                  cy.get('[name*=confirmEmail]')
                    .clear()
                    .type(email2);
                  cy.contains('Update page')
                    .click()
                    .then($btn => {
                      cy.wrap($btn).should('not.exist');
                    });
                  cy.get('.input-section.schemaform-field-container').should(
                    'not.exist',
                  );
                  cy.get('dl.review').should('be.visible');

                  // Validate Contact-info edits.
                  cy.get('dl.review').within(() => {
                    cy.contains(/country/i)
                      .next()
                      .should('have.text', countryName);
                    cy.contains(/street/i)
                      .next()
                      .should('have.text', vetAddr2.street);
                    cy.contains(/city/i)
                      .next()
                      .should('have.text', vetAddr2.city);
                    cy.contains(/state$/i)
                      .next()
                      .should('have.text', stateName2);
                    cy.contains(/postal.code/i)
                      .next()
                      .should('have.text', vetAddr2.postalCode);
                    cy.contains(/main.phone/i)
                      .next()
                      .should('have.text', mainPhone2);
                    cy.contains(/^email/i)
                      .next()
                      .should('have.text', email2);
                    cy.contains(/^confirm.email/i)
                      .next()
                      .should('have.text', email2);
                  });
                });
            });

          // Collapse section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]').should('not.be.visible');
        });
      });
    });
    it('Should edit Additional Information section', () => {
      const yearsOfEducation2 = '14';
      const newAddr2 = {
        country: 'USA',
        street: '125 Any St',
        city: 'Anytown',
        state: 'AZ',
        postalCode: '54321',
      };
      const countryName = 'United States';
      const stateName2 = 'Arizona';

      cy.get('.input-section').within(() => {
        cy.get('[data-chapter=additionalInformation]').within(() => {
          // Expand section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]')
            .should('be.visible')
            .within(() => {
              cy.get('div[name=additionalInformationScrollElement]')
                .next('form')
                .within(() => {
                  // Open edit-form.
                  cy.get(
                    '.form-review-panel-page-header-row button[aria-label*="Additional Information"]',
                  ).click();
                  cy.get('.input-section.schemaform-field-container').should(
                    'be.visible',
                  );
                  cy.get(
                    'button[type=submit][aria-label*="Additional Information"]',
                  ).should('be.visible');
                  // Edit fields.
                  cy.get('[name*=yearsOfEducation]')
                    .clear()
                    .type(yearsOfEducation2);
                  cy.get('[name*=isMoving][value=Y]').check();
                  cy.get('[name*=country]').select(newAddr2.country);
                  cy.get('[name*=street]')
                    .eq(0)
                    .clear()
                    .type(newAddr2.street);
                  cy.get('[name*=city]')
                    .clear()
                    .type(newAddr2.city);
                  cy.get('[name*=state]').select(newAddr2.state);
                  cy.get('[name*=postalCode]')
                    .clear()
                    .type(newAddr2.postalCode);
                  // Save edits.
                  cy.get(
                    'button[type=submit][aria-label*="Additional Information"]',
                  )
                    .click()
                    .then($btn => {
                      cy.wrap($btn).should('not.exist');
                    });
                  cy.get('.schemaform-block').should('not.exist');
                  cy.get('dl.review').should('be.visible');

                  // Validate edits.
                  cy.get('dl.review').within(() => {
                    cy.contains(/years.of.education/i)
                      .next()
                      .should('have.text', yearsOfEducation2);
                    cy.contains(/moving/i)
                      .parent()
                      .next()
                      .should('have.text', 'Yes');
                    cy.contains(/country/i)
                      .next()
                      .should('have.text', countryName);
                    cy.contains(/street/i)
                      .next()
                      .should('have.text', newAddr2.street);
                    cy.contains(/city/i)
                      .next()
                      .should('have.text', newAddr2.city);
                    cy.contains(/state$/i)
                      .next()
                      .should('have.text', stateName2);
                    cy.contains(/postal.code/i)
                      .next()
                      .should('have.text', newAddr2.postalCode);
                  });
                });
            });

          // Collapse section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]').should('not.be.visible');
        });
      });
    });
    it('Should edit Communication Preferences section', () => {
      const useEva2 = formData.useEva ? 'N' : 'Y';
      const useTelecounseling2 = formData.useTelecounseling ? 'N' : 'Y';
      const apptTimePrefs = formData.appointmentTimePreferences;
      const selectedApptTimePrefs = {};
      const selectedApptTimePrefs2 = {};

      // Actual form doesn't have 'Other' appointment-pref option.
      delete apptTimePrefs.other;

      Object.keys(apptTimePrefs).forEach(key => {
        if (apptTimePrefs[key]) selectedApptTimePrefs[key] = true;
      });
      Object.keys(apptTimePrefs).forEach(key => {
        if (!apptTimePrefs[key]) selectedApptTimePrefs2[key] = true;
      });
      cy.log('selectedApptTimePrefs:', selectedApptTimePrefs);
      cy.log('selectedApptTimePrefs2:', selectedApptTimePrefs2);

      cy.get('.input-section').within(() => {
        cy.get('[data-chapter=communicationPreferences]').within(() => {
          // Expand section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]')
            .should('be.visible')
            .within(() => {
              // Open edit-form.
              cy.get(
                '.form-review-panel-page-header-row button[aria-label*="Communication Preferences"]',
              ).click();
              cy.get('.input-section.schemaform-field-container').should(
                'be.visible',
              );
              cy.get(
                'button[type=submit][aria-label*="Communication Preferences"]',
              ).should('be.visible');
              // Edit fields.
              cy.get(`[name*=useEva][value=${useEva2}]`).check();
              cy.get(
                `[name*=useTelecounseling][value=${useTelecounseling2}]`,
              ).check();
              Object.keys(selectedApptTimePrefs).forEach(key => {
                cy.get(
                  `[type=checkbox][name*=appointmentTimePreferences][id*=${key}]`,
                ).uncheck();
              });
              Object.keys(selectedApptTimePrefs2).forEach(key => {
                cy.get(
                  `[type=checkbox][name*=appointmentTimePreferences][id*=${key}]`,
                ).check();
              });
              // Save edits.
              cy.get(
                'button[type=submit][aria-label*="Communication Preferences"]',
              )
                .click()
                .then($btn => {
                  cy.wrap($btn).should('not.exist');
                });
              cy.get('.schemaform-block').should('not.exist');
              cy.get('dl.review').should('be.visible');
            });

          // Validate edits.
          cy.get('dl.review').within(() => {
            cy.contains(/e-va/i)
              .parent()
              .parent()
              .next()
              .should('have.text', useEva2 === 'Y' ? 'Yes' : 'No');
            cy.contains(/tele-counseling/i)
              .parent()
              .parent()
              .next()
              .should('have.text', useTelecounseling2 === 'Y' ? 'Yes' : 'No');
            Object.keys(selectedApptTimePrefs).forEach(key => {
              cy.contains(key, { matchCase: false })
                .next()
                .should('not.have.text', 'Selected');
            });
            Object.keys(selectedApptTimePrefs2).forEach(key => {
              cy.contains(key, { matchCase: false })
                .next()
                .should('have.text', 'Selected');
            });
          });

          // Collapse section.
          cy.get('.accordion-header button').click();
          cy.get('[id*=collapsible-]').should('not.be.visible');
        });
      });
    });
    it('Should block submit before accepting privacy policy', () => {
      cy.get('.progress-box-schemaform').within(() => {
        cy.get('[type=checkbox][name*=privacyAgreement]').uncheck();
        cy.contains('submit application', { matchCase: false }).click();
        cy.get('.usa-input-error-message')
          .last()
          .should('be.visible')
          .and('contain.text', 'privacy policy');
      });
    });
    it('Should allow submit after accepting privacy policy', () => {
      cy.intercept('POST', '/v0/veteran_readiness_employment_claims', {
        formSubmissionId: '123fake-submission-id-567',
        timestamp: '2020-11-12',
        attributes: {
          guid: '123fake-submission-id-567',
        },
      }).as('submitApplication');

      cy.get('.progress-box-schemaform').within(() => {
        cy.get('[type=checkbox][name*=privacyAgreement]').check();
        cy.contains('submit application', { matchCase: false }).click();
        cy.location('pathname').should('contain', '/confirmation');
      });
    });
    // TODO: Create minimal spec for submission-error message.
    // it('Should display error message on submission-failure', () => {
    //   cy.intercept('POST', '/v0/veteran_readiness_employment_claims', {
    //     statusCode: 500,
    //     body: 'Submission failed',
    //   }).as('submitApplication');

    //   cy.get('.progress-box-schemaform').within(() => {
    //     cy.get('[type=checkbox][name*=privacyAgreement]').check();
    //     cy.contains('submit application', { matchCase: false }).click();
    //     cy.get('.schemaform-failure-alert').should('be.visible');
    //   });
    // });
  });
});

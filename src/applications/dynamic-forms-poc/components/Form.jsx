import React, { useEffect, useCallback } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
// import moment from 'moment';
import recordEvent from 'platform/monitoring/record-event';

import {
  DowntimeNotification,
  externalServices,
} from 'platform/monitoring/DowntimeNotification';

import AlertBox, {
  ALERT_TYPE,
} from '@department-of-veterans-affairs/component-library/AlertBox';

import LoadingIndicator from '@department-of-veterans-affairs/component-library/LoadingIndicator';

import SchemaForm from 'platform/forms-system/src/js/components/SchemaForm';
import * as userSelectors from 'platform/user/selectors';
import { requestStates } from 'platform/utilities/constants';
import { focusElement } from 'platform/utilities/ui';

import * as actions from '../actions';

import useInitializeForm from '../hooks/useInitializeForm';
import useSubmitForm from '../hooks/useSubmitForm';

import FormFooter from 'platform/forms/components/FormFooter';
import GetHelp from './GetHelp';
import GetDynamicBreadcrumbs from './DynamicBreadcrumbs';

function Form({ formState, updateFormData, router }) {
  const [submitStatus, submitToApi] = useSubmitForm();

  useInitializeForm(formState, updateFormData, router.location.query.formid);

  useEffect(() => {
    focusElement('#va-dynamic-form-heading');
  }, []);

  useEffect(
    () => {
      if (submitStatus === requestStates.succeeded) {
        recordEvent({
          event: 'va-dynamic-form--submission-successful',
        });
        router.replace('/confirmation');
      } else if (submitStatus === requestStates.failed) {
        recordEvent({
          event: 'va-dynamic-form--submission-failed',
        });
      }
    },
    [submitStatus],
  );

  const onFormChange = useCallback(
    nextFormData => {
      updateFormData(formState.formSchema, formState.uiSchema, nextFormData);
    },
    [formState],
  );

  const onFormSubmit = useCallback(
    () => {
      recordEvent({ event: 'va-dynamic-form--submission' });
      submitToApi(formState.formData);
    },
    [router, formState],
  );

  if (submitStatus === requestStates.pending) {
    return <LoadingIndicator message="Submitting your form..." />;
  }
  return (
    <>
      {GetDynamicBreadcrumbs(formState?.formSchema?.questionnairePublisher)}

      <DowntimeNotification
        appTitle={formState?.formSchema?.formTitle}
        dependencies={[externalServices.vetextVaccine]}
      >
        <h1 id="va-dynamic-form-heading" className="no-outline">
          {formState?.formSchema?.formTitle}
        </h1>

        {formState ? (
          <SchemaForm
            addNameAttribute
            // "name" and "title" are used only internally to SchemaForm
            name="VA Forms"
            title="VA Forms"
            data={formState.formData}
            schema={formState.formSchema}
            uiSchema={formState.uiSchema}
            onChange={onFormChange}
            onSubmit={onFormSubmit}
          >
            {submitStatus === requestStates.failed ? (
              <div className="vads-u-margin-bottom-2">
                <AlertBox
                  status={ALERT_TYPE.ERROR}
                  content="An error occurred while trying to save your form. Please try again later."
                />
              </div>
            ) : null}
            <button
              type="submit"
              className="usa-button"
              aria-label="Submit form"
            >
              Submit form
            </button>
          </SchemaForm>
        ) : (
          <LoadingIndicator message="Loading the form..." />
        )}
      </DowntimeNotification>
      <div className="vads-u-margin-top--1">
        <FormFooter formConfig={{ getHelp: GetHelp }} />
      </div>
    </>
  );
}

const mapStateToProps = state => {
  return {
    isLoggedIn: userSelectors.isLoggedIn(state),
    profile: userSelectors.selectProfile(state),
    formState: state.coronavirusVaccinationApp.formState,
  };
};

const mapDispatchToProps = {
  updateFormData: actions.updateFormData,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(Form),
);
export { Form };

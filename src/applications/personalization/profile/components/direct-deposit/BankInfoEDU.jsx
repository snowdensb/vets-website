import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { connect } from 'react-redux';

import AdditionalInfo from '@department-of-veterans-affairs/component-library/AdditionalInfo';
import Modal from '@department-of-veterans-affairs/component-library/Modal';
import Telephone, {
  CONTACTS,
} from '@department-of-veterans-affairs/component-library/Telephone';

import recordEvent from '~/platform/monitoring/record-event';
import LoadingButton from '~/platform/site-wide/loading-button/LoadingButton';

import { isLOA3 as isLOA3Selector } from '~/platform/user/selectors';
import { usePrevious } from '~/platform/utilities/react-hooks';
import {
  editEDUPaymentInformationToggled,
  saveEDUPaymentInformation as savePaymentInformationAction,
} from '@@profile/actions/paymentInformation';
import {
  eduDirectDepositAccountInformation,
  eduDirectDepositInformation,
  eduDirectDepositIsSetUp,
  eduDirectDepositLoadError,
  eduDirectDepositUiState as directDepositUiStateSelector,
} from '@@profile/selectors';

import DirectDepositConnectionError from '../alerts/DirectDepositConnectionError';

import BankInfoForm, { makeFormProperties } from './BankInfoForm';

import PaymentInformationEditError from './PaymentInformationEditError';
import ProfileInfoTable from '../ProfileInfoTable';
import { benefitTypes } from './DirectDepositV2';

import prefixUtilityClasses from '~/platform/utilities/prefix-utility-classes';

export const DirectDepositEDU = ({
  isLOA3,
  isDirectDepositSetUp,
  directDepositAccountInfo,
  directDepositServerError,
  directDepositUiState,
  saveBankInformation,
  toggleEditState,
}) => {
  const formPrefix = 'EDU';
  const editBankInfoButton = useRef();
  const [formData, setFormData] = useState({});
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const wasEditingBankInfo = usePrevious(directDepositUiState.isEditing);

  const isEditingBankInfo = directDepositUiState.isEditing;
  const saveError = directDepositUiState.responseError;

  const { accountNumber, accountType, routingNumber } = makeFormProperties(
    formPrefix,
  );

  const {
    [accountNumber]: formAccountNumber,
    [accountType]: formAccountType,
    [routingNumber]: formRoutingNumber,
  } = formData;
  const isEmptyForm =
    !formAccountNumber && !formAccountType && !formRoutingNumber;

  // when we enter and exit edit mode...
  useEffect(
    () => {
      if (wasEditingBankInfo && !isEditingBankInfo) {
        // clear the form data when exiting edit mode so it's blank when the
        // edit form is shown again
        setFormData({});
        // focus the edit button when we exit edit mode
        editBankInfoButton.current.focus();
      }
    },
    [isEditingBankInfo, wasEditingBankInfo],
  );

  useEffect(
    () => {
      // Show alert when navigating away
      if (!isEmptyForm) {
        window.onbeforeunload = () => true;
        return;
      }

      window.onbeforeunload = undefined;
    },
    [isEmptyForm],
  );

  const saveBankInfo = () => {
    const payload = {
      financialInstitutionRoutingNumber: formData[routingNumber],
      accountNumber: formData[accountNumber],
      accountType: formData[accountType],
    };
    saveBankInformation(payload);
  };

  const bankInfoClasses = prefixUtilityClasses(
    [
      'display--flex',
      'align-items--flex-start',
      'flex-direction--row',
      'justify-content--space-between',
    ],
    'medium',
  );

  const editButtonClasses = [
    'va-button-link',
    ...prefixUtilityClasses(['margin-top--1p5']),
  ];

  const editButtonClassesMedium = prefixUtilityClasses(
    ['flex--auto', 'margin-top--0'],
    'medium',
  );

  const classes = {
    bankInfo: [...bankInfoClasses].join(' '),
    editButton: [...editButtonClasses, ...editButtonClassesMedium].join(' '),
  };

  const closeDDForm = () => {
    if (!isEmptyForm) {
      setShowConfirmCancelModal(true);
      return;
    }

    toggleEditState();
  };

  // When direct deposit is set up we will show the current bank info
  const bankInfoContent = (
    <div className={classes.bankInfo}>
      <dl className="vads-u-margin-y--0 vads-u-line-height--6">
        <dt className="sr-only">Bank name:</dt>
        <dd>{directDepositAccountInfo?.financialInstitutionName}</dd>
        <dt className="sr-only">Bank account number:</dt>
        <dd>{directDepositAccountInfo?.accountNumber}</dd>
        <dt className="sr-only">Bank account type:</dt>
        <dd>{`${directDepositAccountInfo?.accountType} account`}</dd>
      </dl>
      <button
        className={classes.editButton}
        aria-label={
          'Edit your direct deposit for education benefits bank information'
        }
        ref={editBankInfoButton}
        onClick={() => {
          recordEvent({
            event: 'profile-navigation',
            'profile-action': 'edit-link',
            'profile-section': 'edu-direct-deposit-information',
          });
          toggleEditState();
        }}
      >
        Edit
      </button>
    </div>
  );

  // When not eligible for DD for EDU
  const notEligibleContent = (
    <>
      <p className="vads-u-margin-top--0">
        Our records show that you’re not receiving education benefit payments.
        If you think this is an error, please call us at{' '}
        <Telephone contact={CONTACTS.VA_BENEFITS} />.
      </p>
      <p className="vads-u-margin-bottom--0">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.va.gov/education/eligibility/"
          onClick={() => {
            recordEvent({
              event: 'profile-navigation',
              'profile-action': 'view-link',
              'profile-section': 'education-benefits',
            });
          }}
        >
          Find out if you’re eligible for VA education benefits
        </a>
      </p>
    </>
  );

  // When editing bank info, we'll show a form that accepts bank account
  // information
  const editingBankInfoContent = (
    <>
      <div id="edu-bank-save-errors" role="alert" aria-atomic="true">
        {!!saveError && (
          <PaymentInformationEditError
            className="vads-u-margin-top--0 vads-u-margin-bottom--2"
            level={4}
            responseError={saveError}
          />
        )}
      </div>
      <p className="vads-u-margin-top--0">
        Please enter your bank’s routing and account numbers and your account
        type.
      </p>
      <div className="vads-u-margin-bottom--2">
        <AdditionalInfo triggerText="Where can I find these numbers?">
          <figure className="vads-u-margin-x--0">
            {/* eslint-disable jsx-a11y/no-redundant-roles */}
            <img
              src="/img/direct-deposit-check-guide.svg"
              role="img"
              alt="A personal check"
              aria-labelledby="check-caption"
            />
            {/* eslint-enable jsx-a11y/no-redundant-roles */}
            <figcaption
              id="check-caption"
              className="vads-u-font-size--base vads-u-font-weight--normal vads-u-font-family--sans vads-u-width--auto vads-u-color--gray-dark"
            >
              <p>
                The bank routing number is the first 9 digits on the bottom left
                corner of a printed check. Your account number is the second set
                of numbers on the bottom of a check, just to the right of the
                bank routing number.
              </p>
              <p>If you don’t have a printed check, you can:</p>
              <ul>
                <li>
                  Sign in to your online bank account and check your account
                  details, or
                </li>
                <li>Check your bank statement, or</li>
                <li>Call your bank</li>
              </ul>
            </figcaption>
          </figure>
        </AdditionalInfo>
      </div>
      <div data-testid={`${formPrefix}-bank-info-form`}>
        <BankInfoForm
          formChange={data => setFormData(data)}
          formData={formData}
          formPrefix={formPrefix}
          formSubmit={saveBankInfo}
        >
          <LoadingButton
            aria-label="update your bank information for education benefits"
            type="submit"
            loadingText="saving bank information"
            className="usa-button-primary vads-u-margin-top--0 vads-u-width--full small-screen:vads-u-width--auto"
            isLoading={directDepositUiState.isSaving}
          >
            Update
          </LoadingButton>
          <button
            aria-label="cancel updating your bank information for education benefits"
            type="button"
            disabled={directDepositUiState.isSaving}
            className="va-button-link vads-u-margin-left--1"
            onClick={closeDDForm}
            data-qa="cancel-button"
          >
            Cancel
          </button>
        </BankInfoForm>
      </div>
    </>
  );

  // Helper that determines which data to show in the top row of the table
  const getBankInfo = () => {
    if (directDepositUiState.isEditing) {
      return editingBankInfoContent;
    }
    if (isDirectDepositSetUp) {
      return bankInfoContent;
    }
    return notEligibleContent;
  };

  const directDepositData = () => {
    const data = {
      // the table can show multiple states so we set its value with the
      // getBankInfo() helper
      value: getBankInfo(),
    };
    if (isDirectDepositSetUp) {
      data.title = 'Account';
    }
    return [data];
  };

  // Render nothing if the user is not LOA3.
  // This entire component should never be rendered in that case; this just
  // serves as another layer of protection.
  if (!isLOA3) {
    return null;
  }

  if (directDepositServerError) {
    return <DirectDepositConnectionError benefitType={benefitTypes.EDU} />;
  }

  return (
    <>
      <Modal
        title={'Are you sure?'}
        status="warning"
        visible={showConfirmCancelModal}
        onClose={() => {
          setShowConfirmCancelModal(false);
        }}
      >
        <p>
          {' '}
          {`You haven’t finished editing your direct deposit information. If you cancel, your in-progress work won’t be saved.`}
        </p>
        <button
          className="usa-button-secondary"
          onClick={() => {
            setShowConfirmCancelModal(false);
          }}
        >
          Continue Editing
        </button>
        <button
          onClick={() => {
            setShowConfirmCancelModal(false);
            toggleEditState();
          }}
        >
          Cancel
        </button>
      </Modal>
      <Prompt
        message="Are you sure you want to leave? If you leave, your in-progress work won’t be saved."
        when={!isEmptyForm}
      />
      <ProfileInfoTable
        className="vads-u-margin-y--2 medium-screen:vads-u-margin-y--4"
        title="Education benefits"
        data={directDepositData()}
      />
    </>
  );
};

DirectDepositEDU.propTypes = {
  isLOA3: PropTypes.bool.isRequired,
  directDepositAccountInfo: PropTypes.shape({
    accountNumber: PropTypes.string.isRequired,
    accountType: PropTypes.string.isRequired,
    financialInstitutionName: PropTypes.string.isRequired,
    financialInstitutionRoutingNumber: PropTypes.string.isRequired,
  }),
  isDirectDepositSetUp: PropTypes.bool.isRequired,
  directDepositServerError: PropTypes.bool.isRequired,
  directDepositUiState: PropTypes.shape({
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    responseError: PropTypes.string,
  }),
  saveBankInformation: PropTypes.func.isRequired,
  toggleEditState: PropTypes.func.isRequired,
};

export const mapStateToProps = state => ({
  isLOA3: isLOA3Selector(state),
  directDepositAccountInfo: eduDirectDepositAccountInformation(state),
  directDepositInfo: eduDirectDepositInformation(state),
  isDirectDepositSetUp: eduDirectDepositIsSetUp(state),
  directDepositServerError: !!eduDirectDepositLoadError(state),
  directDepositUiState: directDepositUiStateSelector(state),
});

const mapDispatchToProps = {
  saveBankInformation: savePaymentInformationAction,
  toggleEditState: editEDUPaymentInformationToggled,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DirectDepositEDU);

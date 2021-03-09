import React from 'react';
import { connect } from 'react-redux';
import LoadingIndicator from '@department-of-veterans-affairs/component-library/LoadingIndicator';

import backendServices from '~/platform/user/profile/constants/backendServices';
import { createIsServiceAvailableSelector } from '~/platform/user/selectors';

import {
  getAppealsV2 as getAppealsAction,
  getClaimsV2 as getClaimsAction,
} from '~/applications/claims-status/actions';

import NotificationCTA from '../NotificationCTA';
import useOpenClaimsAppealsCount from './hooks/useOpenClaimOrAppealCount';
import useHighlightedClaimOrAppeal from './hooks/useHighlightedClaimOrAppeal';

const ClaimsAndAppealsCTA = ({ count }) => {
  let content = 'Go to all claims or appeals';
  if (count === 1) {
    content = '1 claim or appeal in progress';
  } else if (count > 1) {
    content = `${count} claims or appeals in progress`;
  }
  return (
    <div className="vads-u-display--flex vads-u-flex-direction--column vads-l-col--12 medium-screen:vads-l-col--6 small-desktop-screen:vads-l-col--4 medium-screen:vads-u-padding-right--3">
      <NotificationCTA
        CTA={{
          text: content,
          href: 'claim-or-appeal-status/',
          icon: 'clipboard',
        }}
      />
    </div>
  );
};

const HighlightedClaimAppeal = ({ claimOrAppeal }) => {
  if (!claimOrAppeal) {
    return <p>You have no claims or appeals updates in the last 30 days.</p>;
  } else {
    return (
      <div className="vads-l-col--12 medium-screen:vads-l-col--6 small-desktop-screen:vads-l-col--8 medium-screen:vads-u-padding-right--3">
        <div className="vads-u-padding-y--2p5 vads-u-padding-x--2p5 vads-u-background-color--gray-lightest">
          <p>Show some details about the claim or appeal</p>
          <a className="usa-button-primary" href="claim-or-appeal-status/">
            View details
          </a>
        </div>
      </div>
    );
  }
};

const ClaimsAndAppeals = ({
  appealsData,
  claimsData,
  // for some unit testing purposes, we want to prevent this component from
  // making off API calls which kicks off a chain of events that results in the
  // component always showing a loading spinner
  dataLoadingDisabled = false,
  loadAppeals,
  loadClaims,
  shouldLoadAppeals,
  shouldLoadClaims,
  shouldShowLoadingIndicator,
}) => {
  React.useEffect(
    () => {
      if (!dataLoadingDisabled && shouldLoadAppeals) {
        loadAppeals();
      }
    },
    [dataLoadingDisabled, loadAppeals, shouldLoadAppeals],
  );

  React.useEffect(
    () => {
      if (!dataLoadingDisabled && shouldLoadClaims) {
        loadClaims();
      }
    },
    [dataLoadingDisabled, loadClaims, shouldLoadClaims],
  );

  // the most recently updated claim or appeal that has been updated in the past
  // 30 days
  const highlightedClaimOrAppeal = useHighlightedClaimOrAppeal(
    appealsData,
    claimsData,
  );

  // the total number of open claims and appeals, no matter when they were last
  // updated
  const openClaimsOrAppealsCount = useOpenClaimsAppealsCount(
    appealsData,
    claimsData,
  );

  if (!shouldLoadAppeals && !shouldLoadClaims) {
    return null;
  }

  if (shouldShowLoadingIndicator) {
    return <LoadingIndicator />;
  }

  if (highlightedClaimOrAppeal || openClaimsOrAppealsCount > 0) {
    return (
      <div>
        <h2>Claims & appeals</h2>
        <HighlightedClaimAppeal claimOrAppeal={highlightedClaimOrAppeal} />
        <ClaimsAndAppealsCTA count={openClaimsOrAppealsCount} />
      </div>
    );
  } else {
    return null;
  }
};

const isClaimsAvailableSelector = createIsServiceAvailableSelector(
  backendServices.EVSS_CLAIMS,
);
const isAppealsAvailableSelector = createIsServiceAvailableSelector(
  backendServices.APPEALS_STATUS,
);

const mapStateToProps = state => {
  const claimsState = state.disability.status;
  const claimsV2Root = claimsState.claimsV2;
  const appealsLoading = claimsV2Root.appealsLoading;
  const claimsLoading = claimsV2Root.claimsLoading;

  return {
    appealsData: claimsV2Root.appeals,
    claimsData: claimsV2Root.claims,
    shouldLoadAppeals: isAppealsAvailableSelector(state),
    shouldLoadClaims: isClaimsAvailableSelector(state),
    shouldShowLoadingIndicator: appealsLoading || claimsLoading,
  };
};

const mapDispatchToProps = {
  loadAppeals: getAppealsAction,
  loadClaims: getClaimsAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsAndAppeals);

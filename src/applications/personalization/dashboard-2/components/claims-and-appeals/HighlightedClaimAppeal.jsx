import React from 'react';

import { appealTypes } from '~/applications/claims-status/utils/appeals-v2-helpers';

import Claim from './Claim';

const Appeal = () => {
  return (
    <div className="vads-l-col--12 medium-screen:vads-l-col--6 small-desktop-screen:vads-l-col--8 medium-screen:vads-u-padding-right--3">
      <div className="vads-u-padding-y--2p5 vads-u-padding-x--2p5 vads-u-background-color--gray-lightest">
        <h3 className="vads-u-margin-top--0">
          Claim for compensation received June 7, 1999
        </h3>
        <div className="vads-u-display--flex">
          <i
            aria-hidden="true"
            className={`fas fa-fw fa-check-circle vads-u-margin-right--1 vads-u-margin-top--0p5 vads-u-color--green`}
          />
          <div>
            <p className="vads-u-margin-y--0">
              Status: Evidence gathering, review, and decision
            </p>
            <p className="vads-u-margin-y--0">
              We sent you a development letter
            </p>
          </div>
        </div>
        <a className="usa-button-primary" href="claim-or-appeal-status/">
          View details
        </a>
      </div>
    </div>
  );
};

const HighlightedClaimAppeal = ({ claimOrAppeal }) => {
  if (!claimOrAppeal) {
    return <p>You have no claims or appeals updates in the last 30 days.</p>;
  }
  if (appealTypes.includes(claimOrAppeal.type)) {
    return <Appeal appeal={claimOrAppeal} />;
  }
  return <Claim claim={claimOrAppeal} />;
};
export default HighlightedClaimAppeal;

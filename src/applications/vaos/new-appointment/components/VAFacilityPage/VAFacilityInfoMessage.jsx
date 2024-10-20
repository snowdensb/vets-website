import React from 'react';
import AlertBox from '@department-of-veterans-affairs/component-library/AlertBox';
import State from '../../../components/State';
import NewTabAnchor from '../../../components/NewTabAnchor';

export default function VAFacilityInfoMessage({ facility }) {
  return (
    <AlertBox
      status="info"
      headline="We found one facility that accepts online scheduling for this care"
    >
      <p>
        <strong>{facility.name}</strong>
        <br />
        {facility.address?.city}, <State state={facility.address?.state} />
      </p>
      <p>
        Not all VA facilities offer online scheduling for all types of care. If
        this isn’t the facility you’re looking for, you can{' '}
        <NewTabAnchor href="/find-locations">
          search for another VA facility
        </NewTabAnchor>
        .
      </p>
    </AlertBox>
  );
}

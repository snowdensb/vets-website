import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getMedicalCenterNameByID } from '~/platform/utilities/medical-centers/medical-centers';
import { GeneralCernerWidget } from '~/applications/personalization/dashboard/components/cerner-widgets';
import { fetchConfirmedFutureAppointments as fetchConfirmedFutureAppointmentsAction } from '~/applications/personalization/appointments/actions';

import { isAuthenticatedWithSSOe } from '~/platform/user/authentication/selectors';
import {
  selectCernerAppointmentsFacilities,
  selectCernerMessagingFacilities,
  selectCernerRxFacilities,
  selectIsCernerPatient,
} from '~/platform/user/selectors';
import { mhvUrl } from '~/platform/site-wide/mhv/utilities';
import Appointments from './Appointments';
import HealthCareCard from './HealthCareCard';

const HealthCare = ({
  appointments,
  authenticatedWithSSOe,
  canAccessRx,
  fetchConfirmedFutureAppointments,
  isCernerPatient,
  facilityNames,
}) => {
  useEffect(
    () => {
      fetchConfirmedFutureAppointments();
    },
    [fetchConfirmedFutureAppointments],
  );

  if (isCernerPatient && facilityNames?.length) {
    return (
      <GeneralCernerWidget
        facilityNames={facilityNames}
        authenticatedWithSSOe={authenticatedWithSSOe}
      />
    );
  }

  return (
    <div className="health-care vads-u-margin-y--6">
      <h2 className="vads-u-margin-y--0">Health care</h2>

      <div className="vads-u-display--flex vads-u-flex-wrap--wrap">
        {/* Messages */}
        <HealthCareCard type="messages" />

        {/* Appointments */}
        <Appointments
          appointments={appointments}
          authenticatedWithSSOe={authenticatedWithSSOe}
        />
      </div>

      <div className="vads-u-margin-top--4">
        <h3>Manage your health care benefits</h3>
        <hr
          aria-hidden="true"
          className="vads-u-background-color--primary vads-u-margin-bottom--2 vads-u-margin-top--0p5 vads-u-border--0"
        />

        {canAccessRx && (
          <p>
            <a
              rel="noreferrer noopener"
              target="_blank"
              className="vads-u-margin-bottom--2"
              href={mhvUrl(
                authenticatedWithSSOe,
                'web/myhealthevet/refill-prescriptions',
              )}
            >
              Manage all your prescriptions
            </a>
          </p>
        )}
        <p>
          <a
            href={mhvUrl(isAuthenticatedWithSSOe, 'download-my-data')}
            rel="noreferrer noopener"
            target="_blank"
            className="vads-u-margin-bottom--2"
            // onClick={recordEvent()}
          >
            Get your lab and test results
          </a>
        </p>

        <p>
          <a
            href="/health-care/get-medical-records/"
            // onClick={recordDashboardClick('health-records')}
          >
            Get your VA medical records
          </a>
        </p>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  const profileState = state.user.profile;
  const canAccessRx = profileState.services.includes('rx');

  const cernerAppointmentFacilities = selectCernerAppointmentsFacilities(state);
  const cernerMessagingFacilities = selectCernerMessagingFacilities(state);
  const cernerPrescriptionFacilities = selectCernerRxFacilities(state);

  const appointmentFacilityNames =
    cernerAppointmentFacilities?.map(facility =>
      getMedicalCenterNameByID(facility.facilityId),
    ) || [];
  const messagingFacilityNames =
    cernerMessagingFacilities?.map(facility =>
      getMedicalCenterNameByID(facility.facilityId),
    ) || [];
  const prescriptionFacilityNames =
    cernerPrescriptionFacilities?.map(facility =>
      getMedicalCenterNameByID(facility.facilityId),
    ) || [];

  const facilityNames = [
    ...new Set([
      ...appointmentFacilityNames,
      ...messagingFacilityNames,
      ...prescriptionFacilityNames,
    ]),
  ];

  return {
    appointments: state.health?.appointments?.data,
    isCernerPatient: selectIsCernerPatient(state),
    facilityNames,
    canAccessRx,
    authenticatedWithSSOe: isAuthenticatedWithSSOe(state),
  };
};

const mapDispatchToProps = {
  fetchConfirmedFutureAppointments: fetchConfirmedFutureAppointmentsAction,
};

HealthCare.propTypes = {
  authenticatedWithSSOe: PropTypes.bool.isRequired,
  canAccessRx: PropTypes.bool.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HealthCare);
export { HealthCare };

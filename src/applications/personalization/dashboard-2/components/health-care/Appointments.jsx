import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { differenceInDays } from 'date-fns';

import HealthCareCard from './HealthCareCard';
import { recordDashboardClick } from 'applications/personalization/dashboard/helpers';

import { mhvUrl } from '~/platform/site-wide/mhv/utilities';

export const Appointments = ({ authenticatedWithSSOe, appointments }) => {
  const nextAppointment = appointments?.[0];
  const start = new Date(nextAppointment?.startsAt);
  const today = new Date();
  const hasUpcomingAppointment = differenceInDays(start, today) < 30;

  const hasFutureAppointments = appointments?.length;
  const noUpcomingAppointmentsCopy =
    'You have no appointments scheduled in the next 30 days.';

  let locationName;

  if (nextAppointment && nextAppointment?.isVideo) {
    locationName = 'VA Video Connect';

    if (nextAppointment?.additionalInfo) {
      locationName += ` ${nextAppointment.additionalInfo}`;
    }
  }

  if (nextAppointment && !nextAppointment?.isVideo) {
    locationName = nextAppointment.providerName;
  }

  const cardDetails = {
    sectionTitle: 'Appointments',
    ctaIcon: 'calendar',
    ctaHref: mhvUrl(
      authenticatedWithSSOe,
      'web/myhealthevet/refill-appointments',
    ),
    ctaAriaLabel: 'View upcoming appointments',
    ctaOnClick: recordDashboardClick('view-all-appointments'),
    ctaText: `${appointments?.length} upcoming appointment${
      hasFutureAppointments > 1 ? 's' : ''
    }`,
  };

  // has an upcoming appointment in the next 30 days
  if (hasFutureAppointments) {
    cardDetails.cardTitle = 'Next appointment';
    cardDetails.line1 = moment(nextAppointment?.startsAt).format(
      'dddd, MMMM Mo, YYYY',
    );
    cardDetails.line2 = `Time: ${moment(nextAppointment?.startsAt).format(
      'h:mm a',
    )} ${nextAppointment?.timeZone}`;
    cardDetails.line3 = locationName;
  }

  // has appointments but not in the next 30 days
  if (hasFutureAppointments && !hasUpcomingAppointment) {
    cardDetails.cardTitle = '';
    cardDetails.line1 = noUpcomingAppointmentsCopy;
  }

  // has no appointments scheduled
  if (!hasFutureAppointments) {
    cardDetails.cardTitle = '';
    cardDetails.line1 = noUpcomingAppointmentsCopy;
    cardDetails.ctaText = 'Go to appointments';
  }

  if (!nextAppointment) {
    return null;
  }

  return (
    <HealthCareCard
      cardProperties={cardDetails}
      noActiveData={!hasUpcomingAppointment}
    />
  );
};

Appointments.propTypes = {
  authenticatedWithSSOe: PropTypes.bool.isRequired,
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      additionalInfo: PropTypes.string,
      facility: PropTypes.object,
      id: PropTypes.string.isRequired,
      isVideo: PropTypes.bool.isRequired,
      providerName: PropTypes.string,
      startsAt: PropTypes.string.isRequired,
      timeZone: PropTypes.string,
      type: PropTypes.string.isRequired,
    }),
  ),
};

export default Appointments;

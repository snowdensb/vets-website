// Direct copy
// Appointments in these "HIDDEN_SET"s should not be shown in appointment lists at all
export const FUTURE_APPOINTMENTS_HIDDEN_SET = new Set(['NO-SHOW', 'DELETED']);

// Direct copy
export const VIDEO_TYPES = {
  gfe: 'MOBILE_GFE',
  clinic: 'CLINIC_BASED',
  adhoc: 'ADHOC',
  mobile: 'MOBILE_ANY',
  storeForward: 'STORE_FORWARD',
};

export const FETCH_CONFIRMED_FUTURE_APPOINTMENTS =
  'dashboard-2/FETCH_CONFIRMED_FUTURE_APPOINTMENTS';
export const FETCH_CONFIRMED_FUTURE_APPOINTMENTS_SUCCEEDED =
  'dashboard-2/FETCH_CONFIRMED_FUTURE_APPOINTMENTS_SUCCEEDED';
export const FETCH_CONFIRMED_FUTURE_APPOINTMENTS_FAILED =
  'dashboard-2/FETCH_CONFIRMED_FUTURE_APPOINTMENTS_FAILED';

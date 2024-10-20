const buildVeteranInformation = vetContactInfo => {
  const {
    countryCodeIso3: countryName,
    addressLine1,
    addressLine2,
    addressLine3,
    city,
    stateCode,
    zipCode,
  } = vetContactInfo.residentialAddress;

  return {
    veteranAddress: {
      countryName,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      stateCode,
      zipCode,
    },
    phoneNumber: `${vetContactInfo.homePhone.areaCode}${
      vetContactInfo.homePhone.phoneNumber
    }`,
    emailAddress: vetContactInfo.email.emailAddress,
  };
};

// maps to values in the 686 task wizard schema
// https://github.com/department-of-veterans-affairs/vets-json-schema/blob/master/src/schemas/686c-674/schema.js#L126
const WIZARD_OPTIONS_KEYS = {
  DIVORCE: 'reportDivorce',
  ANNULMENT: 'reportDivorce',
  VOID: 'reportDivorce',
  DEATH: 'reportDeath',
  CHILD_MARRIED: 'reportMarriageOfChildUnder18',
  CHILD_LEFT_SCHOOL: 'reportChild18OrOlderIsNotAttendingSchool',
  STEPCHILD_LEFT_HOUSEHOLD: 'reportStepchildNotInHousehold',
};

// maps to values in the 686 report divorce reason
// https://github.com/department-of-veterans-affairs/vets-json-schema/blob/master/src/schemas/686c-674/schema.js#L507
const DIVORCE_REASONS = {
  DIVORCE: 'Divorce',
  ANNULMENT: 'Other',
  VOID: 'Other',
};

const DEPENDENT_TYPES = {
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  DEPENDENT_PARENT: 'DEPENDENT_PARENT',
};

// mirror the date format forms submit with
const formatDateString = date => {
  const dateFragments = date.split('/');
  return `${dateFragments[2]}-${dateFragments[0]}-${dateFragments[1]}`;
};

const transformForSubmit = formData => {
  const payload = {};
  const {
    fullName: { firstName: first, lastName: last },
    date,
    ssn,
    location,
  } = formData;
  const birthDate = formatDateString(formData.dateOfBirth);
  // this goes in all iterations of the payload.
  const universalData = {
    fullName: {
      first,
      last,
    },
    date,
  };
  // if formdata includes reasonMarriageEnded, user is reporting either a divorce or the death of a spouse.
  if (formData.reasonMarriageEnded) {
    payload['view:selectable686Options'] = {
      [WIZARD_OPTIONS_KEYS[formData.reasonMarriageEnded]]: true,
    };
    if (payload['view:selectable686Options'].reportDivorce) {
      payload.reportDivorce = {
        ...universalData,
        reasonMarriageEnded: DIVORCE_REASONS[formData.reasonMarriageEnded],
        location,
        ssn,
        birthDate,
      };
    } else if (payload['view:selectable686Options'].reportDeath) {
      payload.deaths = [
        {
          ...universalData,
          location,
          ssn,
          birthDate,
          dependentType: DEPENDENT_TYPES.SPOUSE,
        },
      ];
    }
  }

  // if formData includes reasonForRemoval, user is reporting the removal of a child.
  if (formData.reasonForRemoval) {
    payload['view:selectable686Options'] = {
      [formData.reasonForRemoval]: true,
    };
    if (formData.reasonForRemoval === WIZARD_OPTIONS_KEYS.CHILD_MARRIED) {
      const { fullName, date: dateMarried } = universalData;
      payload.childMarriage = {
        fullName,
        dateMarried,
        birthDate,
        ssn,
      };
    } else if (
      formData.reasonForRemoval === WIZARD_OPTIONS_KEYS.CHILD_LEFT_SCHOOL
    ) {
      const { fullName, date: dateChildLeftSchool } = universalData;
      payload.childStoppedAttendingSchool = {
        fullName,
        dateChildLeftSchool,
        birthDate,
        ssn,
      };
    } else if (formData.reasonForRemoval === WIZARD_OPTIONS_KEYS.DEATH) {
      const { childStatus } = formData;
      payload.deaths = [
        {
          ...universalData,
          location,
          ssn,
          birthDate,
          dependentType: DEPENDENT_TYPES.CHILD,
          childStatus,
        },
      ];
    } else if (
      formData.reasonForRemoval === WIZARD_OPTIONS_KEYS.STEPCHILD_LEFT_HOUSEHOLD
    ) {
      const {
        livingExpensesPaid,
        whoDoesTheStepchildLiveWith,
        address,
      } = formData;
      const supportingStepchild = livingExpensesPaid !== 'None';
      payload.stepChildren = [
        {
          ...universalData,
          ssn,
          birthDate,
          supportingStepchild,
          livingExpensesPaid,
          address,
          whoDoesTheStepchildLiveWith,
        },
      ];
    }
  }
  return payload;
};

export const submitToApi = (formData, vetContactInfo, userInfo) => {
  const mergedFormData = { ...formData, ...userInfo };
  return {
    veteranContactInformation: buildVeteranInformation(vetContactInfo),
    ...transformForSubmit(mergedFormData),
  };
};

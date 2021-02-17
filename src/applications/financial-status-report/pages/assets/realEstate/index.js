export const uiSchema = {
  'ui:title': 'Your real estate assets',
  hasRealEstate: {
    'ui:title': 'Do you currently own any real estate?',
    'ui:widget': 'yesNo',
    'ui:required': () => true,
  },
};

export const schema = {
  type: 'object',
  properties: {
    hasRealEstate: {
      type: 'boolean',
    },
  },
};
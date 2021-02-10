import ItemLoop from '../../../components/ItemLoop';
import TableDetailsView from '../../../components/TableDetailsView';
import currencyUI from 'platform/forms-system/src/js/definitions/currency';
import Typeahead from '../../../components/Typeahead';
import {
  formatOptions,
  incomeTypes,
} from '../../../constants/typeaheadOptions';
import _ from 'lodash/fp';

export const uiSchema = {
  'ui:title': 'Your other income',
  additionalIncome: {
    additionalIncomeRecords: {
      'ui:field': ItemLoop,
      'ui:description':
        'Please provide information about additional income you currently receive.',
      'ui:options': {
        viewType: 'table',
        viewField: TableDetailsView,
        doNotScroll: true,
        showSave: true,
        itemName: 'income',
      },
      items: {
        incomeType: {
          'ui:title': 'Type of income',
          'ui:field': Typeahead,
          'ui:options': {
            classNames: 'input-size-4',
            getOptions: () => formatOptions(incomeTypes),
          },
        },
        monthlyAmount: _.merge(currencyUI('Monthly income amount'), {
          'ui:options': {
            widgetClassNames: 'input-size-2',
          },
        }),
      },
    },
  },
};
export const schema = {
  type: 'object',
  properties: {
    additionalIncome: {
      type: 'object',
      properties: {
        additionalIncomeRecords: {
          type: 'array',
          items: {
            type: 'object',
            required: ['incomeType', 'monthlyAmount'],
            properties: {
              incomeType: {
                type: 'string',
              },
              monthlyAmount: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  },
};
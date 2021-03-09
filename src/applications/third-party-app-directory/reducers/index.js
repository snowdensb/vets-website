import get from 'lodash/get';

// Relative imports.
import {
  FETCH_RESULTS,
  FETCH_RESULTS_FAILURE,
  FETCH_RESULTS_SUCCESS,
  FETCH_SCOPES,
  FETCH_SCOPES_FAILURE,
  FETCH_SCOPES_SUCCESS,
} from '../constants';

const initialState = {
  error: '',
  fetching: false,
  page: 1, // mocking page data until api is updated
  perPage: 10, // default in initial mocks
  results: undefined,
  scopes: {},
  totalResults: undefined,
};

export const thirdPartyAppsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RESULTS: {
      return {
        ...state,
        error: '',
        fetching: !action?.options?.hideFetchingState,
      };
    }
    case FETCH_RESULTS_FAILURE: {
      return { ...state, error: action.error, fetching: false };
    }
    case FETCH_RESULTS_SUCCESS: {
      const data = get(action, ['response', 'data'], {});
      return {
        ...state,
        fetching: false,
        results: data,
        // totalResults: data.length,
        totalResults: 100, //  testing a large list of apps, remove and use line above
      };
    }
    case FETCH_SCOPES: {
      return {
        ...state,
        error: '',
      };
    }
    case FETCH_SCOPES_FAILURE: {
      return {
        ...state,
        error: action.error,
      };
    }
    case FETCH_SCOPES_SUCCESS: {
      return {
        ...state,
        scopes: {
          ...state.scopes,
          [action.scopeCategory]: action.response.data,
        },
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default {
  thirdPartyAppsReducer,
};

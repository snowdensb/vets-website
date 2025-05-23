/**
 * Attaches CustomEvent 'component-library-analytics' listener to document.body
 * to translate component library actions into analytics dataLayer events.
 */
import _recordEvent from 'platform/monitoring/record-event';
import { kebabCase } from 'lodash';

const analyticsEvents = {
  Modal: [{ action: 'show', event: 'int-modal-show' }],
  AdditionalInfo: [
    { action: 'expand', event: 'int-additional-info-expand' },
    { action: 'collapse', event: 'int-additional-info-collapse' },
  ],
  AlertBox: [{ action: 'linkClick', event: 'nav-alert-box-link-click' }],
  PromoBanner: [{ action: 'linkClick', event: 'nav-promo-banner-link-click' }],
};

export function subscribeComponentAnalyticsEvents(
  e,
  recordEvent = _recordEvent,
) {
  // Is it a component we are tracking?
  const component = analyticsEvents[e.detail.componentName];

  if (component) {
    const action = component.find(ev => ev.action === e.detail.action);

    if (action) {
      const dataLayer = {
        event: action.event,
        'event-source': 'component-library',
      };

      // If the event included additional details / context...
      if (e.detail.details) {
        for (const key of Object.keys(e.detail.details)) {
          const newKey = `${kebabCase(e.detail.componentName)}-${key}`;

          dataLayer[newKey] = e.detail.details[key];
        }
      }

      recordEvent(dataLayer);
      // Remove event-source from the dataLayer
      recordEvent({ 'event-source': undefined });
    }
  }
}

document.body.addEventListener(
  'component-library-analytics',
  subscribeComponentAnalyticsEvents,
);

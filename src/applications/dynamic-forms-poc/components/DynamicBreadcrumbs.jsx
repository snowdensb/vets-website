import React from 'react';
import Breadcrumbs from '@department-of-veterans-affairs/component-library/Breadcrumbs';

function GetBreadcrumbs(publisher) {
  if (publisher === undefined) return null;
  const crumbs = publisher.split(',');
  const crumbElements = crumbs.map(crumb => {
    const hrefElements = crumb.split('|');
    return `<a href=/${hrefElements[1]}>${hrefElements[0]}</a>`;
  });
  return (
    <Breadcrumbs className="vads-u-font-family--sans">
      {crumbElements.map(crumb => (
        // eslint-disable-next-line react/no-danger
        <span dangerouslySetInnerHTML={{ __html: crumb }} key={crumb} />
      ))}
      {/* {crumbElements.map(element => )} */}
      {/* <a href="/manage-va-debt">Manage your VA debt</a> */}
      {/* <a href="/manage-va-debt/your-debt">Your VA debt</a>
      <a href="/manage-va-debt/your-debt/debt-detail">Details</a> */}
    </Breadcrumbs>
  );
}

export default GetBreadcrumbs;

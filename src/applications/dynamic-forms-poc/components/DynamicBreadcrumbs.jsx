import React from 'react';
import Breadcrumbs from '@department-of-veterans-affairs/component-library/Breadcrumbs';

function GetBreadcrumbs(publisher) {
  if (publisher === undefined) return null;
  const crumbs = publisher.split(',');
  const crumbElements = crumbs.map((crumb, index) => {
    const hrefElements = crumb.split('|');
    return index === crumbs.length - 1
      ? `<strong>${hrefElements[0]}</strong>`
      : `<a href=/${hrefElements[1]}>${hrefElements[0]}</a>`;
  });
  return (
    <Breadcrumbs className="vads-u-font-family--sans">
      {crumbElements.map(crumb => (
        // eslint-disable-next-line react/no-danger
        <span dangerouslySetInnerHTML={{ __html: crumb }} key={crumb} />
      ))}
    </Breadcrumbs>
  );
}

export default GetBreadcrumbs;

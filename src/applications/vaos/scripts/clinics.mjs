import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

if (process.argv[2] === 'update') {
  const response = await fetch('https://veteran.apps.va.gov/cdw/v3/facilities');
  const output = await response.json();

  const siteIds = new Set(output.map(f => f.parentSiteCode));

  for await (let siteId of siteIds) {
    const resp = await fetch(`https://veteran.apps.va.gov/cdw/v3/facilities/${siteId}/clinics?pageSize=0`);
    const clinics = await resp.json();
    fs.writeFileSync(
      `./src/applications/vaos/scripts/clinics/${siteId}.json`,
      JSON.stringify(clinics),
    );
    console.log(clinics.data.length);
  }
}

let matchingClinics = [];
fs.readdirSync('./src/applications/vaos/scripts/clinics').forEach(f => {
const clinics = JSON.parse(fs.readFileSync(path.join('./src/applications/vaos/scripts/clinics', f), 'utf8'));
  const covidClinics = clinics.data.filter(clinic => clinic.directSchedulingPatient && clinic.secondaryStopCode === 710 && (!!clinic.reactivationDate || !clinic.inactivationDate));
  matchingClinics = matchingClinics.concat(covidClinics);
});

// matchingClinics.filter(c => c.displayAppointment).forEach(c => console.log(c.primaryStopCode));
// console.log(matchingClinics.filter(c => c.displayAppointment).length);

const header = `facility id,clinic id,name,friendly name, primary stop code, secondary stop code, display to patients, direct scheduling, friendly name`;
fs.writeFileSync(
  './clinics.csv',
  [header]
    .concat(
      matchingClinics.map(row => {
        return `${row.sta6aid || row.facilityId},${row.locationIEN || ''},${row.locationName},${row.patientFriendlyLocationName || ''},${row.primaryStopCode || ''},${row.secondaryStopCode || ''},${row.displayAppointment || false},${row.directSchedulingPatient || false}`;
      }),
    )
    .join('\n'),
);
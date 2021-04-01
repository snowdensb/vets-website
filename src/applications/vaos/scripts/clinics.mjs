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

const siteMap = {
  '523': [],
  '523A5': [],
  '523A4': [],
  '636A8': [],
  '614': [],
  '612A4': [],
  '612GF': [],
  '612GG': [],
  '612GH': [],
  '612GI': [],
  '612BY': [],
  '612B4': [],
  '612GD': [],
  '612GJ': [],
  '612GK': [],
  '612GE': [],
};

let matchingClinics = [];
fs.readdirSync('./src/applications/vaos/scripts/clinics').forEach(f => {
  const clinics = JSON.parse(fs.readFileSync(path.join('./src/applications/vaos/scripts/clinics', f), 'utf8'));
  clinics.data.forEach(clinic => {
    if (siteMap[clinic.sta6aid] && clinic.nationalChar4 === 'CDQC' &&
      clinic.displayAppointment &&
      clinic.directSchedulingPatient && 
      (!!clinic.reactivationDate || !clinic.inactivationDate)) {
      siteMap[clinic.sta6aid].push(clinic);
    }
  });

  // const noneClinics = clinics.data.filter(clinic => clinic.displayAppointment &&
  //   (clinic.patientFriendlyLocationName?.toUpperCase() === 'N/A' || clinic.patientFriendlyLocationName?.toUpperCase() === 'NONE') && (!!clinic.reactivationDate || !clinic.inactivationDate));
  // matchingClinics = matchingClinics.concat(noneClinics);
});

Object.entries(siteMap).forEach(([facility, clinics]) => {
  console.log(`${facility}: ${clinics.length}`);
});
// matchingClinics.filter(c => c.displayAppointment).forEach(c => console.log(c.primaryStopCode));
// console.log(matchingClinics.filter(c => c.displayAppointment).length);

// const header = `facility id,clinic id,name,friendly name, primary stop code, secondary stop code, display to patients, direct scheduling, friendly name`;
// fs.writeFileSync(
//   './clinics.csv',
//   [header]
//     .concat(
//       matchingClinics.map(row => {
//         return `${row.sta6aid || row.facilityId},${row.locationIEN || ''},${row.locationName},${row.patientFriendlyLocationName || ''}`
//       }),
//     )
//     .join('\n'),
// );
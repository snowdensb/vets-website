import { UploadDescription } from '../content/fileUploadDescriptions';
import _ from 'platform/utilities/data';
import fullSchema from 'vets-json-schema/dist/21-526EZ-ALLCLAIMS-schema.json';
import { ancillaryFormUploadUi } from '../utils';
import { DATA_PATHS } from '../constants';

const { privateMedicalRecordAttachments } = fullSchema.properties;

const fileUploadUi = ancillaryFormUploadUi(
  'Upload your private medical records',
  ' ',
  {
    attachmentId: '',
    addAnotherLabel: 'Add another document',
  },
);

export const uiSchema = {
  privateMedicalRecordAttachments: {
    ...fileUploadUi,
    'ui:options': {
      ...fileUploadUi['ui:options'],
    },
    'ui:description': UploadDescription,
    'ui:required': data =>
      _.get(DATA_PATHS.hasPrivateRecordsToUpload, data, false),
  },
};

export const schema = {
  type: 'object',
  properties: {
    privateMedicalRecordAttachments,
  },
};

import React, { useEffect, useState } from 'react';

// this will not be necessary when Questionnaire json files are fetched from PGD
import externalVaccine from '../config/externalVaccine.json';
import trucks from '../config/trucks.json';
import preVisitSummary from '../config/preVisitSummary.json';

import currentOrPastDateUI from 'platform/forms-system/src/js/definitions/currentOrPastDate';
import { R4 } from '@ahryman40k/ts-fhir-types';

export default function useSchemas(formId) {
  const [uiSchema, setUiSchema] = useState({});
  const [schema, setSchema] = useState({});

  useEffect(() => {
    // In real life this will be a call to get the Questionnaire JSON from PGD
    let questionnaireData;
    switch (formId) {
      case 'trucks':
        questionnaireData = trucks;
        break;

      case 'externalVaccine':
        questionnaireData = externalVaccine;
        break;

      case 'preVisitSummary':
        questionnaireData = preVisitSummary;
        break;

      default:
        questionnaireData = externalVaccine;
    }

    // const FormatedString = props => {
    //   if (spanRef.current) {
    //     spanRef.current.innerHTML = props.textString;
    //   }
    //   return <span ref={spanRef} />;
    //   // <>
    //   //   <span>
    //   //     <strong>{props.textString}</strong>
    //   //   </span>
    //   // </>
    // };

    function createSchemas() {
      const schemaObject = {
        type: 'object',
        properties: {},
        questionnaireId: questionnaireData.id,
        formTitle: questionnaireData.title,
        required: [],
      };

      const uiSchemaObject = {};
      const order = [];

      questionnaireData.item.forEach(element => {
        const itemKey = `va-${element.linkId.toString()}`;

        if (element.required) {
          schemaObject.required.push(itemKey);
        }

        uiSchemaObject[itemKey] = { 'ui:options': {} };
        order.push(itemKey);

        if (
          element.type === R4.Questionnaire_ItemTypeKind._date ||
          element.type === R4.Questionnaire_ItemTypeKind._dateTime ||
          element.type === R4.Questionnaire_ItemTypeKind._time
        ) {
          uiSchemaObject[itemKey] = currentOrPastDateUI(element.text);
          schemaObject.properties[itemKey] = {
            type: 'string',
          };
        } else if (element.type === R4.Questionnaire_ItemTypeKind._choice) {
          const subtype =
            element.extension[0].valueCodeableConcept.coding[0].code;

          // get keys array for schema
          const keysArray = element.answerOption.map(option => {
            return Object.keys(option)[0];
          });

          const labels = {};
          element.answerOption.forEach(option => {
            const key = Object.keys(option)[0];
            labels[key] = option[key].valueString;
          });
          if (subtype === 'radio-button') {
            const values = Object.values(labels);
            const widgetType =
              values.length === 2 && (values[0] === 'Yes' && values[1] === 'No')
                ? 'yesNo'
                : 'radio';
            uiSchemaObject[itemKey] = {
              'ui:title': element.text,
              'ui:widget': widgetType,
              'ui:options': {
                labels,
              },
            };
            if (widgetType === 'radio') {
              schemaObject.properties[itemKey] = {
                type: 'string',
                enum: keysArray,
              };
            } else {
              // yes/no widget requires boolean type in schema
              schemaObject.properties[itemKey] = {
                type: 'boolean',
              };
            }
          } else {
            // Select Group
            uiSchemaObject[itemKey] = {
              'ui:title': element.text,
            };

            Object.keys(labels).forEach(key => {
              uiSchemaObject[itemKey] = {
                ...uiSchemaObject[itemKey],
                [key]: { 'ui:title': labels[key] },
              };
            });
            const properties = {};
            keysArray.forEach(key => {
              properties[key] = { type: 'boolean' };
            });
            schemaObject.properties[itemKey] = {
              type: 'object',
              properties,
            };
          }
        } else {
          const [title, description] = element.text.split('|');

          uiSchemaObject[itemKey] = {
            'ui:title': title,
          };
          if (description !== undefined) {
            uiSchemaObject[itemKey] = {
              ...uiSchemaObject[itemKey],
              'ui:description': () => (
                <span
                  // surely there is a better way??
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              ),
              // FormatedString({ textString: description }),
            };
          }
          schemaObject.properties[itemKey] = {
            type: element.type,
          };
        }
        if (element.enableWhen !== undefined) {
          uiSchemaObject[itemKey]['ui:options'] = {
            ...uiSchemaObject[itemKey]['ui:options'],
            expandUnder: `va-${element.enableWhen[0].question}`,
          };
          const conditionKey = `va-${element.enableWhen[0].question}`;

          if (schemaObject.properties[conditionKey].type !== 'boolean') {
            uiSchemaObject[itemKey]['ui:options'] = {
              ...uiSchemaObject[itemKey]['ui:options'],
              expandUnderCondition: formData => {
                // multiple expand under conditions are treated as an OR
                // for future enhancement, FHIR Questionnaire supports specifying AND or OR:
                // https://www.hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item.enableBehavior
                return element.enableWhen.some(
                  elem => elem.answerString === formData,
                );
              },
            };
          }
        }
      });
      uiSchemaObject['ui:order'] = order;
      setUiSchema(uiSchemaObject);
      setSchema(schemaObject);

      // console.log('UISCema: ', uiSchemaObject);
      // console.log('Schema Object Created: ', schemaObject);
    }

    createSchemas();
  }, []);

  return [uiSchema, schema];
}

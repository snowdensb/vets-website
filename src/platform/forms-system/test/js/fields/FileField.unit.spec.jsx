import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';

import { uploadStore } from 'platform/forms-system/test/config/helpers';
import {
  DefinitionTester,
  getFormDOM,
} from 'platform/testing/unit/schemaform-utils.jsx';

import { FileField } from '../../../src/js/fields/FileField';
import fileUploadUI, { fileSchema } from '../../../src/js/definitions/file';

const formContext = {
  setTouched: sinon.spy(),
};
const requiredSchema = {};

describe('Schemaform <FileField>', () => {
  it('should render', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(
      tree
        .find('label')
        .first()
        .text(),
    ).to.contain('Upload');
    tree.unmount();
  });
  it('should render files', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('li').text()).to.contain('Test file name');
    tree.unmount();
  });

  it('should remove files with empty file object when initializing', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test1',
      },
      {
        file: {},
        name: 'Test2',
      },
      {
        file: {
          name: 'fake', // should never happen
        },
        name: 'Test3',
      },
      {
        file: new File([1, 2, 3], 'Test3'),
        name: 'Test4',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const onChange = sinon.spy();
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={onChange}
        requiredSchema={requiredSchema}
      />,
    );

    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0].length).to.equal(3);
    // empty file object was removed;
    expect(onChange.firstCall.args[0][1].name).to.equal('Test3');

    tree.unmount();
  });

  it('should call onChange once when deleting files', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const onChange = sinon.spy();

    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={onChange}
        requiredSchema={requiredSchema}
      />,
    );

    tree.instance().removeFile(0);

    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args.length).to.equal(0);
    tree.unmount();
  });

  it('should render uploading', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        uploading: true,
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('ProgressBar').exists()).to.be.true;
    expect(tree.find('button').text()).to.equal('Cancel');
    tree.unmount();
  });

  it('should update progress', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        uploading: true,
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('ProgressBar').props().percent).to.equal(0);

    tree.instance().updateProgress(20);
    tree.update();

    expect(tree.find('ProgressBar').props().percent).to.equal(20);
    tree.unmount();
  });
  it('should render error', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        errorMessage: 'asdfas',
      },
    ];
    const errorSchema = {
      0: {
        __errors: ['Bad error'],
      },
    };
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        errorSchema={errorSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('.va-growable-background').text()).to.contain('Bad error');
    tree.unmount();
  });

  it('should not render upload button if over max items', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      maxItems: 1,
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('label').exists()).to.be.false;
    tree.unmount();
  });
  it('should not render upload button on review & submit page while in review mode', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {},
      items: [
        {
          properties: {},
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={{ reviewMode: true }}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('label').exists()).to.be.false;
    tree.unmount();
  });

  it('should delete file', () => {
    const uiSchema = fileUploadUI('Files');
    const schema = {
      type: 'object',
      properties: {
        fileField: fileSchema,
      },
    };
    const form = render(
      <Provider store={uploadStore}>
        <DefinitionTester
          schema={schema}
          data={{
            fileField: [
              {
                confirmationCode: 'asdfasfd',
              },
            ],
          }}
          uiSchema={{
            fileField: uiSchema,
          }}
        />
      </Provider>,
    );
    const formDOM = getFormDOM(form);

    expect(formDOM.querySelectorAll('li')).not.to.be.empty;

    formDOM.click('.va-growable-background button');

    expect(formDOM.querySelectorAll('li')).to.be.empty;
  });

  it('should upload png file', () => {
    const uiSchema = fileUploadUI('Files');
    const schema = {
      type: 'object',
      properties: {
        fileField: fileSchema,
      },
    };
    const uploadFile = sinon.spy();
    const form = render(
      <Provider store={uploadStore}>
        <DefinitionTester
          schema={schema}
          data={{
            fileField: [],
          }}
          uploadFile={uploadFile}
          uiSchema={{
            fileField: uiSchema,
          }}
        />
      </Provider>,
    );
    const formDOM = getFormDOM(form);

    formDOM.files('input[type=file]', [{ name: 'test.png' }]);

    expect(uploadFile.firstCall.args[0]).to.eql({ name: 'test.png' });
    expect(uploadFile.firstCall.args[1]).to.eql(uiSchema['ui:options']);
    expect(uploadFile.firstCall.args[2]).to.be.a('function');
    expect(uploadFile.firstCall.args[3]).to.be.a('function');
    expect(uploadFile.firstCall.args[4]).to.be.a('function');
  });

  it('should upload unencrypted pdf file', done => {
    const uiSchema = fileUploadUI('Files');
    const schema = {
      type: 'object',
      properties: {
        fileField: fileSchema,
      },
    };
    const uploadFile = sinon.spy();
    const isFileEncrypted = () => Promise.resolve(false);
    const uiOptions = {
      ...uiSchema['ui:options'],
      isFileEncrypted,
    };
    const fileField = {
      ...uiSchema,
      'ui:options': uiOptions,
    };

    const form = render(
      <Provider store={uploadStore}>
        <DefinitionTester
          schema={schema}
          data={{ fileField: [] }}
          uploadFile={uploadFile}
          uiSchema={{ fileField }}
        />
      </Provider>,
    );
    const formDOM = getFormDOM(form);

    formDOM.files('input[type=file]', [{ name: 'test.pdf' }]);

    setTimeout(() => {
      expect(uploadFile.firstCall.args[0]).to.eql({ name: 'test.pdf' });
      expect(uploadFile.firstCall.args[1]).to.eql(uiOptions);
      expect(uploadFile.firstCall.args[2]).to.be.a('function');
      expect(uploadFile.firstCall.args[3]).to.be.a('function');
      expect(uploadFile.firstCall.args[4]).to.be.a('function');
      done();
    });
  });
  it('should not call uploadFile when initially adding an encrypted PDF', done => {
    const uiSchema = fileUploadUI('Files');
    const schema = {
      type: 'object',
      properties: {
        fileField: fileSchema,
      },
    };
    const uploadFile = sinon.spy();
    const isFileEncrypted = () => Promise.resolve(true);
    const fileField = {
      ...uiSchema,
      'ui:options': {
        ...uiSchema['ui:options'],
        isFileEncrypted,
      },
    };

    const form = render(
      <Provider store={uploadStore}>
        <DefinitionTester
          schema={schema}
          data={{ fileField: [] }}
          uploadFile={uploadFile}
          uiSchema={{ fileField }}
        />
      </Provider>,
    );
    const formDOM = getFormDOM(form);

    formDOM.files('input[type=file]', [{ name: 'test-pw.pdf' }]);

    setTimeout(() => {
      expect(uploadFile.notCalled).to.be.true;
      done();
    });
  });

  it('should render file with attachment type', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {
        type: 'object',
        properties: {
          attachmentId: {
            type: 'string',
          },
        },
      },
      items: [
        {
          type: 'object',
          properties: {
            attachmentId: {
              type: 'string',
            },
          },
        },
      ],
    };
    const uiSchema = fileUploadUI('Files');
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name.pdf',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('li').text()).to.contain('Test file name.pdf');
    expect(tree.find('SchemaField').prop('schema')).to.equal(
      schema.items[0].properties.attachmentId,
    );
    tree.unmount();
  });
  it('should render file with attachment name', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {
        type: 'object',
        properties: {
          attachmentId: {
            type: 'string',
          },
        },
      },
      items: [
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      ],
    };
    const uiSchema = fileUploadUI('Files', {
      attachmentName: {
        'ui:title': 'Document name',
      },
    });
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={formContext}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    expect(tree.find('li').text()).to.contain('Test file name');
    expect(tree.find('SchemaField').prop('schema')).to.equal(
      schema.items[0].properties.name,
    );
    tree.unmount();
  });

  // Accessibility checks
  it('should render a div wrapper when not on the review page', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {
        type: 'object',
        properties: {
          attachmentId: {
            type: 'string',
          },
        },
      },
      items: [
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      ],
    };
    const uiSchema = fileUploadUI('Files', {
      attachmentName: {
        'ui:title': 'Document name',
      },
    });
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={{ onReviewPage: false }}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    // expect dl wrapper on review page
    expect(tree.find('div.review').exists()).to.be.true;
    tree.unmount();
  });
  it('should render a dl wrapper when on the review page', () => {
    const idSchema = {
      $id: 'field',
    };
    const schema = {
      additionalItems: {
        type: 'object',
        properties: {
          attachmentId: {
            type: 'string',
          },
        },
      },
      items: [
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      ],
    };
    const uiSchema = fileUploadUI('Files', {
      attachmentName: {
        'ui:title': 'Document name',
      },
    });
    const formData = [
      {
        confirmationCode: 'asdfds',
        name: 'Test file name',
      },
    ];
    const registry = {
      fields: {
        SchemaField: f => f,
      },
    };
    const tree = shallow(
      <FileField
        registry={registry}
        schema={schema}
        uiSchema={uiSchema}
        idSchema={idSchema}
        formData={formData}
        formContext={{ onReviewPage: true, reviewMode: true }}
        onChange={f => f}
        requiredSchema={requiredSchema}
      />,
    );

    // expect dl wrapper on review page
    expect(tree.find('dl.review').exists()).to.be.true;
    tree.unmount();
  });
});

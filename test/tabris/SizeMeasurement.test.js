import {expect, mockTabris, restore, spy, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientMock from './ClientMock';
import SizeMeasurement, {create} from '../../src/tabris/SizeMeasurement';
import Font from '../../src/tabris/Font';

describe('SizeMeasurement', function() {

  let sizeMeasurement, client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    sizeMeasurement = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new SizeMeasurement({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', function() {
    expect(sizeMeasurement).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof SizeMeasurement', function() {
    expect(sizeMeasurement.constructor.name).to.equal('SizeMeasurement');
    expect(sizeMeasurement).to.be.an.instanceOf(SizeMeasurement);
  });

  describe('create', function() {

    it('creates a native object', function() {
      expect(client.calls({op: 'create', type: 'tabris.SizeMeasurement'})).to.not.be.empty;
    });

  });

  it('can not be disposed', function() {
    expect(() => {
      sizeMeasurement.dispose();
    }).to.throw();
  });

  describe('measureTexts', function() {

    it('rejects if parameter missing', function() {
      return sizeMeasurement.measureTexts().then(expectFail, error => {
        expect(error.message).to.equal('Not enough arguments to measure texts');
      });
    });

    it('rejects invalid argument type', function() {
      return sizeMeasurement.measureTexts(23).then(expectFail, error => {
        expect(error.message).to.equal('The text measurement configs have to be an array');
      });
    });

    it('rejects missing text string property', function() {
      return sizeMeasurement.measureTexts([{font: '12px'}]).then(expectFail, error => {
        expect(error.message).to.equal('A text measurement configuration has to provide a "text" string');
      });
    });

    it('calls native measureTexts', function() {
      spy(client, 'call');

      sizeMeasurement.measureTexts([{text: 'Hello World', font: '12px Arial'}]);

      expect(client.call).to.have.been.calledWithMatch(sizeMeasurement.cid, 'measureTexts', {
        configs: [{text: 'Hello World', font: new Font(12, ['Arial']), markupEnabled: false, maxWidth: undefined}]
      });
      const args = client.call.lastCall.args[2];
      expect(args.onResult).to.be.a('function');
      expect(args.onError).to.be.a('function');
    });

    it('resolves on successful measureTexts', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onResult([{width: 128, height: 24}]));
      return sizeMeasurement.measureTexts([{text: 'Hello World', font: '12px'}]).then(result => {
        expect(result).to.deep.equal([{width: 128, height: 24}]);
      });
    });

    it('rejects in case of error', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onError('Could not measure texts'));
      return sizeMeasurement.measureTexts([{text: 'Hello World', font: '12px'}]).then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Could not measure texts');
      });
    });

  });

  describe('measureTextsSync', function() {

    it('throws if parameter missing', function() {
      expect(() => sizeMeasurement.measureTextsSync()).to.throw('Not enough arguments to measure texts');
    });

    it('throws on invalid argument type', function() {
      expect(() => sizeMeasurement.measureTextsSync(23)).to.throw('The text measurement configs have to be an array');
    });

    it('throws on missing text property', function() {
      expect(() => sizeMeasurement.measureTextsSync([{font: '12px'}]))
        .to.throw('A text measurement configuration has to provide a "text" string');
    });

    it('calls native measureTextsSync', function() {
      spy(client, 'call');

      sizeMeasurement.measureTextsSync([{text: 'Hello World', font: '12px Arial'}]);

      expect(client.call).to.have.been.calledWithMatch(sizeMeasurement.cid, 'measureTextsSync', {
        configs: [{text: 'Hello World', font: new Font(12, ['Arial']), markupEnabled: false, maxWidth: undefined}]
      });
    });

    it('returns on successful measureTextsSync', function() {
      stub(client, 'call').callsFake(() => [{width: 128, height: 24}]);

      const result = sizeMeasurement.measureTextsSync([{text: 'Hello World', font: '12px'}]);

      expect(result).to.deep.equal([{width: 128, height: 24}]);
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

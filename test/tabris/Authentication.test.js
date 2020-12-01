import {expect, mockTabris, restore, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientMock from './ClientMock';
import Authentication, {create} from '../../src/tabris/Authentication';

describe('Authentication', () => {

  let authentication, client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    authentication = create();
  });

  afterEach(restore);

  it('can not be created standalone', () => {
    expect(() => {
      new Authentication({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', () => {
    expect(authentication).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof Authentication', () => {
    expect(authentication.constructor.name).to.equal('Authentication');
    expect(authentication).to.be.an.instanceOf(Authentication);
  });

  describe('create', () => {

    it('creates a native object', () => {
      expect(client.calls({op: 'create', type: 'tabris.Authentication'})).to.not.be.empty;
    });

  });

  it('can not be disposed', () => {
    expect(() => {
      authentication.dispose();
    }).to.throw();
  });

  describe('canAuthenticate', () => {

    it('returns result from call', () => {
      const result = true;

      stub(client, 'call').callsFake(() => result);

      expect(authentication.canAuthenticate()).to.equal(true);
    });

    it('rejects if allowCredentials is invalid type', () => {
      expect(() => authentication.canAuthenticate({allowCredentials: 123})).to.throw;
    });

  });

  describe('authenticate', () => {

    it('rejects if title is invalid type', () => {
      expect(() => authentication.authenticate({title: 123})).to.throw;
    });

    it('rejects if subtitle is invalid type', () => {
      expect(() => authentication.authenticate({subtitle: 123})).to.throw;
    });

    it('rejects if message is invalid type', () => {
      expect(() => authentication.authenticate({message: 123})).to.throw;
    });

    it('rejects if allowCredentials is invalid type', () => {
      expect(() => authentication.authenticate({allowCredentials: 123})).to.throw;
    });

    it('rejects if confirmationRequired is invalid type', () => {
      expect(() => authentication.authenticate({confirmationRequired: 123})).to.throw;
    });

    it('returns status from call', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onResult({status: 'success'}));
      return authentication.authenticate().then(result => {
        expect(result).to.deep.equal({status: 'success'});
      });
    });

    it('rejects in case of error', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onError('incorrect'));
      return authentication.authenticate().then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('incorrect');
      });
    });

  });

  describe('cancel', () => {

    it('calls native "cancel"', () => {
      authentication.cancel();

      expect(client.calls({op: 'call', id: authentication.cid, method: 'cancel'}).length).to.equal(1);
    });

  });
});

function expectFail() {
  throw new Error('Expected to fail');
}

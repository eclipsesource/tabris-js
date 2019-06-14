import {expect, mockTabris, restore, spy, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientMock from './ClientMock';
import Permission, {create} from '../../src/tabris/Permission';

describe('Permission', () => {

  let permission, client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    permission = create();
  });

  afterEach(restore);

  it('can not be created standalone', () => {
    expect(() => {
      new Permission({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', () => {
    expect(permission).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof Permission', () => {
    expect(permission.constructor.name).to.equal('Permission');
    expect(permission).to.be.an.instanceOf(Permission);
  });

  describe('create', () => {

    it('creates a native object', () => {
      expect(client.calls({op: 'create', type: 'tabris.Permission'})).to.not.be.empty;
    });

  });

  it('can not be disposed', () => {
    expect(() => {
      permission.dispose();
    }).to.throw();
  });

  describe('getAuthorizationStatus', () => {

    it('rejects if parameter missing', () => {
      expect(() => permission.getAuthorizationStatus()).to.throw('Not enough arguments to get authorization status');
    });

    it('rejects invalid data type', () => {
      expect(() => permission.getAuthorizationStatus(23, 54)).to.throw('Permissions need to be of type string');
    });

    it('rejects invalid data type array', () => {
      expect(() => permission.getAuthorizationStatus(['x'])).to.throw('Permissions need to be of type string');
    });

    it('returns status from get call', () => {
      const result = {status: 'granted'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.getAuthorizationStatus('camera')).to.equal('granted');
    });

    it('returns status from get call', () => {
      const result = {error: 'could not get status'};

      stub(client, 'call').callsFake(() => result);

      expect(() => permission.getAuthorizationStatus('camera')).to.throw('could not get status');
    });

  });

  describe('isAuthorized', () => {

    it('rejects if parameter missing', () => {
      expect(() => permission.isAuthorized()).to.throw('Not enough arguments to check if permission is authorized');
    });

    it('rejects invalid data type', () => {
      expect(() => permission.isAuthorized(23, 54)).to.throw('Permissions need to be of type string');
    });

    it('rejects invalid data type array', () => {
      expect(() => permission.isAuthorized(['x'])).to.throw('Permissions need to be of type string');
    });

    it('returns true when status is granted', () => {
      const result = {status: 'granted'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.isAuthorized('camera')).to.equal(true);
    });

    it('returns false when status is not granted', () => {
      const result = {status: 'denied'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.isAuthorized('camera')).to.equal(false);
    });

  });

  describe('isAuthorizationPossible', () => {

    it('rejects if parameter missing', () => {
      expect(() => permission.isAuthorizationPossible())
        .to.throw('Not enough arguments to check if authorization is possible');
    });

    it('rejects invalid data type', () => {
      expect(() => permission.isAuthorizationPossible(23, 54)).to.throw('Permissions need to be of type string');
    });

    it('rejects invalid data type array', () => {
      expect(() => permission.isAuthorizationPossible(['x'])).to.throw('Permissions need to be of type string');
    });

    it('returns true when status is undetermined', () => {
      const result = {status: 'undetermined'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.isAuthorizationPossible('camera')).to.equal(true);
    });

    it('returns true when status is declined', () => {
      const result = {status: 'undetermined'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.isAuthorizationPossible('camera')).to.equal(true);
    });

    it('returns false when status is not undetermined or declined', () => {
      const result = {status: 'denied'};

      stub(client, 'call').callsFake(() => result);

      expect(permission.isAuthorizationPossible('camera')).to.equal(false);
    });

  });

  describe('requestAuthorization', () => {

    it('rejects if parameter missing', () => permission.requestAuthorization().then(expectFail, error => {
      expect(error.message).to.equal('Not enough arguments to request permission authorization');
    }));

    it('rejects invalid data type', () => permission.requestAuthorization(23, 54).then(expectFail, error => {
      expect(error.message).to.equal('Permissions need to be of type string');
    }));

    it('rejects invalid data type array', () => permission.requestAuthorization(['x']).then(expectFail, error => {
      expect(error.message).to.equal('Permissions need to be of type string');
    }));

    it('calls native `requestAuthorization`', () => {
      spy(client, 'call');
      const permissions = ['location', 'camera'];

      permission.requestAuthorization(...permissions);

      expect(client.call).to.have.been.calledWithMatch(permission.cid, 'requestAuthorization', {permissions});
      const args = client.call.lastCall.args[2];
      expect(args.onResult).to.be.a('function');
    });

    it('resolves on successful authorization request', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onResult({status: 'granted'}));
      return permission.requestAuthorization('camera').then(status => {
        expect(status).to.equal('granted');
      });
    });

    it('rejects in case of error', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onResult({error: 'error occurred'}));
      return permission.requestAuthorization('camera').then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('error occurred');
      });
    });

  });

  describe('withAuthorization', () => {

    it('rejects if parameter missing', () => {
      expect(() => permission.withAuthorization())
        .to.throw('Permission needs to be of type string or an array of strings');
    });

    it('rejects invalid data type', () => {
      expect(() => permission.withAuthorization(23))
        .to.throw('Permission needs to be of type string or an array of strings');
    });

    it('rejects invalid data type array', () => {
      expect(() => permission.withAuthorization([3])).to.throw('Permissions need to be of type string');
    });

    it('calls native `withAuthorization`', () => {
      spy(client, 'call');
      const permissions = ['location', 'camera'];

      permission.withAuthorization(permissions);

      expect(client.call).to.have.been.calledWithMatch(permission.cid, 'requestAuthorization', {permissions});
    });

    it('invokes callback on successful authorization request', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onResult({status: 'granted'}));
      const onAuthorized = spy();

      permission.withAuthorization(['camera'], onAuthorized);

      permission.requestAuthorization('camera').then(() => expect(onAuthorized).to.have.been.calledOnce);
    });

    it('invokes callback on failed authorization request', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onResult({status: 'denied'}));
      const onUnauthorized = spy();

      permission.withAuthorization(['camera'], spy(), onUnauthorized);

      permission.requestAuthorization('camera').then(() => {
        expect(onUnauthorized).to.have.been.calledWithMatch('denied');
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

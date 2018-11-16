import {expect, mockTabris, restore, spy, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientStub from './ClientStub';
import Printer, {create} from '../../src/tabris/Printer';

describe('Printer', function() {

  let printer, client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    printer = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new Printer({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', function() {
    expect(printer).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof Printer', function() {
    expect(printer.constructor.name).to.equal('Printer');
    expect(printer).to.be.an.instanceOf(Printer);
  });

  describe('create', function() {

    it('creates a native object', function() {
      expect(client.calls({op: 'create', type: 'tabris.Printer'})).to.not.be.empty;
    });

  });

  it('can not be disposed', function() {
    expect(() => {
      printer.dispose();
    }).to.throw();
  });

  describe('print', function() {

    it('rejects if parameter missing', function() {
      return printer.print().then(expectFail, error => {
        expect(error.message).to.equal('Not enough arguments to print');
      });
    });

    it('rejects invalid data type`', function() {
      return printer.print(23).then(expectFail, error => {
        expect(error.message).to.equal('data is not an ArrayBuffer or typed array');
      });
    });

    it('calls native `print`', function() {
      spy(client, 'call');
      const data = new ArrayBuffer(8);

      printer.print(data, {jobName: 'print job'});

      expect(client.call).to.have.been.calledWithMatch(printer.cid, 'print', {data, options: {jobName: 'print job'}});
      const args = client.call.lastCall.args[2];
      expect(args.onResult).to.be.a('function');
      expect(args.onError).to.be.a('function');
    });

    it('resolves on successful print', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onResult('completed'));
      return printer.print(new ArrayBuffer(8)).then(event => {
        expect(event.result).to.equal('completed');
      });
    });

    it('resolves on canceled print', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onResult('canceled'));
      return printer.print(new ArrayBuffer(8)).then(event => {
        expect(event.result).to.equal('canceled');
      });
    });

    it('rejects in case of error', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onError('Could not print'));
      return printer.print(new ArrayBuffer(8)).then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Could not print');
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

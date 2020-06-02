import {expect, mockTabris} from '../test';
import ClientMock from './ClientMock';
import Process, {create} from '../../src/tabris/Process';

describe('Process', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    tabris.app = {debugBuild: false};
  });

  it('cannot be instantiated directly', function() {
    expect(() => new Process()).to.throw(Error, 'Process can not be created');
  });

  it('can be created by create function', function() {
    expect(create(tabris)).to.be.instanceOf(Process);
  });

  it('sets environment variable for production mode', function() {
    expect(create(tabris).env.NODE_ENV).to.equal('production');
  });

  it('sets environment variable for debug mode', function() {
    tabris.app.debugBuild = true;
    expect(create(tabris).env.NODE_ENV).to.equal('development');
  });

  it('sets platform', function() {
    tabris.device.platform = 'FooBar';
    expect(create(tabris).platform).to.equal('foobar');
  });

  it('sets argv', function() {
    expect(create(tabris).argv).to.deep.equal(['tabris', './']);
  });

});
